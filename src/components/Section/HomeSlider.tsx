import { FC } from "react";
import CardNFTComponent from "components/Card/CardNFTComponent";
import Slider from "react-slick";
import { SampleNextArrow, SamplePrevArrow } from "../Button/NextPrevButton";

export interface HomeSliderProps {
  items;
}

const HomeSlider: FC<HomeSliderProps> = ({ items }: HomeSliderProps) => {
  const settings = {
    lazyLoad: true,
    infinite: true,
    autoplay: true,
    centerMode: true,
    className: "center",
    centerPadding: "10px",
    speed: 500,
    autoplaySpeed: 1500,
    slidesToShow: 5,
    slidesToScroll: 1,
    pauseOnHover: true,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 1368,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
  };
  return (
    <Slider {...settings} style={{ width: "100%" }}>
      {items &&
        items.length > 0 &&
        items.map((item) => (
          <CardNFTComponent item={item} isHome={true} key={item} />
        ))}
    </Slider>
  );
};

export default HomeSlider;
