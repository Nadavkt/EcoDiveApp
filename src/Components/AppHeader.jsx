import React from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../Context/CartContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBagShopping } from '@fortawesome/free-solid-svg-icons'


export default function AppHeader({ user }) {
  const { cart } = useContext(CartContext);

  return (
    <>

      <header>
        <nav className="navbar navbar-expand-lg navbar-light ">
          <li>
            <Link to={"/Home"}>
              <img
                width={50}
                src="/Images/coral-logo.png"
                alt="LOGO"
                title="LOGO"
              />
            </Link>
          </li>
          <button
            className="navbar-toggler text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo03"
            aria-controls="navbarTogglerDemo03"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link text-primary p-4" to={"/Home"}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-primary p-4" to={"/About"}>
                  About-Us
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-primary p-4" to={"/Store"}>
                  Store
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-primary p-4" to={"/Community"}>
                  Community
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-primary p-4" to={"/Marinel"}>
                  Marine Life
                </Link>
              </li>
              <li className="nav-item icons-btn d-inline-block bag">
                <Link
                  className="cart-link nav-link text-primary p-4"
                  to={"/cart"}>
                  <span>
                    <FontAwesomeIcon className="shop-bag" icon={faBagShopping} />
                    {cart.length > 0 && <div className="red-dot"></div>}
                  </span>
                </Link>
              </li>
              {user?.isAdmin ? (
                <li className="nav-item">
                  <Link
                    className="nav-link text-primary p-4"
                    to={"/manage-products"}
                  >
                    Admin Profile
                  </Link>
                </li>
              ) : null}
              {/* {user ? <li>Hey {user.email}</li> : null} */}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
