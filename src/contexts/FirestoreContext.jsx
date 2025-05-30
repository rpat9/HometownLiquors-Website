import { createContext, useContext } from "react";
import { db } from "../services/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, arrayRemove, arrayUnion, query, where, getDocs, Timestamp } from "firebase/firestore";

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
        getAllReviewsGroupedByProduct
    };


    return (
        <FirestoreContext.Provider value={value}>
            {children}
        </FirestoreContext.Provider>
    );
}