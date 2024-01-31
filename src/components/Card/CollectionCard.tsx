import React, { FC } from "react";
import Avatar from "components/StyleComponent/Avatar";
import NcImage from "components/NcComponent/NcImage";
import VerifyIcon from "../StyleComponent/VerifyIcon";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import {
  changeConsideringCollectionId,
  CollectionData,
} from "app/reducers/collection.reducers";
import { config } from "app/config.js";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { RiEdit2Line, RiDeleteBin6Line } from "react-icons/ri";
import { nanoid } from "@reduxjs/toolkit";
import VideoForBannerPreview from "./VideoForBannerPreview";
import { isVideo } from "utils/utils";

export interface CollectionCardProps {
  className?: string;
  imgs?: string[];
  collection?: CollectionData;
  isEditable?: Boolean;
  onRemove?: Function;
}

const CollectionCard: FC<CollectionCardProps> = ({
  className,
  collection,
  isEditable = true,
  onRemove,
}) => {
  const dispatch = useAppDispatch();
  const currentUsr = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [DEMO_NFT_ID] = React.useState(nanoid());

  const onSelectCollection = (id: string) => {
    if (id !== "" && id) {
      dispatch(changeConsideringCollectionId(id));
      localStorage.setItem("collectionId", id);
      navigate("/collectionItems/" + id);
    }
  };

  const handleEdit = (id: string) => {
    if (collection && currentUsr?._id === collection?.owner?._id) {
      navigate("/editCollection/" + id);
    }
  };

  const handleRemove = (id: any, number: any) => {
    if (collection && currentUsr?._id === collection?.owner?._id) {
      onRemove(id, number);
    }
  };

  return (
    <div
      className={`CollectionCard relative p-4 rounded-2xl w-[100%] overflow-hidden h-[410px] flex justify-center flex-col group cursor-pointer ${className}`}
    >
      {isVideo(collection?.bannerURL || "") !== true ? (
        <NcImage
          containerClassName="absolute inset-0"
          src={collection?.bannerURL}
          isLocal={true}
        />
      ) : (
        <VideoForBannerPreview
          src={`${config.UPLOAD_URL}uploads/${collection?.bannerURL}`}
          nftId={DEMO_NFT_ID}
          className="absolute inset-0"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 group-hover:h-full to-transparent "></div>
      {collection &&
        currentUsr?._id === collection?.owner?._id &&
        isEditable && (
          <div className="edit-buttons absolute top-[20%] left-0 right-0 m-auto flex justify-center items-center gap-4 z-50">
            <IconButton
              className="!bg-[#0284c7] !w-[40px] !h-[40px]"
              onClick={() => handleEdit(collection?._id)}
            >
              <RiEdit2Line color="#fff" />
            </IconButton>
            {collection?.itemslength === 0 && (
              <IconButton
                className="!bg-[#0284c7] !w-[40px] !h-[40px]"
                onClick={() =>
                  handleRemove(collection?._id, collection?.collectionNumber)
                }
              >
                <RiDeleteBin6Line color="#fff" />
              </IconButton>
            )}
          </div>
        )}
      <div
        className="absolute top-0 bottom-0 left-0 right-0 m-auto"
        onClick={() => {
          onSelectCollection(collection?._id || "");
        }}
      ></div>
      <div
        className="relative mt-auto mb-3"
        onClick={() => {
          onSelectCollection(collection?._id || "");
        }}
      >
        {isEditable && (
          <div className="flex items-center">
            <Avatar
              sizeClass="h-6 w-6"
              containerClassName="ring-2 ring-white"
              imgUrl={collection?.owner?.avatar}
              userName={" "}
            />
            <div className="ml-2 text-white text-md">
              <span className="font-normal">by</span>
              {` `}
              <span className="font-medium">
                {collection?.owner?.username || ""}
              </span>
            </div>
            {Boolean(collection?.owner?.verified) === true && (
              <VerifyIcon iconClass="w-4 h-4" />
            )}
          </div>
        )}
        <h2
          className="font-semibold text-3xl mt-1.5 text-white"
          onClick={() => {
            onSelectCollection(collection?._id || "");
          }}
        >
          {collection?.name || ""}
        </h2>
        <div
          className="flex items-center"
          onClick={() => {
            onSelectCollection(collection?._id || "");
          }}
        >
          <div className="ml-2 text-lg text-white">
            <span className="font-normal">
              {collection?.itemslength || 0} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
