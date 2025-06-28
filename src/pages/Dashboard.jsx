import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const { currentUser, userData, setUserData } = useAuth();
    const { updateUserProfile, getUserProfile, getOrdersByIds, getFavorites, getProductById } = useFirestore();

    const [preferences, setPreferences] = useState({
        lowStock: false,
        newStock: false,
        restockAlerts: false,
    });

    const [orders, setOrders] = useState([]);
    const [favoriteProducts, setFavoriteProducts] = useState([]);


    useEffect(() => {
        if (userData?.notificationPreferences) {
            setPreferences(userData.notificationPreferences);
        }
    }, [userData]);


    useEffect(() => {

        const fetchOrders = async () => {
            if (userData?.orderHistory?.length) {
                const orderDocs = await getOrdersByIds(userData.orderHistory);
                setOrders(orderDocs);
            }
        };
    
        fetchOrders();
    }, [userData?.orderHistory]);


    useEffect(() => {
        const fetchFavorites = async () => {
            if (currentUser) {
                const favoriteIds = await getFavorites(currentUser.uid);
                if (favoriteIds?.length) {
                    const favoriteProductsData = await Promise.all(
                        favoriteIds.map(async (productId) => {
                            return await getProductById(productId);
                        })
                    );
                    setFavoriteProducts(favoriteProductsData.filter(Boolean));
                }
            }
        };

        fetchFavorites();
    }, [currentUser, userData]);


    const handleToggle = (field) => {
        setPreferences((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };


    const handleSave = async () => {
        if (currentUser) {
            await updateUserProfile(currentUser.uid, {
                notificationPreferences: preferences,
            });

            const updatedData = await getUserProfile(currentUser.uid);
            setUserData(updatedData);

            toast.success("Preferences updated!");
        }
    };


    return (
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-10 text-[var(--color-text-primary)]">

            <h1 className="text-3xl font-bold">
                Welcome, {userData?.name || "User"}!
            </h1>

            <section className="space-y-4">

                <h2 className="text-2xl font-semibold">Notification Preferences</h2>

                <div className="space-y-2">

                    {Object.entries(preferences).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() => handleToggle(key)}
                                className="accent-[var(--color-primary)]"
                            />
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}

                </div>

                <button onClick={handleSave} className="btn-primary btn-hover mt-2">
                    Save Preferences
                </button>

            </section>

            <section>

                <h2 className="text-2xl font-semibold mb-2">Your Favorites</h2>

                <div className="border border-[var(--color-border)] p-6 rounded-xl bg-[var(--card-bg)]">
                    {favoriteProducts.length === 0 ? (
                        <p>You haven't added any favorites yet.</p>
                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {favoriteProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-[var(--color-border)] p-4 rounded-lg bg-[var(--color-bg)]"
                                >
                                    {product.imageUrl && (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            className="w-full h-32 object-contain rounded-md mb-3"
                                        />
                                    )}

                                    <Link to={`/products/${product.id}`}>
                                        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                                    </Link>
                                    
                                    <p className="text-[var(--color-primary)] font-bold">${product.price?.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </section>

            <section>

                <h2 className="text-2xl font-semibold mb-2">Your Orders</h2>

                {orders.length === 0 ? (

                    <div className="border border-[var(--color-border)] p-6 rounded-xl bg-[var(--card-bg)]">
                        You haven't placed any orders yet.
                    </div>

                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="border border-[var(--color-border)] p-4 rounded-xl bg-[var(--card-bg)]"
                            >
                                <p className="font-semibold">Order ID: {order.id}</p>
                                <p>Status: {order.orderStatus}</p>
                                <p>Total: ${order.orderTotal.toFixed(2)}</p>
                                {order.orderStatus === 'Completed' ? (
                                    <p>
                                        Picked up on {
                                            order.readableCreatedAt
                                                ? (() => {
                                                    const parts = order.readableCreatedAt.split(', ');
                                                    if (parts.length === 4) {
                                                        return `${parts[1]} ${parts[2]} at ${parts[3]}`;
                                                    }
                                                    return order.readableCreatedAt;
                                                })()
                                                : "Unknown"
                                        }
                                    </p>
                                ) : order.orderStatus === 'Cancelled' ? (
                                    <p>
                                        Cancelled on {
                                            order.readableCreatedAt
                                                ? (() => {
                                                    const parts = order.readableCreatedAt.split(', ');
                                                    if (parts.length === 4) {
                                                        return `${parts[1]} ${parts[2]} at ${parts[3]}`;
                                                    }
                                                    return order.readableCreatedAt;
                                                })()
                                                : "Unknown"
                                        }
                                    </p>
                                ) : (
                                    <p>
                                        Pickup Time: {order.pickupTime
                                            ? new Date(order.pickupTime).toLocaleString([], {
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                            })
                                            : "N/A"}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </section>

        </div>
    );
}