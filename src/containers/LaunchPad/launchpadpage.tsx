import BottomSlider from "./BottomSlider";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
  selectGlobalProvider,
} from "app/reducers/auth.reducers";
import {
  changeDetailedCollection,
  selectDetailedCollection,
} from "app/reducers/collection.reducers";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CATEGORIES,
  FILE_TYPE,
  ITEM_ACTION_TYPES,
  MINTING_PRICE_LIST,
  PLATFORM_NETWORKS,
  config,
} from "app/config";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { useSigningClient } from "app/cosmwasm";
import { isEmpty, saveMultipleItemActivity } from "app/methods";
import UpperSlider from "components/StyleComponent/slider";
import {
  decrypt,
  getFileType,
  handleKeyPress,
  isJsonObject,
  isSupportedEVMNetwork,
  promiseWithTimeout,
  validateSignature,
} from "utils/utils";
import { Backdrop, CircularProgress } from "@mui/material";
import "./launchpad.css";
import defaultLogo from "images/default_logo.png";
import {
  generateReferralUrlApi,
  getDiscountApi,
  getWlMintedCountApi,
  updateReferralCountApi,
  updateWlMintCountApi,
} from "app/api/minting";
import { isInMintingWLApi } from "app/api/users";
import {
  getCollectionDetails,
  getRandomIdsForBulkMintApi,
  increaseMintedCountApi,
  registerLaunchApi,
} from "app/api/collections";
import MainSection from "components/Section/MainSection";
import { useItemsApiServices } from "app/api/useItemsApiServices";
import { useEVMOperations } from "hooks/useEVMOperations";

const secret = process.env.REACT_APP_ENCRYPT_KEY;

const PageLaunchPad = () => {
  const detailedCollectionInfo = useAppSelector(selectDetailedCollection);
  const { bulkCreateApi, deleteManyByIdsApi, getUserItemsOnACollApi, updateTokenIdsApi } = useItemsApiServices();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mintOnEVM } = useEVMOperations();
  const { collectionId } = useParams();
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const currentUser = useAppSelector(selectCurrentUser);
  const [totalMintingPrice, setTotalMintingPrice] = useState(
    MINTING_PRICE_LIST[PLATFORM_NETWORKS.COREUM].PRICE
  );
  const [mintingCount, setMintingCount] = useState(1);
  const [totalMinted, setTotalMinted] = useState(0);
  const [MAX_COUNT, setMaxCount] = useState(10000);
  const [totalItems, setTotalItems] = useState(0);
  const [availableItemsForMint, setAvailableItemsForMint] = useState([]);
  const [myItemsOnConsideringColl, setMyItemsOnConsideringColl] = useState([]);
  const {
    collectionConfig,
    batchMintAndPay,
    batchMintForHomies,
    balances,
  }: any = useSigningClient();
  const [working, setWorking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [openReferral, setOpenreferral] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [saleMode, setSaleMode] = useState(false); // false: public sale, true: presale
  const [isInMintingWL, setIsInMintingWL] = useState(false);
  const [whitelistinfo, setWhitelistinfo] = useState(null);
  const [myDiscountRate, setMyDiscountRate] = useState(0);

  const handleOpenMint = () => {
    if (detailedCollectionInfo?.mintingPrice === 0) {
      toast("You can't mint now since price is set as 0");
      return;
    }
    let totalItemCount =
      Number(detailedCollectionInfo?.items?.length || 0) +
      Number(detailedCollectionInfo?.totalItemNumberInCID || 0) -
      Number(detailedCollectionInfo?.mintedCountOfCID || 0);
    if (detailedCollectionInfo?.items?.length >= totalItemCount) {
      toast.warning("This collection has been fully filled.");
      return;
    }

    if (saleMode === true && isInMintingWL) {
      setTotalMintingPrice(
        Number(
          Number(
            mintingCount *
            ((detailedCollectionInfo?.mintingPrice *
              detailedCollectionInfo?.wlDiscountRate) /
              100)
          ).toFixed(2)
        )
      );
    } else {
      setTotalMintingPrice(
        Number(
          myDiscountRate > 0
            ? Number(
              (mintingCount - 1) *
              (Number(detailedCollectionInfo?.mintingPrice) || 0) +
              Number(
                ((Number(detailedCollectionInfo?.mintingPrice) || 0) *
                  (100 - myDiscountRate)) /
                100
              )
            ).toFixed(2)
            : Number(
              mintingCount * (detailedCollectionInfo?.mintingPrice || 0)
            ).toFixed(2)
        )
      );
    }
    setShowMintModal(true);
  };

  const readDiscount = async () => {
    const discountResponse = await getDiscountApi(
      collectionId,
      currentUser?._id
    );
    let discoutRateForAnItem = Number(discountResponse.data || 0);
    setMyDiscountRate(discoutRateForAnItem);
  };

  useEffect(() => {
    readDiscount();
  }, [collectionId, currentUser]);

  useEffect(() => {
    if (openReferral || showMintModal || working || openReturn) {
      document.documentElement.classList.add("no-scroll"); // Add no-scroll class to html element
    } else {
      document.documentElement.classList.remove("no-scroll"); // Remove no-scroll class from html element
    }

    return () => {
      document.documentElement.classList.remove("no-scroll"); // Clean up on component unmount
    };
  }, [openReferral, showMintModal, working, openReturn]);

  const parseAndValidateReferralUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedData = urlParams.get("data");
    const signature = urlParams.get("signature");

    if (validateSignature(encryptedData, signature, secret)) {
      const data = decrypt(encryptedData, secret);
      const [collId, referrerId] = data.split(",");
      if (collId !== collectionId) {
        toast.warning("The referral data is invalid, we don't accept the it.");
      } else {
        setReferralData(encryptedData);
      }
    } else {
      console.log("The link is not valid or has been tampered with ");
    }
  };

  const checkIamIntheWL = async () => {
    try {
      const response = await isInMintingWLApi(
        collectionId,
        currentUser?.address
      );
      if (response.code === 0) {
        setIsInMintingWL(response.data);
        setWhitelistinfo(response.wlInfor);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
    parseAndValidateReferralUrl();
  }, []);

  useEffect(() => {
    if (saleMode) checkIamIntheWL();
    refreshMintedItems();
  }, [detailedCollectionInfo, currentUser]);

  const initInfor = useCallback(async () => {
    let updatedColl = detailedCollectionInfo;
    dispatch(changeDetailedCollection(updatedColl));
    setAvailableItemsForMint([]);
    let totalItemCount =
      Number(updatedColl?.items?.length || 0) +
      Number(updatedColl?.totalItemNumberInCID || 0) -
      Number(updatedColl?.mintedCountOfCID || 0);
    setTotalItems(totalItemCount);
    setTotalMinted(updatedColl?.items?.length || 0);
    setMaxCount(
      Number(updatedColl?.totalItemNumberInCID || 0) -
      Number(updatedColl?.mintedCountOfCID || 0)
    );
    let notMintedItems = [];
    let maxCount = 0;
    for (let idx = 0; idx < updatedColl.totalItemNumberInCID; idx++) {
      if (updatedColl.mintedArray[idx]) continue;
      maxCount++;
      if (maxCount > 9) break;
      try {
        const url = `${config.ipfsGateway}${updatedColl.jsonFolderCID}/${Number(idx) + 1
          }.json`;

        const response = await axios.get(url);
        const jsonData = isJsonObject(response.data)
          ? JSON.parse(response.data)
          : response.data;
        notMintedItems.push(jsonData);
      } catch (err) { }
    }
    setAvailableItemsForMint(notMintedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailedCollectionInfo, dispatch]);

  useEffect(() => {
    if (detailedCollectionInfo?._id?.toString()?.length !== 24) return;
    initInfor();
  }, [detailedCollectionInfo]);

  const updateUI = async (colelctionInfo) => {
    let totalItemCount =
      Number(colelctionInfo?.items?.length || 0) +
      Number(colelctionInfo?.totalItemNumberInCID || 0) -
      Number(colelctionInfo?.mintedCountOfCID || 0);
    setTotalItems(totalItemCount);
    setTotalMinted(colelctionInfo?.items?.length || 0);
    setMaxCount(
      Number(colelctionInfo?.totalItemNumberInCID || 0) -
      Number(colelctionInfo?.mintedCountOfCID || 0)
    );
  };

  const handleClickPlus = () => {
    try {
      if (mintingCount < MAX_COUNT) {
        let newCount = Number(mintingCount) + Number(1);

        setMintingCount(newCount);
        setTotalMintingPrice(
          saleMode && isInMintingWL
            ? Number(
              Number(
                newCount *
                ((detailedCollectionInfo?.mintingPrice *
                  detailedCollectionInfo?.wlDiscountRate) /
                  100 || 0)
              ).toFixed(2)
            )
            : Number(
              Number(
                newCount * (detailedCollectionInfo?.mintingPrice || 0)
              ).toFixed(2)
            )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickMinus = () => {
    if (mintingCount > 1) {
      let newCount = mintingCount - 1;
      setMintingCount(newCount);
      setTotalMintingPrice(
        saleMode && isInMintingWL
          ? Number(
            Number(
              newCount *
              ((detailedCollectionInfo?.mintingPrice *
                detailedCollectionInfo?.wlDiscountRate) /
                100 || 0)
            ).toFixed(2)
          )
          : Number(
            Number(
              newCount * (detailedCollectionInfo?.mintingPrice || 0)
            ).toFixed(2)
          )
      );
    }
  };

  const checkNativeCurrencyAndTokenBalances = async (tokenAmountShouldPay) => {
    if (
      balances[config.COIN_MINIMAL_DENOM] <= 0 ||
      (tokenAmountShouldPay > 0 && balances.cw20 <= tokenAmountShouldPay)
    ) {
      toast.warning("Insufficient CORE or RIZE");
      return false;
    }
    return true;
  };

  const saveMultipleItem = async (params, fmint = false, mintedIndexs) => {
    setWorking(true);
    let idArray = [];
    try {
      const response = await bulkCreateApi(params);
      console.log(response);
      if (response.code !== 0) {
        throw new Error("Failed to create api");
      }
      idArray = [...(response.data as string[])];
      let discountedtotalMintingFee = 0;
      const discountedPriceForAnItem =
        ((detailedCollectionInfo?.mintingPrice || 0) * (100 - myDiscountRate)) /
        100;
      discountedtotalMintingFee =
        (detailedCollectionInfo?.mintingPrice || 0) * (mintingCount - 1) +
        discountedPriceForAnItem;
      if (saleMode === true && isInMintingWL === true) {
        discountedtotalMintingFee =
          ((detailedCollectionInfo?.mintingPrice || 0) *
            mintingCount *
            (100 - (whitelistinfo?.wlDiscountRate || 100))) /
          100;
      }
      if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
        var prices = [];
        for (let idx = 0; idx < idArray?.length; idx++) prices[idx] = 0;
        //do transaction
        let colllectionInfo = await collectionConfig(
          detailedCollectionInfo?.address
        );
        let startId = colllectionInfo.unused_token_id;
        let balanceCheck = await checkNativeCurrencyAndTokenBalances(0);

        if (balanceCheck === false) {
          throw new Error("Insufficient balance!");
        }

        let txHash = -1;
        if (detailedCollectionInfo._id === "645a7501069be7750b397759") { // for Homies collection
          console.log("you are minting for Homies")
          txHash = await batchMintForHomies(
            currentUser.address,
            detailedCollectionInfo.address,
            params.metadataURIs,
            params.nameList,
            discountedtotalMintingFee > 0
              ? discountedtotalMintingFee
              : (detailedCollectionInfo?.mintingPrice || 0) * mintingCount,
            fmint
          );
        } else {
          txHash = await batchMintAndPay(
            currentUser.address,
            detailedCollectionInfo.address,
            params.metadataURIs,
            params.nameList,
            params.descList,
            params.itemMusicURL,
            params.metaData,
            discountedtotalMintingFee > 0
              ? discountedtotalMintingFee
              : (detailedCollectionInfo?.mintingPrice || 0) * mintingCount,
            false
          );
        }
        //succeed, then update all items with token ids
        if (txHash === -1) {
          throw new Error("Transaction error.");
        }
        const response = await updateTokenIdsApi(idArray, startId);
        if (response.code !== 0) {
          throw new Error("Failed to update token id");
        }

        if (isInMintingWL && saleMode === true) {
          const response = await updateWlMintCountApi(
            detailedCollectionInfo._id,
            currentUser?._id,
            mintingCount
          );
          if (response.code !== 0) {
            throw new Error("Failed to update wlMintCoundt");
          }
        }
        const increaseMintedCountApiResponse = await increaseMintedCountApi(
          detailedCollectionInfo._id,
          mintingCount,
          mintedIndexs
        );
        if (increaseMintedCountApiResponse.code !== 0)
          throw new Error("Failed to increase MintedCount");
        if (referralData !== null) {
          const updateRefCountResponse = await updateReferralCountApi(
            referralData
          );
          if (updateRefCountResponse.code !== 0)
            throw new Error("Failed to update Referral Count");
        }
        toast.success("You've created NFTs successfully.");
        setMintingCount(1);
        let paramsActs = {
          items: idArray,
          origin: currentUser?._id,
          transactionHash: txHash,
          actionType: ITEM_ACTION_TYPES.MINTED,
        };
        saveMultipleItemActivity(paramsActs);
      } else if (isSupportedEVMNetwork(currentNetworkSymbol) === true) {
      }
    } catch (error) {
      if (idArray.length > 0)
        await deleteManyByIdsApi(idArray, detailedCollectionInfo?._id || "");
      console.log(error);
      const errorMessage = error.message || "An unexpected error occurred";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      const colResponse = await getCollectionDetails(
        detailedCollectionInfo._id
      );
      const updatedColData = colResponse.data || {};
      dispatch(changeDetailedCollection(updatedColData));
      updateUI(updatedColData);
      setShowMintModal(false);
      setWorking(false);
    }
  };

  const isValidCollectionId = () => {
    return detailedCollectionInfo._id?.toString().length === 24;
  };

  const validateUserAndCollection = () => {
    if (!currentUser) {
      toast.warning("Please connect wallet first.");
      return false;
    }
    if (new Date() > new Date(detailedCollectionInfo?.mintFinishDate)) {
      toast.warning("This collection has closed sale.");
      return false;
    }
    if (!isValidCollectionId()) {
      toast.warning("Invalid collection id.");
      return false;
    }
    return true;
  };

  const handleClickMint = async () => {
    if (!validateUserAndCollection()) return;

    try {
      setWorking(true);
      if (
        mintingCount > 0 &&
        currentUser &&
        currentUser._id &&
        detailedCollectionInfo._id
      ) {
        if (saleMode === true) {
          if (isInMintingWL) {
            const getWlMintedCountResponse = await getWlMintedCountApi();
            const myWlMintedCount = getWlMintedCountResponse.data || 0;
            if (myWlMintedCount >= detailedCollectionInfo?.wlMintableMax) {
              throw new Error("You can not mint items of this collection.");
            }
          } else {
            throw new Error("You can not mint items of this collection.");
          }
        }

        if (currentNetworkSymbol === PLATFORM_NETWORKS.ETHEREUM) {
          const payPrice = await mintOnEVM((detailedCollectionInfo?.mintingPrice || 0) * mintingCount)
          if (payPrice.success !== true) {
            throw new Error("Failed to execute Ethereum error.");
          }
        } else {
          const getRandomIdsForBulkMintResponse =
            await getRandomIdsForBulkMintApi(
              detailedCollectionInfo._id,
              mintingCount
            );
          const mintingIndexArray = getRandomIdsForBulkMintResponse.data || [];
          if (mintingIndexArray?.length === 0)
            throw new Error("The collection has no items for minting.");
          // read item infomations from pinata
          let promisesForfetching = [];
          let uris = [];
          for (let idx = 0; idx < mintingIndexArray?.length; idx++) {
            let url = `${config.ipfsGateway}${detailedCollectionInfo.jsonFolderCID
              }/${Number(mintingIndexArray[idx]) + 1}.json`;
            uris.push(
              `${detailedCollectionInfo.jsonFolderCID}/${Number(
                Number(mintingIndexArray[idx]) + 1
              )}.json`
            );
            promisesForfetching.push(axios.get(url));
          }
          const timeoutDuration = 10000;

          const promisesWithTimeout = promisesForfetching.map((promise) =>
            promiseWithTimeout(promise, timeoutDuration)
          );

          Promise.all(promisesWithTimeout)
            .then(async (responses) => {
              let imageList = [];
              let nameList = [];
              let logoList = [];
              let descList = [];
              let attributesList = [];
              let fileType = 0;
              for (let idx1 = 0; idx1 < responses?.length; idx1++) {
                let json_meta: any = {};
                if (isJsonObject(responses[idx1].data))
                  json_meta = JSON.parse(responses[idx1].data);
                else json_meta = responses[idx1].data;

                fileType = getFileType(json_meta.image);
                imageList.push(
                  json_meta.image.toString().replace("ipfs://", "") || "image"
                );
                nameList.push(json_meta.name || "");
                logoList.push(
                  getFileType(json_meta.image) !== FILE_TYPE.IMAGE
                    ? "default.png"
                    : json_meta.image.toString().replace("ipfs://", "")
                );
                descList.push(json_meta.description || "description");
                attributesList.push(json_meta.attributes || []);
              }
              const params = {
                nameList: nameList,
                itemMusicURL: imageList,
                itemLogoURL: logoList,
                descList: descList,
                collectionId: detailedCollectionInfo?._id || "",
                creator: detailedCollectionInfo.owner?._id || "",
                owner: currentUser?._id || "",
                fileType: fileType,
                isSale: 0,
                price: 0,
                auctionPeriod: 0,
                stockAmount: 1,
                metaData: attributesList,
                timeLength: 0,
                stockGroupId: new Date().getTime(),
                chainId: currentNetworkSymbol || 1,
                metadataURIs: uris,
                networkSymbol: currentNetworkSymbol || 1,
                coreumPaymentUnit: 0,
              };
              await saveMultipleItem(params, false, mintingIndexArray);
              refreshMintedItems();
            })
            .catch((error) => {
              console.error(error.message);
            });
        }
      }
    } catch (error) {
      const errorMessage = error.message || "An unexpected error occurred";
      toast.error(`Error: ${errorMessage}`);
      console.log(error);
      setWorking(false);
    } finally {
      setShowMintModal(false);
    }
  };

  const refreshMintedItems = async () => {
    if (!detailedCollectionInfo?._id || !currentUser?._id) {
      return;
    }
    if (!isValidCollectionId()) return;

    try {
      const response = await getUserItemsOnACollApi(
        detailedCollectionInfo._id,
        currentUser?._id
      );
      setMyItemsOnConsideringColl(response.data);
    } catch (error) {
      toast.error("Failed to refresh Minted Items");
      console.log(error);
    }
  };

  useEffect(() => {
    setWorking(true);

    const fetchCollectionDetails = async () => {
      try {
        const colResponse = await getCollectionDetails(collectionId);
        if (colResponse.code !== 0) {
          throw new Error("Failed to get Collection Detail");
        }
        const updatedColData = colResponse.data || {};
        setSaleMode(updatedColData.saleMode || false);
        dispatch(changeDetailedCollection(updatedColData));
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching collection details.");
      } finally {
        setWorking(false);
      }
    };
    fetchCollectionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const handleChangeMintingCount = (value) => {
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);
    if (isNaN(numericValue) === false) {
      setMintingCount(numericValue);
      setTotalMintingPrice(
        saleMode && isInMintingWL
          ? Number(
            Number(
              numericValue *
              ((detailedCollectionInfo?.mintingPrice *
                detailedCollectionInfo?.wlDiscountRate) /
                100 || 0)
            ).toFixed(2)
          )
          : Number(
            Number(
              numericValue * (detailedCollectionInfo?.mintingPrice || 0)
            ).toFixed(2)
          )
      );
    }
  };

  const handleOpenReferralModal = async () => {
    try {
      const response = await generateReferralUrlApi(
        collectionId,
        currentUser?._id
      );
      setOpenreferral(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onConfirmToLaunch = async () => {
    try {
      await registerLaunchApi(detailedCollectionInfo._id);
      toast.info("Successfully sent request to the Rize");
      navigate(`/collectionItems/${collectionId}`);
    } catch (error) {
      toast.error("Failed to register Launch");
      console.log(error);
    }
  };

  return (
    <MainSection title="LaunchPad">
      <div
        className="relative bg-white w-full h-[auto] overflow-hidden text-left text-base text-white"
        style={{ fontFamily: "MyCustomFont" }}
      >
        {/* --------------background paper-opacity-color--------------- */}
        <div className="flex flex-col">
          <div className="flex-grow">
            <img
              className="absolute top-[400px] left-[0px] object-cover w-full h-full"
              alt=""
              src="/assets/bg@2x.png"
            />
            <img
              className="absolute top-[0px] left-[0px] object-cover w-full h-[400px] "
              alt=""
              src={`${config.UPLOAD_URL}uploads/${detailedCollectionInfo.bannerURL}`}
            />
            <div className="absolute top-[400px] left-[0px] bg-lime-100 w-full h-full mix-blend-darken" />
            <div className="absolute top-[400px] left-[0px] bg-gray-100 [backdrop-filter:blur(82px)] w-full h-full mix-blend-normal" />
          </div>
        </div>

        <div className="relative m-auto w-[80%] h-[auto] mt-[100px] rounded-3xl">
          {/* -------------black bg----------- */}
          <div
            className="absolute top-0 left-0 w-full h-full bg-black opacity-90 rounded-3xl "
            style={{ boxShadow: " 0px 2px 21px 19px rgba(51,255,0,0.32)" }}
          ></div>

          {/* -------------MID content start----------- */}
          <div className="m-auto w-[100%] h-[auto] text-19xl back flex flex-col justify-center items-center shadow-2xl ">
            {/* ----------first div------------- */}
            <div className=" w-[90%] flex flex-col md:flex-row flex-wrap m-auto mt-10 ">
              <div className="relative m-auto flex flex-col">
                <div className="bg-[#121814] [box-shadow:0px_-6px_14px_rgba(51,_255,_0,_0.42)] rounded-3xl flex flex-col justify-space items-center flex-no-wrap m-auto p-5  gap-3">
                  <div className="bg-black rounded-3xl boxShadow p-1 w-[200px] h-[200px]">
                    <img
                      alt=""
                      className="w-full h-full object-cover rounded-[1.25rem] [box-shadow:0px_-6px_14px_rgba(51,_255,_0,_0.42)]"
                      src={
                        detailedCollectionInfo.logoURL === "" ||
                          detailedCollectionInfo.logoURL === undefined
                          ? defaultLogo
                          : `${config.UPLOAD_URL}uploads/${detailedCollectionInfo.logoURL}`
                      }
                    />
                  </div>
                  <div
                    className=" rounded-81xl bg-lime-200 hover:bg-[#23ad00]  
                    shadow-[0px_0px_28px_#33ff00_inset] animate-pulse transition-1s 
                    duration-90000 flex flex-col items-center justify-center text-center 
                    text-base md:text-xl   text-white w-[198px] h-[52px] font-bold  "
                    style={{ cursor: "pointer" }}
                    onClick={
                      detailedCollectionInfo.launchstate === 2
                        ? handleOpenMint
                        : () => { }
                    }
                  >
                    {detailedCollectionInfo.launchstate === 2
                      ? "Mint Now"
                      : detailedCollectionInfo.launchstate === 1 &&
                      "Waiting Approval"}
                  </div>
                </div>
              </div>
              <div
                className={` h-auto flex flex-col flex-no-wrap m-auto ${isMobile ? "mt-5 w-full" : "w-3/5"
                  }`}
              >
                {(detailedCollectionInfo?.owner?._id === currentUser?._id ||
                  currentUser?._id === "643cf0d37c81d21a1c351d4a") && (
                    <div
                      className={`relative flex ${isMobile ? "justify-center" : "justify-end"
                        }`}
                    >
                      <div
                        className="mb-4 rounded-3xl bg-[rgba(51, 255, 0, 0.01)] hover:bg-[#23ad00]  shadow-[0px_0px_28px_#33ff00_inset] animate-pulse transition-1s duration-90000 flex flex-col items-center justify-center text-center text-xl  h-[52px]  text-white 
                      cursor-pointer w-36
                      "
                        onClick={() => {
                          navigate(
                            `/launchpadSetting/${detailedCollectionInfo?._id}`
                          );
                        }}
                      >
                        Edit
                      </div>
                    </div>
                  )}
                <b className="relative [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] mb-5 heading leading-10 text-[25px] text-center lg:md:text-left md:text-[30px] lg:text-[38px] ">
                  {detailedCollectionInfo?.name || ""}
                </b>
                <div className="relative  w-[auto] text ">
                  {parse(detailedCollectionInfo?.description || "")}
                </div>
                {isEmpty(currentUser?._id) === false &&
                  detailedCollectionInfo?.appplyReferral === true && (
                    <div className="relative flex lg:md:justify-end justify-center">
                      <div
                        className=" mb-4 mt-4 rounded-3xl bg-[rgba(51, 255, 0, 0.01)] hover:bg-[#23ad00]  shadow-[0px_0px_28px_#33ff00_inset] flex flex-col items-center justify-center text-center text-xl  h-[52px]  text-white 
                       w-36 cursor-pointer "
                        onClick={() => {
                          handleOpenReferralModal();
                        }}
                      >
                        Referral
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="relative w-[90%] h-auto flex flex-col flex-wrap m-auto  mt-10">
              <div className="rounded-3xl bg-black shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] flex flex-col flex-wrap py-[26px] px-8 box-border  justify-center text-3xl m-auto mt-5">
                <div>
                  <b className="m-auto lg:ml-1 leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Token Minted
                  </b>
                  <div className="flex justify-between md:mb-1">
                    <span className="font-black text-transparent text-[20px] sm:text-[40px] md:text-[44px] lg:text-[54px] bg-clip-text bg-gradient-to-r from-green-400 to-lime-600 py-2">
                      {Number((totalMinted * 100) / totalItems).toFixed(2)}%
                    </span>
                    <span className="text-[16px] sm:text-[20px] md:text-[24px] lg:text-[] font-small text-gray my-auto">
                      {totalMinted}/{totalItems}
                    </span>
                  </div>
                  <div className="w-full h-4 my-auto  rounded-full bg-black shadow-[0px_0px_7px_1px_gray_inset] mt-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-lime-600 text-xs font-medium text-gray-950 text-center p-0.5 leading-none rounded-full"
                      style={{ width: `${(totalMinted * 100) / totalItems}%` }}
                    >
                      {Number((totalMinted * 100) / totalItems).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-[90%] h-auto  mt-10 flex flex-col flex-wrap">
              <b className="m-auto lg:ml-1 leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                Activity
              </b>
              <div className="flex justify-start mb-1 mt-5  mr-2 gap-3">
                <button
                  style={{ cursor: "pointer" }}
                  type="button"
                  className=" text-white bg-[#2E3F29] rounded-81xl px-8 sm:px-5 py-2 text-center h-[auto] mr-3 md:mr-0  relative font-bold text-base"
                >
                  Presale
                </button>

                {saleMode === true &&
                  new Date().getTime() <
                  new Date(detailedCollectionInfo?.mintFinishDate).getTime() ? (
                  <span className=" text-sm md:text-md text-[#E7EC00] font-bold my-auto">
                    IN PROGRESS
                  </span>
                ) : (
                  <span className=" text-sm md:text-md text-[#FF0000] font-bold my-auto">
                    ENDED
                  </span>
                )}
              </div>
              <div className="rounded-3xl bg-black shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] flex flex-row flex-wrap py-[30px] px-8 box-border  justify-start text-xl md:text-3xl gap-[10px] mt-5">
                <span className="text-[gray] text-bold">
                  Whitelist{" "}
                  <span className="text-white">
                    {whitelistinfo?.wlcounts || 0}
                  </span>
                </span>
                <span>
                  <hr className="h-[4px] w-[4px] rounded-full bg-neutral-100 opacity-100 dark:opacity-50" />
                </span>
                <span className="text-[gray] text-bold">
                  Max{" "}
                  <span className="text-white">
                    {whitelistinfo?.wlMintableMax || 0}
                  </span>{" "}
                  Token
                </span>
                <span>
                  <hr className="h-[4px] w-[4px] rounded-full bg-neutral-100 opacity-100 dark:opacity-50" />
                </span>
                <span className="text-[gray] text-bold">
                  Discount{" "}
                  <span className="text-white">
                    {whitelistinfo?.wlDiscountRate || 100}
                  </span>{" "}
                  %
                </span>
              </div>
              <hr className="h-[2px] w-full rounded-full bg-neutral-100 opacity-100 dark:opacity-50 mt-10" />

              <div className="flex justify-start mb-1 mt-5  mr-2 gap-3">
                <button
                  style={{ cursor: "pointer" }}
                  type="button"
                  className=" text-white bg-[#2E3F29] rounded-81xl px-4 sm:px-8 sm:px-5 py-2 text-center h-[auto] mr-3 md:mr-0  relative font-bold text-base"
                >
                  Public Mint
                </button>

                {saleMode === false &&
                  new Date().getTime() <
                  new Date(detailedCollectionInfo?.mintFinishDate).getTime() ? (
                  <span className=" text-sm md:text-md text-[#E7EC00] font-bold my-auto">
                    IN PROGRESS
                  </span>
                ) : (
                  <span className=" text-sm md:text-md text-[#FF0000] font-bold my-auto">
                    ENDED
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-[90%] flex flex-col mx-auto sm:mx-0 mt-8">
              <div className="heading">
                <b className="w-90% realtive mb-5 mx-auto sm:mx-0 text-md sm:text-md  leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                  Collection Preview
                </b>
                {availableItemsForMint?.length !== 0 ? (
                  <UpperSlider items={availableItemsForMint} />
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <h1>No Items</h1>
                  </div>
                )}
              </div>
            </div>
            {/* ----------third div------------- */}
            <div
              className={`nftInfo ${isMobile && "w-[full]"}`}
              id="grantParent"
            >
              <div id="parent" className="w-[90%] lg:md:w-full">
                <div className="heading">
                  <b className="relative leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                    NFT Information
                  </b>
                </div>
                <div className="rounded-3xl child">
                  <div className="subChild">
                    <div>Name</div>
                    <div className="text-center leading-5">
                      {detailedCollectionInfo?.name || ""}
                    </div>
                  </div>
                  <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-darkslategray-200" />
                  <div className="subChild">
                    <div>Total Minted</div>
                    <div>{totalMinted}</div>
                  </div>
                  <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-darkslategray-200" />
                  <div className="subChild">
                    <div>NFT Type</div>
                    <div>
                      {CATEGORIES.find(
                        (x) => x.value === detailedCollectionInfo?.category
                      )?.text || ""}
                    </div>
                  </div>
                </div>
              </div>

              <div id="parent" className="w-[90%] lg:md:w-full mt-10">
                <div className="heading ">
                  <b className="relative leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                    Schedule
                  </b>
                </div>
                <div className="rounded-3xl child">
                  <div className="subChild">
                    <div>Mint Start</div>
                    <div>
                      {new Date(
                        detailedCollectionInfo?.mintStartDate || Date.now()
                      )?.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-darkslategray-200" />
                  <div className="subChild">
                    <div>Mint Finish</div>
                    <div>
                      {detailedCollectionInfo?.mintFinishDate === "" ||
                        detailedCollectionInfo?.mintFinishDate === undefined
                        ? "---"
                        : new Date(
                          detailedCollectionInfo?.mintFinishDate
                        )?.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-darkslategray-200" />
                  <div className="subChild">
                    <div>WL Sale</div>
                    <div>
                      {detailedCollectionInfo?.flashSaleDate === "" ||
                        detailedCollectionInfo?.flashSaleDate === undefined
                        ? "---"
                        : new Date(
                          detailedCollectionInfo?.flashSaleDate
                        )?.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------forth div------------- */}
            <div className="relative w-[90%] h-auto flex flex-col flex-wrap m-auto  mt-10 ml ">
              <div className="heading">
                <b className=" leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                  Project Overview
                </b>
              </div>
              <div className="rounded-3xl bg-black shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] flex flex-col py-[26px] px-8 box-border items-center justify-center text-3xl m-auto mt-5">
                <div className="flex-1 relative w-[100%] text-sm sm:text-lg text-center">
                  <span>
                    {parse(detailedCollectionInfo?.overview || "No Overview")}
                  </span>
                  {/* <span className="text-lime-100"> read more...</span> */}
                </div>
              </div>
            </div>

            {/* ----------fifth div------------- */}
            <div className="relative  w-[90%] h-auto flex flex-col flex-wrap m-auto  mt-10 ">
              <div className="heading">
                <b className="relative leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                  Project Contact
                </b>
              </div>
              <div className="rounded-3xl bg-black shadow-[0px_16px_34px_rgba(51,_255,_0,_0.15),_0px_-16px_34px_rgba(51,_255,_0,_0.15),_0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] h-auto flex flex-row flex-wrap sm:flex-no-wrap box-border items-center justify-evenly gap-[15px] mt-5 p-5">
                {detailedCollectionInfo?.websiteURL !== "" && (
                  <a
                    href={`${detailedCollectionInfo?.websiteURL}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="relative overflow-hidden hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-7542.svg"
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                )}
                {detailedCollectionInfo?.yutubeURL !== "" && (
                  <a
                    href={detailedCollectionInfo?.yutubeURL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="relative overflow-hidden hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-75411.svg"
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                )}
                {detailedCollectionInfo?.discordURL !== "" && (
                  <a
                    href={detailedCollectionInfo?.discordURL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="relative hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-7539.svg"
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                )}
                {detailedCollectionInfo?.twitterURL !== "" && (
                  <a
                    href={detailedCollectionInfo?.twitterURL}
                    target="_blank"
                    rel="noreferrer "
                  >
                    <img
                      className="relative hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/twitter.png"
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                )}
                {detailedCollectionInfo?.websiteURL === "" &&
                  detailedCollectionInfo?.discordURL === "" &&
                  detailedCollectionInfo?.twitterURL === "" &&
                  detailedCollectionInfo?.yutubeURL === "" && (
                    <div className="flex-1 relative w-[100%] text-sm sm:text-lg text-center">
                      No contacts
                    </div>
                  )}
              </div>
            </div>

            {/* ----------sixth div------------- */}
            <div className="relative w-[90%] flex flex-col mx-auto sm:mx-0 mt-10 mynft">
              <div className="heading">
                <b className="w-90% realtive mb-5 mx-auto sm:mx-0 text-md sm:text-md  leading-[54px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]  text-[25px] md:text-[30px] lg:text-[38px] ">
                  My Minted NFTs
                </b>
                {myItemsOnConsideringColl?.length !== 0 ? (
                  <BottomSlider items={myItemsOnConsideringColl} />
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <h1>No Items</h1>
                  </div>
                )}
              </div>
            </div>

            {/* ----------seventh div------------- */}
            <div className="buttonsLastDiv lg:gap-[50px] md:gap-[20px] sm:gap-[10px] relative w-[90%] h-[auto] text-center text-xl leading-5 my-10 lg:md:my-20 ">
              <div
                className="buttonsLast rounded-81xl bg-lime-200 shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[50px] md:h-[62px] my-2 md:my-5 hover:animate-pulse transition-ease duration-90000"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (detailedCollectionInfo?.launchstate !== 2)
                    navigate(`/collectionItems/${collectionId}`);
                  else setOpenReturn(true);
                }}
              >
                Return to Collection
              </div>
              <div
                className="buttonsLast rounded-81xl bg-lime-200 shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[50px] md:h-[62px] my-2 md:my-5 hover:animate-pulse transition-ease duration-90000"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(`/launchpad`);
                }}
              >
                Return to Launchpad
              </div>
              {detailedCollectionInfo?.owner?._id === currentUser?._id &&
                detailedCollectionInfo?.launchstate === 0 && (
                  <div
                    className="buttonsLast rounded-81xl bg-lime-200 shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[50px] md:h-[62px]  my-2 md:my-5 hover:animate-pulse transition-ease duration-90000"
                    style={{ cursor: "pointer" }}
                    onClick={onConfirmToLaunch}
                  >
                    Confirm to Launch
                  </div>
                )}
            </div>
          </div>

          {/* ------------MID content end----------- */}
        </div>
        <div className="mt-20"></div>
      </div>

      {showMintModal && (
        <div className="inset-0 fixed top-0 left-0 walletPopUpBack p-6 lg:p-0">
          <div className="relative rounded-xl  bg-black  shadow-[0px_0px_10px_#33ff00_inset] text-white w-full md:w-[40%] pt-[13px] px-[5px] pb-[36px] flex flex-col justify-center items-center align-center">
            <div
              className="closeButton"
              onClick={() => setShowMintModal(false)}
            >
              <img className="" alt="" src="/assets/close.png" />
            </div>
            <div className="w-[90%] flex flex-col items-center justify-center">
              {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM && (
                <p className="text-gray-400 text-[10px] md:text-[15px]  balance">
                  Available Balance:
                  <span className="text-white ml-2">
                    {(balances[config.COIN_MINIMAL_DENOM] / 1000000).toFixed(4)}{" "}
                    Core
                  </span>
                </p>
              )}
              <div className="divider md:mb-[1rem] w-[90%]" />

              <div className="w-[100%] mt-[5px] mb-[15px] flex justify-around ">
                <div className="w-[45%] flex flex-col">
                  <div className="w-[100%] text-[12px] sm:text-[18px]">
                    Amount to Mint
                  </div>
                  <div className="w-[100%]">
                    <div
                      className="rounded-3xl bg-[#33ff0003] shadow-[0px_0px_18px_#33ff00_inset] h-[45px] mt-[10px] flex justify-around items-center

                      "
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="text-3xl pb-[5px]"
                        onClick={handleClickMinus}
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        -
                      </div>
                      <input
                        className="text-2xl bg-transparent w-1/3 border-none text-center "
                        type="text"
                        value={mintingCount || 0}
                        onKeyDown={handleKeyPress}
                        onChange={(e) =>
                          handleChangeMintingCount(e.target.value)
                        }
                      />
                      <div
                        className="text-3xl"
                        onClick={handleClickPlus}
                        style={{ cursor: "pointer", userSelect: "none" }}
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[45%] flex flex-col">
                  <div className="w-[100%] text-[12px] sm:text-[18px]">
                    Your Cost
                  </div>
                  <div className="w-[100%]">
                    <div
                      className="rounded-3xl bg-[#33ff0003] shadow-[0px_0px_18px_#33ff00_inset] h-[45px] mt-[10px] flex justify-around items-center"
                      style={{ userSelect: "none" }}
                    >
                      <div className="text-2xl">{totalMintingPrice}</div>
                    </div>
                  </div>
                  {myDiscountRate > 0 && (
                    <div className="border-[#33ff00] rounded-2xl w-full p-2">
                      You have benefit on discount rate {myDiscountRate} % for
                      an item. <br></br>Original cost is{" "}
                      {Number(
                        mintingCount *
                        (detailedCollectionInfo?.mintingPrice || 0)
                      )}
                      .
                    </div>
                  )}
                </div>
              </div>

              <div
                className=" rounded-3xl mb-0 lg:mb-2 text-center text-black bg-[#33ff00] w-full h-[40px] flex flex-col items-center justify-center text-2xl cursor-pointer"
                onClick={() => handleClickMint()}
              >
                Mint
              </div>
            </div>
          </div>
        </div>
      )}

      {openReturn && (
        <div className="inset-0 fixed top-0 left-0 walletPopUpBack p-6 lg:p-0 ">
          <div className="relative rounded-xl  bg-black  shadow-[0px_0px_10px_#33ff00_inset] text-white w-full md:w-[40%] pt-[13px] px-[5px] pb-[13px] flex flex-col justify-center items-center align-center">
            <div className="closeButton" onClick={() => setOpenReturn(false)}>
              <img className="" alt="" src="/assets/close.png" />
            </div>
            <div className="w-[90%] flex flex-col items-center justify-center">
              <div className="w-[100%]  mt-[15px] text-[20px] sm:text-[20px]">
                Are you sure you don't want to mint 1 more for a friend?
              </div>

              <div
                className={`flex justify-around w-full mt-[20px] gap-[10px] ${isMobile && "flex-col"
                  }`}
              >
                <div
                  className={`text-lg ${isMobile ? "w-full" : "w-[30%]"
                    } rounded-81xl bg-lime-200 shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[60px] md:h-[62px] my-2 md:my-5 hover:animate-pulse transition-ease duration-90000`}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setOpenReturn(false)}
                >
                  Mint
                </div>
                <div
                  className="text-lg rounded-81xl text-center bg-lime-200 shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[60px] md:h-[62px] my-2 md:my-5 hover:animate-pulse transition-ease duration-90000"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => {
                    navigate(`/collectionItems/${collectionId}`);
                  }}
                >
                  Take me to collection
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </MainSection>
  );
};

export default PageLaunchPad;