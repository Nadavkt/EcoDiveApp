import { Link } from 'react-router-dom';

export default function Product({ img, title, price, salePrice, serialN }) {

  return (
    <div className="card">
      <img className='card-img-top' src={img} alt="" title='' />

      <div className='card-body'>
        <h5 className='card-title'>{title}</h5>
        {
          salePrice < price ?
            <p className='price-holder'>
              <span className='line-through-price '>{price}$ </span>
              <span className='price'>{salePrice}$</span>
            </p>
            :
            <p className='price'>{price}$</p>
        }
        <Link to={`/SingleProductPage/${serialN}`}>
          <button className='btn-store btn btn-primary' >SEE MORE</button>
        </Link>
      </div>

    </div>
  )
}
