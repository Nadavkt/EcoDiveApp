import { useContext } from "react";
import { createContext, useState } from "react";
import { ProductContext } from "./ProductContext";

export const CartContext = createContext();

export default function CartContextProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { products } = useContext(ProductContext);

  const total = cart.reduce((totals, productId) => {
    totals += Number(products.find((p) => p.serialN === productId).salePrice);
    return totals;
  }, 0);

  const addToCart = (productId) => {
    setCart((prevCart) => [...prevCart, productId]);
  };

  const deleteFromCart = (index) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  };

  const value = { cart, addToCart, deleteFromCart, total,};

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
