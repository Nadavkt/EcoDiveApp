import { useContext } from "react"
import Product from '../Components/Product.jsx'
import { ProductContext } from '../Context/ProductContext.jsx'

export default function Store() {

  const { products } = useContext(ProductContext)




  return (
    <>
      <section className="products bg-secondary">
        {products.map((item, index) => <Product key={index} {...item} />)}
      </section>
    </>
  )
}
