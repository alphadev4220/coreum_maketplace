import { useEffect, useState } from "react";
import "../../App.css";
import { FILE_TYPE, config } from "app/config";
import defaultLogo from "images/default_logo.png";
import Slider from "react-slick";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "components/Button/NextPrevButton";

/* Install pure-react-carousel using -> npm i pure-react-carousel */

export default function BottomSlider(props) {
  const [availableItems, setAvaliableItems] = useState([]);

  useEffect(() => {
    if (props?.items && props?.items?.length > 0)
      setAvaliableItems(props?.items);
  }, [props?.items]);

  const getFullLogoURL = (item) => {
    if (item?.fileType === FILE_TYPE.IMAGE) {
      return `${config.ipfsGateway}${item?.logoURL}`;
    } else {
      return `${config.ipfsGateway}${item?.musicURL}`;
    }
  };

  const handleImageError = (event) => {
    // When the image fails to load, replace it with the defaultLogo
    event.target.src = defaultLogo;
  };

  const settings = {
    lazyLoad: true,
    infinite: true,
    autoplay: true,
    centerMode: true,
    speed: 2000,
    autoplaySpeed: 3000,
    slidesToShow: availableItems.length > 8 ? 8 : availableItems.length,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1368,
        settings: {
          slidesToShow: availableItems.length > 6 ? 6 : availableItems.length,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: availableItems.length > 4 ? 4 : availableItems.length,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: availableItems.length > 2 ? 2 : availableItems.length,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: availableItems.length > 2 ? 2 : availableItems.length,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
  };

  return (
    <div className="mt-4">
      <Slider {...settings} style={{ width: "100%" }}>
        {availableItems &&
          availableItems.length > 0 &&
          availableItems?.map((item, index) => (
            <div
              className="flex flex-shrink-0 relative max-w-[200px] px-[20px]"
              key={"available" + index}
            >
              {item.fileType === FILE_TYPE.VIDEO && (
                <video
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  controls={false}
                  className="w-sm-100 "
                  width="100%"
                >
                  {(item?.musicURL || "")
                    .toString()
                    .toLowerCase()
                    .includes("webm") === true ? (
                    <source src={getFullLogoURL(item)} type="video/webm" />
                  ) : (
                    <source src={getFullLogoURL(item)} type="video/mp4" />
                  )}
                </video>
              )}
              {item.fileType === FILE_TYPE.IMAGE && (
                <img
                  src={getFullLogoURL(item)}
                  alt=""
                  className="object-cover object-center w-full rounded-xl"
                  loading="lazy"
                  onError={handleImageError}
                />
              )}
            </div>
          ))}
      </Slider>
    </div>
  );
}
