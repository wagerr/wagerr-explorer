import Component from 'core/Component';
import React from 'react';
import Slider from "react-slick";

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    />
  );
}

export default class Sliding extends Component {
  state = {
    selected: -1
  }
  render() {
    var settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 11,
      slidesToScroll: 1,
      initialSlide: 0,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 2100,
          settings: {
            slidesToShow: 8,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1500,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1147,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 1021,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 894,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 471,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 346,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    return (
      <div className="slick-slider">
        <div className="slick-slider__row">
          <Slider {...settings}>
            {
              this.props.options.map((item, index) =>
                <center
                  className={`slick-slider__item ${item.value === this.props.selectedValue && 'slick-slider__item__active'}`} 
                  key={index} 
                  onClick={()=> this.props.onChange(item.value)}
                >
                  <img src={'/img/uiupdate/' + item.icon} alt={'sports'} />
                  <p>{item.label}</p>
                </center>)
            }
          </Slider>
        </div>
      </div>
    )
  }
}