import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { collection, getDocs, query, limit, orderBy, getCountFromServer } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCart } from "../contexts/CartContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useAuth } from "../contexts/AuthContext";
import { searchProducts } from "../services/algolia";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ratingsMap, setRatingsMap] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [pageCache, setPageCache] = useState({});
    const [loadingPage, setLoadingPage] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const PRODUCTS_PER_PAGE = 24;
    const searchTimeoutRef = useRef(null);

    const { currentUser, userData, setUserData } = useAuth();
    const { toggleFavorite, getUserProfile, getAllReviewsGroupedByProduct } = useFirestore();
    const { addToCart } = useCart();

    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const favoriteSet = useMemo(() => new Set(userData?.favorites || []), [userData]);

    // Debounce search term
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Handle search when debounced term changes
    useEffect(() => {
        if (debouncedSearchTerm.trim()) {
            handleSearch(debouncedSearchTerm);
        } else if (isSearchMode) {
            clearSearch();
        }
    }, [debouncedSearchTerm]);

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

    useEffect(() => {
        const fetchProducts = async () => {
            if (isSearchMode) return;

            setLoadingPage(true);
            try {
                if (pageCache[currentPage]) {
                    setProducts(pageCache[currentPage]);
                    return;
                }

                const productQuery = query(
                    collection(db, "products"),
                    orderBy("name"),
                    limit(currentPage * PRODUCTS_PER_PAGE)
                );

                const snapshot = await getDocs(productQuery);
                const docs = snapshot.docs.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
                const productList = docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setProducts(productList);
                setPageCache(prev => ({ ...prev, [currentPage]: productList }));

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
    }, [currentPage, isSearchMode]);

    const handleSearch = async (value) => {
        if (!value.trim()) return;

        setSearching(true);
        setIsSearchMode(true);
        
        try {
            const hits = await searchProducts(value);
            setSearchResults(hits);
            setProducts(hits);
        } catch (err) {
            console.error("Algolia search failed:", err);
            toast.error("Search failed. Try again.");
        } finally {
            setSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setIsSearchMode(false);
        setSearchResults([]);
        setCurrentPage(1);
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.trim() && !searching) {
            setSearching(true);
        }
    };

    const handleToggleFavorite = async (productId) => {
        if (!currentUser) return toast.error("Please log in to favorite items.");
        const isFavorited = userData?.favorites.includes(productId);

        try {
            await toggleFavorite(currentUser.uid, productId, isFavorited);
            const updated = await getUserProfile(currentUser.uid);
            setUserData(updated);
            toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update favorites");
        }
    };

    const handlePageChange = (newPage) => {
        if (!isSearchMode && newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const PaginationControls = () =>
        !isSearchMode && totalPages > 1 && (
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
                                        : 'bg-gray-300 text-gray-700 hover:bg-gray-300'
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

    const SearchHeader = () => (
        isSearchMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                            Search Results for "{debouncedSearchTerm}"
                        </h3>
                        <p className="text-sm text-blue-700">
                            {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <button
                        onClick={clearSearch}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                        <X size={16} className="mr-1" />
                        Clear Search
                    </button>
                </div>
            </div>
        )
    );

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Our Products</h1>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute top-2.5 left-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="pl-10 pr-12 py-2 rounded-lg w-full border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                    {searching && (
                        <div className="absolute top-2.5 right-10">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    )}
                </div>
            </div>

            <SearchHeader />

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-gray-500">
                        {isSearchMode ? 'No products found matching your search.' : 'No products found.'}
                    </p>
                    {isSearchMode && (
                        <button
                            onClick={clearSearch}
                            className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--btn-hover-color)] transition-colors"
                        >
                            View All Products
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {loadingPage && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-[var(--card-bg)] border border-[var(--color-border)] rounded-lg p-2 flex flex-col justify-between hover:shadow-lg transition-shadow"
                            >
                                <img
                                    src={product.imageUrl || "/placeholder.jpg"}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-48 object-contain aspect-square rounded mb-4"
                                />

                                <div className="flex justify-between items-center mb-2">
                                    <Link to={`/products/${product.id}`}>
                                        <h2 className="text-lg font-semibold hover:text-[var(--color-primary)] transition-colors">
                                            {product.name}
                                        </h2>
                                    </Link>

                                    <button
                                        onClick={() => handleToggleFavorite(product.id)}
                                        className="text-[var(--color-primary)] hover:scale-110 transition-transform"
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

                    <PaginationControls />
                </>
            )}
            
        </div>
    );
}