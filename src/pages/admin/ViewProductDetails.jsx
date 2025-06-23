import { useState, useEffect } from "react";
import { X, DollarSign, Star, Edit3, Trash2, Save, XCircle, Package, Tag, Hash, Droplets } from "lucide-react";
import { useFirestore } from "../../contexts/FirestoreContext";
import toast from "react-hot-toast";

export default function ViewProductDetails({ open, product, onClose, onProductUpdate }) {

  const { getReviewsByProductId, updateProduct, deleteProduct, uploadImage } = useFirestore();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) return;
    setEditMode(false);
    
    const productWithDefaults = { 
      ...product, 
      imageFile: null,
      details: {
        pack: product.details?.pack || "",
        type: product.details?.type || "",
        upc: product.details?.upc || "",
        volume: product.details?.volume || ""
      }
    };

    setCurrentProduct(productWithDefaults);

    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await getReviewsByProductId(product.id);
        setReviews(res);
        setAverageRating(res.length > 0 ? res.reduce((sum, r) => sum + r.rating, 0) / res.length : 0);
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
      let updatedProduct = { ...currentProduct };

      if (currentProduct.imageFile) {
        updatedProduct.imageUrl = await uploadImage(currentProduct.imageFile);
      }

      const { imageFile, ...productData } = updatedProduct;
      await updateProduct(currentProduct.id, { ...productData, updatedAt: new Date() });

      setCurrentProduct(updatedProduct); // Update local state immediately
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

  const updateField = (field, value) => {
    setCurrentProduct(p => ({ ...p, [field]: value }));
  };

  const updateDetails = (field, value) => {
    setCurrentProduct(p => ({ ...p, details: { ...p.details, [field]: value } }));
  };

  if (!open || !product) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          open ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
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
                <img src={currentProduct.imageUrl} className="w-24 h-24 object-cover rounded-lg border" alt="" />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg text-gray-900">{currentProduct.name}</h3>
                  <p className="text-sm text-gray-600">{currentProduct.brand} • {currentProduct.category}</p>
                  <div className="flex items-center gap-2">
                    {renderStars(averageRating)} 
                    <span className="text-sm text-gray-600">({reviews.length})</span>
                  </div>
                </div>
              </div>

              {editMode ? (
                <div className="p-4 space-y-4 rounded-lg border-2 border-[var(--color-primary)] bg-blue-50">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={currentProduct.name} onChange={e => updateField('name', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Product Name" />
                    <input value={currentProduct.brand || ""} onChange={e => updateField('brand', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Brand" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input value={currentProduct.category} onChange={e => updateField('category', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Category" />
                    <input value={currentProduct.sku || ""} onChange={e => updateField('sku', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="SKU" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" step="0.01" value={currentProduct.price} onChange={e => updateField('price', parseFloat(e.target.value) || 0)} className="input w-full border rounded-lg p-2" placeholder="Price" />
                    <input type="number" value={currentProduct.quantity} onChange={e => updateField('quantity', parseInt(e.target.value) || 0)} className="input w-full border rounded-lg p-2" placeholder="Stock Quantity" />
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-3">Product Details</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={currentProduct.details?.pack || ""} onChange={e => updateDetails('pack', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Pack (single, 4-pack, etc.)" />
                      <input value={currentProduct.details?.type || ""} onChange={e => updateDetails('type', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Type (bottle, can, etc.)" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input value={currentProduct.details?.volume || ""} onChange={e => updateDetails('volume', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="Volume (750ml, 12oz, etc.)" />
                      <input value={currentProduct.details?.upc || ""} onChange={e => updateDetails('upc', e.target.value)} className="input w-full border rounded-lg p-2" placeholder="UPC Code" />
                    </div>

                  </div>

                  <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-3">Product Image</h5>
                    <input value={currentProduct.imageUrl} onChange={e => setCurrentProduct(p => ({ ...p, imageUrl: e.target.value, imageFile: null }))} className="input w-full border rounded-lg p-2 mb-3" placeholder="Image URL" />
                    <input type="file" accept="image/*" className="w-full border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition ease-in-out" onChange={(e) => setCurrentProduct(p => ({ ...p, imageFile: e.target.files[0], imageUrl: "" }))} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="font-medium text-green-600">${currentProduct.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">In Stock</p>
                      <p className="font-medium">{currentProduct.quantity} units</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-3 text-gray-800">Product Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {[
                        { icon: Tag, label: "Brand", value: currentProduct.brand, color: "blue" },
                        { icon: Hash, label: "SKU", value: currentProduct.sku, color: "purple" },
                        { icon: Package, label: "Pack", value: currentProduct.details?.pack, color: "orange" },
                        { icon: Tag, label: "Type", value: currentProduct.details?.type, color: "green" },
                        { icon: Droplets, label: "Volume", value: currentProduct.details?.volume, color: "cyan" },
                        { icon: Hash, label: "UPC", value: currentProduct.details?.upc, color: "gray" }
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${color}-600`} />
                          <div>
                            <p className="text-gray-600">{label}</p>
                            <p className={`font-medium ${label === "UPC" ? "text-xs" : ""}`}>{value || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
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
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
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