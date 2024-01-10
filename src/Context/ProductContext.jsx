import { createContext, useState, useEffect } from "react";

export const ProductContext = createContext({ products: [] });

export default function ProductContextProvider({ children }) {
  const [products, setProducts] = useState([]);

  const deleteProduct = (serialN) => {
    // when updating the state using the previous state
    // we will use the "updater" form (callback)

    setProducts((prevProducts) => {
      return prevProducts.filter((p) => p.serialN !== serialN);
    });
  };

  const addProduct = (product) => {
    setProducts((prevProducts) => {
      return [...prevProducts, product];
    });
  };

  async function loadProducts() {
    try {
      let res = await fetch("/Data/Products.json");
      let data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const value = { products, deleteProduct, addProduct };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
