import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import ImageCarousel from "../../public/Data/ImageCarousel.json"

export default function carusel() {

    const renderSlide = ImageCarousel.map((image) => (
        <div key={image.alt}>
        <img src={image.url} alt={image.alt} />
        <p className="legend">{image.label}</p>
      </div>
    ));


  return (
    <>
        <Carousel
          showArrows={true}
          autoPlay={true}
          infiniteLoop={true}
          className="carousel-container"
        >
        {renderSlides}
        </Carousel>
    </>
  )
}
