import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import { Star, ShoppingCart, Package, Tag, Building, Layers, Box, TrendingUp } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getProductById, getReviewsByProductId, addReview, getUserProfile } = useFirestore();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewerNames, setReviewerNames] = useState({});
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const fetchedProduct = await getProductById(id);

        if (!fetchedProduct) {
          toast.error("Product not found");
          setLoading(false);
          return;
        }

        setProduct(fetchedProduct);
        const fetchedReviews = await getReviewsByProductId(id);
        setReviews(fetchedReviews);

        const avg = fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / (fetchedReviews.length || 1);
        setAverageRating(avg);

        if (currentUser) {
          const alreadyReviewed = fetchedReviews.some(r => r.userId === currentUser.uid);
          setHasReviewed(alreadyReviewed);
        }

        const nameMap = {};
        for (const review of fetchedReviews) {
          const profile = await getUserProfile(review.userId);
          nameMap[review.userId] = profile?.name || "Anonymous";
        }
        setReviewerNames(nameMap);

      } catch (err) {

        toast.error("Failed to load product");
        console.error("Error loading product:", err);

      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [id, currentUser]);


  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !currentUser) return;

    try {
      await addReview(id, currentUser.uid, rating, comment);
      toast.success("Review submitted!");
      setComment("");
      setHasReviewed(true);

      const updatedReviews = await getReviewsByProductId(id);
      setReviews(updatedReviews);
      const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / (updatedReviews.length || 1);
      setAverageRating(avg);

      const nameMap = {};

      for (const review of updatedReviews) {
        const profile = await getUserProfile(review.userId);
        nameMap[review.userId] = profile?.name || "Anonymous";
      }

      setReviewerNames(nameMap);

    } catch (err) {
      console.error("Failed to add review:", err);
      toast.error("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg text-[var(--color-text-primary)]">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          <div className="relative">

            <div className="aspect-square bg-[var(--card-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg">

              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />

              <div className="absolute top-4 right-4">
                {product.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    • Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    • Unavailable
                  </span>
                )}
              </div>

            </div>

          </div>

          <div className="space-y-6">

            <div className="space-y-3">

              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-[var(--color-primary)]">
                  ${product.price.toFixed(2)}
                </span>

                {reviews.length > 0 && (
                  <div className="flex items-center space-x-2">

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= averageRating ? "var(--color-primary)" : "none"}
                          stroke="var(--color-primary)"
                        />
                      ))}
                    </div>

                    <span className="text-sm text-[var(--color-text-secondary)]">
                      ({averageRating.toFixed(1)}) • {reviews.length} reviews
                    </span>

                  </div>
                )}

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {[
                { icon: Building, label: "Brand", value: product.brand },
                { icon: Tag, label: "Category", value: product.category },
                { icon: Layers, label: "Department", value: product.department },
                { icon: Box, label: "Stock", value: `${product.quantity} available` },
                ...(product.details ? [
                  { icon: Package, label: "Pack", value: product.details.pack },
                  { icon: TrendingUp, label: "Type", value: product.details.type },
                ] : [])
              ].filter(item => item.value && item.value !== "N/A").map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--color-border)]">
                  <item.icon className="w-4 h-4 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--color-primary)] font-medium">{item.label}</p>
                    <p className="text-sm text-[var(--color-text-primary)] font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}

            </div>

            <button
              onClick={() => {
                addToCart(product);
                toast.success(`${product.name} added to cart`);
              }}
              className="btn-primary btn-hover w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-8 text-lg font-semibold rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>

          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--color-border)] p-6 lg:p-8">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Customer Reviews</h2>
            
            {reviews.length > 0 && (
              <div className="flex items-center space-x-1">
                <Star size={20} fill="var(--color-primary)" stroke="var(--color-primary)" />
                <span className="text-lg font-semibold text-[var(--color-primary)]">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}

          </div>

          {reviews.length === 0 ? (

            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-[var(--color-text-primary)] mb-6">No reviews yet — be the first to write one!</p>
            </div>

          ) : (
            <div className="space-y-4 mb-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[var(--bg-primary)] border border-[var(--color-border)] p-5 rounded-xl"
                >

                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-[var(--color-primary)]">
                      {reviewerNames[review.userId] || "User"}
                    </p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= review.rating ? "var(--color-primary)" : "none"}
                          stroke="var(--color-primary)"
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-[var(--color-text-primary)] leading-relaxed">{review.comment}</p>
                  )}

                </div>
              ))}
            </div>
          )}

          {currentUser && !hasReviewed && (
            <div className="border-t border-[var(--color-border)] pt-6">
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Leave a Review</h3>

                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      className="cursor-pointer hover:scale-110 transition-all duration-200"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      fill={star <= (hoverRating || rating) ? "var(--color-primary)" : "none"}
                      stroke="var(--color-primary)"
                    />
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full p-4 border border-[var(--color-border)] rounded-xl bg-[var(--bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />

                <button type="submit" className="btn-primary btn-hover px-6 py-3 rounded-xl font-semibold">
                  Submit Review
                </button>

              </form>

            </div>
          )}
        </div>

      </div>
      
    </div>
  );
}