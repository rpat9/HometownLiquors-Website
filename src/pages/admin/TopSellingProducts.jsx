import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TopSellingProducts() {

    const { getAllOrders, getAllProducts } = useFirestore();
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        async function fetchTopProducts() {
            const orders = await getAllOrders();
            const products = await getAllProducts();
            const salesMap = {}

            orders.forEach((order) => {
                order.productList.forEach((product) => {
                    const productId = product.productId;
                    const quantity = product.quantity;

                    if (!salesMap[productId]){
                        salesMap[productId] = { quantity: 0 }
                    }
                    salesMap[productId].quantity += quantity;
                });
            });

            const topSelling = Object.entries(salesMap).map(([productId, { quantity }]) => {
                const matchProduct = products.find((p) => p.id === productId);

                if (!matchProduct) return null;

                return {
                    name: matchProduct.name,
                    price: matchProduct.price,
                    quantity,
                    amount: matchProduct.price * quantity,
                    dateAdded: matchProduct.createdAt?.toDate?.() || new Date(),
                }
            }).filter(Boolean)

            setTopProducts(topSelling)

        }

        fetchTopProducts();
    }, [])


    const handleExport = () => {
        const doc = new jsPDF();
        doc.text("Top Selling Products", 14, 16);
    
        autoTable(doc, {
          startY: 20,
          head: [["Name", "Price", "Quantity", "Revenue"]],
          body: topProducts.map((p) => [
            p.name,
            `$${p.price.toFixed(2)}`,
            p.quantity,
            `$${p.amount.toFixed(2)}`,
          ]),
        });
    
        doc.save("top_selling_products.pdf");

      };
    
      return (

        <div className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Top Selling Products
                </h2>

                <button
                onClick={handleExport}
                className="flex items-center gap-1 btn-primary btn-hover"
                >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
                {topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-4">
                    
                    
                    <div>
                        <p className="text-[var(--color-text-primary)] font-semibold text-sm sm:text-base">
                            {p.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {p.quantity} units • ${p.amount.toFixed(2)}
                        </p>
                    </div>

                    
                    <div className="text-right">
                        <p className="text-[var(--color-primary)] font-semibold text-sm sm:text-base">
                            ${p.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            Unit Price
                        </p>
                    </div>
                </div>
                ))}
            </div>
        </div>
      );
}