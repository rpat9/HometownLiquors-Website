import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";


export default function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {

            try {
                const snapshot = await getDocs(collection(db, "products"));

                const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                setProducts(productList);

            } catch (err) {

                console.error("Error loading products:", err);

            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, []);

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
                                className="w-full h-48 object-fill rounded mb-4"
                            />

                            <Link to={`/products/${product.id}`}>
                            <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                            </Link>

                            <p className="text-[var(--color-primary)] font-bold mb-1">${product.price.toFixed(2)}</p>

                            {product.rating ? (
                                <p className="text-sm mb-1">
                                    {"★".repeat(Math.floor(product.rating))}
                                    {"☆".repeat(5 - Math.floor(product.rating))} ({product.rating.toFixed(1)})
                                </p>

                            ) : (

                                <p className="text-sm text-gray-500 mb-1">No reviews yet — be the first!</p>

                            )}

                            <button
                                onClick={() => {
                                    addToCart(product);
                                    toast.success(`${product.name} added to cart!`);
                                }}
                                className="btn-primary btn-hover w-full mt-2"
                            >
                                Add to Cart
                            </button>

                        </div>
                    ))}
                    
                </div>
            )}
        </div>
    );
}
