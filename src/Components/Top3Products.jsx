import React from 'react'

export default function Top3Products({img, title}) {
  return (
    <div className='top3 card'>
        <img className='card-img-top' width={"250"} src={img} alt="top 3" title='top 3' />
        <div className='card-body'>
            <h3 className='card-title'>{title}</h3>
        </div>
    </div>
  )
}
