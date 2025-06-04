import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCart } from "../contexts/CartContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react"


export default function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsMap, setRatingsMap] = useState({});

    const { currentUser, userData, setUserData } = useAuth();
    const { toggleFavorite, getUserProfile, getAllReviewsGroupedByProduct } = useFirestore();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {

            try {
                const snapshot = await getDocs(collection(db, "products"));

                const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                setProducts(productList);

                const allReviews = await getAllReviewsGroupedByProduct();
                
                const avgMap = {};

                for (const productId in allReviews) {
                    const reviews = allReviews[productId];
                    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                    avgMap[productId] = avg;
                }

                setRatingsMap(avgMap);

            } catch (err) {

                console.error("Error loading products:", err);

            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, []);

    const favoriteSet = useMemo(() => new Set(userData?.favorites || []), [userData]);

    const handleToggleFavorite = async (productId) => {

        if (!currentUser) {
            toast.error("Please log in to favorite items.");
            return;
        }

        const isFavorited = userData.favorites.includes(productId);
        
        try {

            await toggleFavorite(currentUser.uid, productId, isFavorited);

            const updatedUserData = await getUserProfile(currentUser.uid);

            setUserData(updatedUserData);

            toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");

        } catch (err) {

            console.error("Error toggling favorite:", err);

            toast.error("Failed to toggle favorite");

        }
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)]">

            <h1 className="text-3xl font-bold mb-6">Our Products</h1>

            {loading ? (

                <p>Loading products...</p>

            ) : products.length === 0 ? (

                <p>No products available yet.</p>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    {products.map((product) => (

                        <div
                            key={product.id}
                            className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col justify-between"
                        >

                            <img
                                src={product.imageUrl || "/placeholder.jpg"}
                                alt={product.name}
                                className="w-full h-48 object-contain aspect-square rounded mb-4"
                            />

                            <div className="flex justify-between items-center align-middle mb-2">
                                <Link to={`/products/${product.id}`}>
                                    <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                                </Link>

                                <button
                                onClick={() => handleToggleFavorite(product.id)}
                                className="text-[var(--color-primary)] hover:scale-110 transition-transform cursor-pointer"
                                aria-label="Toggle favorite"
                                >
                                    <Heart fill={favoriteSet.has(product.id) ? "var(--color-primary)" : "none"} />
                                </button>

                            </div>

                            <p className="text-[var(--color-primary)] font-bold mb-1">${product.price.toFixed(2)}</p>

                            {ratingsMap[product.id] ? (
                                <div className="flex items-center text-sm mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        fill={star <= ratingsMap[product.id] ? "var(--color-primary)" : "none"}
                                        stroke="var(--color-primary)"
                                    />
                                    ))}
                                    <span className="ml-2">({ratingsMap[product.id].toFixed(1)})</span>
                                </div>
                                ) : (
                                <p className="text-sm text-gray-500 mb-1">No reviews yet</p>
                            )}

                            <button
                                onClick={() => {
                                    addToCart(product);
                                    toast.success(`${product.name} added to cart!`);
                                }}
                                className="btn-primary btn-hover w-full mt-2 flex items-center justify-center"
                            >
                                <ShoppingCart className="mr-2 " />
                                Add to Cart
                            </button>

                        </div>
                    ))}
                    
                </div>
            )}
        </div>
    );
}