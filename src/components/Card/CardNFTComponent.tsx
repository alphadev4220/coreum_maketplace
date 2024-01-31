import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "components/StyleComponent/Avatar";
import NcImage from "components/NcComponent/NcImage";
import { AiOutlineMessage } from "react-icons/ai";
import CartButton from "../Button/CartButton";
import LikeButton from "../Button/LikeButton";
import musicWave from "images/musicWave.png";
import Prices from "../StyleComponent/Prices";
import { ClockIcon } from "@heroicons/react/outline";
import NetworkLogo from "../StyleComponent/NetworkLogo";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import Tooltip from "@mui/material/Tooltip";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { isEmpty } from "app/methods";
import axios from "axios";
import { toast } from "react-toastify";
import { config, PLATFORM_NETWORKS, FILE_TYPE } from "app/config.js";
import { NFT_EFFECT } from "../StyleComponent/EffectListBox";
import TileEffect from "../StyleComponent/TileEffect";
import {
  getLinkPathToJSON,
  getSystemTime,
  isJsonObject,
  isVideo,
} from "utils/utils";
import SelectableCard from "./SelectableCard";
import {
  changeBulkSelectedArray,
  selectBulkOpsMode,
  selectBulkSelectedArray,
} from "app/reducers/collection.reducers";
import {
  GenericCard,
  plusPlayCount,
  renderListenButtonDefault,
} from "./CardGeneral";
import ThreeDForNft from "./ThreeDForNft";
import { nanoid } from "@reduxjs/toolkit";
import VideoForPreview from "./VideoForPreview";
import ButtonPlayMusicRunningContainer from "containers/ButtonPlayMusicRunningContainer";
import AudioForNft from "./AudioForNft";
import RemainingTimeNftCard from "./RemainingTimeNftCard";
import VideoForNft from "./VideoForNft";

export interface CardNFTProps {
  className?: string;
  isLiked?: boolean;
  item?: any;
  hideHeart?: boolean;
  effect?: NFT_EFFECT;
  isHome?: boolean;
  selectable?: boolean;
  clickStyle?: string;
  isProfile?: boolean;
}

const CardNFTComponent: FC<CardNFTProps> = (props: any) => {
  const bulkMode = useAppSelector(selectBulkOpsMode);
  const bulkSelectedArray = useAppSelector(selectBulkSelectedArray);
  const currentUsr = useAppSelector(selectCurrentUser);
  const [className, setClassName] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [nftItem, setNftItem] = useState({});
  const [hideFav, setHideFav] = useState(props?.hideHeart || false);
  const [timeLeft, setTimeLeft] = useState({});
  const [sysTime, setSysTime] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [nftName, setNftName] = useState("No Name");
  const [imageUrl, setImageUrl] = useState("");
  const curTime = useRef(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [blurContent, setBlurContent] = useState(false);
  const [DEMO_NFT_ID] = React.useState(nanoid());
  const [isHovered, setIsHovered] = useState(!props.isHome);
  const [isProfile, setIsProfile] = useState(!props.isProfile);

  const fetchJson = useCallback(async () => {
    if (
      (nftItem as any)?.metadataURI === undefined ||
      (nftItem as any)?.metadataURI === "" ||
      (nftItem as any)?.name !== ""
    ) {
      setNftName((nftItem as any)?.name);
      setImageUrl((nftItem as any)?.logoURL);
      return;
    }
    const response = await axios.get(
      getLinkPathToJSON((nftItem as any)?.metadataURI, (nftItem as any)?.name)
    );

    if (response.data) {
      if (isJsonObject(response.data)) {
        setNftName(JSON.parse(response.data).name);
        setImageUrl(JSON.parse(response.data).image.replace("ipfs://", ""));
      } else {
        setNftName(response.data.name);
        setImageUrl(response.data.image.replace("ipfs://", ""));
      }
    }
  }, [nftItem]);

  useEffect(() => {
    let need2blur = false;
    if ((nftItem as any)?.blur)
      need2blur = true;
    if ((nftItem as any)?.explicit?.includes(currentUsr?._id) === true)
      need2blur = true;
    setBlurContent(need2blur);
    fetchJson();
  }, [nftItem, currentUsr]);

  useEffect(() => {
    setHideFav(props?.hideHeart);
    if (props.className) setClassName(props.className);

    if (props.item) {
      setNftItem(props.item);
      var isIn = props?.item?.likes?.includes(currentUsr?._id) || false;
      setIsLiked(isIn);
    }

    if (props.item?.isSale === 2 && !props.isHome) {
      (async () => {
        const res = await getSystemTime();
        setSysTime(res);
      })();
    }
  }, []);

  const setFavItem = (target_id: string, user_id: string) => {
    if (isEmpty(target_id) || isEmpty(user_id)) return;
    axios
      .post(
        `${config.API_URL}api/users/set_fav_item`,
        { target_id: target_id, user_id: user_id },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        axios
          .post(
            `${config.API_URL}api/item/get_detail`,
            { id: (nftItem as any)?._id || "" },
            {
              headers: {
                "x-access-token": localStorage.getItem("jwtToken"),
              },
            }
          )
          .then((result) => {
            setNftItem(result.data.data);
            checkIsLiked(result.data.data);
          })
          .catch(() => { });
      });
  };

  const toggleFav = () => {
    if (currentUsr === undefined || Object.keys(currentUsr).length === 0) {
      toast.error("Please connect your wallet first");
      return;
    }
    setFavItem((nftItem as any)._id, currentUsr?._id || "");
  };

  const checkIsLiked = (item) => {
    if (item && currentUsr) {
      if (!(item as any).likes) {
        setIsLiked(false);
        return;
      }
      let isLiked = item.likes.includes(currentUsr?._id);
      setIsLiked(isLiked);
    }
  };

  const handleMessage = (msg: any) => {
    if (currentUsr === undefined || Object.keys(currentUsr).length === 0) {
      toast.error("Please connect your wallet first");
      return;
    }
    let id = msg?._id ? msg._id : msg;
    if (currentUsr && currentUsr._id && currentUsr?._id !== id) {
      navigate("/message/" + id);
    } else {
      toast.warn("A NFT you select is yours");
    }
  };

  const calculateTimeLeft = (created: number, period: number) => {
    let difference = created * 1000 + period * 1000 - curTime.current++ * 1000;
    let time = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference >= 0) {
      time = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    setTimeLeft(time);
    setRefresh(!refresh);
    return difference;
  };

  useEffect(() => {
    let intVal: string | number | NodeJS.Timeout;
    if (sysTime > 0) {
      curTime.current = sysTime;
      calculateTimeLeft(
        (nftItem as any)?.auctionStarted,
        (nftItem as any)?.auctionPeriod
      );
      intVal = setInterval(() => {
        const time_left = calculateTimeLeft(
          (nftItem as any)?.auctionStarted,
          (nftItem as any)?.auctionPeriod
        );
        if (time_left <= 0) {
          curTime.current = 0;
          setAuctionEnded(true);
          clearInterval(intVal);
        }
      }, 1000);
    }

    return () => clearInterval(intVal);
  }, [sysTime]);

  const updateViews = () => {
    if ((nftItem as any)?._id?.toString()?.length === 24) {
      axios
        .post(`${config.API_URL}api/item/updateViews`, {
          itemId: (nftItem as any)?._id,
        })
        .then((response) => { })
        .catch((error) => { });
    }
  };

  const renderView = () => {
    return (
      <div
        className={`z-10 m-auto relative flex flex-col group [ nc-box-has-hover nc-dark-box-bg-has-hover ${!props?.isHome && "nc-box-has-hover-green-shadow-zoom"
          } ] ${props?.isHome ? "!border-[#22c55e]" : ""} ${className}`}
        onMouseEnter={() => {
          props.isHome && setIsHovered(true);
        }}
        onMouseLeave={() => {
          props.isHome && setIsHovered(false);
        }}
      >
        <div className="relative flex-shrink-0 ">
          {(nftItem as any)?.fileType > FILE_TYPE.IMAGE ? (
            <>
              {(nftItem as any)?.fileType === FILE_TYPE.THREED ? (
                <ThreeDForNft
                  src={`${config.ipfsGateway}${(nftItem as any)?.musicURL}`}
                  nftId={(nftItem as any)?._id || DEMO_NFT_ID}
                />
              ) : (nftItem as any)?.fileType === FILE_TYPE.AUDIO ? (
                <AudioForNft
                  src={`${config.ipfsGateway}${(nftItem as any)?.musicURL}`}
                  nftId={(nftItem as any)?._id || DEMO_NFT_ID}
                />
              ) : (
                <VideoForNft
                  src={`${config.ipfsGateway}${(nftItem as any)?.musicURL}`}
                  nftId={(nftItem as any)?._id || DEMO_NFT_ID}
                />
              )}
              <div
                className=""
                onClick={() => {
                  updateViews();
                  !props?.selectable &&
                    ((nftItem as any)?._id
                      ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                      : navigate("/nft-detail"));
                }}
              >
                {isVideo((nftItem as any)?.logoURL) === false ? (
                  <NcImage
                    containerClassName="block aspect-w-12 aspect-h-10 w-full h-[250px] rounded-3xl overflow-hidden z-0"
                    src={(nftItem as any)?.logoURL}
                    className={`object-cover w-full h-[250px] rounded-3xl overflow-hidden  group-hover:scale-[1.03] transition-transform duration-300 ease-in-out cursor-pointer will-change-transform ${blurContent === true ? "blur-2xl" : ""
                      }`}
                  />
                ) : (
                  <VideoForPreview
                    src={`${(nftItem as any)?.logoURL || ""}?stream=true`}
                    isLocal={false}
                    nftId={(nftItem as any)?._id || DEMO_NFT_ID}
                    className="object-cover cursor-pointer w-full h-[250px] rounded-3xl overflow-hidden z-0 "
                  />
                )}
              </div>
            </>
          ) : (
            <div>
              <NcImage
                containerClassName="flex aspect-w-12 aspect-h-10 w-full h-[250px] rounded-3xl overflow-hidden z-0"
                src={imageUrl}
                loading="lazy"
                onClick={() => {
                  updateViews();
                  !props?.selectable &&
                    ((nftItem as any)?._id
                      ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                      : navigate("/nft-detail"));
                }}
                className={`object-cover cursor-pointer w-full h-[250px] rounded-3xl overflow-hidden  group-hover:scale-[1.03] transition-transform duration-300 ease-in-out will-change-transform ${blurContent === true ? "blur-2xl" : ""
                  } `}
              />
            </div>
          )}

          {isHovered && isProfile && (
            <div className="flex flex-row absolute top-3 right-3 z-10 !h-10 bg-black/50 px-3.5 items-center justify-center rounded-full text-white">
              <CartButton nftId={(nftItem as any)?._id} />
              <div
                onClick={() =>
                  !props?.selectable && handleMessage((nftItem as any)?.owner)
                }
              >
                <AiOutlineMessage
                  className="flex items-center justify-center cursor-pointer rounded-full text-white"
                  size={21}
                />
              </div>
              {!hideFav && (
                <LikeButton
                  liked={isLiked}
                  count={
                    (nftItem as any)?.likes ? (nftItem as any).likes.length : 0
                  }
                  toggleFav={toggleFav}
                />
              )}
            </div>
          )}
          {((nftItem as any)?.fileType === FILE_TYPE.THREED ||
            (nftItem as any)?.fileType === FILE_TYPE.VIDEO) && (
              <ButtonPlayMusicRunningContainer
                className="absolute z-20 bottom-3 left-3"
                nftId={(nftItem as any)?._id || DEMO_NFT_ID}
                renderDefaultBtn={() => renderListenButtonDefault()}
                renderPlayingBtn={() => renderListenButtonDefault("playing")}
                renderLoadingBtn={() => renderListenButtonDefault("loading")}
                increaseFunc={() => {
                  plusPlayCount((nftItem as any)?._id, currentUsr._id);
                }}
              />
            )}
          {(nftItem as any)?.fileType === FILE_TYPE.AUDIO && (
            <RemainingTimeNftCard
              src={`${config.ipfsGateway}${(nftItem as any)?.musicURL}`}
              nftId={(nftItem as any)?._id || DEMO_NFT_ID}
              itemLength={(nftItem as any)?.timeLength || 0}
            />
          )}
          {(nftItem as any)?.isSale === 2 && !props.isHome && (
            <div className="absolute bottom-[10px] right-[10px] flex items-center text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              <ClockIcon className="w-4 h-4" />
              {auctionEnded ? (
                <span className="ml-1 mt-0.5">Expired</span>
              ) : (
                <span className="ml-1 mt-0.5">
                  {(timeLeft as any)?.days || 0} :{" "}
                  {(timeLeft as any)?.hours || 0} :{" "}
                  {(timeLeft as any)?.minutes || 0} :{" "}
                  {(timeLeft as any)?.seconds || 0}
                </span>
              )}
            </div>
          )}
        </div>
        {(nftItem as any)?.fileType === FILE_TYPE.AUDIO && (
          <div
            className={`px-5 py-3 -mt-[80px] z-10 transform flex items-center space-x-4 relative `}
          >
            <div
              className={`flex-grow flex justify-center`}
              onClick={() => {
                updateViews();
                !props?.selectable &&
                  ((nftItem as any)?._id
                    ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                    : navigate("/nft-detail"));
              }}
            ></div>
            <img src={musicWave} alt="musicWave" loading="lazy" />
            <ButtonPlayMusicRunningContainer
              className="relative bottom-0 z-10"
              nftId={(nftItem as any)?._id || DEMO_NFT_ID}
              renderDefaultBtn={() => renderListenButtonDefault()}
              renderPlayingBtn={() => renderListenButtonDefault("playing")}
              renderLoadingBtn={() => renderListenButtonDefault("loading")}
              increaseFunc={() => {
                plusPlayCount((nftItem as any)?._id, currentUsr._id);
              }}
            />
          </div>
        )}

        <div className="p-4 py-5 space-y-3">
          <div className="flex items-center w-full gap-2">
            <Tooltip title={nftName} placement="top" arrow={true}>
              <div
                className={`flex w-full text-md  cursor-pointer whitespace-no-wrap `}
                onClick={() => {
                  updateViews();
                  !props?.selectable &&
                    ((nftItem as any)?._id
                      ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                      : navigate("/nft-detail"));
                }}
              >
                {nftName?.length > 10
                  ? nftName?.substring(0, 10) + "..."
                  : nftName}
              </div>
            </Tooltip>
            <div className="flex justify-between items-center gap-2">
              {!isEmpty((nftItem as any).owner) && (
                <div
                  className="flex justify-center"
                  onClick={() =>
                    !props?.selectable &&
                    navigate(
                      `/page-author/${(nftItem as any)?.owner?._id || "1"}`
                    )
                  }
                >
                  <Avatar
                    imgUrl={(nftItem as any)?.owner?.avatar}
                    sizeClass="w-8 h-8 sm:w-8 sm:h-8"
                  />
                </div>
              )}

              <NetworkLogo
                networkSymbol={
                  (nftItem as any)?.networkSymbol || PLATFORM_NETWORKS.COREUM
                }
                className={`cursor-pointer`}
              />
            </div>
          </div>
          {!props?.isHome && (
            <div
              className="w-2d4 w-full border-b border-neutral-100 dark:border-neutral-600 cursor-pointer"
              onClick={() => {
                updateViews();
                !props?.selectable &&
                  ((nftItem as any)?._id
                    ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                    : navigate("/nft-detail"));
              }}
            ></div>
          )}
          {!props?.isHome && (
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                updateViews();
                !props?.selectable &&
                  ((nftItem as any)?._id
                    ? navigate(`/nft-detail/${(nftItem as any)?._id}`)
                    : navigate("/nft-detail"));
              }}
            >
              <Prices
                labelTextClassName="bg-white dark:bg-[#191818] dark:group-hover:bg-[#202020] group-hover:bg-neutral-50"
                labelText={
                  (nftItem as any)?.isSale === 2
                    ? (nftItem as any)?.bids && (nftItem as any).bids.length > 0
                      ? "Current Bid"
                      : "Start price"
                    : (nftItem as any)?.isSale === 1
                      ? "Sale Price"
                      : "Price"
                }
                item={nftItem}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <SelectableCard
      selected={bulkMode ? bulkSelectedArray?.includes(nftItem) : false}
      onClick={() => {
        if (bulkMode) dispatch(changeBulkSelectedArray(nftItem));
      }}
    >
      {props?.effect?.code === NFT_EFFECT.WRAP_VIEW ? (
        <TileEffect>{renderView()}</TileEffect>
      ) : props?.effect?.code === NFT_EFFECT.CARD_FLIP ? (
        <GenericCard
          nftItem={nftItem}
          renderView={renderView}
          selectable={props?.selectable}
        />
      ) : (
        renderView()
      )}
    </SelectableCard>
  );
};

export default CardNFTComponent;
