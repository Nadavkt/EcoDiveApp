import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ToperH from './Components/ToperH';
import AppHeader from './Components/AppHeader';
import AppFooter from './Components/AppFooter';

import FindDShop from './Pages/FindDShop.jsx';
import SignIn from './Pages/SignIn.jsx';
import Login from './Pages/Login.jsx';

import Home from './Pages/Home.jsx';
import About from './Pages/About.jsx';
import Community from './Pages/Community.jsx';
import Marinel from './Pages/Marinel.jsx';

import Store from './Pages/Store.jsx';
import SingleProductPage from './Pages/SingleProductPage.jsx';
import ProductContextProvider from './Context/ProductContext';
import CartContextProvider from './Context/CartContext';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import { useState } from 'react';
import ManageProducts from './Pages/ManageProducts';
import AddProduct from './Pages/AddProduct';
import EditProduct from './Pages/EditProduct';




function App() {
  const [user, setUser] = useState();

  return (
    <div>
      <>
        <ProductContextProvider>
          <CartContextProvider>

            <BrowserRouter>

              <ToperH />
              <AppHeader user={user} />

              <Routes>
                <Route path='/Home' element={<Home />} />
                <Route path='/About' element={<About />} />
                <Route path='/Store' element={<Store />} />
                <Route path='/SingleProductPage/:serialN' element={<SingleProductPage />} />
                <Route path='/Community' element={<Community />} />
                <Route path='/Marinel' element={<Marinel />} />
                <Route path='/FindDShop' element={<FindDShop />} />
                <Route path='/SignIn' element={<SignIn />} />
                <Route path='/Login' element={<Login setUser={setUser} />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/checkout' element={<Checkout />} />
                <Route path='/manage-products' element={<ManageProducts />} />
                <Route path='/AddProduct' element={<AddProduct />} />
                <Route path='/EditProduct' element={<EditProduct />} />

              </Routes>

              <AppFooter />
            </BrowserRouter>

          </CartContextProvider>
        </ProductContextProvider>
      </>
    </div>
  )
}

export default App
