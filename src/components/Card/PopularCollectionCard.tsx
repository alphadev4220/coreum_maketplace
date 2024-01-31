import React, { FC, useEffect, useState } from "react";
import Avatar from "components/StyleComponent/Avatar";
import VerifyIcon from "../StyleComponent/VerifyIcon";
import { useAppDispatch } from "app/hooks";
import { useNavigate } from "react-router-dom";
import { changeConsideringCollectionId } from "app/reducers/collection.reducers";
import { config } from "app/config";
import VideoForBannerPreview from "./VideoForBannerPreview";
import { nanoid } from "@reduxjs/toolkit";
import NcImage from "components/NcComponent/NcImage";
import { isVideo } from "utils/utils";
import defaultBanner from "images/default_banner.jpg";

export interface PopularCollectionCardProps {
  className?: string;
  imgs?: string[];
  collection?: any;
}

const PopularCollectionCard: FC<PopularCollectionCardProps> = ({
  className,
  collection,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [DEMO_NFT_ID] = React.useState(nanoid());

  useEffect(() => {
    setData(collection);
  }, [collection]);

  const onSelectCollection = (id: string) => {
    if (id !== "" && id) {
      dispatch(changeConsideringCollectionId(id));
      localStorage.setItem("collectionId", id);
      navigate("/collectionItems/" + id);
    }
  };
  return (
    <div
      className={`CollectionCard flex flex-col w-full relative cursor-pointer ${className}`}
      onClick={() => {
        onSelectCollection((data as any)?._id || "");
      }}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {isVideo((data as any)?.collection_info?.bannerURL || "") !== true ? (
          <NcImage
            containerClassName="w-full pt-[27.78%] relative overflow-hidden"
            src={(data as any)?.collection_info?.bannerURL}
            isLocal={true}
            alt=""
            className="absolute top-0 left-0 object-cover w-full h-full"
          />
        ) : (
          <VideoForBannerPreview
            src={
              (data as any)?.collection_info?.bannerURL === ""
                ? defaultBanner
                : `${config.UPLOAD_URL}uploads/${
                    (data as any)?.collection_info?.bannerURL
                  }`
            }
            nftId={DEMO_NFT_ID}
            className="w-full pt-[27.78%] overflow-hidden"
          />
        )}
      </div>
      <div className="relative mt-5 items-center w-full">
        {/* TITLE */}
        <h1 className="text-md lg:text-2xl font-semibold transition-colors group-hover:text-primary-500 flex justify-center">
          {(data as any)?.collection_info?.name || ""}
        </h1>
        {/* AUTHOR */}
        <div className="flex justify-center">
          <div className="flex items-center truncate mt-2">
            <Avatar
              sizeClass="h-10 w-10"
              imgUrl={(data as any)?.creator_info?.avatar}
            />
            <div className="ml-2 text-sm truncate">
              <span className="hidden font-normal sm:inline-block">
                Creator
              </span>
              {` `}
              <span className="font-medium">
                {(data as any)?.creator_info?.username || ""}
              </span>
            </div>
            {Boolean((data as any)?.creator_info?.verified) === true && (
              <VerifyIcon iconClass="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <span className="mb-0.5 inline-flex justify-center items-center px-1 py-1.5   rounded-md text-sm !leading-none font-medium">
            {(data as any)?.items_length} items
          </span>
        </div>
      </div>
    </div>
  );
};

export default PopularCollectionCard;
