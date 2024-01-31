import Label from "components/StyleComponent/Label";
import { FC, useState, useEffect } from "react";
import ButtonPrimary from "components/Button/ButtonPrimary";
import { Helmet } from "react-helmet";
import { RadioGroup } from "@headlessui/react";
import NcImage from "components/NcComponent/NcImage";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeCollectionList,
  changeDetailedCollection,
  CollectionData,
  selectConllectionList,
} from "app/reducers/collection.reducers";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
  selectCurrentWallet,
} from "app/reducers/auth.reducers";
import { useNavigate } from "react-router-dom";
import {
  isEmpty,
  isValidXRPAddress,
  saveItemActivity,
  saveMultipleItemActivity,
} from "app/methods";
import {
  config,
  COREUM_PAYMENT_COINS,
  ITEM_ACTION_TYPES,
  PLATFORM_NETWORKS,
} from "app/config.js";
import {
  changeTradingResult,
  selectCurrentTradingResult,
} from "app/reducers/nft.reducers";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import Radio from "components/Button/Radio";
import { useSigningClient } from "app/cosmwasm";
import { FILE_TYPE } from "app/config.js";
import {
  UPLOADING_FILE_TYPES,
  pinUpdatedJSONDirectoryToNFTStorage,
  storeNFT,
  storeSingleNFT,
} from "utils/pinatasdk";
import {
  isSupportedEVMNetwork,
  isSupportedNetwork,
} from "InteractWithSmartContract/interact";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import axios from "axios";
import { convertStringToHex } from "xrpl";
import { xumm } from "utils/xummsdk";

export interface PageUploadItemProps {
  className?: string;
}

const fileCategories = [
  { value: 0, text: "All" },
  { value: 1, text: "Image" },
  { value: 2, text: "Audio" },
  { value: 3, text: "Video" },
  { value: 4, text: "3D file" },
];

const PaymentPayloadViewer = ({ payload }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [runtime, setRuntime] = useState();

  useEffect(() => {
    if (/Mobi/.test(navigator.userAgent)) {
      setIsMobile(true);
    }
    xumm.then((xummSDK) => {
      setRuntime((xummSDK as any).runtime);
    });
  }, []);

  /**
   * only when on a mobile webapp and the user is not in the xumm app
   * do we want to show the link to open the xumm app
   *
   * @param {*} uuid
   * @param {*} runtime
   */
  const handleSignPopup = async (uuid, runtime) => {
    if (isMobile && runtime.browser && !runtime.xapp) {
      window.location.href = `https://xumm.app/sign/${uuid}`;
    }
  };

  return (
    <>
      {payload && (
        <div className="flex flex-col">
          {payload.refs && payload.refs.qr_png && (
            <div className="flex flex-col w-full justify-center">
              <div className="text-white text-2xl font-mono w-full text-center flex justify-center">
                <img
                  className="w-96 rounded"
                  src={payload.refs.qr_png}
                  alt="qr_code"
                />
              </div>
              <div className="my-5 text-md text-center">
                Scan this QR with Xumm
              </div>
            </div>
          )}

          {payload.refs && isMobile && (
            <div
              onClick={() => handleSignPopup(payload.uuid, runtime)}
              className="btn-common bg-green-800 text-white uppercase"
            >
              Sign in XUMM
            </div>
          )}
        </div>
      )}
    </>
  );
};

const PageUploadItem: FC<PageUploadItemProps> = ({ className = "" }) => {
  const currentUsr = useAppSelector(selectCurrentUser);
  const collections = useAppSelector(selectConllectionList);
  const tradingResult = useAppSelector(selectCurrentTradingResult);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const currentWallet = useAppSelector(selectCurrentWallet);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selected, setSelected] = useState({ name: "", _id: "", address: "" });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [collectionId, setCollectionId] = useState("");

  const [colls, setColls] = useState(Array<CollectionData>);
  const [coreumPaymentCoin, setCoreumPaymentCoin] = useState(
    COREUM_PAYMENT_COINS.CORE
  );
  const [working, setWorking] = useState(false);
  const { collectionConfig, batchMint, balances }: any = useSigningClient();
  const [fileCategory, setFileCategory] = useState(1); //0: image, 1: music, 2: video

  const [paymentPayload, setPaymentPayload] = useState(null);
  const [explictContent, setExplicitContent] = useState(false);
  const [jsonFileList, setJsonFileList] = useState([]);
  const [imageNameList, setImageNameList] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);
  const [previewPath, setPreviewPath] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [cidMetaData, setCidMetaData] = useState("");
  const [cidNFTData, setCidNFTData] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const handleExplicityContent = (e) => {
    setExplicitContent(e.target.checked);
  };
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    if (collections && collections.length > 0) {
      let tempOptions: any = [];
      collections.map((coll) => {
        if (
          currentNetworkSymbol === PLATFORM_NETWORKS.COREUM &&
          coll.collectionNumber &&
          coll.collectionNumber >= 0
        ) {
          tempOptions.push({
            _id: coll?._id || "",
            name: coll?.name || "",
            logoURL: coll?.logoURL || "",
            address: coll?.address || "",
            cw721address: coll?.cw721address || "",
            collectionNumber: coll?.collectionNumber || "",
          });
        } else {
          tempOptions.push({
            _id: coll?._id || "",
            name: coll?.name || "",
            logoURL: coll?.logoURL || "",
            address: coll?.address || "",
            cw721address: coll?.cw721address || "",
            collectionNumber: coll?.collectionNumber || "",
          });
        }
      });
      setColls(tempOptions);
    }
  }, [collections]);

  useEffect(() => {
    if (currentUsr?._id) {
      axios
        .post(
          `${config.API_URL}api/collection/getUserCollections`,
          {
            limit: 90,
            userId: currentUsr?._id,
            connectedNetworkSymbol: currentNetworkSymbol,
          },
          {
            headers: {
              "x-access-token": localStorage.getItem("jwtToken"),
            },
          }
        )
        .then((result) => {
          dispatch(changeCollectionList(result.data.data));
        })
        .catch((err: any) => {
          console.log("error getting collections : ", err);
        });
    }
  }, [currentUsr]);

  useEffect(() => {
    if (tradingResult) {
      switch (tradingResult.function) {
        default:
          break;
        case "singleMintOnSale":
          dispatch(
            changeTradingResult({ function: "", success: false, message: "" })
          );
          if (tradingResult.success === false)
            toast.error(tradingResult.message);
          break;
        case "batchMintOnSale":
          dispatch(
            changeTradingResult({ function: "", success: false, message: "" })
          );
          if (tradingResult.success === false)
            toast.error(tradingResult.message);
          break;
      }
    }
  }, [tradingResult]);

  const selPreviewFile = async (event: any) => {
    var file = event.target.files[0];
    if (file === null) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.warn("Image file size should be less than 100MB");
      return;
    }

    setPreviewFile(file);
    setPreviewFileName(file.name);

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {};
    reader.onerror = function (error: any) {
      console.log("banner file choosing error : ", error);
    };
  };

  const checkNativeCurrencyAndTokenBalances = async (tokenAmountShouldPay) => {
    if (
      balances[config.COIN_MINIMAL_DENOM] <= 0 ||
      (tokenAmountShouldPay > 0 && balances.cw20 <= tokenAmountShouldPay)
    ) {
      toast.warn("Insufficient CORE or RIZE");
      return false;
    }
    return true;
  };

  useEffect(() => {
    setCollectionId((selected as any)._id || "");
  }, [selected]);

  const createItem = async () => {
    if (!uploaded) {
      toast.warn("Please upload NFTs and try again.");
      return;
    }
    if (isSupportedNetwork(currentNetworkSymbol) === false) {
      toast.warn(
        "Please connect your wallet to a network we support and try again."
      );
      return;
    }
    if (isEmpty(currentUsr)) {
      toast.warn("Please log in first.");
      return;
    }

    if (isEmpty(selected) || selected.name === "") {
      toast.warn("Please select a collection and try again.");
      return;
    }
    setWorking(true);
    try {
      setWorking(true);
      if (imageFileList.length > 0) {
        let paths = [];
        let uris = [];
        let nameList = [];
        let descList = [];
        let logoList = [];
        let metas = [];
        let colllectionInfo = await collectionConfig(selected.address);
        let startId = colllectionInfo.unused_token_id;
        setWorking(true);

        for (var i = 0; i < imageFileList.length; i++) {
          paths.push(cidNFTData + "/" + imageFileList[i].name);
          uris.push("ipfs://" + cidMetaData + "/" + imageNameList[i].name);
          logoList.push(
            fileCategory !== FILE_TYPE.IMAGE
              ? previewPath.replace("ipfs://", "")
              : `${cidNFTData + "/" + imageFileList[i].name}`
          );
        }

        for (var j = 0; j < jsonFileList.length; j++) {
          var json = JSON.parse(jsonFileList[j]);
          nameList.push(json.name || `#${j}`);
          descList.push(json.description || "");
          metas.push(json.attributes);
        }

        const params = {
          nameList: nameList,
          itemMusicURL: paths,
          itemLogoURL: logoList,
          descList: descList,
          collectionId: selected?._id || "",
          creator: currentUsr?._id || "",
          owner: currentUsr?._id || "",
          fileType: fileCategory,
          isSale: 0,
          price: 0,
          auctionPeriod: 0,
          stockAmount: 1,
          metaData: metas,
          timeLength: 0,
          stockGroupId: new Date().getTime(),
          chainId: currentNetworkSymbol || 1,
          metadataURIs: uris,
          networkSymbol: currentNetworkSymbol || 1,
          coreumPaymentUnit: coreumPaymentCoin,
          explicitContent: explictContent,
        };

        if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
          try {
            let balanceCheck = await checkNativeCurrencyAndTokenBalances(0);
            if (balanceCheck === false) {
              toast.error("Insufficient balance!");
              setWorking(false);
            }
            let txHash = await batchMint(
              currentUsr.address,
              selected.address,
              uris,
              nameList,
              descList,
              paths,
              logoList,
              metas
            );
            if (txHash === -1) {
              setWorking(false);
              toast.error("Failed to transact.");
            } else {
              await axios
                .post(`${config.API_URL}api/item/multiple_create`, {
                  params,
                })
                .then(async function (response) {
                  const IdArray = [...response.data];
                  let paramsActs = {
                    items: IdArray,
                    origin: currentUsr?._id,
                    transactionHash: txHash,
                    actionType: ITEM_ACTION_TYPES.MINTED,
                  };
                  saveMultipleItemActivity(paramsActs);
                  axios
                    .post(`${config.API_URL}api/item/updateTokenIds`, {
                      idArray: IdArray,
                      startTokenId: startId,
                    })
                    .then((response) => {
                      if (response.data.code === 0) {
                        toast.success("You've created NFTs sucessfully.");
                        navigate(`/collectionItems/${collectionId}`);
                        setWorking(false);
                      } else {
                        setWorking(false);
                        toast.error("Update Token Ids error.");
                        axios
                          .post(`${config.API_URL}api/item/deleteManyByIds`, {
                            idArray: IdArray,
                            collId: params.collectionId || "",
                          })
                          .then(() => {})
                          .catch((error) => {
                            console.log(error);
                          });
                      }
                    });
                })
                .catch(() => {
                  toast.error("Create Catch Failed!");
                  setWorking(false);
                });
            }
          } catch (error) {
            toast.error("Try Failed!");
            setWorking(false);
          }
        } else if (isSupportedEVMNetwork(currentNetworkSymbol) === true) {
          await axios
            .post(`${config.API_URL}api/item/multiple_create`, {
              params,
              nameList,
              paths,
              metas,
            })
            .then(async function (response) {
              if (response.status === 200) {
                toast.success("You've created NFTs sucessfully.");
                setWorking(false);
                navigate(`/collectionItems/${collectionId}`);
              } else {
                toast.error("Failed!");
                setWorking(false);
              }
            })
            .catch(() => {
              toast.error("Failed!");
              setWorking(false);
            });
        } else if (currentNetworkSymbol === PLATFORM_NETWORKS.XRPL) {
          setWorking(true);
          const accountInfo = (
            await axios.post(`${config.API_URL}api/item/getAccountInfo`, {
              wallet: currentWallet,
            })
          )?.data?.data;
          if (isEmpty(accountInfo) === false) {
            const my_sequence = accountInfo.result.account_data.Sequence;
            const nftokenCount = paths.length;
            const ticketTransaction = {
              TransactionType: "TicketCreate",
              Account: currentWallet,
              TicketCount: nftokenCount,
              Sequence: my_sequence,
            };

            if (!isValidXRPAddress(currentWallet)) {
              toast.error("Invalid connected address");
              return;
            } else {
              console.log("Creating payload");
              xumm
                .then(async (xummSDK) => {
                  const paymentPayload = {
                    txjson: ticketTransaction,
                  };
                  try {
                    const pong = await xummSDK.ping();
                    console.log(pong.application);

                    const payloadResponse =
                      await xummSDK.payload.createAndSubscribe(
                        paymentPayload as any,
                        (event) => {
                          console.log("event subscription", event.data);

                          if (event.data.signed === true) {
                            console.log(
                              "Woohoo! The sign request was signed :)"
                            );
                            setPaymentPayload(null);
                            return event.data;
                          }

                          if (event.data.signed === false) {
                            console.log("The sign request was rejected :(");
                            toast.error("User rejected wallet sign! ");
                            setWorking(false);
                            setPaymentPayload(null);
                            return false;
                          }
                        }
                      );

                    setPaymentPayload(payloadResponse.created);
                    const resolveData = await payloadResponse.resolved;

                    if ((resolveData as any).signed === false) {
                      console.log("The sign request was rejected :(");
                      toast.error("User rejected wallet sign! ");
                      setWorking(false);
                      return;
                    }

                    if ((resolveData as any).signed === true) {
                      console.log("Woohoo! The sign request was signed :)");

                      const result = await xummSDK.payload.get(
                        (resolveData as any).payload_uuidv4
                      );
                      console.log(
                        "User token:",
                        result.application.issued_user_token
                      );
                      console.log("On ledger TX hash:", result.response.txid);

                      //ask tickets to backend
                      const ticketsResponse = (
                        await axios.post(
                          `${config.API_URL}api/item/getTickets`,
                          {
                            wallet: currentWallet,
                          }
                        )
                      )?.data?.data;
                      if (isEmpty(ticketsResponse) === false) {
                        let tickets = [];

                        for (let i = 0; i < nftokenCount; i++) {
                          tickets[i] =
                            ticketsResponse.result.account_objects[
                              i
                            ].TicketSequence;
                        }

                        for (let i = 0; i < nftokenCount; i++) {
                          const transactionBlob = {
                            TransactionType: "NFTokenMint",
                            Account: currentWallet,
                            URI: convertStringToHex(uris[i]),
                            Flags: 9,
                            TransferFee: 2500,
                            Sequence: 0,
                            TicketSequence: tickets[i],
                            LastLedgerSequence: null,
                            NFTokenTaxon: 0,
                          };
                          xumm.then(async (xummSDK) => {
                            const paymentPayload = {
                              txjson: transactionBlob,
                            };
                            try {
                              const pong = await xummSDK.ping();
                              console.log(pong.application);

                              const payloadResponse =
                                await xummSDK.payload.createAndSubscribe(
                                  paymentPayload as any,
                                  (event) => {
                                    console.log(
                                      "event subscription",
                                      event.data
                                    );

                                    if (event.data.signed === true) {
                                      console.log(
                                        "Woohoo! The sign request was signed :)"
                                      );
                                      setPaymentPayload(null);
                                      return event.data;
                                    }

                                    if (event.data.signed === false) {
                                      console.log(
                                        "The sign request was rejected :("
                                      );
                                      toast.error(
                                        "User rejected wallet sign! "
                                      );
                                      setWorking(false);
                                      setPaymentPayload(null);
                                      return false;
                                    }
                                  }
                                );

                              setPaymentPayload(payloadResponse.created);
                              const resolveData =
                                await payloadResponse.resolved;

                              if ((resolveData as any).signed === false) {
                                toast.error("User rejected wallet sign! ");
                                setWorking(false);
                                return;
                              }
                              if ((resolveData as any).signed === true) {
                                const result = await xummSDK.payload.get(
                                  (resolveData as any).payload_uuidv4
                                );
                                console.log(
                                  "User token:",
                                  result.application.issued_user_token
                                );
                                console.log(
                                  "On ledger TX hash:",
                                  result.response.txid
                                );

                                let txHash = result.response.txid;
                                await axios({
                                  method: "post",
                                  url: `${config.API_URL}api/item/create`,
                                  data: {
                                    itemName: nameList[i],
                                    itemMusicURL: paths[i],
                                    itemLogoURL:
                                      fileCategory !== FILE_TYPE.IMAGE
                                        ? logoList[i]
                                        : paths[i],
                                    itemDescription: descList[i],
                                    collectionId: selected?._id,
                                    creator: currentUsr?._id,
                                    owner: currentUsr?._id,
                                    fileType: fileCategory,
                                    isSale: 0,
                                    price: 0,
                                    auctionPeriod: 0,
                                    stockAmount: 0,
                                    metaData: [],
                                    mutiPaths: [],
                                    timeLength: 0,
                                    stockGroupId: new Date().getTime(),
                                    chainId: currentNetworkSymbol,
                                    metadataURI: uris[i],
                                    networkSymbol: currentNetworkSymbol,
                                    coreumPaymentUnit: coreumPaymentCoin,
                                    latestTxHash: txHash,
                                  },
                                })
                                  .then(async function (response: any) {
                                    if (response.status === 200) {
                                      const newItemId = response.data._id;

                                      toast.success(
                                        <div>Successfully created an item.</div>
                                      );
                                      let paramAct = {
                                        item: newItemId,
                                        origin: currentUsr?._id,
                                        transactionHash: txHash,
                                        actionType: ITEM_ACTION_TYPES.MINTED,
                                      };
                                      saveItemActivity(paramAct);
                                    } else {
                                      toast.error(
                                        "Failed in creating an item."
                                      );
                                    }
                                  })
                                  .catch(() => {
                                    toast.error("Failed in creating an item.");
                                  });
                              }
                            } catch (error) {}
                          });
                        }
                      }
                    }
                  } catch (e) {
                    toast.error("Failed! ");
                    setWorking(false);
                  }
                })
                .catch(() => {
                  toast.error("Failed! ");
                  setWorking(false);
                });
            }
          }
        }
      }
      setWorking(false);
    } catch (error) {
      toast.error("Network error");
      setWorking(false);
      return;
    }
  };

  const handleSelectJsonsFolder = async (filelist: any) => {
    setImageNameList(filelist);
    let updatingJSONList = [];
    for (let i = 0; i < filelist.length; i++) {
      const file = filelist[i];
      // Read the file
      const fileContent = await file.text();
      updatingJSONList.push(fileContent);
    }
    setJsonFileList(updatingJSONList);
  };

  const handleSelectImagesFolder = (filelist) => {
    setImageFileList(filelist);
  };

  const updateJson = (json, replsceImgStr, previewPath) => {
    let updated = json;
    updated["image"] = replsceImgStr;
    updated["previewImage"] = previewPath;
    return updated;
  };

  const applyForMinting = async (newJsonFolderCID) => {
    if (collectionId && newJsonFolderCID) {
      if (collectionId?.toString()?.length === 24) {
      } else {
        return;
      }
      setWorking(true);
      const response = await axios.get(
        `${config.ipfsGateway}${newJsonFolderCID}`
      );

      let fethedStr = response.data.toString();
      let itemCount = fethedStr.split("<tr>").length - 2;

      axios
        .post(`${config.API_URL}api/collection/updateWithJsonCID`, {
          collId: collectionId,
          jsonFolderCID: newJsonFolderCID || "",
          totalItemNumberInCID: itemCount,
        })
        .then((response) => {
          if (response.data.code === 0) {
            //fetch collection name ,

            setTimeout(() => {
              if (collectionId?.toString()?.length === 24) {
              } else {
                setWorking(false);
                return;
              }
              axios
                .post(`${config.API_URL}api/collection/detail`, {
                  id: collectionId,
                })
                .then((response) => {
                  if (response.data.code === 0) {
                    let updatedColl = response.data.data;
                    dispatch(changeDetailedCollection(updatedColl));
                    setTimeout(() => {
                      // refreshWithNotMintedItems();
                      setUploaded(true);
                      setWorking(false);
                    }, 300);
                  }
                })
                .catch(() => {
                  setWorking(false);
                });
            }, 100);
          }
        })
        .catch(() => {
          setWorking(false);
        });
    }
  };
  const handleUploadAll = async () => {
    if (!collectionId || collectionId.toString().length !== 24) {
      toast.warn("Please select a collection and try again.");
      return;
    }
    if (imageFileList?.length === 0 || jsonFileList?.length === 0) {
      toast.error("Please select nfts and try again.");
      return;
    }
    if (
      imageFileList?.length > config.MAXIMUM_UPLOAD &&
      jsonFileList?.length > config.MAXIMUM_UPLOAD
    ) {
      toast.error(
        `You can't upload more than ${config.MAXIMUM_UPLOAD} files at a time.`
      );
      return;
    }
    if (fileCategory > 1 && previewFile === null) {
      toast.warn("Please select a preview image and try again.");
      return;
    }
    if (imageFileList?.length > 0 && jsonFileList?.length > 0) {
      if (imageFileList?.length !== jsonFileList?.length) {
        toast.error("Number of image files and json files should be equal");
        return;
      }
    }
    if (imageFileList?.length > 0) {
      setWorking(true);

      let cid = await storeNFT(imageFileList);
      var uploadedBannerPath = "";
      if (fileCategory !== FILE_TYPE.IMAGE) {
        uploadedBannerPath = await storeSingleNFT(previewFile);
      }
      if (cid !== null) {
        setCidNFTData(cid);
        var updatedJsonList = [];
        for (let idx = 0; idx < jsonFileList.length; idx++) {
          const json = JSON.parse(jsonFileList[idx]);
          const updatedJson = updateJson(
            json,
            `ipfs://${cid}/${imageFileList[idx].name}`,
            uploadedBannerPath
          );

          const updatedFileContent = JSON.stringify(updatedJson);
          updatedJsonList.push(updatedFileContent);
        }

        if (updatedJsonList?.length > 0) {
          setWorking(true);
          let cidOfJsonFolder = await pinUpdatedJSONDirectoryToNFTStorage(
            imageNameList,
            updatedJsonList,
            UPLOADING_FILE_TYPES.JSON
          );
          if (cidOfJsonFolder !== null) {
            toast.success(
              `You've uploaded a folder of json files to Rize2Day Pindata store.\n
             You can go on minting with new CID.`
            );
            setCidMetaData(cidOfJsonFolder);
            setPreviewPath(uploadedBannerPath);
            setTimeout(() => {
              applyForMinting(cidOfJsonFolder);
              setWorking(false);
            }, 200);
          }
          setWorking(false);
        }
      }
      setWorking(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create NFTs || Rize2Day </title>
      </Helmet>
      <div
        className={`nc-PageUploadItem ${className}`}
        data-nc-id="PageUploadItem"
      >
        <div className="container">
          <div className="max-w-4xl mx-auto my-12 space-y-8 sm:lg:my-16 lg:my-24 sm:space-y-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Create New NFTs
              </h2>
              <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                You can set preferred display name, create your profile URL and
                manage other personal settings.
              </span>
            </div>
            <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-600"></div>
            <div>
              <Label>Choose collection</Label>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Choose an exiting collection or create a new one. If you don't
                have any collection please click here to go to{" "}
                <span
                  onClick={() => navigate("/createCollection")}
                  className="text-[#33ff00] cursor-pointer"
                >
                  create a collection
                </span>
                .
              </div>
              <RadioGroup value={selected} onChange={setSelected}>
                <RadioGroup.Label className="sr-only">
                  Server size
                </RadioGroup.Label>
                <div className="flex py-2 space-x-4 overflow-auto customScrollBar pl-3">
                  {colls.map((plan, index) => (
                    <RadioGroup.Option
                      key={index}
                      value={plan}
                      className={({ active, checked }) =>
                        `${
                          active
                            ? "ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-60"
                            : ""
                        }
                          ${
                            checked
                              ? "bg-teal-600 text-white"
                              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }
                          relative flex-shrink-0 w-44 rounded-xl border border-neutral-200 dark:border-neutral-600 px-6 py-5 cursor-pointer flex focus:outline-none `
                      }
                    >
                      {({ checked }) => (
                        <>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <div className="text-sm">
                                <div className="flex items-center justify-between">
                                  <RadioGroup.Description
                                    as="div"
                                    className={"rounded-full w-16"}
                                  >
                                    <NcImage
                                      containerClassName="aspect-w-1 aspect-h-1 rounded-full overflow-hidden"
                                      src={plan?.logoURL}
                                      isLocal={true}
                                    />
                                  </RadioGroup.Description>
                                  {checked && (
                                    <div className="flex-shrink-0 text-white">
                                      <CheckIcon className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <RadioGroup.Label
                                  as="p"
                                  className={`font-semibold mt-3  ${
                                    checked ? "text-white" : ""
                                  }`}
                                >
                                  {plan?.name.substring(0, 10) + "..." || ""}
                                </RadioGroup.Label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-600"></div>
            <h3 className="text-lg font-semibold sm:text-2xl ">
              Item category
            </h3>
            <div className=" overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-[#191818] border border-neutral-200 dark:border-neutral-600">
              <div className="relative flex px-1 md:px-5 py-6 space-x-1 md:space-x-10 justify-around">
                {fileCategories.map((item, index) => {
                  if (index > 0)
                    return (
                      <div key={index} className="">
                        <Radio
                          id={item.text}
                          name="radioFileCategories"
                          label={item.text}
                          defaultChecked={fileCategory === index}
                          onChange={(checked) => {
                            if (Boolean(checked) === true) {
                              setFileCategory(index);
                              setImageFileList([]);
                              setImageNameList([]);
                              setJsonFileList([]);
                              setPreviewFile(null);
                            }
                          }}
                        />
                      </div>
                    );
                })}
              </div>
            </div>
            <div className="mt-12 space-y-5 md:mt-0 sm:space-y-6 md:sm:space-y-8">
              <div>
                <h3 className="text-lg font-semibold sm:text-2xl">
                  {fileCategory === 1
                    ? "Image Files"
                    : fileCategory === 2
                    ? "Audio Files"
                    : fileCategory === 3
                    ? "Video Files"
                    : "3D Files"}
                </h3>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {fileCategory === 1
                    ? "File types supported: PNG, JPEG, GIF, WEBP"
                    : fileCategory === 2
                    ? "File types supported: MP3"
                    : fileCategory === 3
                    ? "File types supported: MP4"
                    : "File types supported: GLB"}
                </span>
                <div className="mt-5 ">
                  <div
                    className={`relative ${
                      isMobile ? "flex-col gap-[10px]" : "flex justify-evenly"
                    } items-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed border-neutral-300 dark:border-neutral-6000 rounded-xl`}
                  >
                    {uploaded ? (
                      <span className="text-[#33ff00]">
                        {` ${imageFileList?.length} NFTs and ${imageFileList?.length} JSON files have been uploaded to IPFS successfully `}
                      </span>
                    ) : (
                      <>
                        <div className="relative flex flex-col justify-center items-center gap-[30px]">
                          <img
                            className="relative w-[40px] h-[40px] overflow-hidden shrink-0"
                            alt=""
                            src="/assets/upload.png"
                          />
                          <label
                            htmlFor="image_upload"
                            className="font-medium rounded-md cursor-pointer text-primary-6000 transition hover:text-primary-500  absolute top-0 left-10 z-5  w-10/12 h-[100px]"
                          >
                            <input
                              id="image_upload"
                              type="file"
                              multiple={true}
                              className="z-0 hidden"
                              onChange={(e) =>
                                handleSelectImagesFolder(e.target.files)
                              }
                            />
                          </label>
                          <div className="relative">
                            <p className="m-0">{`Upload nfts up-to `}</p>
                            <p className="m-0">
                              {imageFileList?.length > 0
                                ? `${imageFileList?.length} files`
                                : `500 files here...`}
                            </p>
                          </div>
                        </div>
                        <div className="relative flex flex-col justify-center items-center gap-[30px]">
                          <img
                            className="relative w-[40px] h-[40px] overflow-hidden shrink-0"
                            alt=""
                            src="/assets/upload.png"
                          />
                          <label
                            htmlFor="json_upload"
                            className="font-medium rounded-md cursor-pointer text-primary-6000 transition hover:text-primary-500  absolute top-0 left-10 z-5  w-10/12 h-[100px]"
                          >
                            <input
                              id="json_upload"
                              type="file"
                              multiple={true}
                              className="z-0 hidden"
                              onChange={(e) =>
                                handleSelectJsonsFolder(e.target.files)
                              }
                            />
                          </label>
                          <div className="relative">
                            <p className="m-0">{`Upload json up-to `}</p>
                            <p className="m-0">
                              {jsonFileList?.length > 0
                                ? `${jsonFileList?.length} files`
                                : `500 files here...`}
                            </p>
                          </div>
                        </div>
                        <div className="text-xl overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 flex flex-col justify-center items-center">
                          <div
                            className=" rounded-3xl bg-[rgba(51, 255, 0, 0.01)] hover:bg-[#23ad00]  shadow-[0px_0px_28px_#33ff00_inset] animate-pulse transition-1s duration-90000 flex flex-row items-center justify-center text-center text-lg  
                            w-[200px] h-[60px] mt-4 text-white"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUploadAll()}
                          >
                            Upload NFTs
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {fileCategory > 1 && (
                <div>
                  <h3 className="text-lg font-semibold sm:text-2xl">
                    Preview Image or Video
                  </h3>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    File types supported: PNG, JPEG, GIF, WEBP, MP4
                  </span>
                  <div className="mt-5 ">
                    <div className="relative flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed border-neutral-300 dark:border-neutral-6000 rounded-xl">
                      <div className="space-y-1 text-center">
                        <svg
                          className="w-12 h-12 mx-auto text-neutral-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                        <div className="flex justify-center text-sm text-center text-neutral-6000 dark:text-neutral-300">
                          <span>Upload a preview image or video</span>
                          <label
                            htmlFor="file-upload"
                            className="font-medium rounded-md cursor-pointer text-primary-6000 transition hover:text-primary-500 hover:bg-black/5 absolute top-0 left-0 w-full h-full"
                          >
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".png,.jpeg,.jpg,.gif,.webp,.mp4"
                              onChange={selPreviewFile}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {previewFile && (
                            <span className="text-[#33ff00]">{`You've selected preview file: ${previewFileName}`}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM && (
                <>
                  <h3 className="text-lg font-semibold sm:text-2xl ">
                    Payment Coin/Token
                  </h3>
                  <div className=" overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-[#191818] border border-neutral-200 dark:border-neutral-600">
                    <div className="relative flex px-5 py-6 space-x-10 justify-around">
                      <Radio
                        id={"CORE"}
                        name="coreumPaymentCoins"
                        label={"CORE"}
                        defaultChecked={
                          coreumPaymentCoin === COREUM_PAYMENT_COINS.CORE
                        }
                        onChange={(checked) => {
                          if (Boolean(checked) === true)
                            setCoreumPaymentCoin(COREUM_PAYMENT_COINS.CORE);
                        }}
                      />
                      <Radio
                        id={"RIZE"}
                        name="coreumPaymentCoins"
                        label={"RIZE"}
                        defaultChecked={
                          coreumPaymentCoin === COREUM_PAYMENT_COINS.RIZE
                        }
                        disabled={true}
                        onChange={(checked) => {
                          if (Boolean(checked) === true)
                            setCoreumPaymentCoin(COREUM_PAYMENT_COINS.RIZE);
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="flex mt-5 ml-0 mb-5 items-center gap-[10px]">
                <input
                  type="checkbox"
                  checked={explictContent}
                  onChange={handleExplicityContent}
                />
                <Label>Explicit content</Label>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 ml-10">
                  Check if the content is for audiences over 18.{" "}
                </div>
              </div>
              <div className="flex flex-col pt-2 space-x-0 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 ">
                <ButtonPrimary
                  className="flex-1"
                  onClick={() => {
                    createItem();
                  }}
                >
                  Create NFTs
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>

      {paymentPayload ? (
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
      )}
    </>
  );
};

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PageUploadItem;
