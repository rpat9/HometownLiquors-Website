import { useEffect, useState } from "react";
import { X, Package, User, DollarSign, FileText } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ViewOrderDetails({ open, order, onClose }) {

  const { getUserProfile, getProductById, updateOrderStatus } = useFirestore();

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || "Processing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order || !open) return;

    setSelectedStatus(order.orderStatus);

    async function fetchDetails() {
      try {
        const fetchedUser = await getUserProfile(order.userId);
        setUser(fetchedUser);

        const items = await Promise.all(
          order.productList.map(async (item) => {
            const product = await getProductById(item.productId);
            return {
              ...product,
              quantity: item.quantity,
              subtotal: product.price * item.quantity,
            };
          })
        );

        setProducts(items);
      } catch (err) {
        console.error("Error loading order details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [order, open]);

  const formatDate = (timestamp) => {
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleStatusUpdate = async () => {

    if (selectedStatus === order.orderStatus) {
      toast("No changes made");
      return;
    }

    try {

      setStatusUpdating(true);
      await updateOrderStatus(order.id, selectedStatus);
      order.orderStatus = selectedStatus;
      toast.success("Order status updated");

    } catch (err) {

      console.error("Failed to update order status:", err);
      toast.error("Couldn't update order status");

    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReceipt = () => {
    const doc = new jsPDF();
    doc.text("Order Receipt", 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [["Product", "Quantity", "Unit Price", "Subtotal"]],
      body: products.map((p) => [
        p.name,
        p.quantity,
        `$${p.price.toFixed(2)}`,
        `$${p.subtotal.toFixed(2)}`
      ]),
    });

    doc.save("orderReceipt.pdf");
  };

  if (!open || !order) return null;

  return (
    <>
      
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          open ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full bg-[var(--card-bg)] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } w-full lg:w-[500px] xl:w-[600px]`}
      >
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Order Details</h2>

          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={20} />
          </button>

        </div>

        
        <div className="h-full overflow-y-auto pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">

                <div className="flex items-center gap-3 mb-4">

                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Order #{order.orderId || order.id}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  <div className="flex items-center gap-3">

                    <DollarSign className="w-4 h-4 text-green-600" />

                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>

                      <p className="font-semibold text-green-600">
                        {order.orderTotal.toFixed(2)}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className={`w-3 h-3 rounded-full ${
                      order.orderStatus === "Processing" ? "bg-yellow-500" :
                      order.orderStatus === "Shipped" ? "bg-blue-500" :
                      order.orderStatus === "Delivered" ? "bg-green-500" :
                      order.orderStatus === "Cancelled" ? "bg-red-500" : "bg-gray-500"
                    }`} />

                    <div>
                      <p className="text-sm text-gray-600">Status</p>

                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="mt-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-700"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                    </div>

                  </div>

                </div>
              </div>

              
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">

                <div className="flex items-center gap-3 mb-4">

                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>

                  <h3 className="font-semibold text-lg">Customer Information</h3>

                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium">{user?.name || "Unknown Customer"}</p>
                  </div>

                  {user?.email && (

                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>

                  )}

                  <div>
                    <p className="text-sm text-gray-600">Customer Since</p>

                    <p className="font-medium">
                      {user?.createdAt ? 
                        new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
                        "N/A"
                      }
                    </p>

                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>

                    <p className="font-medium">
                      {user?.orderHistory ? user.orderHistory.length : 0}
                    </p>

                  </div>

                </div>
              </div>

              {order.pickupInstructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>

                    <h3 className="font-semibold text-lg">Pickup Instructions</h3>

                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {order.pickupInstructions}
                  </p>

                </div>
              )}

              <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Order Items ({products.length})</h3>
                
                <div className="space-y-4">

                  {products.map((product, index) => (

                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">

                      <div className="flex-1">

                        <h4 className="font-medium text-gray-900">{product.name}</h4>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Qty: {product.quantity}</span>
                          <span>×</span>
                          <span>${product.price.toFixed(2)}</span>
                        </div>

                        {product.description && (

                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>

                        )}

                      </div>
                      
                      <div className="text-right ml-4">

                        <p className="font-semibold text-lg">
                          ${product.subtotal.toFixed(2)}
                        </p>

                      </div>

                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-4">

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Order Total</span>
                    <span className="text-green-600">${order.orderTotal.toFixed(2)}</span>
                  </div>

                </div>
              </div>

              <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--color-border)] p-6 -mx-6">

                <div className="flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    {statusUpdating ? "Updating..." : "Update Status"}
                  </button>

                  <button 
                  onClick={handleReceipt}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium cursor-pointer transition-colors">
                    Receipt PDF
                  </button>

                </div>

              </div>

            </div>
          )}
          
        </div>
      </div>
    </>
  );
}