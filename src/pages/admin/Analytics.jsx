import { useEffect, useState } from "react";
import { useFirestore } from "../../contexts/FirestoreContext";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {

  const { getAllOrders, getAllUsers, getAllProducts } = useFirestore();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {

    async function fetchData() {
      const orders = await getAllOrders();
      const products = await getAllProducts();
      const users = await getAllUsers();

      setOrders(orders);
      setProducts(products);
      setUsers(users);
    }

    fetchData();
  }, []);

  useEffect(() => {

    if (!dateRange.start || !dateRange.end) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const createdAt = new Date(order.createdAt.seconds * 1000);
      return createdAt >= dateRange.start && createdAt <= dateRange.end;
    });

    setFilteredOrders(filtered);

  }, [orders, dateRange]);

  
  const revenueByDate = {};

  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt.seconds * 1000).toLocaleDateString();
    revenueByDate[date] = (revenueByDate[date] || 0) + order.orderTotal;
  });

  const revenueData = {
    labels: Object.keys(revenueByDate),
    datasets: [
      {
        label: "Revenue",
        data: Object.values(revenueByDate),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        fill: true
      }
    ]
  };

  const statusCounts = filteredOrders.reduce((acc, order) => {
    acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ["#facc15", "#60a5fa", "#34d399", "#f87171"]
      }
    ]
  };

  const categoryMap = {};
  filteredOrders.forEach((order) => {
    order.productList.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const amount = item.quantity * product.price;
        categoryMap[product.category] = (categoryMap[product.category] || 0) + amount;
      }
    });
  });

  const categoryData = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        label: "Revenue",
        data: Object.values(categoryMap),
        backgroundColor: ["#4ade80", "#fbbf24", "#818cf8", "#f472b6"]
      }
    ]
  };

  const customerMap = {};
  filteredOrders.forEach((order) => {
    customerMap[order.userId] = (customerMap[order.userId] || 0) + order.orderTotal;
  });

  const lifetimeValue = users.length > 0
    ? Object.values(customerMap).reduce((sum, v) => sum + v, 0) / users.length
    : 0;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="flex gap-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                    type="date"
                    value={dateRange.start ? dateRange.start.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                        setDateRange((prev) => ({
                        ...prev,
                        start: new Date(e.target.value),
                        }))
                    }
                    className="input p-2 border rounded-md w-full cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                    type="date"
                    value={dateRange.end ? dateRange.end.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                        setDateRange((prev) => ({
                        ...prev,
                        end: new Date(e.target.value),
                        }))
                    }
                    className="input p-2 border rounded-md w-full cursor-pointer"
                />
            </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow border">
          <h3 className="text-md font-semibold mb-2">Revenue Over Time</h3>
          <Line data={revenueData} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow border">
          <h3 className="text-md font-semibold mb-2">Orders by Status</h3>
          <Pie data={statusData} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow border">
          <h3 className="text-md font-semibold mb-2">Revenue by Category</h3>
          <Bar data={categoryData} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border">
        <h3 className="text-md font-semibold">Customer Lifetime Value</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">
          ${lifetimeValue.toFixed(2)}
        </p>
      </div>
    </div>
  );
}