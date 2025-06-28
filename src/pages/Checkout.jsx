import { useEffect, useState, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Checkout() {
    const MAX_ITEMS_ALLOWED = 7;
    const { cartItems, clearCart } = useCart();
    const { currentUser, setUserData } = useAuth();
    const { createOrder, getUserProfile, getStoreSettings, updateUserProfile } = useFirestore();
    const navigate = useNavigate();

    const [form, setForm] = useState({ displayName: "", email: "", pickupTime: "", pickupNotes: "" });
    const [userProfile, setUserProfile] = useState(null);
    const [storeSettings, setStoreSettings] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const { subtotal, tax, total, totalItems } = useMemo(() => {
        const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const taxRate = storeSettings?.defaultTax || 0;
        const calculatedTax = parseFloat((sub * taxRate).toFixed(2));
        return {
            subtotal: sub,
            tax: calculatedTax,
            total: (sub + calculatedTax).toFixed(2),
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        };
    }, [cartItems, storeSettings]);

    const timeOptions = useMemo(() => {
        const hours = storeSettings?.businessHours;
        if (!hours?.open || !hours?.close) return [];

        const [openH, openM] = hours.open.split(":").map(Number);
        const [closeH, closeM] = hours.close.split(":").map(Number);

        const now = new Date();

        let startH = Math.max(openH, now.getHours());
        let startM = startH === now.getHours() ? Math.ceil(now.getMinutes() / 15) * 15 : 0;
        if (startM >= 60) { startH++; startM = 0; }

        const options = [];

        for (let h = startH; h <= closeH; h++) {
            const maxMin = h === closeH ? closeM : 60;
            for (let m = (h === startH ? startM : 0); m < maxMin; m += 30) {
                const val = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                const label = new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                options.push({ value: val, label });
            }
        }

        return options;
    }, [storeSettings]);

    useEffect(() => {
        async function fetchData() {
            if (!currentUser) return setLoading(false);
            try {
                const [profile, settings] = await Promise.all([
                    getUserProfile(currentUser.uid),
                    getStoreSettings()
                ]);
                setUserProfile(profile);
                setStoreSettings(settings);
                setForm(prev => ({
                    ...prev,
                    displayName: profile?.name || "",
                    email: currentUser.email || ""
                }));
            } catch (err) {
                toast.error("Error loading store or user info");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentUser]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!form.displayName || !form.email || !form.pickupTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!storeSettings?.businessHours || !timeOptions.find(opt => opt.value === form.pickupTime)) {
            toast.error("Invalid pickup time");
            return;
        }

        if (totalItems > MAX_ITEMS_ALLOWED) {
            toast.error(`Orders over ${MAX_ITEMS_ALLOWED} items must be placed in-store`);
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setSubmitting(true);
        try {
            const now = new Date();
            const readableCreatedAt = now.toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            const [hour, minute] = form.pickupTime.split(":").map(Number);
            const today = new Date();
            const pickupTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

            const order = {
                userId: currentUser.uid,
                customerName: form.displayName.trim(),
                customerEmail: form.email.trim(),
                pickupTime: pickupTime.toISOString(),
                pickupInstructions: form.pickupNotes.trim(),
                productList: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                orderTotal: parseFloat(total),
                orderStatus: "Processing",
                createdAt: now,
                readableCreatedAt,
            };

            const orderId = await createOrder(order);

            const latestProfile = await getUserProfile(currentUser.uid);
            const newOrderHistory = [...(latestProfile?.orderHistory || []), orderId];
            await updateUserProfile(currentUser.uid, { orderHistory: newOrderHistory });

            const updatedProfile = await getUserProfile(currentUser.uid);
            setUserData && setUserData(updatedProfile);

            clearCart();
            toast.success("Order placed successfully!");
            navigate("/dashboard");

        } catch (err) {
            toast.error("Order failed");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="max-w-3xl mx-auto px-6 py-10 text-center">Loading checkout...</div>;

    if (!currentUser) return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <div className="mb-4">Please sign in to checkout</div>
        <Link to="/login" className="btn-primary btn-hover">Sign In</Link>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-[var(--color-text-primary)]">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <input name="displayName" value={form.displayName} onChange={handleChange} placeholder="Your Name" className="input border p-2 rounded-lg" required />

                    <input name="email" value={form.email} onChange={handleChange} placeholder="Your Email" className="input border p-2 rounded-lg" required />

                    <select name="pickupTime" value={form.pickupTime} onChange={handleChange} className="input border p-2 rounded-lg cursor-pointer" required>
                        <option value="">Select Pickup Time</option>
                        {timeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <input name="pickupNotes" value={form.pickupNotes} onChange={handleChange} placeholder="Special Instructions (optional)" className="input border p-2 rounded-lg" />
                </div>

                <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--color-border)] space-y-4">
                    <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="border-t border-[var(--color-border)] pt-3 text-sm space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax ({(storeSettings?.defaultTax * 100).toFixed(2)}%):</span><span>${tax}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${total}</span></div>
                    </div>
                </div>

                <div className="text-yellow-600 bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm font-medium">
                    ⚠️ Orders must be picked up the same day. Unclaimed orders may be canceled. Valid government-issued ID may be required.
                </div>

                {timeOptions.length === 0 && storeSettings?.businessHours && (
                    <div className="text-red-600 font-semibold text-sm border border-red-300 bg-red-50 p-3 rounded-lg">
                        Store is currently closed. Try again during business hours: {storeSettings.businessHours.open} - {storeSettings.businessHours.close}
                    </div>
                )}

                {totalItems > MAX_ITEMS_ALLOWED ? (
                    <div className="text-red-600 font-semibold text-sm border border-red-300 bg-red-50 p-3 rounded-lg">
                        Online orders are limited to {MAX_ITEMS_ALLOWED} items. Please contact the store for larger orders.
                    </div>
                ) : (
                    <div className="flex gap-5">
                        <button type="submit" disabled={submitting || timeOptions.length === 0} className="btn-primary btn-hover w-full disabled:opacity-50">
                            {submitting ? "Placing Order..." : "Confirm Order"}
                        </button>
                        <Link to="/cart" className="btn-primary btn-hover w-full text-center">Back to Cart</Link>
                    </div>
                )}
            </form>
        </div>
    );
}