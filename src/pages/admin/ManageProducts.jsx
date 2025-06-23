import { useFirestore } from "../../contexts/FirestoreContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "react-hot-toast";
import ViewProductDetails from "./ViewProductDetails";

const initialFormState = {
  name: "", category: "", brand: "", sku: "", price: "", quantity: "", imageUrl: "", imageFile: null,
  details: { volume: "", upc: "", pack: "", type: "" }
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const [newProduct, setNewProduct] = useState(initialFormState);

  const { getAllProducts, deleteProduct, addProduct, uploadImage, getAllReviewsGroupedByProduct } = useFirestore();

  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      let valA = sortConfig.key === "rating" ? (ratingsMap[a.id] || 0) : a[sortConfig.key];
      let valB = sortConfig.key === "rating" ? (ratingsMap[b.id] || 0) : b[sortConfig.key];
      
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      
      const result = valA > valB ? 1 : valA < valB ? -1 : 0;
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [products, ratingsMap, sortConfig]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, reviewsData] = await Promise.all([
          getAllProducts(),
          getAllReviewsGroupedByProduct()
        ]);
        
        setProducts(productsData);
        
        const avgMap = Object.fromEntries(
          Object.entries(reviewsData).map(([productId, reviews]) => [
            productId,
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ])
        );

        setRatingsMap(avgMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  }, [deleteProduct]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  }, []);

  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    const { name, category, price, quantity, imageFile, imageUrl } = newProduct;

    if (!name || !category || price < 0 || quantity < 0 || (!imageFile && !imageUrl)) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    try {
      const imageDownloadUrl = imageFile ? await uploadImage(imageFile) : imageUrl;
      const productData = {
        ...newProduct,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        imageUrl: imageDownloadUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newId = await addProduct(productData);
      
      setProducts(prev => [...prev, { id: newId, ...productData }]);
      setNewProduct(initialFormState);
      setShowAddForm(false);
      toast.success("Product added successfully");

    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    }
  }, [newProduct, addProduct, uploadImage]);

  const updateFormField = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewProduct(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setNewProduct(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const refreshData = useCallback(() => {
    getAllReviewsGroupedByProduct().then(reviewsData => {
      const avgMap = Object.fromEntries(
        Object.entries(reviewsData).map(([productId, reviews]) => [
          productId,
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ])
      );
      setRatingsMap(avgMap);
    });
  }, [getAllReviewsGroupedByProduct]);

  if (loading) return <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]"><p>Loading...</p></div>;

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <button onClick={() => setShowAddForm(true)} className="btn-primary btn-hover">
          + Add Product
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-[var(--color-bg)] p-4 rounded-lg border-1 border-[var(--color-primary)] mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { field: 'name', placeholder: 'Product Name' },
            { field: 'category', placeholder: 'Category e.g Wine' },
            { field: 'brand', placeholder: "Brand e.g Jack Daniel's" },
            { field: 'sku', placeholder: 'SKU' },
            { field: 'details.volume', placeholder: 'Volume' },
            { field: 'details.upc', placeholder: 'UPC' },
            { field: 'details.pack', placeholder: 'Pack (e.g. single, 6-pack)' },
            { field: 'details.type', placeholder: 'Type (e.g. bottle, can)' },
            { field: 'price', placeholder: 'Price', type: 'number' },
            { field: 'quantity', placeholder: 'Quantity', type: 'number' }
          ].map(({ field, placeholder, type = 'text' }) => (
            <input
              key={field}
              type={type}
              placeholder={placeholder}
              className="input border-1 rounded-lg p-1"
              value={field.includes('.') ? newProduct.details[field.split('.')[1]] : newProduct[field]}
              onChange={(e) => updateFormField(field, e.target.value)}
              required
            />
          ))}
          
          <input
            type="url"
            placeholder="Image URL"
            className="input col-span-1 sm:col-span-2 border-1 rounded-lg p-1"
            value={newProduct.imageUrl}
            onChange={(e) => updateFormField('imageUrl', e.target.value) || updateFormField('imageFile', null)}
          />
          
          <input
            type="file"
            accept="image/*"
            className="col-span-1 sm:col-span-2 border-1 rounded-lg p-1 cursor-pointer hover:scale-101 transition ease-in-out"
            onChange={(e) => updateFormField('imageFile', e.target.files[0]) || updateFormField('imageUrl', '')}
          />
          
          <button type="submit" className="btn-primary hover:scale-101 transition ease-in-out sm:col-span-2">
            Save Product
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">

          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="p-3">Image</th>
              {[
                { key: 'name', label: 'Product', width: 'w-[600px]' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'quantity', label: 'Stock' },
                { key: 'rating', label: 'Rating' }
              ].map(({ key, label, width }) => (
                <th key={key} className={`p-3 cursor-pointer ${width || ''}`} onClick={() => handleSort(key)}>
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <ArrowUpDown size={16} />
                  </div>
                </th>
              ))}

              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition">
                <td className="p-3">
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-contain rounded" />
                </td>
                <td className="p-3 font-medium w-[600px]">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">${product.price.toFixed(2)}</td>
                <td className="p-3">{product.quantity}</td>

                <td className="p-3">
                  {ratingsMap[product.id] ? (
                    <span className="text-[var(--color-primary)]">{ratingsMap[product.id].toFixed(1)}</span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>

                <td className="p-5 flex justify-center space-x-3">
                  <button className="text-yellow-600 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <Pencil size={20} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 cursor-pointer">
                    <Trash2 size={20} />
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {selectedProduct && (
        <ViewProductDetails
          open={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onProductUpdate={refreshData}
        />
      )}
    </div>
  );
}