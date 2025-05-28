import { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {

    setCartItems((prev) => {

      const existing = prev.find((item) => item.id === product.id);
      const max = product.quantity;

      if (existing) {

        if (existing.quantity < max) {

          return prev.map((item) =>

          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }

            : item
          );

        } else {
          toast("You have reached the available stock for this item.");
          return prev;
        }

      } else {
        return [...prev, { ...product, quantity: 1, maxStock: max }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {

    setCartItems((prev) =>

      prev.map((item) =>

        item.id === id
          ? {
              ...item,
              quantity:
                quantity > item.maxStock
                  ? (toast("Stock limit reached."), item.quantity)
                  : Math.max(1, quantity),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}