import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";


export default function Checkout() {

    const [pickupTime, setPickupTime] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState("");

    const { cartItems, clearCart } = useCart();
    const { currentUser, userData, setUserData } = useAuth();
    const { updateUserProfile, getUserProfile, createOrder } = useFirestore();


    const handleSubmit = async(e) => {
        e.preventDefault();

        if (!agreed || !pickupTime || cartItems.length === 0 || !currentUser) return;

        const orderPayload = {

            userId: currentUser.uid,

            productList: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),

            orderTotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),

            orderStatus: "pending",

            pickupInstructions: pickupTime,

            createdAt: Timestamp.now()
        };

        try {
        
        const orderId = await createOrder(orderPayload);

        
        await updateUserProfile(currentUser.uid, {
            orderHistory: [...(userData.orderHistory || []), orderId],
        });

        
        const updated = await getUserProfile(currentUser.uid);
        setUserData(updated);

        clearCart();

        toast.success("Order placed! We'll see you at pickup.");

        } catch (err) {

            console.error("Order error:", err);
            toast.error("Something went wrong while placing your order.");

        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)]">

            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                    <label className="block font-semibold mb-1">Select a pickup time:</label>
                    <input
                        type="datetime-local"
                        className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--card-bg)] text-[var(--color-text-primary)]"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                    />
                </div>

                <div className="space-x-2">
                    <input
                        type="checkbox"
                        id="ageConfirm"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    <label htmlFor="ageConfirm" className="text-sm">
                        I confirm that I am 21 years of age or older and I agree to pick up in-store with valid ID. I understand that failure to verify my age will result in refusal of pickup and a potential refund.
                    </label>
                </div>

                {error && <p className="text-[var(--color-primary)] text-sm">{error}</p>/*text-red-500*/}

                <button
                    type="submit"
                    className="btn-primary btn-hover w-full"
                    disabled={!agreed}
                >
                    Place Order (Pickup Only)
                </button>
                
            </form>

            <div className="mt-6 text-sm text-[var(--color-text-primary)]">
                <p><strong>Note:</strong> Your order will be reserved for pickup. Payment will be completed in-store. A valid ID will be required at pickup. We reserve the right to refuse the order if the customer cannot verify age eligibility.</p>
            </div>
            
        </div>
    );
}