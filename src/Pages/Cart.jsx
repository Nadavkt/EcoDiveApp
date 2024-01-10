import React from "react";
import { useContext } from "react";
import { ProductContext } from "../Context/ProductContext";
import { CartContext } from "../Context/CartContext";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export default function Cart() {
  const { products } = useContext(ProductContext);
  const { cart, deleteFromCart, total } = useContext(CartContext);
  // const [cartItemsCount, setCartItemsCount] = useState(0);

  // setCartItemsCount(cartItemsCount + 1);

  return (
    <>
      <section className="cart-page h-100">
        <div className="container h-100 py-5">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-10">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-normal mb-0 text-black">Shopping Cart</h1>
              </div>

              {cart.map((productId, index) => {
                const product = products.find((p) => p.serialN === productId);
                return (
                  <div key={index}>
                    <div className="detail-product  card rounded-3 mb-4">
                      <div className=" card-body p-4">
                        <div className="row d-flex justify-content-between align-items-center">
                          <div className="col-md-2 col-lg-2 col-xl-2">
                            <img
                              src={product.img}
                              className="img-fluid rounded-3"
                              alt="Cotton T-shirt"
                            />
                          </div>
                          <div className="col-md-3 col-lg-3 col-xl-3">
                            <p className="lead fw-normal mb-2">
                              {product.title}
                            </p>
                          </div>

                          <div className="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                            <h5 className="mb-0">{product.salePrice}$</h5>
                          </div>
                          <div className="col-md-1 col-lg-1 col-xl-1 text-end">
                            <div
                              onClick={() => deleteFromCart(index)}
                              className=" text-danger">
                                <FontAwesomeIcon className="delet-store-btn" icon={faTrash} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="total">
                Total: <span>{total} $</span>
              </div>
              <button className="btn-checkout btn btn-primary-md">
                <Link className="btn-dec" to="/checkout">
                  Checkout
                </Link>
              </button>
              <button className="btn-checkout btn btn-primary-md">
                <Link className="btn-dec" to="/store">
                  Back To Shop
                </Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
