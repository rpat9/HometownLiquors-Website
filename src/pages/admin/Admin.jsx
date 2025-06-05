import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";

export default function Admin() {

  const { getAllProducts, getAllOrders } = useFirestore();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const fetchedProducts = await getAllProducts();
        console.log(`Products Fetched ${fetchedProducts}`)
        const fetchedOrders = await getAllOrders();
        console.log(`Orders Fetched ${fetchedProducts}`)
        const totalRevenue = fetchedOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );
        console.log("Check")
        setProducts(fetchedProducts);
        setOrders(fetchedOrders);
        setStats({
          products: fetchedProducts.length,
          orders: fetchedOrders.length,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      color: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      label: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "bg-yellow-100",
      text: "text-yellow-600",
    },
    {
      label: "Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-100",
      text: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map(({ label, value, icon: Icon, color, text }, i) => (
        <div
          key={i}
          className={`p-6 rounded-xl shadow-sm border border-[var(--color-border)] ${color} hover:shadow-md transition`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
                {label}
              </h4>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${text} bg-white shadow-inner`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
