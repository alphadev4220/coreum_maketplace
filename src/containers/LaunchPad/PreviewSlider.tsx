import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { useEffect, useState } from "react";
import { FILE_TYPE, config } from "app/config";
import { getFileType } from "utils/utils";

/* Install pure-react-carousel using -> npm i pure-react-carousel */

const PreviewSlider = (props) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages(props.images);
  }, [props]);

  const processIPFSstr = (fileName) => {
    if (fileName.includes("ipfs://")) {
      return fileName.replace("ipfs://", config.ipfsGateway);
    }
    return fileName;
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-center w-100% h-full pt-15 pv-10 sm:py-8 m-auto cursor-pointer select-none">
        <CarouselProvider
          className="lg:block hidden"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          isIntrinsicHeight={true}
          totalSlides={12}
          visibleSlides={4}
          step={1}
          infinite={true}
        >
          <div className="w-full relative flex items-center justify-center">
            {images && images.length > 0 && (
              <ButtonBack
                role="button"
                aria-label="slide backward"
                className="min-w-[40px] absolute left-0   rounded-3xl pt-1 pl-1 cursor-pointer"
                id="prev"
              >
                <img
                  className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] left-[-19px] rounded-3xl overflow-hidden shrink-0 z-[4]  h-[40px] w-[40px] cursor-pointer"
                  alt=""
                  src="/assets/leftarrow.svg"
                />
              </ButtonBack>
            )}
            <div className="w-full h-full mx-auto overflow-x-hidden overflow-y-hidden">
              <Slider>
                <div
                  id="slider"
                  className="h-full flex lg:gap-8 md:gap-6 gap-14 items-center justify-start transition ease-out duration-700"
                >
                  {images &&
                    images.length > 0 &&
                    images.map((item, index) => (
                      <Slide index={index} key={index}>
                        <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.VIDEO && (
                            <div className="video-container video--border">
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
                            </div>
                          )}
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.IMAGE && (
                            <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                              <img
                                src={processIPFSstr(item?.image || "")}
                                className="object-cover object-center w-full rounded-xl"
                                alt=""
                              />
                            </div>
                          )}
                        </div>
                      </Slide>
                    ))}
                </div>
              </Slider>
            </div>
            {images && images.length > 0 && (
              <ButtonNext
                role="button"
                aria-label="slide forward"
                className="min-w-[40px]  absolute right-0   pt-1 pr-1 rounded-3xl "
                id="next"
              >
                <img
                  className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] right-[-12px] rounded-3xl   overflow-hidden shrink-0 z-[5] h-[40px] w-[40px] cursor-pointer"
                  alt=""
                  src="/assets/rightarrow.svg"
                />
              </ButtonNext>
            )}
          </div>
        </CarouselProvider>

        {/* Carousel for tablet and medium size devices */}
        <CarouselProvider
          className="lg:hidden md:block hidden"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          isIntrinsicHeight={true}
          totalSlides={12}
          visibleSlides={2}
          step={1}
          infinite={true}
        >
          <div className="w-full relative flex items-center justify-center">
            <ButtonBack
              role="button"
              aria-label="slide backward"
              className="min-w-[40px] absolute left-0   rounded-3xl pt-1 pl-1 cursor-pointer"
              id="prev"
            >
              <img
                className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] left-[-19px] rounded-3xl contactImg overflow-hidden shrink-0 z-[4]"
                alt=""
                src="/assets/leftarrow.svg"
                style={{ cursor: "pointer" }}
              />
            </ButtonBack>
            <div className="w-full h-full mx-auto overflow-x-hidden overflow-y-hidden">
              <Slider>
                <div
                  id="slider"
                  className="h-full flex lg:gap-8 md:gap-6 gap-14 items-center justify-start transition ease-out duration-700"
                >
                  {images &&
                    images.length > 0 &&
                    images.map((item, index) => (
                      <Slide index={index} key={index}>
                        <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.VIDEO && (
                            <div className="video-container video--border">
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
                            </div>
                          )}
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.IMAGE && (
                            <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                              <img
                                src={processIPFSstr(item?.image || "")}
                                className="object-cover object-center w-full rounded-xl"
                                alt=""
                              />
                            </div>
                          )}
                        </div>
                      </Slide>
                    ))}
                </div>
              </Slider>
            </div>
            <ButtonNext
              role="button"
              aria-label="slide forward"
              className="min-w-[40px] absolute right-0   pt-1 pr-1 rounded-3xl "
              id="next"
            >
              <img
                className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] right-[-12px] rounded-3xl contactImg overflow-hidden shrink-0 z-[5]"
                alt=""
                src="/assets/rightarrow.svg"
                style={{ cursor: "pointer" }}
              />
            </ButtonNext>
          </div>
        </CarouselProvider>

        {/* Carousel for mobile and Small size Devices */}
        <CarouselProvider
          className="block w-[90%] md:hidden "
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          isIntrinsicHeight={true}
          totalSlides={12}
          visibleSlides={1}
          step={1}
          infinite={true}
        >
          <div className="w-full relative flex items-center justify-center">
            <ButtonBack
              role="button"
              aria-label="slide backward"
              className="min-w-[40px] absolute left-0   rounded-3xl pt-1 pl-1 cursor-pointer"
              id="prev"
            >
              <img
                className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] left-[-19px] rounded-3xl contactImg overflow-hidden shrink-0 z-[4]"
                alt=""
                src="/assets/leftarrow.svg"
                style={{ cursor: "pointer" }}
              />
            </ButtonBack>
            <div className="w-full h-full mx-auto overflow-x-hidden overflow-y-hidden">
              <Slider>
                <div
                  id="slider"
                  className="h-full w-full flex lg:gap-8 md:gap-6 items-center justify-start transition ease-out duration-700"
                >
                  {images &&
                    images.length > 0 &&
                    images.map((item, index) => (
                      <Slide index={index} key={index}>
                        <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.VIDEO && (
                            <div className="video-container video--border">
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
                            </div>
                          )}
                          {getFileType(item?.image || "") ===
                            FILE_TYPE.IMAGE && (
                            <div className="flex flex-shrink-0 relative w-full sm:w-auto">
                              <img
                                src={processIPFSstr(item?.image || "")}
                                className="object-cover object-center w-full rounded-xl"
                                alt=""
                              />
                            </div>
                          )}
                        </div>
                      </Slide>
                    ))}
                </div>
              </Slider>
            </div>
            <ButtonNext
              role="button"
              aria-label="slide forward"
              className="min-w-[40px] absolute right-0   pt-1 pr-1 rounded-3xl "
              id="next"
            >
              <img
                className="absolute my-0 mx-[!important] top-[calc(50%_-_19px)] right-[-12px] rounded-3xl contactImg overflow-hidden shrink-0 z-[5]"
                alt=""
                src="/assets/rightarrow.svg"
                style={{ cursor: "pointer" }}
              />
            </ButtonNext>
          </div>
        </CarouselProvider>
      </div>
    </div>
  );
};

export default PreviewSlider;
