import { useState, useEffect, useContext } from 'react'
import Top3Products from '../Components/Top3Products.jsx'
// import Carusel from '../Components/carusel.jsx'
import Articles from '../Components/Articles.jsx'
import { ProductContext } from '../Context/ProductContext.jsx'
import { Carousel } from 'react-bootstrap'


export default function Home() {
  const { products } = useContext(ProductContext)

  const filteredProducts = products.filter((item) => item.salePrice <= 150)

  useEffect(() => {
    console.log('mount')

    return () => console.log('unmount')
  }, [])

  return (
    <>
      {/* <section className='Grid section-1'>
        <div>
          <Carousel />
        </div>
      </section> */}
      

      <section className="Grid section2">
        <h2 className="Grid h2">top 3 best products</h2>
        <div className="Grid top-products">
          {
            filteredProducts.length == 0 ?
              <h2>no movies found</h2>
              :
              filteredProducts.map((item, index) => <Top3Products key={index} {...item} />)
          }
        </div>
      </section>
      <section className='Grid section3'>
        <h2 className='Grid h3'>Articles</h2>
        <Articles />
      </section>

    </>
  )
}
