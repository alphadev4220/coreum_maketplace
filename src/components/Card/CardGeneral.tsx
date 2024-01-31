// GenericCard.js
import React, { useState } from "react";
import Avatar from "components/StyleComponent/Avatar";
import { useNavigate } from "react-router-dom";
import CardFlip from "react-card-flip";
import { config } from "app/config";
import axios from "axios";

export const GenericCard = ({ nftItem, renderView, selectable }) => {
  const [isFlipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  const onClickHandler = () => {
    !selectable &&
      ((nftItem as any)?._id
        ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
        : navigate("/nft-detail"));
  };

  return (
    <div className="relative">
      <div onClick={onClickHandler}>
        <div
          className="absolute top-0 aspect-w-12 aspect-h-10 w-full h-full z-50"
          onMouseEnter={() => setFlipped(true)}
          onMouseLeave={() => setFlipped(false)}
        ></div>
      </div>
      <CardFlip isFlipped={isFlipped}>
        {renderView()}
        <div
          className={`nc-CardNFT z-10 relative flex flex-col group !border-0 [ nc-box-has-hover nc-dark-box-bg-has-hover ]`}
          data-nc-id="CardNFT"
        >
          <div className="flex flex-col text-neutral-500 dark:text-neutral-400 px-10 py-5">
            <div className="flex flex-col gap-1 mb-4">
              <span>Collection:</span>
              <div className="flex flex-row gap-4 items-center">
                <Avatar
                  imgUrl={(nftItem as any)?.collection_id?.logoURL}
                  sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span>{(nftItem as any)?.collection_id?.name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <span>Owner:</span>
              <div className="flex flex-row gap-4 items-center">
                <Avatar
                  imgUrl={(nftItem as any)?.owner?.avatar}
                  sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span>{(nftItem as any)?.owner?.username}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <span>Creator:</span>
              <div className="flex flex-row gap-4 items-center">
                <Avatar
                  imgUrl={(nftItem as any)?.creator?.avatar}
                  sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span>{(nftItem as any)?.creator?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </CardFlip>
    </div>
  );
};

const renderIcon = (state?: "playing" | "loading") => {
  if (!state) {
    return (
      <svg className="ml-0.5 w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M18.25 12L5.75 5.75V18.25L18.25 12Z"
        ></path>
      </svg>
    );
  }
  return (
    <svg className=" w-9 h-9" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15.25 6.75V17.25"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8.75 6.75V17.25"
      ></path>
    </svg>
  );
};

export const renderListenButtonDefault = (state?: "playing" | "loading") => {
  return (
    <div
      className={`w-14 h-14 flex items-center justify-center rounded-full  cursor-pointer ${
        state === "playing"
          ? "bg-neutral-900/40 text-primary-50"
          : "bg-neutral-50/80 text-primary-500"
      }`}
    >
      {renderIcon(state)}
    </div>
  );
};

export const plusPlayCount = async (itemId, userId) => {
  await axios
    .post(
      `${config.API_URL}api/playhistory/createPlayHistory`,
      { itemId: itemId || "", userId: userId || "" },
      {
        headers: {
          "x-access-token": localStorage.getItem("jwtToken"),
        },
      }
    )
    .then(() => {})
    .catch(() => {});
};
