import { createContext, useContext } from "react";
import { db } from "../services/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, addDoc } from "firebase/firestore";

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

    const value = {
        createUserProfile,
        updateUserProfile,
        getUserProfile,
        createOrder,
        getOrdersByIds
    };

    return (
        <FirestoreContext.Provider value={value}>
            {children}
        </FirestoreContext.Provider>
    );
}