import React from 'react'
import { Link } from 'react-router-dom'

export default function ManageProducts() {

  return (
    <>
      <h1 className='Admin-h1'>Hello Admin</h1>
      <div className='products-mange'>
        <button className='btn-checkout-manger btn btn-primary-md'><Link className='btn-dec' to='/EditProduct'>Edit Product</Link></button>
        <button className='btn-checkout-manger btn btn-primary-md'><Link className='btn-dec' to='/AddProduct'>Add Product</Link></button>
      </div>
    </>
  )
}
