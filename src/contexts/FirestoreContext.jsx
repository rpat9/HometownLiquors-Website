import { createContext, useContext } from "react";
import { db } from "../services/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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

    const value = {
        createUserProfile,
        updateUserProfile,
        getUserProfile
    };

    return (
        <FirestoreContext.Provider value={value}>
            {children}
        </FirestoreContext.Provider>
    );
}