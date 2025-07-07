import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, limit, orderBy, startAfter, getCountFromServer } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCart } from "../contexts/CartContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsMap, setRatingsMap] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [pageCache, setPageCache] = useState({});
    const [loadingPage, setLoadingPage] = useState(false);

    const PRODUCTS_PER_PAGE = 25; // You can make this configurable

    const { currentUser, userData, setUserData } = useAuth();
    const { toggleFavorite, getUserProfile, getAllReviewsGroupedByProduct } = useFirestore();
    const { addToCart } = useCart();

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    // Get total product count
    useEffect(() => {
        const getTotalCount = async () => {
            try {
                const snapshot = await getCountFromServer(collection(db, "products"));
                setTotalProducts(snapshot.data().count);
            } catch (err) {
                console.error("Error getting total count:", err);
            }
        };

        getTotalCount();
    }, []);

    // Fetch products for current page
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingPage(true);

            try {
                // Check if page is already cached
                if (pageCache[currentPage]) {
                    setProducts(pageCache[currentPage].products);
                    setLastVisible(pageCache[currentPage].lastVisible);
                    setFirstVisible(pageCache[currentPage].firstVisible);
                    setLoadingPage(false);
                    return;
                }

                let productQuery;

                if (currentPage === 1) {
                    // First page
                    productQuery = query(
                        collection(db, "products"),
                        orderBy("name"),
                        limit(PRODUCTS_PER_PAGE)
                    );
                } else {
                    // Subsequent pages - we need to rebuild the query from page 1
                    // This is a limitation of Firestore pagination
                    const skipCount = (currentPage - 1) * PRODUCTS_PER_PAGE;
                    productQuery = query(
                        collection(db, "products"),
                        orderBy("name"),
                        limit(skipCount + PRODUCTS_PER_PAGE)
                    );
                }

                const snapshot = await getDocs(productQuery);
                const allDocs = snapshot.docs;

                // Get only the products for current page
                const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
                const endIndex = startIndex + PRODUCTS_PER_PAGE;
                const currentPageDocs = allDocs.slice(startIndex, endIndex);

                const productList = currentPageDocs.map((doc) => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));

                setProducts(productList);

                // Set pagination markers
                if (currentPageDocs.length > 0) {
                    setFirstVisible(currentPageDocs[0]);
                    setLastVisible(currentPageDocs[currentPageDocs.length - 1]);
                }

                // Cache the page
                setPageCache(prev => ({
                    ...prev,
                    [currentPage]: {
                        products: productList,
                        lastVisible: currentPageDocs[currentPageDocs.length - 1],
                        firstVisible: currentPageDocs[0]
                    }
                }));

                // Load ratings for current page products only
                const allReviews = await getAllReviewsGroupedByProduct();
                const avgMap = {};

                productList.forEach(product => {
                    if (allReviews[product.id]) {
                        const reviews = allReviews[product.id];
                        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                        avgMap[product.id] = avg;
                    }
                });

                setRatingsMap(avgMap);

            } catch (err) {
                console.error("Error loading products:", err);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
                setLoadingPage(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

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
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
            // Scroll to top when changing pages
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const PaginationControls = () => (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--btn-hover-color)] transition-colors cursor-pointer'
                }`}
            >
                <ChevronLeft size={16} className="mr-1" />
                Previous
            </button>

            <div className="flex items-center space-x-1">
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                pageNum === currentPage
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--btn-hover-color)] transition-colors cursor-pointer'
                }`}
            >
                Next
                <ChevronRight size={16} className="ml-1" />
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Our Products</h1>
                <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}-{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)} of {totalProducts} products
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            ) : totalProducts === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500">No products available yet.</p>
                </div>
            ) : (
                <>
                    {loadingPage && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading products...</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-lg p-2 flex flex-col justify-between"
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
                                
                                <p className="text-sm text-gray-500 mb-1">Actual Product May Differ</p>
                                
                                <button
                                    onClick={() => {
                                        addToCart(product);
                                        toast.success(`${product.name} added to cart!`);
                                    }}
                                    className="btn-primary btn-hover w-full mt-2 flex items-center justify-center"
                                >
                                    <ShoppingCart className="mr-2" />
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && <PaginationControls />}
                </>
            )}
        </div>
    );
}