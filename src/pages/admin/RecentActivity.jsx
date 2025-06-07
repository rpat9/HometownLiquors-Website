import { useEffect, useState } from "react";
import { ShoppingCart, Package, User, Upload, MoreVertical } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function RecentActivity() {
    const { getAllOrders, getAllProducts } = useFirestore();
    const { userData } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecentActivities() {
            try {
                const orders = await getAllOrders();
                const products = await getAllProducts();
                
                const activityList = [];

                
                orders
                    .sort((a, b) => {
                        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
                        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
                        return dateB - dateA;
                    })
                    .slice(0, 4)
                    .forEach(order => {
                        // Get the first product from the order's productList
                        const firstProduct = order.productList?.[0];
                        if (firstProduct) {
                            const product = products.find(p => p.id === firstProduct.productId);
                            if (product) {
                                const orderDate = order.createdAt?.seconds ? 
                                    new Date(order.createdAt.seconds * 1000) : 
                                    new Date(order.createdAt);
                                
                                activityList.push({
                                    id: `sale-${order.orderId || order.id}`,
                                    type: 'sale',
                                    icon: ShoppingCart,
                                    iconBg: 'bg-blue-500',
                                    title: 'Product sold',
                                    description: `${userData?.name.toUpperCase() || "User"} purchased "${product.name}" - $${order.orderTotal?.toFixed(2) || '0.00'}`,
                                    time: getTimeAgo(orderDate),
                                    timestamp: orderDate
                                });
                            }
                        }
                    });

                // Add recent products as activities
                products
                    .sort((a, b) => {
                        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
                        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
                        return dateB - dateA;
                    })
                    .slice(0, 2)
                    .forEach(product => {
                        const productDate = product.createdAt?.seconds ? 
                            new Date(product.createdAt.seconds * 1000) : 
                            new Date(product.createdAt);
                        
                        activityList.push({
                            id: `product-${product.id}`,
                            type: 'product',
                            icon: Package,
                            iconBg: 'bg-purple-500',
                            title: 'Product added to inventory',
                            description: `New product "${product.name}" added - ${product.price?.toFixed(2)}`,
                            time: getTimeAgo(productDate),
                            timestamp: productDate
                        });
                    });

                
                const sortedActivities = activityList
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 6);

                setActivities(sortedActivities);
            } catch (error) {
                toast.error("Error displaying recent activities")
                console.error("Error fetching recent activities:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecentActivities();
    }, []);

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    if (loading) {
        return (
            <div className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Recent Activity
                    </h2>
                    <MoreVertical className="w-5 h-5 text-[var(--color-text-secondary)] cursor-pointer" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Recent Activity
                </h2>
                <MoreVertical className="w-5 h-5 text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors" />
            </div>

            <div className="space-y-4 relative">
                
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border)] opacity-30 z-0"></div>
                
                {activities.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                        <div key={activity.id} className="relative z-10">
                            <div className="flex items-start space-x-3 group hover:bg-[var(--color-bg)] hover:bg-opacity-50 p-2 rounded-lg transition-colors cursor-pointer">
                                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-[var(--card-bg)]`}>
                                    <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                                                {activity.description}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-3 opacity-50" />
                    <p className="text-[var(--color-text-secondary)] text-sm">No recent activity</p>
                </div>
            )}
        </div>
    );
}