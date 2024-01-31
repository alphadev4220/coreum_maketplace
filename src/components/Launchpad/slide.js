import React from "react";
import "./Slider.css";
import defaultLogo from "images/default_logo.png";
import { config } from "app/config";
import VideoForBannerPreview from "components/Card/VideoForBannerPreview";
import { isVideo } from "utils/utils";
import { nanoid } from "@reduxjs/toolkit";

export const Slide = React.memo(function (StackedCarouselSlideProps) {
  const { data, dataIndex, isCenterSlide, swipeTo, slideIndex } =
    StackedCarouselSlideProps;

  const coverImage =
    data[dataIndex]?.logoURL === "" || data[dataIndex]?.logoURL === undefined
      ? defaultLogo
      : `${config.UPLOAD_URL}uploads/${data[dataIndex]?.logoURL}`;
  const [DEMO_NFT_ID] = React.useState(nanoid());

  return (
    <div className="card-card" draggable={false}>
      <div className={`cover fill ${isCenterSlide ? "off" : "on"}`}>
        <div
          className="card-overlay fill"
          onClick={() => {
            if (!isCenterSlide) swipeTo(slideIndex);
          }}
        />
      </div>
      <div className="detail fill">
        <div className="discription">
          {isVideo(data[dataIndex]?.logoURL || "") !== true ? (
            <img alt="" className="cover-image" src={coverImage} />
          ) : (
            <VideoForBannerPreview
              src={coverImage}
              nftId={DEMO_NFT_ID}
              className="w-full pt-[27.78%] overflow-hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
});
