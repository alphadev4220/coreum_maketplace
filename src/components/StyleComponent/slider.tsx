import { useEffect, useState } from "react";
import "../../App.css";
import { FILE_TYPE, config } from "app/config";
import { getFileType } from "utils/utils";
import defaultLogo from "images/default_logo.png";
import Slider from 'react-slick';
import { SampleNextArrow, SamplePrevArrow } from "components/Button/NextPrevButton";

/* Install pure-react-carousel using -> npm i pure-react-carousel */

export default function UpperSlider(props) {
  const [availableItems, setAvaliableItems] = useState([]);

  useEffect(() => {
    if (props?.items && props?.items?.length > 0)
      setAvaliableItems(props?.items);
  }, [props?.items]);

  const processIPFSstr = (fileName) => {
    if (fileName.includes("ipfs://")) {
      return fileName.replace("ipfs://", config.ipfsGateway);
    }
    return fileName;
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
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1368,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />
  };

  return (
    <div className="mt-4 w-full">
      <Slider {...settings} style={{ width: "100%" }}>
        {availableItems &&
          availableItems.length > 0 &&
          availableItems?.map((item, index) => (
            <div className="flex relative max-w-[300px] max-h-[300px] px-[20px]" key={"available" + index}>
              {getFileType(item?.image || "") === FILE_TYPE.VIDEO && (
                <video
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  controls={false}
                  className="w-sm-100 "
                  width="100%"
                >
                  {(item?.image || "")
                    .toString()
                    .toLowerCase()
                    .includes("webm") === true ? (
                    <source
                      src={processIPFSstr(item?.image || "")}
                      type="video/webm"
                    />
                  ) : (
                    <source
                      src={processIPFSstr(item?.image || "")}
                      type="video/mp4"
                    />
                  )}
                </video>
              )}
              {getFileType(item?.image || "") === FILE_TYPE.IMAGE && (
                <img
                  src={`${config.ipfsGateway}${item?.image?.replace(
                    "ipfs://",
                    ""
                  )}`}
                  alt=""
                  className="object-cover object-center w-full rounded-xl"
                  loading="lazy"
                  onError={handleImageError}
                />
              )}
            </div>
          ))}
      </Slider >
    </div>
  );
}
