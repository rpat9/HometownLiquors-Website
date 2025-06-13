import { useEffect, useState } from "react";
import { Search, Eye, Trash2, FileDown } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import ViewOrderDetails from "./ViewOrderDetails";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ViewOrders() {
  const { getAllOrders, getUserProfile, getProductById } = useFirestore();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {

      const rawOrders = await getAllOrders();

      const enriched = await Promise.all(

        rawOrders.map(async (order) => {

          const user = await getUserProfile(order.userId);

          const productNames = await Promise.all(

            order.productList.map(async (item) => {
              const product = await getProductById(item.productId);

              return `${item.quantity}x ${product?.name || "Unknown"}`;
            })

          );

          return {
            ...order,
            customerName: user?.name || "Unknown",
            productSummary: productNames.join(", ")
          };

        })
      );

      setOrders(enriched);
    };

    fetchOrders();
  }, []);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("All Orders", 14, 16);

    autoTable(doc, {

      startY: 20,
      head: [["Customer", "Products", "Date", "Total", "Status"]],
      body: orders.map((o) => [
        o.customerName,
        o.productSummary,
        new Date(o.createdAt.seconds * 1000).toLocaleDateString(),
        `$${o.orderTotal.toFixed(2)}`,
        o.orderStatus
      ]),

      styles: {
        cellPadding: 3,
        overflow: 'linebreak',
      },

      columnStyles: {
        1: {
          cellWidth: 70,
          overflow: 'linebreak'
        }
      }

    });

    doc.save("orders.pdf");
  };

  const filteredOrders = orders.filter(order => {
    const query = search.toLowerCase();
    const matchSearch =
      order.customerName.toLowerCase().includes(query) ||
      order.productSummary.toLowerCase().includes(query) ||
      order.orderId?.toLowerCase().includes(query) ||
      order.orderStatus?.toLowerCase().includes(query);

    const matchStatus = filterStatus ? order.orderStatus === filterStatus : true;

    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex border border-[var(--color-border)] rounded-lg">
            <input
              type="text"
              placeholder="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input p-2"
            />
            <button className="cursor-pointer pr-3">
              <Search />
            </button>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input p-2 border border-[var(--color-border)] rounded-lg cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-2 border px-4 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition"
          >
            <FileDown className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                <td className="p-3">{order.customerName}</td>
                <td className="p-3 max-w-[200px] truncate" title={order.productSummary}>{order.productSummary}</td>
                <td className="p-3">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                <td className="p-3">${order.orderTotal.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.orderStatus === "Processing" ? "bg-yellow-100 text-yellow-700" :
                    order.orderStatus === "Shipped" ? "bg-blue-100 text-blue-700" :
                    order.orderStatus === "Completed" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" : ""
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-600 cursor-pointer">
                    <Eye className="w-6 h-8" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <ViewOrderDetails open={Boolean(selectedOrder)} order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}