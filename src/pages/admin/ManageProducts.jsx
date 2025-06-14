import { useFirestore } from "../../contexts/FirestoreContext";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { toast } from "react-hot-toast";
import ViewProductDetails from "./ViewProductDetails";

export default function ManageProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    imageUrl: "",
    imageFile: null,
  });

  const { getAllProducts, deleteProduct, addProduct, uploadImage, getAllReviewsGroupedByProduct } = useFirestore();

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const items = await getAllProducts();
        setProducts(items);

        const allReviews = await getAllReviewsGroupedByProduct();
        const avgMap = {};

        for (const productId in allReviews) {
          const reviews = allReviews[productId];
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          avgMap[productId] = avg;
        }

        setRatingsMap(avgMap);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]);

  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure?")) return;

    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    toast.success("Deleted successfully");
  };


  const handleSort = (key) => {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);

    const sorted = [...products].sort((a, b) => {
      let valA, valB;
      
      if (key === "rating") {
        valA = ratingsMap[a.id] || 0;
        valB = ratingsMap[b.id] || 0;
      } else {
        valA = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];
        valB = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];
      }
      
      return order === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    setProducts(sorted);
  };


  const handleAddProduct = async (e) => {
    e.preventDefault();

    const { name, category, price, quantity, imageFile, imageUrl} = newProduct;

    if (!name || !category || price < 0 || quantity < 0 || (!imageFile && !imageUrl)) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    try {
      let imageDownloadUrl = imageUrl
      if (imageFile) {
        imageDownloadUrl = await uploadImage(imageFile);
      }

      const productsData = {
        name,
        category,
        price: parseFloat(newProduct.price),
        quantity: parseFloat(newProduct.quantity),
        imageUrl: imageDownloadUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addProduct(productsData);
      toast.success("Product added successfully");
      setShowAddForm(false);
      setNewProduct({ name: "", category: "", price: "", quantity: "", imageUrl: "", imageFile: null });
      refreshData();

    } catch(err) {
      console.error(err);
      toast.error("Failed to add product");
    }

  };

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">Manage Products</h2>

        <button onClick={() => setShowAddForm(true)} className="btn-primary btn-hover flex items-center">
          + Add Product
        </button>

      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-[var(--color-bg)] p-4 rounded-lg border-1 border-[var(--color-primary)] mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input 
            type="text" 
            placeholder="Product Name" 
            className="input border-1 rounded-lg p-1" 
            value={newProduct.name} 
            onChange={(e) => {setNewProduct({ ...newProduct, name: e.target.value })}}
            required
          />

          <input 
            type="text" 
            placeholder="Category e.g Wine" 
            className="input border-1 rounded-lg p-1" 
            value={newProduct.category} 
            onChange={(e) => {setNewProduct({ ...newProduct, category: e.target.value })}}
            required
          />

          <input 
            type="number" 
            placeholder="Price" 
            className="input border-1 rounded-lg p-1" 
            value={newProduct.price} 
            onChange={(e) => {setNewProduct({ ...newProduct, price: e.target.value })}}
            required
          />

          <input 
            type="number" 
            placeholder="Quantity" 
            className="input border-1 rounded-lg p-1" 
            value={newProduct.quantity} 
            onChange={(e) => {setNewProduct({ ...newProduct, quantity: e.target.value })}}
            required
          />

          <input 
            type="url" 
            placeholder="Image URL" 
            className="input col-span-1 sm:col-span-2 border-1 rounded-lg p-1" 
            value={newProduct.imageUrl} 
            onChange={(e) => {setNewProduct({ ...newProduct, imageUrl: e.target.value, imageFile: null })}}
          />

          <input
            type="file"
            accept="image/*"
            className="col-span-1 sm:col-span-2 border-1 rounded-lg p-1 cursor-pointer hover:scale-101 transition ease-in-out"
            onChange={(e)=> {setNewProduct({ ...newProduct, imageFile: e.target.files[0], imageUrl:"" })}}
          />

          <button type="submit" className="btn-primary hover:scale-101 transition ease-in-out sm:col-span-2">Save Product</button>

        </form>
      )}

      {loading ? (

        <p>Loading...</p>

      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full table-auto text-sm text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">

                <th className="p-3">Image</th>

                <th className="p-3 w-[600px] cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    <ArrowUpDown size={16} />
                  </div>
                </th>

                <th className="p-3 cursor-pointer" onClick={() => handleSort("category")}>
                    <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown size={16} />
                    </div>
                </th>

                <th className="p-3 cursor-pointer" onClick={() => handleSort("price")}>
                    <div className="flex items-center space-x-1">
                        <span>Price</span>
                        <ArrowUpDown size={16} />
                    </div>
                </th>

                <th className="p-3 cursor-pointer" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center space-x-1">
                        <span>Stock</span>
                        <ArrowUpDown size={16} />
                    </div>
                </th>

                <th className="p-3 cursor-pointer" onClick={() => handleSort("rating")}>
                    <div className="flex items-center space-x-1">
                        <span>Rating</span>
                        <ArrowUpDown size={16} />
                    </div>
                </th>

                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (

                <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition">

                  <td className="p-3">
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-contain rounded" />
                  </td>

                  <td className="p-3 font-medium w-[600px] text-left">{product.name}</td>

                  <td className="p-3 text-left">{product.category}</td>

                  <td className="p-3 text-left">${product.price.toFixed(2)}</td>

                  <td className="p-3 text-left">{product.quantity}</td>

                  <td className="p-3 text-left">
                    {ratingsMap[product.id] ? (
                      <span className="text-[var(--color-primary)]">{ratingsMap[product.id].toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="p-5 flex justify-center space-x-3">
                    <button
                      className="text-yellow-600 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Pencil size={20} />
                    </button>

                    <button onClick={() => handleDelete(product.id)} className="text-red-600 cursor-pointer"><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <ViewProductDetails
          open={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onProductUpdate={refreshData} // Pass refresh function
        />
      )}
    </div>
  );
}