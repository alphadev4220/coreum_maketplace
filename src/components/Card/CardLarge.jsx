import { useRef, useState, useEffect } from "react";
import NcImage from "components/NcComponent/NcImage";
import Avatar from "components/StyleComponent/Avatar";
import ButtonSecondary from "components/Button/ButtonSecondary";
import ItemTypeVideoIcon from "components/ItemIcon/ItemTypeVideoIcon";
import VerifyIcon from "components/StyleComponent/VerifyIcon";
import { useNavigate } from "react-router-dom";
import { PLATFORM_NETWORKS } from "app/config";
import { useAppSelector } from "app/hooks";
import { selectCOREPrice } from "app/reducers/nft.reducers";
import {
  selectCurrentUser,
} from "app/reducers/auth.reducers";
import { getSystemTime, isVideo } from "utils/utils";
import VideoForPreview from "components/Card/VideoForPreview";
import PricesUnit from "components/StyleComponent/PricesUnit";

const CardLarge = ({ className = "", item, price }) => {
  const curTime = useRef(0);
  const navigate = useNavigate();
  const [consideringItem, setConsideringItem] = useState({});
  const currentUsr = useAppSelector(selectCurrentUser);
  const globalCOREPrice = useAppSelector(selectCOREPrice);

  const [timeLeft, setTimeLeft] = useState({});
  const [sysTime, setSysTime] = useState(0);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [blurContent, setBlurContent] = useState(false);

  useEffect(() => {
    let need2blur = false;
    if (item?.explicitContent === true) need2blur = true;
    if (item?.explicit?.includes(currentUsr?._id) === true) need2blur = false;
    setBlurContent(need2blur);
  }, [item, currentUsr]);

  useEffect(() => {
    setConsideringItem(item || {});
    if (item?.isSale === 2) {
      const currentTime = new Date();
      const auctionEndTime = new Date(
        (item?.auctionStarted + item?.auctionPeriod) * 1000
      );
      if (item?.isSale === 2 && currentTime <= auctionEndTime) {
        (async () => {
          const res = await getSystemTime();
          setSysTime(res);
        })();
      } else {
        setAuctionEnded(true);
      }
    }
  }, [item]);

  const calculateTimeLeft = (created, period) => {
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
    return difference;
  };

  useEffect(() => {
    let intVal = 0;
    if (sysTime > 0) {
      curTime.current = sysTime;
      calculateTimeLeft(
        consideringItem?.auctionStarted,
        consideringItem?.auctionPeriod
      );
      intVal = setInterval(() => {
        const time_left = calculateTimeLeft(
          consideringItem?.auctionStarted,
          consideringItem?.auctionPeriod
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

  return (
    <div
      className={`relative flex flex-col-reverse lg:flex-row md:flex-row justify-center items-center gap-10 ${className} px-[30px]`}
    >
      <div className="lg:mt-0 sm:px-5 ">
        <div className="p-4 bg-white shadow-lg nc-CardLarge__left sm:p-8 bg-transparent rounded-3xl space-y-8 ">
          <div className="text-lg font-semibold lg:text-3xl">
            <div
              onClick={() => {
                navigate(`/nft-detail/${consideringItem?._id || ""}`);
              }}
            >
              {consideringItem?.name || ""}
            </div>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-12">
            <div
              className="flex items-center"
              onClick={() =>
                navigate(`/page-author/${consideringItem?.creator?._id || ""}`)
              }
            >
              <div className="flex-shrink-0 w-10 h-10">
                <Avatar
                  sizeClass="w-10 h-10"
                  imgUrl={consideringItem?.creator?.avatar}
                />
              </div>
              <div className="ml-3">
                <div className="text-xs dark:text-neutral-400">Creator</div>
                <div className="flex items-center text-sm font-semibold">
                  <span>{consideringItem?.creator?.username || ""}</span>
                  <VerifyIcon />
                </div>
              </div>
            </div>
            <div
              className="flex items-center"
              onClick={() =>
                navigate(
                  `/collectionItems/${
                    consideringItem?.collection_id?._id || ""
                  }`
                )
              }
            >
              <div className="flex-shrink-0 w-10 h-10">
                <Avatar
                  sizeClass="w-10 h-10"
                  imgUrl={consideringItem?.collection_id?.logoURL}
                />
              </div>
              <div className="ml-3">
                <div className="text-xs dark:text-neutral-400">Collection</div>
                <div className="text-sm font-semibold ">
                  {consideringItem?.collection_id?.name}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="relative flex flex-col items-baseline p-4 border-2 border-[#33ff00] sm:flex-row rounded-xl">
              <span className="block absolute bottom-full translate-y-1.5 py-1 px-1.5 bg-white dark:bg-[#191818] text-sm text-neutral-500 dark:text-neutral-400  border-none">
                {consideringItem?.isSale === 2
                  ? consideringItem?.bids && consideringItem.bids.length > 0
                    ? "Current Bid"
                    : "Start price"
                  : consideringItem?.isSale === 1
                  ? "Sale Price"
                  : "Price"}
              </span>
              <div className="flex items-center gap-2">
                <PricesUnit
                  className="text-lg font-semibold text-[#33ff00] lg:text-3xl whitespace-nowrap"
                  item={consideringItem}
                />
                {consideringItem.isSale > 0 && (
                  <span className="text-md lg:text-lg text-neutral-400 sm:ml-5 whitespace-nowrap">
                    {consideringItem?.isSale === 2
                      ? `( ≈ $${
                          consideringItem.bids &&
                          consideringItem.bids.length > 0
                            ? consideringItem.bids[
                                consideringItem.bids.length - 1
                              ].price
                              ? (consideringItem.networkSymbol ===
                                PLATFORM_NETWORKS.COREUM
                                  ? consideringItem.bids[
                                      consideringItem.bids.length - 1
                                    ].price * globalCOREPrice
                                  : consideringItem.bids[
                                      consideringItem.bids.length - 1
                                    ].price * price
                                )?.toFixed(2)
                              : 0
                            : (consideringItem?.price * price)?.toFixed(2) || 0
                        } )`
                      : `( ≈ $${
                          (consideringItem?.price * price)?.toFixed(2) || 0
                        })`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {consideringItem?.isSale === 2 && (
            <div className="space-y-5">
              {!auctionEnded && (
                <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 ">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.75 13.25C20.75 18.08 16.83 22 12 22C7.17 22 3.25 18.08 3.25 13.25C3.25 8.42 7.17 4.5 12 4.5C16.83 4.5 20.75 8.42 20.75 13.25Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 2H15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-1 leading-none">
                    {"Auction ending in:"}{" "}
                  </span>
                </div>
              )}
              {!auctionEnded && (
                <div className="flex space-x-5 sm:space-x-10">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold sm:text-3xl">
                      {timeLeft?.days || 0}
                    </span>
                    <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                      Days
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold sm:text-3xl">
                      {timeLeft?.hours || 0}
                    </span>
                    <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                      hours
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold sm:text-3xl">
                      {timeLeft?.minutes || 0}
                    </span>
                    <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
                      mins
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold sm:text-3xl">
                      {timeLeft?.seconds || 0}
                    </span>
                    <span className="sm:text-lg text-neutral-500">secs</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w h-[1px] bg-neutral-100 dark:bg-neutral-700"></div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <ButtonSecondary
              onClick={() => {
                navigate(`/nft-detail/${consideringItem?._id}`);
              }}
              className="flex-1"
            >
              View item
            </ButtonSecondary>
          </div>
        </div>
      </div>

      <div className="lg:md:w-[400px] w-[300px]">
        <div className="nc-CardLarge__right cursor-pointer">
          <div
            onClick={() => {
              navigate(`/nft-detail/${consideringItem?._id || ""}`);
            }}
          >
            {isVideo(consideringItem?.logoURL || "") === false ? (
              <NcImage
                containerClassName="aspect-w-1 aspect-h-1 relative"
                className={`absolute inset-0 object-cover rounded-3xl sm:rounded-[40px] border-4 border-white dark:border-neutral-800 ${
                  blurContent === true ? "blur-2xl" : ""
                }`}
                src={consideringItem.logoURL}
                isLocal={false}
                alt={"title"}
              />
            ) : (
              <VideoForPreview
                src={consideringItem.logoURL}
                isLocal={false}
                nftId={consideringItem?._id || ""}
                className="aspect-w-1 aspect-h-1 relative  inset-0 object-cover rounded-3xl sm:rounded-[40px] border-4 sm:border-[14px] border-white dark:border-neutral-800"
                containStrict={true}
              />
            )}
          </div>
          {isVideo(consideringItem?.musicURL?.toLowerCase()) === true && (
            <ItemTypeVideoIcon className="absolute w-8 h-8 md:w-10 md:h-10 left-3 bottom-3 sm:left-7 sm:bottom-[140px] " />
          )}
        </div>
      </div>
    </div>
  );
};

export default CardLarge;
