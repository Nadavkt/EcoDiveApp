import React from 'react'
import { useContext } from 'react';
import { ProductContext } from '../Context/ProductContext';
import { CartContext } from '../Context/CartContext';
import { Link } from 'react-router-dom';

export default function Checkout() {

  const { total } = useContext(CartContext);


  return (
    <div>
      <h1>Checkout</h1>
      <div>
        {total} $
      </div>
      <button className='btn-checkout btn btn-primary-md'><Link className='btn-dec' to='/checkout'>Checkout</Link></button>
      <button className='btn-checkout btn btn-primary-md'><Link className='btn-dec' to='/cart'>Back To Cart</Link></button>

    </div>
  )
}
