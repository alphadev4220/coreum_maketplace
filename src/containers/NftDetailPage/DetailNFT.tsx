import { FC, useCallback, useEffect, useState } from "react";
import Avatar from "components/StyleComponent/Avatar";
import NcImage from "components/NcComponent/NcImage";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  config,
  PLATFORM_NETWORKS,
} from "app/config";
import {
  changeItemDetail,
  selectDetailOfAnItem,
} from "app/reducers/nft.reducers";
import { useNavigate, useParams } from "react-router-dom";
import { isEmpty, } from "app/methods";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
} from "app/reducers/auth.reducers";
import Bid from "./Bid";
import Checkout from "./Checkout";
import Accept from "./Accept";
import PutSale from "./PutSale";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import AudioForNft from "components/Card/AudioForNft";
import VideoForNft from "components/Card/VideoForNft";
import ThreeDForNft from "components/Card/ThreeDForNft";
import { nanoid } from "@reduxjs/toolkit";
import ButtonPlayMusicRunningContainer from "containers/ButtonPlayMusicRunningContainer";
import { useSigningClient } from "app/cosmwasm";
import { socket } from "App";
import { getLinkPathToJSON, getSystemTime, isJsonObject, isVideo } from "utils/utils";
import NcModal from "components/NcComponent/NcModal";
import { FILE_TYPE } from "app/config";
import Clock from "./Clock/Clock";
import PricesUnit from "components/StyleComponent/PricesUnit";
import VideoForPreview from "components/Card/VideoForPreview";
import PaymentPayloadViewer from "components/Card/XRPLPayloadViewer";
import "./DetailNFTStyle.css";
import parse from "html-react-parser";
import { Checkbox, Switch } from "@mui/material";
import CancelSale from "./RemoveSale";
import { Tooltip } from "react-tooltip";
import DetailTab from "./DetailTab";
import DetailTopMenu from "./DetailTopMenu";
import { useCoreumOperations } from "hooks/useCoreumOperations";
import { useEVMOperations } from "hooks/useEVMOperations";
import { useXRPOperations } from "hooks/useXRPOperations";
import { useItemsApiServices } from "app/api/useItemsApiServices";
import { useWalletOperations } from "hooks/useWalletOperations";

export interface NftDetailPageProps {
}

const DetailNFT: FC<NftDetailPageProps> = () => {
  const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
  const currentUsr = useAppSelector(selectCurrentUser);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);
  const [visibleModalCancelSale, setVisibleModalCancelSale] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { tokenId } = useParams();
  const [DEMO_NFT_ID] = useState(nanoid());
  const [sysTime, setSysTime] = useState(0);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getNftDetail } = useItemsApiServices();
  const { fetchBalance }: any = useSigningClient();
  const [isMobile, setIsMobile] = useState(false);
  const [blurContent, setBlurContent] = useState(false);
  const [showNSFWModal, setShowNSFWModal] = useState(false);
  const [nftMetaData, setNftMetaData] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [nftName, setNftName] = useState("");
  const { removeSaleOnCoreum, bidOnCoreum, buyOnCoreum, listOnCoreum, acceptOnCoreum, getLeftDuration, plusPlayCount } = useCoreumOperations();
  const { removeSaleOnEVM, bidOnEVM, buyOnEVM, listOnEVM, acceptOnEVM } = useEVMOperations();
  const { removeSaleOnXRP, paymentPayload, bidOnXRP, buyOnXRP, listOnXRP, acceptOnXRP }: any = useXRPOperations();
  const { checkWalletAddrAndChainId }: any = useWalletOperations();


  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
    return () => {
      dispatch(changeItemDetail({}));
    };
  }, []);

  const validateBidStatus = useCallback(() => {
    if (globalDetailNFT?.bids.length > 0 && globalDetailNFT?.isSale === 2) {
      toast.warn("You cannot remove it from sale due to existing bids.");
      return false;
    }
    return true;
  }, [globalDetailNFT]);

  const removeSale = async () => {
    if (!validateBidStatus()) return;
    setVisibleModalCancelSale(false);
    setProcessing(true);
    if (!checkWalletAddrAndChainId) {
      setProcessing(false);
      return;
    }
    try {
      switch (currentNetworkSymbol) {
        case PLATFORM_NETWORKS.EVM:
          await removeSaleOnEVM();
          break;
        case PLATFORM_NETWORKS.COREUM:
          await removeSaleOnCoreum();
          break;
        case PLATFORM_NETWORKS.XRPL:
          await removeSaleOnXRP();
          break;
        default:
          toast.error("Unsupported network.");
      }
    } catch (error) {
      toast.error("Error processing request: " + error.message);
    } finally {
      await getNftDetail(tokenId || "");
      setProcessing(false);
    }
  }

  const confirmBuy = async () => {
    setVisibleModalPurchase(false);
    setProcessing(true);
    if (!checkWalletAddrAndChainId) {
      setProcessing(false);
      return;
    }
    try {
      switch (currentNetworkSymbol) {
        case PLATFORM_NETWORKS.EVM:
          await buyOnEVM(tokenId);
          break;
        case PLATFORM_NETWORKS.COREUM:
          await buyOnCoreum(tokenId);
          break;
        case PLATFORM_NETWORKS.XRPL:
          await buyOnXRP(tokenId);
          break;
        default:
          toast.error("Unsupported network.");
      }
    } catch (error) {
      toast.error("Error processing request: " + error.message);
    } finally {
      await getNftDetail(tokenId || "");
      setProcessing(false);
    }
  }
  const onPutSale = async (price: number, instant: boolean, period: number) => {
    setVisibleModalSale(false);
    if (price <= 0 || isNaN(price)) {
      toast.error("Invalid price.");
      return;
    }
    setProcessing(true);
    if (!checkWalletAddrAndChainId) {
      setProcessing(false);
      return;
    }
    var aucperiod = instant === true ? 0 : period * 24 * 3600;
    try {
      switch (currentNetworkSymbol) {
        case PLATFORM_NETWORKS.EVM:
          await listOnEVM(tokenId, aucperiod, price);
          break;
        case PLATFORM_NETWORKS.COREUM:
          await listOnCoreum(instant, aucperiod, price);
          break;
        case PLATFORM_NETWORKS.XRPL:
          await listOnXRP(price, aucperiod);
          break;
        default:
          toast.error("Unsupported network.");
      }
    } catch (error) {
      toast.error("Error processing request: " + error.message);
    } finally {
      getSystemTime().then((resp) => setSysTime(resp));
      await getNftDetail(tokenId || "");
      setProcessing(false);
    }
  }

  const onBid = async (bidPrice: number) => {
    setVisibleModalBid(false);

    if (getLeftDuration <= 12) {
      toast.info("You can place a bid due to auction end time.");
      return;
    }
    setProcessing(true);
    if (!checkWalletAddrAndChainId) {
      setProcessing(false);
      return;
    }
    try {
      switch (currentNetworkSymbol) {
        case PLATFORM_NETWORKS.EVM:
          await bidOnEVM(bidPrice, tokenId);
          break;
        case PLATFORM_NETWORKS.COREUM:
          await bidOnCoreum(bidPrice, tokenId);
          break;
        case PLATFORM_NETWORKS.XRPL:
          await bidOnXRP(bidPrice, tokenId);
          break;
        default:
          toast.error("Unsupported network.");
      }
    } catch (error) {
      toast.error("Error occurred: " + error.message);
    } finally {
      await getNftDetail(tokenId || "");
      setProcessing(false);
    }
  };

  const onAccept = async () => {
    setVisibleModalAccept(false);

    setProcessing(true);
    if (!checkWalletAddrAndChainId) {
      setProcessing(false);
      return;
    }
    try {
      switch (currentNetworkSymbol) {
        case PLATFORM_NETWORKS.EVM:
          await acceptOnEVM(tokenId);
          break;
        case PLATFORM_NETWORKS.COREUM:
          await acceptOnCoreum(tokenId);
          break;
        case PLATFORM_NETWORKS.XRPL:
          await acceptOnXRP(tokenId);
          break;
        default:
          toast.error("Unsupported network.");
      }
    } catch (error) {
      toast.error("Error occurred: " + error.message);
    } finally {
      await getNftDetail(tokenId || "");
      setProcessing(false);
    }
  };

  useEffect(() => {
    socket.on("UpdateStatus", (data) => {
      if (tokenId) {
        if (data?.type === "BURN_NFT" && data?.data?.itemId === tokenId) {
          navigate(`/collectionItems/${data?.data?.colId}`);
          return;
        }
        if (data.data.itemId === tokenId) {
          getNftDetail(tokenId || "");
        }
      }
    });
  }, []);

  const fetchJson = useCallback(async () => {
    setProcessing(true);
    if (globalDetailNFT?.metadataURI === undefined || globalDetailNFT?.metadataURI === "" || globalDetailNFT?.name !== "") {
      setNftName(globalDetailNFT?.name)
      setImageUrl(globalDetailNFT?.logoURL)
      setProcessing(false);
      return;
    }
    const response = await axios.get(getLinkPathToJSON(globalDetailNFT?.metadataURI, globalDetailNFT?.name));

    if (response.data) {
      if (isJsonObject(response.data)) {
        setNftMetaData(JSON.parse(response.data));
        setNftName(JSON.parse(response.data).name);
        setImageUrl(JSON.parse(response.data).image.replace("ipfs://", ""))
      }
      else {
        setNftName(response.data.name)
        setNftMetaData(response.data);
        setImageUrl(response.data.image.replace("ipfs://", ""))
      }
    }
    setProcessing(false);
  }, [globalDetailNFT]);

  useEffect(() => {
    if (globalDetailNFT?.isSale === 2) {
      (async () => {
        const res = await getSystemTime();
        setSysTime(res);
      })();
    }
    fetchJson();
  }, [globalDetailNFT]);

  useEffect(() => {
    let need2blur = false;
    if (globalDetailNFT?.explicit?.includes(currentUsr?._id) === true)
      need2blur = true;
    setBlurContent(need2blur);
  }, [globalDetailNFT, currentUsr]);

  useEffect(() => {
    getNftDetail(tokenId || "");
    fetchBalance();
  }, [tokenId, currentUsr]);


  useEffect(() => {
    if (processing) {
      document.documentElement.classList.add("no-scroll"); // Add no-scroll class to html element
    } else {
      document.documentElement.classList.remove("no-scroll"); // Remove no-scroll class from html element
    }

    return () => {
      document.documentElement.classList.remove("no-scroll"); // Clean up on component unmount
    };
  }, [processing]);


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
      <svg className=" w-9 h-9 first-letter:" fill="none" viewBox="0 0 24 24">
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

  const renderPurchaseModalContent = () => {
    return (
      <Checkout
        onOk={confirmBuy}
        nft={globalDetailNFT}
        onCancel={() => setVisibleModalPurchase(false)}
      />
    );
  };

  const renderBidModalContent = () => {
    return (
      <Bid
        nft={globalDetailNFT}
        onOk={onBid}
        onCancel={() => setVisibleModalBid(false)}
      />
    );
  };

  const renderAcceptModalContent = () => {
    return (
      <Accept
        onOk={onAccept}
        onCancel={() => {
          setVisibleModalAccept(false);
        }}
        nft={globalDetailNFT}
      />
    );
  };

  const renderSaleModalContent = () => {
    return (
      <PutSale
        onOk={onPutSale}
        nft={globalDetailNFT}
        onCancel={() => setVisibleModalSale(false)}
      />
    );
  };

  const renderCancelSaleModal = () => {
    return (
      <CancelSale
        onOk={removeSale}
        onCancel={() => setVisibleModalCancelSale(false)}
      />
    );
  };

  const renderTrigger = () => {
    return null;
  };
  const renderListenButtonDefault = (state?: "playing" | "loading") => {
    return (
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-full bg-[rgb(0,237,180)] text-black cursor-pointer`}
      >
        {renderIcon(state)}
      </div>
    );
  };


  const applyChangeExplicitContents = async () => {
    setShowNSFWModal(false);
    if (isEmpty(currentUsr?._id)) {
      toast.warn("Please connect your wallet and try again.");
      return;
    }
    try {
      //update explicit
      const updateResponse = await axios.post(
        `${config.API_URL}api/item/updateExplicit`,
        {
          userId: currentUsr?._id,
          itemId: globalDetailNFT?._id,
        }
      );
      if (updateResponse.data.code === 0) {
        getNftDetail(globalDetailNFT?._id);
      }
    } catch (error) { }
  };

  const handleCheckFieldChange = (event) => {
    if (event.target.checked === false) {
      applyChangeExplicitContents();
    } else {
      setShowNSFWModal(true);
    }
  }

  return (
    <div
      className="relative bg-white w-full h-[auto] overflow-hidden text-left text-base text-white"
      style={{ fontFamily: "MyCustomFont" }}
    >
      <div className="flex flex-col">
        <div className="flex-grow">
          <img
            className="absolute top-[0px] left-[0px] object-cover w-full h-full"
            alt=""
            src="/assets/bg@2x.png"
          />
          <div className="absolute top-[0px] left-[0px] bg-lime-100 w-full h-full mix-blend-darken" />
          <div className="absolute top-[0px] left-[0px] bg-gray-100 [backdrop-filter:blur(82px)] w-full h-full mix-blend-normal" />
        </div>
      </div>

      <div className="relative m-auto w-[90%] h-[auto] mt-[55px] rounded-3xl">
        <div
          className="absolute top-0 left-0 w-full h-full bg-black opacity-50 rounded-3xl"
          style={{ boxShadow: " 0px 2px 21px 19px rgba(51,255,0,0.32)" }}
        />
        <div className=" flex flex-col w-[full]">
          <DetailTopMenu />
          <div className=" relative m-auto w-[100%] h-[auto] text-19xl back flex flex-col justify-center items-center shadow-2xl ">
            <div className="flex w-[90%] m-auto pb-[30px] px-[10px] flex-col items-center md:flex-row">

              <div className="w-[90%] md:w-4/12 flex flex-col justify-center items-center mt-[50px]">
                <div className="">
                  <Switch
                    checked={!blurContent}
                    onChange={(e, checked) => {
                      handleCheckFieldChange(e);
                    }}
                  />
                  <label>Explicit content</label>
                </div>

                <div className="relative w-full h-full">
                  {globalDetailNFT?.fileType > FILE_TYPE.IMAGE ?
                    <>
                      {isVideo(globalDetailNFT?.logoURL) === false ? (
                        <NcImage
                          src={
                            globalDetailNFT?.logoURL !== "" ?
                              globalDetailNFT?.logoURL :
                              nftMetaData?.previewImage
                          }
                          containerClassName="aspect-w-11 aspect-h-12 rounded-3xl overflow-hidden"
                          className={`${blurContent === true ? "blur-2xl" : ""}`}
                        />
                      ) : (
                        <VideoForPreview
                          src={globalDetailNFT?.logoURL !== "" ? globalDetailNFT?.logoURL : nftMetaData?.previewImage}
                          isLocal={false}
                          nftId={globalDetailNFT?._id || DEMO_NFT_ID}
                          className="aspect-w-11 aspect-h-12 rounded-3xl overflow-hidden"
                          containStrict={true}
                        />
                      )}
                      {globalDetailNFT.fileType === FILE_TYPE.THREED && (
                        <>
                          {/* <ItemType3DIcon className="absolute w-8 h-8 left-3 top-3 md:w-10 md:h-10" /> */}
                          <ThreeDForNft
                            src={
                              globalDetailNFT?.musicURL !== undefined || globalDetailNFT?.musicURL !== ""
                                ? `${config.ipfsGateway}${globalDetailNFT.musicURL}` :
                                `${config.ipfsGateway}${nftMetaData.image}`
                            }
                            nftId={globalDetailNFT?._id || DEMO_NFT_ID}
                          />
                        </>
                      )}
                      {globalDetailNFT.fileType === FILE_TYPE.VIDEO && (
                        <>
                          {/* <ItemTypeVideoIcon className="absolute w-8 h-8 left-3 top-3 md:w-10 md:h-10" /> */}
                          <VideoForNft
                            src={
                              globalDetailNFT?.musicURL !== undefined || globalDetailNFT?.musicURL !== ""
                                ? `${config.ipfsGateway}${globalDetailNFT.musicURL}?stream=true` :
                                `${config.ipfsGateway}${nftMetaData.image}?stream=true`
                            }
                            nftId={globalDetailNFT?._id || DEMO_NFT_ID}
                          />
                        </>
                      )}
                      {globalDetailNFT.fileType === FILE_TYPE.AUDIO && (
                        <AudioForNft
                          src={
                            globalDetailNFT?.musicURL !== undefined || globalDetailNFT?.musicURL !== ""
                              ? `${config.ipfsGateway}${globalDetailNFT.musicURL}` :
                              `${config.ipfsGateway}${nftMetaData.image}`
                          }
                          nftId={globalDetailNFT?._id || DEMO_NFT_ID}
                        />
                      )}
                    </> :
                    <div>
                      <NcImage
                        src={imageUrl}
                        containerClassName="aspect-w-11 aspect-h-12 rounded-3xl overflow-hidden"
                        className={`${blurContent === true ? "blur-2xl" : ""}`}
                      />
                    </div>
                  }
                  <div className="z-20 absolute aspect-w-11 aspect-h-12 rounded-3xl ">
                    <div className="relative w-full h-full">
                      {globalDetailNFT.fileType >= 2 && (
                        <ButtonPlayMusicRunningContainer
                          className="absolute bottom-3 left-3"
                          nftId={globalDetailNFT?._id || DEMO_NFT_ID}
                          renderDefaultBtn={() => renderListenButtonDefault()}
                          renderPlayingBtn={() =>
                            renderListenButtonDefault("playing")
                          }
                          renderLoadingBtn={() =>
                            renderListenButtonDefault("loading")
                          }
                          increaseFunc={plusPlayCount}
                        />
                      )}
                    </div>
                  </div>

                </div>

              </div>

              <div className={`flex flex-col ${isMobile ? "w-[90%]" : "w-[70%]"} sm: mt-5 md:mt-01`}>
                {/* ---------------nft right div - A ---------------- */}
                <div className="classificationDetail">
                  <div className="w-full mb-3  md:mt-3 md:mb-1 relative flex justify-between items-center">
                    <span className="classificationDetailText w-[100%] truncate py-2 " data-tooltip-id="nft-detail-tooltip"
                      data-tooltip-content={nftName}>
                      {nftName}
                    </span>
                  </div>
                </div>
                <div className="classificationDetail">
                  <div className="classificationDetailCardParent">
                    <div
                      className="classificationDetailCard cursor-pointer"
                      data-tooltip-id="nft-detail-tooltip"
                      data-tooltip-content={
                        globalDetailNFT?.owner?.username || ""
                      }
                      onClick={() =>
                        navigate(
                          `/page-author/${globalDetailNFT?.owner?._id || ""}`
                        )
                      }
                    >
                      <Avatar
                        imgUrl={globalDetailNFT?.owner?.avatar}
                        sizeClass="h-9 w-9"
                        radius="rounded-full"
                      />
                      <div className="flex-col flex-1 truncate text-ellipsis overflow-hidden">
                        <div className="text-[10px] lg:text-[13px] ">Owner</div>
                        <div className="text-base sm:text-[14px] lg:text-[18px]  font-bold text-ellipsis overflow-hidden">
                          {globalDetailNFT?.owner?.username || ""}
                        </div>
                      </div>
                    </div>

                    <div
                      className="classificationDetailCard cursor-pointer"
                      data-tooltip-id="nft-detail-tooltip"
                      data-tooltip-content={
                        globalDetailNFT?.creator?.username || ""
                      }
                      onClick={() =>
                        navigate(
                          `/page-author/${globalDetailNFT?.creator?._id || ""}`
                        )
                      }
                    >
                      <Avatar
                        imgUrl={globalDetailNFT?.creator?.avatar}
                        sizeClass="h-9 w-9"
                        radius="rounded-full"
                      />
                      <div className="flex flex-col truncate text-ellipsis overflow-hidden">
                        <div className="text-[10px] lg:text-[13px]">Creater</div>
                        <div className="text-base sm:text-[14px] lg:text-[18px]  font-bold text-ellipsis overflow-hidden">
                          {globalDetailNFT?.creator?.username || ""}
                        </div>
                      </div>
                    </div>

                    {globalDetailNFT?.collection_id !== null && (
                      <div
                        className={`classificationDetailCard cursor-pointer`}
                        data-tooltip-id="nft-detail-tooltip"
                        data-tooltip-content={
                          globalDetailNFT?.collection_id?.name || ""
                        }
                        onClick={() =>
                          navigate(
                            `/collectionItems/${globalDetailNFT?.collection_id?._id || ""
                            }`
                          )
                        }
                      >
                        <Avatar
                          imgUrl={globalDetailNFT?.collection_id?.logoURL}
                          sizeClass="h-9 w-9"
                          radius="rounded-full"
                        />
                        <div className="flex-1 flex-col min-h-0 truncate text-ellipsis overflow-hidden">
                          <div className="text-[10px] lg:text-[13px]">
                            Collection
                          </div>
                          <p className="text-base sm:text-[14px] lg:text-[18px] font-bold text-ellipsis overflow-hidden">
                            {globalDetailNFT?.collection_id?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="nftDetailDivider" />
                <div className="w-[full] pt-[22px] md:ml-[56px] flex  justify-center md:justify-start ">
                  <div className="flex flex-col w-[90%]">
                    <div className="text-[#33ff00] text-[28px] pb-2 md:b-5 flex justify-start text-left ">
                      {globalDetailNFT?.isSale === 2
                        ? globalDetailNFT?.bids &&
                          globalDetailNFT?.bids?.length > 0
                          ? "Current Bid"
                          : "Start price"
                        : globalDetailNFT?.isSale === 1
                          ? "Sale Price"
                          : "Price"}
                    </div>
                    <div className={`w-full priceBox flex flex-row rounded-3xl ${isMobile && "h-[60px]"}`}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width:
                            globalDetailNFT?.isSale > 0
                              ? "50%"
                              : globalDetailNFT?.owner?._id === currentUsr?._id
                                ? "50%"
                                : "100%",
                        }}
                      >
                        <PricesUnit
                          className="priceTag py-[10px]"
                          item={globalDetailNFT}
                        />
                      </div>
                      <div>
                        {globalDetailNFT &&
                          currentUsr &&
                          globalDetailNFT.isSale === 1 &&
                          globalDetailNFT.owner &&
                          globalDetailNFT.owner._id !== currentUsr._id && (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalPurchase(true)}
                            >
                              Buy now
                            </div>
                          )}
                        {globalDetailNFT &&
                          currentUsr &&
                          globalDetailNFT.isSale === 2 &&
                          globalDetailNFT.owner &&
                          globalDetailNFT.owner._id !== currentUsr._id &&
                          !auctionEnded && (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalBid(true)}
                            >
                              Place a bid
                            </div>
                          )}
                        {globalDetailNFT &&
                          currentUsr &&
                          globalDetailNFT.isSale === 2 &&
                          globalDetailNFT.owner &&
                          globalDetailNFT.owner._id === currentUsr._id &&
                          (globalDetailNFT.bids.length > 0 ? (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalAccept(true)}
                            >
                              Accept
                            </div>
                          ) : (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalCancelSale(true)}
                            >
                              Delist NFT
                            </div>
                          ))}
                        {globalDetailNFT &&
                          currentUsr &&
                          globalDetailNFT.owner &&
                          globalDetailNFT.owner._id === currentUsr._id &&
                          globalDetailNFT.isSale === 0 && (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalSale(true)}
                            >
                              List NFT
                            </div>
                          )}
                        {globalDetailNFT &&
                          currentUsr &&
                          globalDetailNFT.owner &&
                          globalDetailNFT.owner._id === currentUsr._id &&
                          globalDetailNFT.isSale === 1 && (
                            <div
                              className="buyBox rounded-xl whitespace-nowrap"
                              onClick={() => setVisibleModalCancelSale(true)}
                            >
                              Delist NFT
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {globalDetailNFT?.isSale === 2 && (
              <div className="flex  items-center flex-col lg:flex-row justify-center py-4 w-full gap-5 ">
                <div className="flex items-center text-neutral-500 dark:text-neutral-400 gap-2">
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
                    {auctionEnded
                      ? "Auction period has expired"
                      : "Auction ending in:"}{" "}
                  </span>
                </div>
                {!auctionEnded && (
                  <Clock
                    nftItem={globalDetailNFT}
                    sysTime={sysTime}
                    setAuctionEnded={() => setAuctionEnded(true)}
                  />
                )}
              </div>
            )}
            <div className="pageDivider" />
            <div className="w-11/12 pdx-2 sm:px-0 flex flex-col justify-between">
              <DetailTab
                isMobile={isMobile}
                attributes={nftMetaData?.attributes || []}
              />
            </div>
            {/* ------------forth div------------------ */}
            <div className="description">
              {/* -------description Heading-------------- */}
              <div className="propertiesHeading">Description</div>

              <div className="whitespace-pre-wrap text-center mt-[35px] px-[20px]">
                {nftMetaData && nftMetaData?.description !== "" ?
                  parse(nftMetaData?.description?.replace(/background-color: rgb\(25,24,24\);/g, "") || "") :
                  parse(globalDetailNFT?.description?.replace(/background-color: rgb\(25,24,24\);/g, "") || "")
                }
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20"></div>

        {
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={processing}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      </div>

      <NcModal
        isOpenProp={visibleModalPurchase}
        onCloseModal={() => setVisibleModalPurchase(false)}
        contentExtraClass="max-w-lg"
        renderContent={renderPurchaseModalContent}
        renderTrigger={renderTrigger}
        modalTitle="Buy Now"
      />

      <NcModal
        isOpenProp={visibleModalBid}
        onCloseModal={() => setVisibleModalBid(false)}
        contentExtraClass="max-w-lg"
        renderContent={renderBidModalContent}
        renderTrigger={renderTrigger}
        modalTitle="Place a Bid"
      />

      <NcModal
        isOpenProp={visibleModalAccept}
        onCloseModal={() => setVisibleModalAccept(false)}
        contentExtraClass="max-w-lg"
        renderContent={renderAcceptModalContent}
        renderTrigger={renderTrigger}
        modalTitle="Accept Sale"
      />

      <NcModal
        isOpenProp={visibleModalSale}
        onCloseModal={() => setVisibleModalSale(false)}
        contentExtraClass="max-w-lg"
        renderContent={renderSaleModalContent}
        renderTrigger={renderTrigger}
        modalTitle="List NFT"
      />

      <NcModal
        isOpenProp={visibleModalCancelSale}
        onCloseModal={() => setVisibleModalCancelSale(false)}
        contentExtraClass="max-w-lg"
        renderContent={renderCancelSaleModal}
        renderTrigger={renderTrigger}
        modalTitle="Cancel Sale"
      />


      {
        showNSFWModal && (
          <div className="inset-0 fixed top-0 left-0 walletPopUpBack z-20">
            <div className="relative rounded-xl  bg-black  shadow-[0px_0px_10px_#33ff00_inset] text-white w-full md:w-[40%] pt-[13px] px-[5px] pb-[36px] flex flex-col justify-center items-center align-center">
              <div
                className="closeButton"
                onClick={() => setShowNSFWModal(false)}
              >
                <img className="" alt="" src="/assets/close.png" />
              </div>
              <div className="w-[90%] flex flex-col items-center justify-center">
                <p className="text-gray-400 text-3xl md:text-[15px]  balance">
                  You’re about to enable explicit content
                </p>
                <div className="divider md:mb-[1rem] w-[90%]" />

                <div className="w-[100%] mt-[5px] mb-[15px] flex justify-around ">
                  Please keep in mind that this will enable explicit and sensitive
                  content to the result page. You must be of the legal age to view
                  this.
                </div>

                <div
                  className=" rounded-3xl mb-0 lg:mb-2 text-center text-black bg-[#33ff00] w-full h-[40px] flex flex-col items-center justify-center text-2xl cursor-pointer"
                  onClick={() => applyChangeExplicitContents()}
                >
                  Yes
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        paymentPayload ? (
          <>
            <section
              className="fixed top-0 left-0 flex items-center justify-center w-full min-h-screen popup"
              style={{
                color: "#fff",
                zIndex: 1202,
              }}
            >
              <div className="popup-other">
                <div className="container">
                  <div className="p-10 bg-black rounded-3xl">
                    <PaymentPayloadViewer payload={paymentPayload} />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          ""
        )
      }

      <Tooltip id="nft-detail-tooltip" place="top" />
    </div >
  );
};

export default DetailNFT;