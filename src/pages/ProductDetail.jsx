import { useFirestore } from "../contexts/FirestoreContext";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";

export default function ProductDetail() {

    const { id } = useParams();
    const { getProductById } = useFirestore();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(()=>{

        const fetchProduct = async () => {
            
            try {
                const data = await getProductById(id);

                if (data) setProduct(data);
                else toast.error("Product not found");

            } catch (err) {

                toast.error("Failed to load product");
                console.error("Error loading product:", err);

            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, getProductById]);

    if (loading) {
        return <div className="p-6 text-[var(--color-text-primary)]">Loading...</div>;
    }
    
    if (!product) {
        return <div className="p-6 text-[var(--color-text-primary)]">Product not found.</div>;
    }
    
    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)]">

          <div className="flex flex-col lg:flex-row gap-10">

            <div className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-xl w-full lg:w-1/2">

              <img
                src={product.imageUrl || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-80 object-contain rounded-xl"
              />

            </div>
    
            <div className="w-full lg:w-1/2 space-y-4">

              <h1 className="text-3xl font-bold">{product.name}</h1>

              <p className="text-xl text-[var(--color-primary)] font-semibold">

                ${product.price.toFixed(2)}

              </p>
    
              {product.rating ? (
                <p>

                  {"★".repeat(Math.floor(product.rating))}

                  {"☆".repeat(5 - Math.floor(product.rating))} ({product.rating.toFixed(1)})

                </p>

              ) : (
                <p className="text-gray-500">No reviews yet — be the first!</p>
              )}
    
              <p className="text-sm">Category: {product.category}</p>

              <p className="text-sm">Stock: {product.quantity} available</p>
    
              <button
                onClick={() => {
                  addToCart(product);
                  toast.success("Added to cart!");
                }}
                className="btn-primary btn-hover mt-4"
              >
                Add to Cart
              </button>

            </div>

          </div>

        </div>
    );
}   