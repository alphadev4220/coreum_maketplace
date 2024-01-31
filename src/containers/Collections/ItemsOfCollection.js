import React, {useEffect, useRef, useState} from "react";
import cn from "classnames";
import styles from "./Profile.module.sass";
import defaultLogo from "images/default_logo.png";
import {config, ITEM_ACTION_TYPES, PLATFORM_NETWORKS,} from "app/config.js";
import {useNavigate, useParams} from "react-router-dom";
import {isEmpty, saveMultipleItemActivity} from "app/methods";
import {useAppDispatch, useAppSelector} from "app/hooks";
import ButtonPrimary from "components/Button/ButtonPrimary";
import {
    changeBulkOpsMode,
    changeDetailedCollection,
    emptyBulkSelectedArray,
    selectBulkOpsMode,
    selectBulkSelectedArray,
    selectDetailedCollection,
    setBulkSelectArray,
} from "app/reducers/collection.reducers";
import {selectCurrentNetworkSymbol, selectCurrentUser, selectWalletStatus,} from "app/reducers/auth.reducers";
import {getItemPriceUnitText} from "containers/NftDetailPage/ItemPriceUnitText";
import VideoForBannerPreview from "components/Card/VideoForBannerPreview";
import {nanoid} from "@reduxjs/toolkit";
import parse from "html-react-parser";
import {toast} from "react-toastify";
import {useSigningClient} from "app/cosmwasm";
import NcModal from "components/NcComponent/NcModal";
import CopyButton from "components/Button/CopyButton";
import {BsLink} from "react-icons/bs";
import NcImage from "components/NcComponent/NcImage";
import {Backdrop, CircularProgress, Switch, Tooltip} from "@mui/material";
import Checkbox from "components/Button/Checkbox";
import Label from "components/StyleComponent/Label";
import {IoIosCloseCircle} from "react-icons/io";
import ModalDelete from "components/Modal/ModalDelete";
import ModalTransferToken from "components/Modal/ModalTransferToken";
import PutSale from "containers/NftDetailPage/PutSale";
import CancelSale from "containers/NftDetailPage/RemoveSale";
import Input from "components/StyleComponent/Input";
import CardNFTComponent from "components/Card/CardNFTComponent";
import {calcFloorPrice, isVideo} from "utils/utils";
import {getCollectionDetails, getSearchInaCollection, updateExplicitApi,} from "app/api/collections";
import MainSection from "components/Section/MainSection";
import CollectionInfo from "./collectionInfo";
import { useItemsApiServices } from "app/api/useItemsApiServices";
import { useWalletOperations } from "hooks/useWalletOperations";

const ItemsOfCollection = () => {
  const { bulkListNFT, bulkCancelSaleNFT, bulkBurnNFT, bulkTransferNFT } =
    useSigningClient();
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const collection = useAppSelector(selectDetailedCollection);
  const bulkSelectedArray = useAppSelector(selectBulkSelectedArray);
  const showBulkFeatures = useAppSelector(selectBulkOpsMode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUsr = useAppSelector(selectCurrentUser);
  const [DEMO_NFT_ID] = React.useState(nanoid());
  const { collectionId } = useParams();
  const [collectionMinPrice, setCollectionMinPrice] = useState(0);
  const { bulkBurnApi, bulkPutOnSaleApi, bulkRemoveFromSaleApi, bulkTransferApi } = useItemsApiServices();
  const [items, setItems] = useState([]);
  const [viewNoMore, setViewNoMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mintModal, setMintModal] = useState(false);
  const [showExplicit, setShowExplicit] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);
  const [visibleModalDelist, setVisibleModalDelist] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const {checkWalletAddrAndChainId} = useWalletOperations();
  const more = useRef();
  

  const onBulkTransfer = async (toAddr) => {
    let checkResult = await checkWalletAddrAndChainId();
    if (!checkResult) {
      return;
    }
    const isNotOwner = bulkSelectedArray.some(
      (item) => item.owner?.address !== currentUsr.address
    );
    if (isNotOwner) {
      toast.error("You are not the owner of these NFTs.");
      return;
    }

    const hasBidsAndOnSale = bulkSelectedArray.some(
      (item) => item?.bids.length > 0 && item?.isSale === 2
    );
    if (hasBidsAndOnSale) {
      toast.warn(
        "You cannot transfer from sale because you had one or more bid(s) already."
      );
      return;
    }

    setVisibleModalTransfer(false);
    if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
      setProcessing(true);
      try {
        const txHash = await bulkTransferNFT(
          currentUsr.address,
          collection?.cw721address,
          toAddr,
          bulkSelectedArray?.map((item) => item.tokenId)
        );

        if (txHash === -1) {
          throw new Error("Network error.");
        }

        const ids = bulkSelectedArray?.map((item) => item._id);
        const response = await bulkTransferApi(ids, currentUsr.address, toAddr);

        if (response.code !== 0) {
          throw new Error(response.message);
        }

        toast.success("You've sent items.");

        const params = {
          items: ids,
          origin: currentUsr?._id,
          destination: toAddr,
          transactionHash: txHash,
          actionType: ITEM_ACTION_TYPES.TRANSFERED,
        };

        saveMultipleItemActivity(params);
        getCollectionList(true, 0);
      } catch (error) {
        toast.error(error.message || "Failed to bulk transfer.");
      } finally {
        setProcessing(false);
        dispatch(emptyBulkSelectedArray());
        setSelectAll(false);
      }
    }
  };

  const onBulkBurn = async () => {
    let checkResult = await checkWalletAddrAndChainId();
    if (!checkResult) {
      return;
    }
    const isNotOwner = bulkSelectedArray.some(
      (item) => item.owner?.address !== currentUsr.address
    );
    if (isNotOwner) {
      toast.error("You are not the owner of these NFTs.");
      return;
    }

    const hasBidsOnSale = bulkSelectedArray.some(
      (item) => item?.bids.length > 0 && item?.isSale === 2
    );
    if (hasBidsOnSale) {
      toast.warn("You cannot burn because you had one or more bid(s) already.");
      return;
    }

    setVisibleModalBurn(false);

    if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
      setProcessing(true);

      try {
        const txHash = await bulkBurnNFT(
          currentUsr.address,
          collection?.cw721address,
          bulkSelectedArray?.map((item) => item.tokenId)
        );

        if (txHash === -1) {
          throw new Error("Tx error.");
        }

        const ids = bulkSelectedArray?.map((item) => item._id);
        const response = await bulkBurnApi(ids, collection?._id);

        if (response.code !== 0) {
          throw new Error(response.message || "Error in burning items.");
        }

        toast.success("You've burnt items.");

        const params = {
          items: ids,
          origin: currentUsr?._id,
          transactionHash: txHash,
          actionType: ITEM_ACTION_TYPES.DESTROYED,
        };

        await saveMultipleItemActivity(params);
        await getCollectionList(true, 0);

      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to Bulk Burn.");
      } finally {
        setProcessing(false);
        dispatch(emptyBulkSelectedArray());
        setSelectAll(false);
      }
    }
  };

  const onBulkDelist = async () => {
    const hasBidsOnSale = bulkSelectedArray.some(
      (item) => item?.bids.length > 0 && item?.isSale === 2
    );
    if (hasBidsOnSale) {
      toast.warn("You cannot burn because you had one or more bid(s) already.");
      return;
    }
    const isBidsOnSale = bulkSelectedArray.some((item) => item?.isSale <= 0);
    if (isBidsOnSale) {
      toast.error("Please correctly selected items on sale and try again.");
      return;
    }

    let checkResult = await checkWalletAddrAndChainId();
    if (!checkResult) {
      return;
    }
    setVisibleModalDelist(false);
    if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
      setProcessing(true);
      try {
        let txHash = await bulkCancelSaleNFT(
          currentUsr.address,
          collection?.address,
          bulkSelectedArray.map((item) => item.tokenId)
        );
        if (txHash === -1) {
          throw new Error("Tx error.");
        }
        const token_ids = bulkSelectedArray.map((item) => item._id);
        const response = await bulkRemoveFromSaleApi(token_ids);
        if (response.code !== 0) {
          throw new Error(response.message || "Error in delisting items.");
        }
        toast.success("Succeed in delisting items.");

        let params = {
          items: token_ids,
          origin: currentUsr?._id,
          transactionHash: txHash,
          actionType: ITEM_ACTION_TYPES.DELISTED,
        };
        await saveMultipleItemActivity(params);
        await getCollectionList(true, 0);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to Delist.");
      } finally {
        setProcessing(false);
        dispatch(emptyBulkSelectedArray());
        setSelectAll(false);
      }
    }
  };

  const onPutSale = async (price, instant, period) => {
    let checkResult = await checkWalletAddrAndChainId();
    if (!checkResult) {
      return;
    }
    const isNotOwner = bulkSelectedArray.some(
      (item) => item.owner?.address !== currentUsr.address
    );
    if (isNotOwner) {
      toast.error("You are not the owner of these NFTs.");
      return;
    }
    const isOnSale = bulkSelectedArray.some((item) => item?.isSale > 0);
    if (isOnSale) {
      toast.error(
        "Please correctly selected item(s) that is no on sale and try again."
      );
      return;
    }
    setVisibleModalSale(false);
    if (Number(price) <= 0 || isNaN(price)) {
      toast.error("Invalid price.");
      return;
    }
    var aucperiod = instant === true ? 0 : period * 24 * 3600;
    var tokenIds = bulkSelectedArray.map((item) => item.tokenId);
    if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
      setProcessing(true);
      try {
        const denormArg = { native: config.COIN_MINIMAL_DENOM };
        let txhash = await bulkListNFT(
          currentUsr.address,
          collection?.cw721address,
          !instant ? "Auction" : "Fixed",
          !instant
            ? {
                Time: [
                  Math.floor(Date.now() / 1000),
                  Math.floor(Date.now() / 1000) + Math.floor(aucperiod),
                ],
              }
            : "Fixed",
          price,
          price,
          denormArg,
          tokenIds,
          collection?.address
        );
        if (txhash === -1) {
          throw new Error("Tx error.");
        }
        const response = await bulkPutOnSaleApi(
          tokenIds,
          aucperiod,
          price,
          txhash,
          collection?._id
        );
        if (response.code !== 0) {
          throw new Error(response.message || "Error in listing items.");
        }
        toast.success("Succeed put on sale.");
        const params = {
          items: bulkSelectedArray?.map((item) => item._id),
          price: price,
          origin: currentUsr._id,
          actionType: ITEM_ACTION_TYPES.LISTED,
          transactionHash: txhash,
        };
        saveMultipleItemActivity(params);
        getCollectionList(true, 0);
      } catch (error) {
        console.log(error);
        toast.error(error.message || "Failed to Bulk List.");
      } finally {
        setProcessing(false);
        dispatch(emptyBulkSelectedArray());
        setSelectAll(false);
      }
    }
  };

  const renderSaleModalContent = () => {
    return (
      <PutSale
        onOk={onPutSale}
        onCancel={() => setVisibleModalSale(false)}
        multiple={bulkSelectedArray?.length}
      />
    );
  };

  const renderDelistModalContent = () => {
    return (
      <CancelSale
        multiple={bulkSelectedArray?.length}
        onOk={onBulkDelist}
        onCancel={() => setVisibleModalDelist(false)}
      />
    );
  };

  useEffect(() => {
    dispatch(changeBulkOpsMode(false));
    dispatch(setBulkSelectArray([]));
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
    localStorage.setItem("currentItemIndex", "0");
    getCollectionList(true, 0);
    more.current = false;
    return () => {
      dispatch(changeDetailedCollection({}));
      setItems([]);
    };
  }, []);

  const getCollectionList = async (reStart, useStart) => {
    let currentItemCount = localStorage.getItem("currentItemIndex");
    if (currentItemCount === null || currentItemCount === undefined) {
      localStorage.setItem("currentItemIndex", "0");
    }
    var param = {
      start: reStart === true ? useStart : Number(currentItemCount),
      last:
        reStart === true
          ? useStart + 10
          : Number(currentItemCount) + Number(10),
    };
    param.collId = collectionId;
    param.userId = currentUsr?._id;

    if (reStart) {
      localStorage.setItem("currentItemIndex", "0");
      setItems([]);
      setProcessing(true);
    }
    try {
      const response = await getSearchInaCollection(param);
      if (response.code !== 0) {
        throw new Error(response.message);
      }
      var list = [];
      let currentInfo = localStorage.getItem("hideCollections");
      if (currentInfo === null || !currentInfo) currentInfo = "{}";
      else currentInfo = JSON.parse(currentInfo.toString());

      let currentInfo1 = localStorage.getItem("hideItems");
      if (currentInfo1 === null || currentInfo1 === undefined)
        currentInfo1 = "{}";
      else currentInfo1 = JSON.parse(currentInfo1.toString());
      for (var i = 0; i < response.list.length; i++) {
        var item = response.list[i].item_info;
        item.isLiked = response.list[i].item_info.likes.includes(
          currentUsr._id
        );
        item.owner = response.list[i].owner_info;
        item.blur = response.list[i].blurItems;
        item.users = [{ avatar: response.list[i].creator_info.avatar }];
        let collectionHideflag = Boolean(currentInfo[response.list[i]._id]);
        if (collectionHideflag === true) item.hideItem = true;
        else {
            item.hideItem = Boolean(
              currentInfo1[response.list[i].item_info._id]
          );
          item.verified = item.creator_info?.verified;
        }

        list.push(item);
      }

      if (reStart) {
        localStorage.setItem(
          "currentItemIndex",
          (Number(list.length) + useStart).toString()
        );
        setItems(list);
        setCollectionMinPrice(calcFloorPrice(list));
      } else {
        setItems((items) => {
          localStorage.setItem(
            "currentItemIndex",
            (Number(currentItemCount) + Number(list.length)).toString()
          );
          setCollectionMinPrice(calcFloorPrice(items.concat(list)));
          return items.concat(list);
        });
      }
      if (response.list.length < 10) {
        setViewNoMore(true);
      } else {
        more.current = false;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let currentItemCount = localStorage.getItem("currentItemIndex");
      if (!more.current && isScrollAtBottom() && currentItemCount > 0) {
        more.current = true;
        getCollectionList(false, 0);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        const response = await getCollectionDetails(collectionId);
        const data = response.data || [];

        if (data?.explicit?.some((id) => id === currentUsr?._id)) {
          setShowExplicit(true);
        }

        dispatch(changeDetailedCollection(data));
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch collection data");
      }
    };

    fetchCollectionDetails();
  }, [collectionId]);

  useEffect(() => {
    if (
      collection?.explicit?.findIndex((item) => item === currentUsr?._id) >= 0
    ) {
      setShowExplicit(true);
    }
  }, [currentUsr]);

  const applyChangeExplicitContents = async () => {
    //save explicit showing flag
    if (isEmpty(currentUsr?._id)) {
      toast.warn("Please connect your wallet and try again.");
      return;
    }
    try {
      //update explicit
      const updateResponse = await updateExplicitApi(
        currentUsr?._id,
        collectionId
      );
      if (updateResponse.code === 0) {
        setShowExplicit(!showExplicit);
        setTimeout(() => {
          getCollectionList(true, 0);
        }, [1000]);
      }
    } catch (error) {}
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setStartIndex(event.target.value);
      localStorage.setItem("currentItemIndex", event.target.value);
      getCollectionList(true, parseInt(event.target.value));
    }
  };

  const handleStartIndex = (event) => {
    setStartIndex(event.target.value);
  };

  const isScrollAtBottom = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    // Calculate the adjusted heights based on the zoom level
    const zoomFactor = 1 / window.devicePixelRatio; // Get the zoom factor
    const adjustedWindowHeight = windowHeight * zoomFactor;
    const adjustedDocumentHeight = documentHeight * zoomFactor;
    const adjustedScrollPosition = scrollPosition * zoomFactor;

    return (
      (adjustedWindowHeight + adjustedScrollPosition) * 2 >=
      adjustedDocumentHeight
    );
  };

  return (
    <MainSection title="Collection Details">
      <div
        style={{
          width: "100%",
          marginLeft: "0",
          marginRight: "0",
          marginBottom: "4rem",
        }}
      >
        <div className="relative flex flex-col overflow-hidden rounded-2xl">
          {isVideo(collection?.bannerURL || "") !== true ? (
            <NcImage
              containerClassName="w-full pt-[27.78%] relative overflow-hidden"
              id="BannerImg"
              src={collection.bannerURL}
              isLocal={true}
              alt="Banner"
              className={`absolute top-0 left-0 object-cover w-full h-full`}
            />
          ) : (
            <div className="w-full flex justify-center">
              <VideoForBannerPreview
                src={`${config.UPLOAD_URL}uploads/${collection.bannerURL}`}
                nftId={DEMO_NFT_ID}
                className="w-full pt-[27.78%] overflow-hidden"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center relative">
          <div
            className="absolute z-20 border-2 border-[#cccccc] rounded-full w-[6rem] h-[6rem] md:w-[8rem] md:h-[8rem] lg:w-[10rem] lg:h-[10rem]
              -mt-[3rem]  md:-mt-[4rem]  lg:-mt-[5rem] overflow-hidden"
          >
            <img
              className="absolute top-0 left-0 object-cover w-full h-full"
              id="avatarImg"
              src={
                collection.logoURL === "" || collection.logoURL === undefined
                  ? defaultLogo
                  : `${config.UPLOAD_URL}uploads/${collection.logoURL}`
              }
              alt="Avatar"
            />
          </div>
        </div>
      </div>
      {!isMobile ? (
        <div className=" flex w-full justify-between ">
          <div className="w-5/12 flex flex-col justify-start px-5">
            <div
              className={styles.collectionName}
              style={{ marginTop: "0rem", textAlign: "center" }}
            >
              {collection && collection.name}
            </div>
            <div className="w-full border-b border-neutral-200/70 dark:border-neutral-600 my-4"></div>
            <div
              className={`${styles.collectionDescription} whitespace-pre-wrap text-center mt-[15px] text-description`}
            >
              {collection && parse(collection?.description || "")}
            </div>
          </div>
          <div className="w-2/12 flex flex-col justify-between items-center">
            <div className="w-full flex justify-center mt-12">
              {collection?.reported?.length >= 1 && (
                <div className="flex flex-col items-center">
                  <label>Explicit content</label>
                  <Switch
                    color="success"
                    checked={showExplicit}
                    onChange={(e, checked) => {
                      if (checked === true) {
                        applyChangeExplicitContents();
                      } else {
                        applyChangeExplicitContents();
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="w-[70%] flex flex-col items-center ">
              {collection?.enableLaunchpad === true && (
                <div
                  className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 
                      items-center justify-center h-[62px]  my-5 hover:animate-pulse transition-ease duration-90000
                      mb-4 w-full cursor-pointer"
                  onClick={() => {
                    navigate(`/launchpad/${collectionId}`);
                  }}
                >
                  Mint
                </div>
              )}
            </div>
          </div>
          <div className="w-5/12 flex flex-col justify-start px-5">
            <div
              className={styles.collectionFloorPrice}
              style={{ textAlign: "center" }}
            >
              Floor price :
              {collection && collectionMinPrice ? (
                <span className="font-[MyCutomFont] text-[2rem] text-[#33ff00]">
                  {" " + collectionMinPrice + " "}
                </span>
              ) : (
                " 0 "
              )}
              {getItemPriceUnitText(collection)}
            </div>
            <div className="w-full border-b border-neutral-200/70 dark:border-neutral-600 my-4"></div>
            <CollectionInfo
              itemsLength={collection?.items?.length}
              collectionId={collectionId}
              unitPrice={parseInt(collection?.mintingPrice)}
              launchpadState={collection?.launchstate}
            />
          </div>
        </div>
      ) : (
        <div className=" flex flex-col w-full justify-center mt-30">
          <div className="flex flex-col justify-start px-5 w-full">
            <div
              className={styles.collectionName}
              style={{ marginTop: "0rem", textAlign: "center" }}
            >
              {collection && collection?.name}
            </div>
            <div className="w-full border-b border-neutral-200/70 dark:border-neutral-600 my-4"></div>
            <div
              className={`${styles.collectionDescription} whitespace-pre-wrap text-center mt-[15px] text-description`}
            >
              {collection && parse(collection?.description || "")}
            </div>
          </div>

          <div className="w-full flex flex-col justify-start px-5">
            <div
              className={styles.collectionFloorPrice}
              style={{ textAlign: "center" }}
            >
              {collection && collectionMinPrice
                ? "Floor price : " + collectionMinPrice + " "
                : "Floor price : 0 "}
              {getItemPriceUnitText(collection)}
            </div>
            <div className="w-full border-b border-neutral-200/70 dark:border-neutral-600 my-4"></div>
            <CollectionInfo
              itemsLength={collection?.items?.length}
              collectionId={collectionId}
              unitPrice={parseInt(collection?.mintingPrice)}
              launchpadState={collection?.launchstate}
            />
          </div>

          <div className="w-full flex flex-col justify-between items-center">
            <div
              className="buttonsLast rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[62px]  my-5 hover:animate-pulse transition-ease duration-90000
          mb-4 w-fullcursor-pointer"
              onClick={() => {
                setMintModal(true);
              }}
            >
              Mint
            </div>
          </div>
        </div>
      )}
      <div className=" relative ">
        <div className="flex w-full justify-center py-4 lg:py-2 gap-4">
          {currentUsr && currentUsr?._id === collection?.owner?._id && (
            <ButtonPrimary
              className="buttonsLast rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[62px]  lg:w-[250px] my-5 hover:animate-pulse transition-ease duration-90000
          mb-4  cursor-pointer"
              onClick={() => {
                navigate("/page-upload-item");
              }}
            >
              Create NFTs
            </ButtonPrimary>
          )}
        </div>

        {!showBulkFeatures &&
          currentUsr &&
          currentUsr?._id === collection?.owner?._id && (
            <div
              className={`flex  ${
                isMobile ? "justify-center w-full" : "justify-end w-[98%]"
              }`}
            >
              <div
                className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center hover:animate-pulse transition-ease duration-90000
          w-[150px] h-[40px] cursor-pointer text-sm"
                onClick={() => {
                  dispatch(changeBulkOpsMode(true));
                }}
              >
                Bulk Option
              </div>
            </div>
          )}
        {showBulkFeatures && (
          <div
            className={`flex ${
              isMobile
                ? "flex-col items-center gap-4"
                : "justify-between items-center gap-2"
            }  px-7 `}
          >
            <div
              className={`flex justify-between items-center ${
                isMobile ? "flex-col w-full gap-4" : "w-[90%]"
              }`}
            >
              <div className="flex  gap-2 lg:gap-4  justify-start items-center">
                <div
                  className="gap-2 rounded-3xl bg-[rgba(255, 0, 0, 0.01)] shadow-[0px_0px_28px_#ff3300_inset] flex py-0 px-7 items-center justify-center hover:animate-pulse transition-ease duration-90000
                w-[140px] h-[40px] cursor-pointer text-sm"
                  onClick={() => {
                    dispatch(changeBulkOpsMode(false));
                    dispatch(emptyBulkSelectedArray());
                  }}
                >
                  <IoIosCloseCircle size={40}></IoIosCloseCircle>
                  {"Cancel"}
                </div>
                <div className="flex gap-2">
                  <Checkbox
                    checked={selectAll}
                    onChange={() => {
                      setSelectAll(!selectAll);
                      if (selectAll) dispatch(emptyBulkSelectedArray());
                      else dispatch(setBulkSelectArray(items));
                    }}
                  />
                  {<Label>Select All</Label>}
                </div>
                <p className="text-[#33ff00] text-[20px]">
                  {isMobile
                    ? `(${bulkSelectedArray?.length})`
                    : `Selected Items: ${bulkSelectedArray?.length}`}
                </p>
              </div>

              <div className="flex gap-2 lg:gap-4 items-center ">
                <ButtonPrimary
                  className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[40px]  hover:animate-pulse transition-ease duration-90000
          w-[80px] lg:w-[100px] cursor-pointer"
                  onClick={() => {
                    if (bulkSelectedArray?.length > 0) {
                      setVisibleModalSale(true);
                    } else {
                      toast.warning("Please select items");
                    }
                  }}
                >
                  List
                </ButtonPrimary>
                <ButtonPrimary
                  className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[40px]  hover:animate-pulse transition-ease duration-90000
                w-[80px] lg:w-[100px] cursor-pointer"
                  onClick={() => {
                    if (bulkSelectedArray?.length > 0) {
                      setVisibleModalDelist(true);
                    } else {
                      toast.warning("Please select items");
                    }
                  }}
                >
                  Delist
                </ButtonPrimary>
                <ButtonPrimary
                  className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[40px]  hover:animate-pulse transition-ease duration-90000
                w-[80px] lg:w-[100px] cursor-pointer"
                  onClick={() => {
                    if (bulkSelectedArray?.length > 0) {
                      setVisibleModalTransfer(true);
                    } else {
                      toast.warning("Please select items");
                    }
                  }}
                >
                  Transfer
                </ButtonPrimary>
                <ButtonPrimary
                  className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[40px]  hover:animate-pulse transition-ease duration-90000
                w-[80px] lg:w-[100px] cursor-pointer"
                  onClick={() => {
                    if (bulkSelectedArray?.length > 0) {
                      setVisibleModalBurn(true);
                    } else {
                      toast.warning("Please select items");
                    }
                  }}
                >
                  Burn
                </ButtonPrimary>
              </div>
            </div>
            <Tooltip title={"Search"} placement="top" arrow={true}>
              <label
                htmlFor="search-input"
                className={`relative text-neutral-500 dark:text-neutral-300 ${
                  isMobile ? "w-[150px]" : "w-[100px]"
                }`}
              >
                <Input
                  className={`shadow-lg border-0 dark:border`}
                  id="filled-number"
                  type="search"
                  placeholder="Start"
                  sizeClass={`pr-2 ${isMobile ? "pl-8" : "pl-6"}`}
                  rounded="rounded-full"
                  onChange={handleStartIndex}
                  onKeyDown={handleKeyDown}
                  value={startIndex}
                />
              </label>
            </Tooltip>
          </div>
        )}

        <div className="w-full border-b border-neutral-200/70 dark:border-neutral-600 my-2"></div>

        {items !== undefined && items !== null && items.length > 0 ? (
          <div align="center">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10 mt-8 lg:mt-10 place-items-center">
              {items &&
                items.length > 0 &&
                items.map((x, index) => (
                  <CardNFTComponent
                    item={x}
                    key={index}
                    selectable={showBulkFeatures}
                  />
                ))}
            </div>

            <div className=" text-center mt-10 m-10">
              <span>
                &nbsp;
                {(viewNoMore === true || items?.length === 0) &&
                  "No more items"}
                &nbsp;
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-4 w-full h-[150px]">
            No Items
          </div>
        )}

        <NcModal
          isOpenProp={mintModal}
          onCloseModal={() => setMintModal(false)}
          contentExtraClass="max-w-screen-sm"
          renderContent={() => (
            <div className="flex flex-col">
              <div className="flex items-center justify-center flex-col justify-end my-2">
                <p className="pb-2">You can mint on</p>
                <p className="text-[#33ff00] text-center">
                  {" "}
                  {`https://rize2day/launchpad/${collection.name}`}
                  <span className="pl-4">
                    <CopyButton
                      data={`https://rize2day/launchpad/${collectionId}`}
                      size={15}
                    />
                  </span>
                </p>
                <p className="pt-2">in the Leap wallet Browser</p>
              </div>
              <a
                href="https://launchpad.rize2day.com"
                target="_blank"
                rel="noopener noreferrer"
                className="select-none w-full flex justify-center pb-4"
              >
                <div className="flex item-center">
                  <p className="text-sm">Tutorial Video</p>
                  <BsLink></BsLink>
                </div>
              </a>
              <ButtonPrimary
                className={cn("button")}
                onClick={() => setMintModal(false)}
              >
                Close
              </ButtonPrimary>
            </div>
          )}
          renderTrigger={() => {}}
          modalTitle="Rize2day Support"
        />

        <NcModal
          isOpenProp={visibleModalSale}
          onCloseModal={() => setVisibleModalSale(false)}
          contentExtraClass="max-w-lg"
          renderContent={renderSaleModalContent}
          renderTrigger={() => <></>}
          modalTitle="List NFTs"
        />
        <NcModal
          isOpenProp={visibleModalDelist}
          onCloseModal={() => setVisibleModalDelist(false)}
          contentExtraClass="max-w-lg"
          renderContent={renderDelistModalContent}
          renderTrigger={() => <></>}
          modalTitle="Delist NFTs"
        />
        <ModalTransferToken
          show={visibleModalTransfer}
          onOk={onBulkTransfer}
          onCloseModalTransferToken={() => setVisibleModalTransfer(false)}
          multiple={bulkSelectedArray?.length}
        />

        <ModalDelete
          show={visibleModalBurn}
          onOk={onBulkBurn}
          onCloseModalDelete={() => setVisibleModalBurn(false)}
          multiple={bulkSelectedArray?.length}
        />

        {
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={processing}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      </div>
    </MainSection>
  );
};

export default ItemsOfCollection;
