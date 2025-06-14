import { useState, useEffect } from "react";
import { X, DollarSign, Star, Edit3, Trash2, Save, XCircle } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import toast from "react-hot-toast";

export default function ViewProductDetails({ open, product, onClose, onProductUpdate }) {
  const { getReviewsByProductId, updateProduct, deleteProduct, uploadImage } = useFirestore();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) return;
    setEditMode(false);
    setEditableProduct({ ...product, imageFile: null });

    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await getReviewsByProductId(product.id);
        setReviews(res);
        const avg = res.length > 0 ? res.reduce((sum, r) => sum + r.rating, 0) / res.length : 0;
        setAverageRating(avg);
      } catch (err) {
        toast.error("Failed to fetch reviews");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [open, product]);

  const formatDate = (timestamp) => {
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const handleSave = async () => {

    try {
      setSaving(true);

      let updatedProduct = { ...editableProduct };

      if (editableProduct.imageFile) {
        const newImageUrl = await uploadImage(editableProduct.imageFile);
        updatedProduct.imageUrl = newImageUrl;
      }

      const { imageFile, ...productData } = updatedProduct;

      await updateProduct(editableProduct.id, {
        ...productData,
        updatedAt: new Date()
      });

      toast.success("Product updated");
      setEditMode(false);
      onProductUpdate?.();

    } catch (err) {

      console.error(err);
      toast.error("Update failed");

    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      await deleteProduct(product.id);
      toast.success("Product deleted");

      onProductUpdate?.();
      onClose();

    } catch (err) {
      toast.error("Deletion failed");
      console.error(err);
    }
  };

  if (!open || !product) return null;

  return (
    <>
        <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          open ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}/>
            <div className="fixed top-0 right-0 h-full bg-[var(--card-bg)] shadow-xl w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out">
            
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Product Details</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer">
                        <X />
                    </button>
                </div>

        
                <div className="p-6 overflow-y-auto space-y-6 pb-24">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : (
                    <>

                        <div className="flex items-start gap-4">
                            <img src={editableProduct.imageUrl} className="w-24 h-24 object-cover rounded-lg border" alt="" />
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold text-lg text-gray-900">{editableProduct.name}</h3>
                                <p className="text-sm text-gray-600">{editableProduct.category}</p>
                                <div className="flex items-center gap-2">
                                    {renderStars(averageRating)} 
                                    <span className="text-sm text-gray-600">({reviews.length})</span>
                                </div>
                            </div>
                        </div>

                        
                        {editMode ? (

                            <div className="p-2 space-y-4 rounded-lg border-1 border-[var(--color-primary)]">
                                <input value={editableProduct.name} 
                                    onChange={e => setEditableProduct(p => ({ ...p, name: e.target.value }))} 
                                    className="input w-full border-1 rounded-lg p-1" 
                                    placeholder="Name" />

                                <input value={editableProduct.category} 
                                    onChange={e => setEditableProduct(p => ({ ...p, category: e.target.value }))} 
                                    className="input w-full border-1 rounded-lg p-1" 
                                    placeholder="Category" />

                                <input type="number" value={editableProduct.price} 
                                    onChange={e => setEditableProduct(p => ({ ...p, price: parseFloat(e.target.value) }))}
                                    className="input w-full border-1 rounded-lg p-1" 
                                    placeholder="Price" />

                                <input type="number" value={editableProduct.quantity} 
                                    onChange={e => setEditableProduct(p => ({ ...p, quantity: parseInt(e.target.value) }))} 
                                    className="input w-full border-1 rounded-lg p-1" 
                                    placeholder="Stock" />

                                <input value={editableProduct.imageUrl} 
                                    onChange={e => setEditableProduct(p => ({ ...p, imageUrl: e.target.value, imageFile: null }))} 
                                    className="input w-full border-1 rounded-lg p-1" 
                                    placeholder="Image URL" />

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full border-1 rounded-lg p-1 cursor-pointer hover:scale-101 transition ease-in-out"
                                    onChange={(e) => setEditableProduct(p => ({ ...p, imageFile: e.target.files[0], imageUrl: "" }))}
                                />

                            </div>

                        ) : (

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <p className="font-medium text-green-600">{product.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">In Stock</p>
                                    <p className="font-medium">{product.quantity} units</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-lg mb-2">Customer Reviews</h4>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {reviews.length > 0 ? (

                                    reviews.map((review, i) => (
                                    <div key={i} className="border rounded-lg p-3 text-sm bg-gray-50">
                                        <div className="flex justify-between items-center mb-1">
                                        <div className="flex">{renderStars(review.rating)}</div>
                                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <p>{review.comment}</p>
                                    </div>
                                    ))

                                ) : (

                                    <p className="text-gray-500 text-sm">No reviews yet</p>
                                )}
                            </div>

                        </div>
                    </>
                    )}
                </div>

                <div className="p-6 border-t border-[var(--color-border)] flex gap-3 sticky bottom-0 bg-[var(--card-bg)]">
                    {editMode ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </>
                    )}
                </div>
      </div>
    </>
  );
}