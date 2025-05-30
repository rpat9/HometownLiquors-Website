import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import { Star, ShoppingCart } from "lucide-react";

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

          {reviews.length > 0 ? (

            <div className="flex items-center space-x-1">

              {[1, 2, 3, 4, 5].map(star => (

                <Star
                  key={star}
                  size={20}
                  fill={star <= averageRating ? "var(--color-primary)" : "none"}
                  stroke="var(--color-primary)"
                />

              ))}

              <span className="text-sm">({averageRating.toFixed(1)})</span>

            </div>

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
            className="btn-primary btn-hover mt-4 flex align-center"
          >
            <ShoppingCart className="mr-2" />
            Add to Cart
          </button>

        </div>

      </div>

      <hr className="my-10" />

      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

      {reviews.length === 0 ? (

        <p className="text-gray-500 mb-6">No reviews yet — be the first to write one!</p>

      ) : (

        <div className="space-y-4 mb-8">

          {reviews.map((review) => (

            <div
              key={review.id}
              className="bg-[var(--card-bg)] border border-[var(--color-border)] p-4 rounded-lg mb-4"
            >

              <div className="flex items-center justify-between mb-1">

                <p className="font-semibold text-[var(--color-primary)]">
                  {reviewerNames[review.userId] || "User"}
                </p>

                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (

                    <Star
                      key={star}
                      size={18}
                      fill={star <= review.rating ? "var(--color-primary)" : "none"}
                      stroke="var(--color-primary)"
                    />

                  ))}
                </div>

              </div>

              {review.comment && <p className="text-sm mt-1">{review.comment}</p>}
            </div>
          ))}

        </div>
      )}

      {currentUser && !hasReviewed && (

        <form onSubmit={handleSubmitReview} className="space-y-4">

          <h3 className="text-xl font-semibold">Leave a Review</h3>

          <div className="flex space-x-1">

            {[1, 2, 3, 4, 5].map((star) => (

              <Star
                key={star}
                size={28}
                className="cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                fill={star <= (hoverRating || rating) ? "var(--color-primary)" : "none"}
                stroke="var(--color-primary)"
              />

            ))}

          </div>

          <div>

            <label htmlFor="comment" className="block mb-1">Comment (optional):</label>

            <textarea
              id="comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Share your thoughts..."
            />

          </div>

          <button type="submit" className="btn-primary btn-hover">
            Submit Review
          </button>

        </form>
      )}

    </div>
  );
}