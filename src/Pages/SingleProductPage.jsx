import React from 'react'
import { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductContext } from '../Context/ProductContext';
import { CartContext } from '../Context/CartContext';



export default function SingleProductPage() {
    const { serialN } = useParams()
    const { products } = useContext(ProductContext)
    const { addToCart } = useContext(CartContext)
    const product = products.find((item) => item.serialN == serialN);
    const { cart } = useContext(ProductContext)

    if (products.length === 0) {
        return <div>Loading...</div>
    }

    if (!product) {
        return <div>Product not found</div>
    }

    return (
        <main>
            <div className='container content'>
                <div className="row">

                    <div className='img-section col-lg-5'>
                        <img src={product.img} alt="" />
                    </div>
                    <div className="detail-secttion col-lg-7">
                        <h2 className='detail-h2'>{product.title}</h2>
                        <p>{product.description}</p>
                        {
                            product.salePrice < product.price ?
                                <p className='price-detail price-holder'>
                                    <span className='line-through-price '>{product.price}$ </span>
                                    <span className='price'>{product.salePrice}$</span>
                                </p>
                                :
                                <p className='price-detail price'>{product.price}$</p>
                        }
                        <p>{product.category}</p>

                        <br />

                        <button onClick={() => addToCart(product.serialN)} className='btn-dec btn-detail btn btn-primary-md'>Add To Cart</button>
                        <button className=' btn-detail btn btn-primary-md'><Link className='btn-dec' to='/Store'>Back To Shop</Link></button>
                    </div>
                </div>
            </div>
        </main>
    )
}
