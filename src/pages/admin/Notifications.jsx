import { useEffect, useState } from "react";
import { useFirestore } from "../../contexts/FirestoreContext";
import { AlertCircle, MessageCircle, PackageCheck, Star, Users, CheckCircle2, Clock } from "lucide-react";

export default function Notifications() {

    const { getAllOrders, getAllProducts, getAllUsers, getAllReviews } = useFirestore();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {

        async function fetchNotifications() {
            setLoading(true);
            try {
                const [orders, products, users, reviews] = await Promise.all([
                    getAllOrders(),
                    getAllProducts(),
                    getAllUsers(),
                    getAllReviews(),
                ]);

                const userMap = new Map(users.map(user => [user.id, user]));
                const productMap = new Map(products.map(product => [product.id, product]));

                const activity = [];

                for (const order of orders) {
                    const customer = userMap.get(order.userId);
                    const customerName = customer?.name || customer?.email || "Unknown Customer";

                    let productContext = "";
                    
                    if (order.productList?.length > 0) {
                        const firstProduct = productMap.get(order.productList[0].productId);
                        const productCount = order.productList.length;
                        productContext = productCount > 1
                        ? `${firstProduct?.name || "product"} and ${productCount - 1} more`
                        : firstProduct?.name || "product";
                    }

                    activity.push({
                        id: `order-${order.id}`,
                        type: "order",
                        title: "New Order Placed",
                        message: `${customerName} placed an order for ${productContext}`,
                        timestamp: order.createdAt?.seconds * 1000 || Date.now(),
                        isRead: false,
                    });
                }

                for (const review of reviews) {
                    const product = productMap.get(review.productId);
                    const reviewer = userMap.get(review.userId);
                    activity.push({
                        id: `review-${review.id}`,
                        type: "review",
                        title: "New Product Review",
                        message: `${reviewer?.name || "Someone"} left a ${review.rating}-star review for ${product?.name || "a product"}`,
                        timestamp: review.createdAt?.seconds * 1000 || Date.now(),
                        isRead: false,
                    });
                }

                for (const product of products) {
                    if (product.quantity <= 5) {
                            activity.push({
                            id: `stock-${product.id}`,
                            type: "stock",
                            title: product.quantity === 0 ? "Out of Stock" : "Low Stock Alert",
                            message: `${product.name} has only ${product.quantity} left in stock`,
                            timestamp: product.updatedAt?.seconds * 1000 || Date.now(),
                            isRead: false,
                        });
                    }
                }

                for (const user of users) {
                    if (user.role === "user") {
                        activity.push({
                            id: `user-${user.id}`,
                            type: "user",
                            title: "New User Registered",
                            message: `${user.name || user.email} joined the platform`,
                            timestamp: user.createdAt?.seconds * 1000 || Date.now(),
                            isRead: false,
                        });
                    }
                }

                const sorted = activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
                setNotifications(sorted);
                setUnreadCount(sorted.filter(n => !n.isRead).length);

            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    const getTimeAgo = (timestamp) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";

        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;

        const months = Math.floor(days / 30);

        return `${months}mo ago`;
    };  

    const iconMap = {
        order: { icon: PackageCheck, color: "text-green-600", bg: "bg-green-100" },
        review: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
        stock: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
        user: { icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const filtered = notifications.filter(n =>
        filter === "all" ? true : filter === "unread" ? !n.isRead : n.type === filter
    );

    return (
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--color-border)] shadow">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {unreadCount}
                            </span>
                        )}
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                            <button
                            onClick={markAllAsRead}
                            className="btn-primary btn-hover text-sm px-3 py-1 rounded-md"
                            >
                            <CheckCircle2 className="w-4 h-4 mr-1 inline" /> 
                            Mark all as read
                        </button>
                    )}

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-1 bg-[var(--color-bg)] text-[var(--color-text)]"
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="order">Orders</option>
                        <option value="review">Reviews</option>
                        <option value="stock">Stock Alerts</option>
                        <option value="user">Users</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-[var(--color-muted)]">Loading...</p>
            ) : filtered.length === 0 ? (
                <p className="text-[var(--color-muted)] text-center py-8">No notifications found.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map(n => {
                        const Icon = iconMap[n.type]?.icon || MessageCircle;
                        const color = iconMap[n.type]?.color || "text-gray-600";
                        const bg = iconMap[n.type]?.bg || "bg-gray-100";

                        return (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
                                n.isRead
                                    ? "bg-[var(--color-bg)] border-[var(--color-border)]"
                                    : "bg-blue-50 border-blue-200 shadow-sm"
                                }`}
                            >
                                <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-sm font-semibold ${color}`}>{n.title}</h3>
                                    <p className="text-sm text-[var(--color-text)] mb-1">{n.message}</p>
                                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {getTimeAgo(n.timestamp)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}