import { useFirestore } from "../../contexts/FirestoreContext";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const { getAllProducts, deleteProduct } = useFirestore();

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const items = await getAllProducts();
        setProducts(items);

      } catch (err) {

        console.error(err);
        toast.error("Failed to load products");

      } finally {
        setLoading(false);
      }

    };

    fetchProducts();
  }, []);


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

      const valA = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];

      const valB = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];

      return order === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);

    });

    setProducts(sorted);
  };

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">Manage Products</h2>

        <button className="btn-primary btn-hover">+ Add Product</button>

      </div>

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
                    {product.rating ? (
                      <span className="text-[var(--color-primary)]">{product.rating.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="p-5 flex justify-center space-x-3">

                    <button className="text-blue-600 cursor-pointer"><Eye size={20} /></button>

                    <button className="text-yellow-600 cursor-pointer"><Pencil size={20} /></button>

                    <button onClick={() => handleDelete(product.id)} className="text-red-600 cursor-pointer"><Trash2 size={20} /></button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}
    </div>
  );
}