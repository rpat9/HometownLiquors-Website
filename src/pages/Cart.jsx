import { useCart } from "../contexts/CartContext";

export default function Cart() {

    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    return (

        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 text-[var(--color-text-primary)] space-y-8">

            <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

            {cartItems.length === 0 ? (
                <p className="text-lg">Your cart is empty.</p>
            ) : (
                <div className="space-y-6">

                    {cartItems.map((item) => (

                        <div
                            key={item.id}
                            className="flex justify-between items-center bg-[var(--card-bg)] border border-[var(--color-border)] p-4 rounded-xl"
                        >
                            <div>

                                <h2 className="text-xl font-semibold">{item.name}</h2>

                                <p className="text-sm text-[var(--color-text-primary)]">
                                    ${item.price.toFixed(2)} x {item.quantity}
                                </p>

                            </div>

                            <div className="flex items-center space-x-3">

                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="btn-primary btn-hover px-2"
                                >
                                    -
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="btn-primary btn-hover px-2"
                                >
                                    +
                                </button>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="ml-4 text-[var(--color-primary)] hover:underline hover:text-[var(--btn-hover-color)] cursor-pointer"
                                >
                                    Remove
                                </button>

                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center text-xl font-semibold mt-6">

                        <span>Subtotal:</span>

                        <span>${getSubtotal()}</span>

                    </div>

                    <button className="btn-primary btn-hover w-full mt-4" disabled>

                        Proceed to Checkout (Coming Soon)
                    </button>

                </div>
            )}

        </div>
    );
}
