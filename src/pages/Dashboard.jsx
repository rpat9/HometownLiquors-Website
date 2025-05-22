import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
    const { currentUser, userData, setUserData } = useAuth();
    const { updateUserProfile, getUserProfile } = useFirestore();
    const location = useLocation();

    const [preferences, setPreferences] = useState({
        lowStock: false,
        newStock: false,
        restockAlerts: false,
    });

    useEffect(() => {
        if (userData?.notificationPreferences) {
            setPreferences(userData.notificationPreferences);
        }
    }, [userData, location.pathname]);

    const handleToggle = (field) => {
        setPreferences((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSave = async () => {
        if (currentUser) {
            await updateUserProfile(currentUser.uid, {
                notificationPreferences: preferences,
            });

            const updatedData = await getUserProfile(currentUser.uid);
            setUserData(updatedData);

            alert("Preferences updated!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-10 text-[var(--color-text-primary)]">

            <h1 className="text-3xl font-bold">
                Welcome, {userData?.name || "User"}!
            </h1>

            
            <section className="space-y-4">

                <h2 className="text-2xl font-semibold">Notification Preferences</h2>

                <div className="space-y-2">

                    {Object.entries(preferences).map(([key, value]) => (

                        <label key={key} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() => handleToggle(key)}
                                className="accent-[var(--color-primary)]"
                            />
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                    ))}

                </div>

                <button onClick={handleSave} className="btn-primary btn-hover mt-2">
                    Save Preferences
                </button>

            </section>

            
            <section>

                <h2 className="text-2xl font-semibold mb-2">Your Favorites</h2>

                <div className="border border-[var(--color-border)] p-6 rounded-xl bg-[var(--card-bg)]">
                    You haven't favorited any products yet. They’ll show up here when you do!
                </div>

            </section>

            
            <section>

                <h2 className="text-2xl font-semibold mb-2">Order History</h2>

                <div className="border border-[var(--color-border)] p-6 rounded-xl bg-[var(--card-bg)]">
                    Your past orders will appear here once available.
                </div>

            </section>

        </div>
    );
}
