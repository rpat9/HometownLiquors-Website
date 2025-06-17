import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useFirestore } from "./FirestoreContext";

const ReportContext = createContext();

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

const formatDisplayValue = (key, value) => {

  if (typeof value === 'number') {

    if (key.includes('Revenue') || key.includes('Value')) {
      return formatCurrency(value);
    }

    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  return value;
};


export function ReportProvider({ children }) {

    const { getAllOrders, getAllProducts, getAllUsers } = useFirestore();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState("sales");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [fetchedOrders, fetchedProducts, fetchedUsers] = await Promise.all([
                    getAllOrders(),
                    getAllProducts(),
                    getAllUsers()
                ]);
                setOrders(fetchedOrders);
                setProducts(fetchedProducts);
                setUsers(fetchedUsers);
            } catch (err) {
                console.error("Error fetching data for reports:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const userMap = useMemo(() => 
        new Map(users.map(u => [u.id, u])), [users]
    );

    const productMap = useMemo(() => 
        new Map(products.map(p => [p.id, p])), [products]
    );

    const filteredOrders = useMemo(() => {

        if (!dateRange.start || !dateRange.end) return orders;
        
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        
        return orders.filter(order => {
            const created = new Date(order.createdAt.seconds * 1000);
            return created >= start && created <= end;
        });

    }, [orders, dateRange.start, dateRange.end]);

    const generateSalesReport = useCallback(() => {

        const data = filteredOrders.map(order => ({
            orderId: order.orderId || order.id,
            date: new Date(order.createdAt.seconds * 1000).toLocaleDateString(),
            total: order.orderTotal,
            status: order.orderStatus,
            customer: userMap.get(order.userId)?.name || "Unknown"
        }));

        const totalRevenue = data.reduce((sum, o) => sum + o.total, 0);

        const summary = {
            totalOrders: data.length,
            totalRevenue,
            averageOrderValue: data.length > 0 ? totalRevenue / data.length : 0
        };

        const headers = ["Order ID", "Date", "Customer", "Total", "Status"];
        const rows = data.map(o => [o.orderId, o.date, o.customer, formatCurrency(o.total), o.status]);

        return { summary, headers, rows, type: "sales" };
    }, [filteredOrders, userMap]);

    const generateProductsReport = useCallback(() => {
        const stats = new Map();

        filteredOrders.forEach(order => {
            order.productList.forEach(item => {
                const product = productMap.get(item.productId);
                if (product) {
                    const current = stats.get(product.id) || {
                        name: product.name,
                        category: product.category,
                        quantity: 0,
                        revenue: 0
                    };
                    current.quantity += item.quantity;
                    current.revenue += item.quantity * product.price;
                    stats.set(product.id, current);
                }
            });
        });

        const data = Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
        const totalRevenue = data.reduce((sum, p) => sum + p.revenue, 0);

        const summary = {
            totalProducts: data.length,
            totalUnitsSold: data.reduce((sum, p) => sum + p.quantity, 0),
            totalRevenue
        };

        const headers = ["Product", "Category", "Units Sold", "Revenue"];
        const rows = data.map(p => [p.name, p.category, p.quantity, formatCurrency(p.revenue)]);

        return { summary, headers, rows, type: "products" };
    }, [filteredOrders, productMap]);

    const generateCustomersReport = useCallback(() => {
        const stats = new Map();

        filteredOrders.forEach(order => {
            const userStats = stats.get(order.userId) || { count: 0, total: 0 };
            userStats.count += 1;
            userStats.total += order.orderTotal;
            stats.set(order.userId, userStats);
        });

        const data = users
            .map(user => {
                const s = stats.get(user.id) || { count: 0, total: 0 };
                return {
                    name: user.name || "Unknown",
                    email: user.email || "N/A",
                    totalOrders: s.count,
                    totalSpent: s.total,
                    avgOrderValue: s.count > 0 ? s.total / s.count : 0
                };
            })
            .filter(u => u.totalOrders > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent);

        const totalRevenue = data.reduce((sum, u) => sum + u.totalSpent, 0);

        const summary = {
            totalCustomers: data.length,
            totalRevenue,
            avgCustomerValue: data.length > 0 ? totalRevenue / data.length : 0
        };

        const headers = ["Customer", "Email", "Total Orders", "Total Spent", "Avg Order"];
        const rows = data.map(u => [
            u.name, 
            u.email, 
            u.totalOrders, 
            formatCurrency(u.totalSpent), 
            formatCurrency(u.avgOrderValue)
        ]);

        return { summary, headers, rows, type: "customers" };
    }, [filteredOrders, users]);

    const processReportData = useCallback(() => {
        const generators = {
            sales: generateSalesReport,
            products: generateProductsReport,
            customers: generateCustomersReport
        };

        const generator = generators[reportType];

        if (generator) {
            setReportData(generator());
        }

    }, [reportType, generateSalesReport, generateProductsReport, generateCustomersReport]);

    const generateReport = useCallback(() => {
        if (!reportData) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`${reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)} Report`, 14, 16);
        
        if (dateRange.start && dateRange.end) {
            doc.setFontSize(12);
            doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 24);
        }

        let yPos = dateRange.start && dateRange.end ? 32 : 24;

        doc.setFontSize(10);
        
        if (reportData.summary) {
            Object.entries(reportData.summary).forEach(([key, value]) => {
                const label = formatLabel(key);
                const display = formatDisplayValue(key, value);
                doc.text(`${label}: ${display}`, 14, yPos);
                yPos += 4;
            });
        }

        autoTable(doc, {
            startY: yPos + 4,
            head: [reportData.headers],
            body: reportData.rows,
            theme: "striped",
            headStyles: { fillColor: [59, 130, 246] },
        });

        const filename = `${reportData.type}_report_${new Date().toISOString().split("T")[0]}.pdf`;
        doc.save(filename);
    }, [reportData, dateRange]);

    return (
        <ReportContext.Provider
            value={{
                orders,
                products,
                users,
                loading,
                reportType,
                setReportType,
                dateRange,
                setDateRange,
                reportData,
                processReportData,
                generateReport,
                formatCurrency,
                formatLabel,
                formatDisplayValue
            }}
        >
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    return useContext(ReportContext);
}