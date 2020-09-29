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
      infinite: true,
      speed: 500,
      slidesToShow: 11,
      slidesToScroll: 1,
      initialSlide: 0,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 1500,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 1,
            infinite: true,
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: true,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            initialSlide: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 3,
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

const demo_sports = [
  { id: 1, label: 'All Events', icon: 'explorer_sportbetting_allevent.png' },
  { id: 2, label: 'Soccer', icon: 'explorer_sportbetting_soccor.png' },
  { id: 3, label: 'Esports', icon: 'explorer_sportbetting_esport.png' },
  { id: 4, label: 'Baseball', icon: 'explorer_sportbetting_baseball.png' },
  { id: 5, label: 'Basketball', icon: 'explorer_sportbetting_basketball.png' },
  { id: 6, label: 'Football', icon: 'explorer_sportbetting_soccor.png' },
  { id: 7, label: 'Hockey', icon: 'explorer_sportbetting_hockey.png' },
  { id: 8, label: 'Aussie Rules', icon: 'explorer_sportbetting_aussie_rules.png' },
  { id: 9, label: 'Cricket', icon: 'explorer_sportbetting_cricket.png' },
  { id: 10, label: 'MMA', icon: 'explorer_sportbetting_mma.png' },
  { id: 11, label: 'Rugby League', icon: 'explorer_sportbetting_rugby_league.png' },
  { id: 12, label: 'Rugby Union', icon: 'explorer_sportbetting_rugby_league.png' },
]