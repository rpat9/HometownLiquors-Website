import { createContext, useContext } from "react";
import { db } from "../services/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, arrayRemove, arrayUnion, query, where, getDocs, Timestamp, limit, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

const FirestoreContext = createContext();

export function useFirestore() {
    return useContext(FirestoreContext);
}

export function FirestoreProvider({ children }) {

    async function createUserProfile(userId, userData) {
        if (!userData || typeof userData !== 'object') {
            throw new Error("User data must be a valid object.");
        }
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, userData);
    }


    async function updateUserProfile(userId, userData) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, userData);
    }


    async function getUserProfile(userId) {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    }


    async function createOrder(orderData) {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        return docRef.id;
    }
      

    async function getOrdersByIds(orderIds) {
        const orderDocs = await Promise.all(

          orderIds.map(async (orderId) => {

            const orderRef = doc(db, "orders", orderId);
            const orderSnap = await getDoc(orderRef);
            return orderSnap.exists() ? { id: orderId, ...orderSnap.data() } : null;
          })
        );
        return orderDocs.filter(Boolean);
    }


    async function getProductById(productId) {
        const docref = doc(db, "products", productId);
        const docSnap = await getDoc(docref);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    }


    async function toggleFavorite(userId, productId, isFavorite) {
        const userRef = doc(db, "users", userId);
        
        if (isFavorite) {
            await updateDoc(userRef, {
                favorites: arrayRemove(productId),
            })
        } else {
            await updateDoc(userRef, {
                favorites: arrayUnion(productId),
            })
        }
    }


    async function getFavorites(userId) {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data().favorites : [];
    }


    async function getReviewsByProductId(productId) {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("productId", "==", productId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }


    async function addReview(productId, userId, rating, comment) {
        const review = {
            productId, 
            userId, 
            rating, 
            comment, 
            createdAt: Timestamp.now()
        };

        const reviewsRef = collection(db, "reviews");
        await addDoc(reviewsRef, review);
    }


    async function getAllReviewsGroupedByProduct() {
        const snapshot = await getDocs(collection(db, "reviews"));
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const grouped = {};

        reviews.forEach(re => {
            if (!grouped[re.productId]) {
                grouped[re.productId] = [];
            }
            grouped[re.productId].push(re);
        });

        return grouped;
    }


    async function getAllProducts() {
        const snapshot = await getDocs(collection(db, "products"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }


    async function getAllOrders() {
        const snapshot = await getDocs(collection(db, "orders"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }


    async function addProduct(productData) {
        const docRef = await addDoc(collection(db, "products"), productData)
        return docRef.id;
    }


    async function updateProduct(productId, updates) {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, updates)
    }


    async function deleteProduct(productId) {
        await deleteDoc(doc(db, "products", productId));
    }


    async function uploadImage(file) {
        const storage = getStorage();
        const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
    }


    async function getDashboardStats() {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "products")),
            getDocs(collection(db, "users"))
        ])

        const orders = ordersSnap.docs.map(doc => doc.data());

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const totalProducts = productsSnap.size;
        const totalCustomers = usersSnap.filter(doc => doc.data().role === "user").length;

        return { totalRevenue, totalOrders, totalProducts, totalCustomers };
    }


    async function getRecentOrders(limitCount = 5) {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }


    async function getTopProducts(limitCount = 5) {
        const allReviews = await getAllReviewsGroupedByProduct();
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const productsWithRatings = products.map(product => {
            const productReviews = allReviews[product.id] || [];
            const avgRating = productReviews.length > 0 ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length : 0;

            return {
                ...product,
                reviewCount: productReviews.length,
                averageRating: avgRating
            };
        });

        return productsWithRatings.sort((a, b)=> {
            if (b.reviewCount !== a.reviewCount) {
                return b.reviewCount - a.reviewCount
            }
            return b.averageRating - a.averageRating;
        }).slice(0, limitCount);
    }


    async function updateOrderStatus(orderId, newStatus) {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { orderStatus: newStatus });
    }


    const value = {
        createUserProfile,
        updateUserProfile,
        getUserProfile,
        createOrder,
        getOrdersByIds,
        getProductById,
        toggleFavorite,
        getFavorites,
        getReviewsByProductId,
        addReview,
        getAllReviewsGroupedByProduct,
        getAllProducts,
        getAllOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        uploadImage,
        getDashboardStats,
        getRecentOrders,
        getTopProducts,
        updateOrderStatus
    };


    return (
        <FirestoreContext.Provider value={value}>
            {children}
        </FirestoreContext.Provider>
    );
}