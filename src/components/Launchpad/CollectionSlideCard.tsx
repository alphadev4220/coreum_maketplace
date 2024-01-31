import {
  StackedCarousel,
  ResponsiveContainer,
} from "react-stacked-center-carousel";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./Slider.css";
import { Slide } from "./slide";
import React, { useRef } from "react";
import defaultLogo from "images/default_logo.png";
import { useNavigate } from "react-router-dom";

const defaultData = [
  {
    logoURL: defaultLogo,
    name: "hello",
    id: -1,
  },
  {
    logoURL: defaultLogo,
    name: "hello",
    id: -1,
  },
  {
    logoURL: defaultLogo,
    name: "hello",
    id: -1,
  },
  {
    logoURL: defaultLogo,
    name: "hello",
    id: -1,
  },
  {
    logoURL: defaultLogo,
    name: "hello",
    id: -1,
  },
];

export interface CollectionSlideCardProps {
  data;
  onChange;
}

const CollectionSlideCard = ({ data, onChange }: CollectionSlideCardProps) => {
  const ref = React.useRef<StackedCarousel>(null);
  const navigate = useNavigate();
  const indexRef = useRef(0);
  const slideData = data?.length === 0 ? defaultData : data;

  return (
    <>
      <div style={{ width: "100%", position: "relative" }}>
        <ResponsiveContainer
          carouselRef={ref}
          render={(width, carouselRef) => {
            return (
              <StackedCarousel
                ref={carouselRef}
                slideComponent={Slide}
                slideWidth={320}
                carouselWidth={width}
                data={slideData}
                maxVisibleSlide={5}
                disableSwipe
                customScales={[1, 0.85, 0.7, 0.55]}
                transitionTime={450}
              />
            );
          }}
        />
      </div>
      <div className="flex justify-center items-center gap-3 md:gap-6 mt-[15px] md:mt-[30px]">
        <div
          className="rounded-3xl p-[8px] text-[10px] bg-black shadow-[0px_0px_5px_#33ff00_inset] md:shadow-[0px_0px_8px_#33ff00_inset]"
          onClick={() => {
            ref.current?.goBack();
            indexRef.current =
              indexRef.current === 0
                ? slideData.length - 1
                : indexRef.current - 1;
            onChange(slideData[indexRef.current]?.name);
          }}
          style={{ cursor: "pointer" }}
        >
          <ChevronLeftIcon />
        </div>

        <div
          className=" rounded-81xl bg-lime-200 shadow-[0px_0px_10px_#33ff00_inset] md:shadow-[0px_0px_15px_#33ff00_inset] flex flex-col items-center justify-center text-center text-[20px] md:text-base text-white px-[15px] py-[10px] md:px-[20px] md:py-[16px] lg:px-[48px] lg:py-[20px]"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate(`/collectionItems/${slideData[indexRef.current]._id}`);
          }}
        >
          Explore Collection
        </div>

        <div
          className="rounded-3xl p-[8px] text-[10px] bg-black shadow-[0px_0px_5px_#33ff00_inset] md:shadow-[0px_0px_8px_#33ff00_inset]"
          onClick={() => {
            ref.current?.goNext();
            indexRef.current =
              indexRef.current === slideData.length - 1
                ? 0
                : indexRef.current + 1;
            onChange(slideData[indexRef.current]?.name);
          }}
          style={{ cursor: "pointer" }}
        >
          <ChevronRightIcon />
        </div>
      </div>
    </>
  );
};

export default CollectionSlideCard;
