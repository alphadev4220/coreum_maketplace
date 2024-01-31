import Label from "components/StyleComponent/Label";
import { FC, useState, useEffect, useRef } from "react";
import ButtonPrimary from "components/Button/ButtonPrimary";
import Input from "components/StyleComponent/Input";
import { Helmet } from "react-helmet";
import FormItem from "components/StyleComponent/FormItem";
import { RadioGroup } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeCollectionList,
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
  hasKey,
  isEmpty,
  isValidXRPAddress,
  saveItemActivity,
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
import Checkbox from "@mui/material/Checkbox";
import { useSigningClient } from "app/cosmwasm";
import { FILE_TYPE } from "app/config.js";
import {
  pinJSONToNFTStorage,
  storeSingleNFT,
} from "utils/pinatasdk";
import {
  isSupportedEVMNetwork,
  isSupportedNetwork,
} from "InteractWithSmartContract/interact";
import { parseBlob } from "music-metadata-browser";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { MdCloudUpload } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import NcImage from "components/NcComponent/NcImage";
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
  const fileInputRef = useRef(null);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [selected, setSelected] = useState({ name: "", _id: "", address: "" });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionId, setCollectionId] = useState("");
  const [selectedMusicFileName, setSelectedMusicFileName] = useState("");
  const [selectedMusicFile, setSelectedMusicFile] = useState(null);

  const [metaData, setMetaData] = useState([]);
  const [metaList, setMetaList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [colls, setColls] = useState(Array<CollectionData>);
  const [timeLength, setTimeLength] = useState(0);
  const [working, setWorking] = useState(false);
  const [coreumPaymentCoin, setCoreumPaymentCoin] = useState(
    COREUM_PAYMENT_COINS.CORE
  );
  const { mintNFT, collectionConfig, balances }: any = useSigningClient();
  const [fileCategory, setFileCategory] = useState(1); //0: image, 1: music, 2: video
  const [paymentPayload, setPaymentPayload] = useState(null);
  const [explictContent, setExplicitContent] = useState(false);

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

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setTextDescription(
      draftToHtml(convertToRaw(editorState.getCurrentContent())) || ""
    );
  };

  const handleCheckFieldChange = (event, index) => {
    const metaTemp = metaList;
    metaTemp[index].disabled = !event.target.checked;
    setMetaList(metaTemp);
    setRefresh(!refresh);
  };

  const handleChangeText = (e, index) => {
    const metaTemp = metaList;
    metaTemp[index].value = e.target.value;
    setMetaList(metaTemp);
    setRefresh(!refresh);
  };

  const changeFile = async (event: any) => {
    var file = event.target.files[0];
    if (file === null) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.warn("Image file size should be less than 100MB");
      return;
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
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

  const newSaveItem = async (params: any) => {
    setWorking(true);
    if (isSupportedEVMNetwork(currentNetworkSymbol) === true) {
      axios({
        method: "post",
        url: `${config.API_URL}api/item/create`,
        data: params,
      })
        .then(async function (response: any) {
          if (response.status === 200) {
            setWorking(false);

            toast.success(
              <div>
                Successfully created an item. You can see items at{" "}
                <span
                  style={{ color: "#00f" }}
                  onClick={() => navigate(`/collectionItems/${collectionId}`)}
                >
                  here
                </span>
              </div>
            );
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
    } else if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
      try {
        let colllectionInfo = await collectionConfig(selected.address);
        const unusedTokenId = colllectionInfo.unused_token_id;
        let balanceCheck = await checkNativeCurrencyAndTokenBalances(0);
        if (balanceCheck === false) {
          setWorking(false);
          toast.error("Insufficient balance!");
          return;
        }

        const txHash = await mintNFT(
          currentUsr.address,
          selected.address,
          params.itemName,
          textDescription,
          metaList,
          params.itemMusicURL,
          params.itemLogoURL,
          "ipfs://" + params.metadataURI
        );
        if (txHash !== -1) {
          axios({
            method: "post",
            url: `${config.API_URL}api/item/create`,
            data: params,
          }).then(async function (response: any) {
            if (response.data.code === 0) {
              const newItemId = response.data.data._id;
              await axios
                .post(`${config.API_URL}api/item/updateTokenId`, {
                  itemId: newItemId,
                  tokenId: unusedTokenId,
                })
                .then((response) => {
                  if (response.data.code === 0) {
                    setWorking(false);

                    toast.success(
                      <div>
                        Successfully created an item. You can see items at{" "}
                        <span
                          style={{ color: "#00f" }}
                          onClick={() =>
                            navigate(`/collectionItems/${params.collectionId}`)
                          }
                        >
                          here
                        </span>
                      </div>
                    );

                    let paramsAct = {
                      item: newItemId,
                      origin: currentUsr?._id,
                      transactionHash: txHash,
                      actionType: ITEM_ACTION_TYPES.MINTED,
                    };
                    saveItemActivity(paramsAct);
                    navigate(`/collectionItems/${collectionId}`);
                  } else {
                    toast.error("Update Token Item Sever Error!");
                    setWorking(false);
                    axios
                      .post(`${config.API_URL}api/item/deleteManyByIds`, {
                        idArray: [newItemId],
                        collId: params.collectionId || "",
                      })
                      .then(() => {})
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                });
            } else {
              toast.error("Create Item Sever Error!");
              setWorking(false);
            }
          });
        }
        setWorking(false);
      } catch (error) {
        toast.error("Try Failed!");
        setWorking(false);
      }
    } else if (currentNetworkSymbol === PLATFORM_NETWORKS.XRPL) {
      setWorking(true);

      const transactionBlob = {
        TransactionType: "NFTokenMint",
        Account: currentWallet,
        URI: convertStringToHex("ipfs://" + params.metadataURI),
        Flags: 9,
        TransferFee: 2500,
        NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
      };

      if (!isValidXRPAddress(currentWallet)) {
        toast.error("Invalid connected address");
        return;
      } else {
        console.log("Creating payload");
        xumm
          .then(async (xummSDK) => {
            const paymentPayload = {
              txjson: transactionBlob,
            };
            try {
              const pong = await xummSDK.ping();
              console.log(pong.application);

              const payloadResponse = await xummSDK.payload.createAndSubscribe(
                paymentPayload as any,
                (event) => {
                  console.log("event subscription", event.data);

                  if (event.data.signed === true) {
                    console.log("Woohoo! The sign request was signed :)");
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

                let txHash = result.response.txid;
                params.latestTxHash = txHash;
                await axios({
                  method: "post",
                  url: `${config.API_URL}api/item/create`,
                  data: params,
                })
                  .then(async function (response: any) {
                    if (response.status === 200) {
                      const newItemId = response.data._id;

                      setWorking(false);

                      toast.success(
                        <div>
                          Successfully created an item. You can see items at{" "}
                          <span
                            style={{ color: "#00f" }}
                            onClick={() =>
                              navigate(
                                `/collectionItems/${params.collectionId}`
                              )
                            }
                          >
                            here
                          </span>
                        </div>
                      );
                      let paramAct = {
                        item: newItemId,
                        origin: currentUsr?._id,
                        transactionHash: txHash,
                        actionType: ITEM_ACTION_TYPES.MINTED,
                      };
                      saveItemActivity(paramAct);
                      navigate(`/collectionItems/${collectionId}`);
                    } else {
                      toast.error("Failed!");
                      setWorking(false);
                      return;
                    }
                  })
                  .catch(() => {
                    toast.error("Failed!");
                    setWorking(false);
                  });
              }
            } catch (e) {
              console.log({ error: e.message, stack: e.stack });
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
  };

  useEffect(() => {
    setCollectionId((selected as any)._id || "");
  }, [selected]);

  useEffect(() => {
    if (collectionId !== undefined && collections && collections.length > 0) {
      var index = collections.findIndex((element) => {
        return element._id.toString() === collectionId.toString();
      });

      if (collections[index] && (collections[index] as any).metaData) {
        const metaTemplateArry = (collections[index] as any).metaData;
        setMetaData(metaTemplateArry);

        let metaTempList = [];
        for (let i = 0; i < metaTemplateArry.length; i++) {
          const metaTemp = metaTemplateArry[i];
          const meta = {
            key: metaTemp.trait_type,
            type: metaTemp.type.text,
            disabled: false,
            value:
              metaTemp.property.length > 0
                ? metaTemp.property[0]
                : metaTemp.type.text === "boolean"
                ? false
                : "",
          };
          metaTempList.push(meta);
        }
        setMetaList(metaTempList);
      }
    }
  }, [collectionId, collections]);

  const createItem = async () => {
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
    if (selectedMusicFile === null && fileCategory > FILE_TYPE.IMAGE) {
      if (fileCategory === FILE_TYPE.AUDIO)
        toast.warn("Music file is not selected.");
      if (fileCategory === FILE_TYPE.VIDEO)
        toast.warn("Video file is not selected.");
      if (fileCategory === FILE_TYPE.THREED)
        toast.warn("3D file is not selected.");
      return;
    }
    if (selectedFile === null) {
      toast.warn("Image is not selected.");
      return;
    }
    if (textName === "") {
      toast.error("Item name cannot be empty.");
      return;
    }
    if (isEmpty(selected) || selected.name === "") {
      toast.warn("Please select a collection and try again.");
      return;
    }
    setWorking(true);
    try {
      var uploadedBannerPath = "";
      let consideringFile =
        fileCategory >= FILE_TYPE.AUDIO ? selectedMusicFile : selectedFile;
      let fileHash = await storeSingleNFT(consideringFile);

      if (fileCategory !== FILE_TYPE.IMAGE) {
        // var formData = new FormData();
        // formData.append("itemFile", selectedFile);
        // formData.append("authorId", "hch");
        // formData.append("collectionName", selected?.name);

        // await axios({
        //   method: "post",
        //   url: `${config.API_URL}api/utils/upload_file`,
        //   data: formData,
        //   headers: { "Content-Type": "multipart/form-data" },
        // })
        //   .then(async function (response: any) {
        //     uploadedBannerPath = response.data.path;
        //   })
        //   .catch(function (error: any) {
        //     console.log("banner file uploading error : ", error);
        //     toast.error("Preview file uploading failed.");
        //     setWorking(false);
        //     return;
        //   });
        uploadedBannerPath = await storeSingleNFT(selectedFile);
      } else {
        uploadedBannerPath = fileHash;
      }

      let metadataTemp = {
        name: textName,
        description: textDescription,
        previewImage: uploadedBannerPath,
        image: fileHash,
        attributes: [...metaList],
      };
      let uriHash = await pinJSONToNFTStorage(metadataTemp);

      if (fileCategory === FILE_TYPE.AUDIO)
        toast.info("Music file is uploaded.");
      if (fileCategory === FILE_TYPE.VIDEO)
        toast.info("Video file is uploaded.");
      if (fileCategory === FILE_TYPE.THREED) toast.info("3D file is uploaded.");

      let paths = [];
      let path = fileHash.replace("ipfs://", "");
      let previewPath = uploadedBannerPath.replace("ipfs://", "");
      const params = {
        itemName: textName,
        itemMusicURL: path,
        itemLogoURL: fileCategory !== FILE_TYPE.IMAGE ? previewPath : path,
        itemDescription: textDescription,
        collectionId: selected?._id || "",
        creator: currentUsr?._id || "",
        owner: currentUsr?._id || "",
        fileType: fileCategory,
        isSale: 0,
        price: 0,
        auctionPeriod: 0,
        stockAmount: 0,
        metaData: metaList,
        mutiPaths: paths,
        timeLength: timeLength,
        stockGroupId: new Date().getTime(),
        chainId: currentNetworkSymbol || 0,
        metadataURI: uriHash,
        explicitContent: explictContent,
        networkSymbol: currentNetworkSymbol || 0,
        coreumPaymentUnit: coreumPaymentCoin,
      };
      await newSaveItem(params);
    } catch (error) {
      if (fileCategory === FILE_TYPE.AUDIO)
        toast.error("Music file uploading failed.");
      if (fileCategory === FILE_TYPE.VIDEO)
        toast.error("Video file uploading failed.");
      if (fileCategory === FILE_TYPE.THREED)
        toast.error("3D file uploading failed.");
      setWorking(false);
    }
  };

  const changeMusicFile = async (event: any) => {
    var file = event.target.files[0];
    if (file === null) return;
    if (fileCategory === FILE_TYPE.AUDIO) {
      if (file.size > 100 * 1024 * 1024) {
        setSelectedMusicFile(null);
        setSelectedMusicFileName("");
        toast.warn("Audio file size should be less than 100MB.");
        return;
      }
      const metadata = await parseBlob(file);
      let tl = metadata.format.duration;
      setTimeLength(tl);
    }
    if (fileCategory === FILE_TYPE.VIDEO) {
      if (file.size > 100 * 1024 * 1024) {
        setSelectedMusicFile(null);
        setSelectedMusicFileName("");
        toast.warn("Video file size should be less than 100MB");
        return;
      }
    }

    setSelectedMusicFile(file);
    setSelectedMusicFileName(file.name);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {};
    reader.onerror = function (error: any) {
      console.log("music file choosing error : ", error);
    };
  };

  const changeJsonFile = async (event: any) => {
    try {
      var file = event.target.files[0];
      if (file === null) return;

      const fileContent = await file.text();

      let jsonFileContent;
      try {
        jsonFileContent = JSON.parse(fileContent.toString());
      } catch (error) {
        toast.error(
          <div>
            <p className="mb-0">Invalid JSON file</p>
            <p className="mb-0">Please load another file</p>
          </div>
        );
        fileInputRef.current.value = "";
        return;
      }

      if (!hasKey(jsonFileContent, "attributes")) {
        toast.error(
          <div>
            <p className="mb-0">JSON Validation is failed.</p>
            <p className="mb-0">
              No attributes property in{" "}
              <span className="text-red-400">{jsonFileContent}</span>
            </p>
          </div>
        );
        return;
      }
      const json = jsonFileContent.attributes;
      for (let j = 0; j < json.length; j++) {
        const json_attribute = json[j];
        if (!hasKey(json_attribute, "trait_type")) {
          toast.error(
            <div>
              <p className="mb-0">JSON Validation is failed.</p>
              <p className="mb-0">
                No trait_type property in{" "}
                <span className="text-red-400">{jsonFileContent}</span>
              </p>
            </div>
          );
          fileInputRef.current.value = "";
          return;
        }
        if (!hasKey(json_attribute, "value")) {
          toast.error(
            <div>
              <p className="mb-0">JSON Validation is failed.</p>
              <p className="mb-0">
                No value property in{" "}
                <span className="text-red-400">{jsonFileContent}</span>
              </p>
            </div>
          );
          fileInputRef.current.value = "";
          return;
        }
      }

      const attributes = jsonFileContent.attributes;
      setMetaData(attributes);
      let metalist = [];
      for (let j = 0; j < attributes.length; j++) {
        const attribute = attributes[j];
        const meta = {
          trait_type: attribute.trait_type,
          disabled: false,
          value: attribute.value,
        };
        metalist.push(meta);
      }
      setMetaList(metalist);
    } catch (error) {
      toast.error(
        <div>
          <p className="mb-0">Invalid JSON file</p>
          <p className="mb-0">Please load another file</p>
        </div>
      );
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    fileInputRef.current.value = "";
    setMetaData([]);
    setMetaList([]);
  };
  const handleExplicityContent = (e) => {
    setExplicitContent(e.target.checked);
  };

  return (
    <>
      <Helmet>
        <title>Create an NFT || Rize2Day </title>
      </Helmet>
      <div
        className={`nc-PageUploadItem ${className}`}
        data-nc-id="PageUploadItem"
      >
        <Helmet>
          <title>Create NFT(s) || Rize2Day NFT Marketplace</title>
        </Helmet>
        <div className="container">
          <div className="max-w-4xl mx-auto my-12 space-y-8 sm:lg:my-16 lg:my-24 sm:space-y-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Create New NFT
              </h2>
              <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
                You can set preferred display name, create your profile URL and
                manage other personal settings.
              </span>
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
                            if (Boolean(checked) === true)
                              setFileCategory(index);
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
                  {fileCategory === FILE_TYPE.IMAGE
                    ? "Image file"
                    : "Preview image or video"}
                </h3>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {fileCategory === FILE_TYPE.IMAGE
                    ? "File types supported: PNG, JPEG, GIF, WEBP"
                    : "File types supported: PNG, JPEG, GIF, WEBP, MP4"}
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
                      <div className="flex justify-center text-sm text-neutral-6000 dark:text-neutral-300">
                        <span className="text-green-500">
                          {fileCategory === FILE_TYPE.IMAGE
                            ? "Upload a image file"
                            : "Upload a preview image or video"}
                        </span>
                        <label
                          htmlFor="file-upload2"
                          className="font-medium rounded-md cursor-pointer text-primary-6000 transition hover:text-primary-500 hover:bg-black/5 absolute top-0 left-0 w-full h-full"
                        >
                          {fileCategory === FILE_TYPE.IMAGE ? (
                            <input
                              id="file-upload2"
                              name="file-upload2"
                              type="file"
                              className="sr-only"
                              accept=".png,.jpeg,.jpg,.gif,.webp"
                              onChange={changeFile}
                            />
                          ) : (
                            <input
                              id="file-upload2"
                              name="file-upload2"
                              type="file"
                              className="sr-only"
                              accept=".png,.jpeg,.jpg,.gif,.webp,.mp4"
                              onChange={changeFile}
                            />
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {!selectedFile ? "Max 100MB." : selectedFileName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {fileCategory > FILE_TYPE.IMAGE && (
                <div>
                  <h3 className="text-lg font-semibold sm:text-2xl">
                    Audio/Video/3D file
                  </h3>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    File types supported:{" "}
                    {fileCategory === FILE_TYPE.AUDIO
                      ? "MP3"
                      : fileCategory === FILE_TYPE.VIDEO
                      ? "MP4"
                      : "GLB"}
                  </span>
                  <div className="mt-5 ">
                    <div className="flex relative justify-center px-6 pt-5 pb-6 mt-1 border-2 border-dashed border-neutral-300 dark:border-neutral-6000 rounded-xl">
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
                          <span className="text-green-500">
                            {fileCategory === FILE_TYPE.AUDIO &&
                              "Upload a audio file"}
                            {fileCategory === FILE_TYPE.VIDEO &&
                              "Upload a video file"}
                            {fileCategory === FILE_TYPE.THREED &&
                              "Upload a 3D file"}
                          </span>
                          <label
                            htmlFor="file-upload"
                            className="font-medium rounded-md cursor-pointer text-primary-6000 transition hover:text-primary-500 hover:bg-black/5 absolute top-0 left-0 w-full h-full"
                          >
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept={
                                fileCategory === FILE_TYPE.AUDIO
                                  ? ".mp3"
                                  : fileCategory === FILE_TYPE.VIDEO
                                  ? ".mp4"
                                  : ".glb"
                              }
                              onChange={changeMusicFile}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {!selectedMusicFile
                            ? "Max 100MB"
                            : selectedMusicFileName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM && (
                <>
                  <h3 className="text-lg font-semibold sm:text-2xl ">
                    Payment coin/token
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
              <FormItem
                label="Item Name"
                className="!text-lg !font-semibold sm:!text-2xl "
              >
                <Input
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                />
              </FormItem>

              <FormItem
                label="Description"
                desc={
                  <div>
                    The description will be included on the nft's detail page,
                    underneath its image.
                  </div>
                }
              >
                <Editor
                  editorState={editorState}
                  wrapperClassName="demo-wrapper mt-1.5 text-black "
                  editorClassName="demo-editor border-2 rounded-lg border-neutral-100 dark:border-neutral-400  min-h-[300px] text-black dark:text-white "
                  onEditorStateChange={onEditorStateChange}
                />
              </FormItem>

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

              <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-600"></div>

              <div>
                <Label>Choose collection</Label>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Choose an exiting collection or create a new one. If you don't
                  have any collection please click here to go to{" "}
                  <span
                    onClick={() => navigate("/createCollection")}
                    className="text-green-500 cursor-pointer"
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
                              ? "ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-60 "
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
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 py-0">
                When you create the JSON files, please add the correct fields
                and values.
              </div>
              <div className="w-full flex items-center mt-2">
                <label
                  htmlFor="json-upload"
                  className="nc-Button relative h-auto inline-flex justify-start items-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-3 sm:px-6  ttnc-ButtonPrimary disabled:bg-opacity-70 bg-green-400 hover:bg-green-500 text-primary-shadow text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-0"
                >
                  <MdCloudUpload className="ml-2" color="black" size={20} />
                  <span className="pl-2">Select a json file</span>
                  <input
                    ref={fileInputRef}
                    id="json-upload"
                    name="json-upload"
                    type="file"
                    className="sr-only"
                    accept=".json"
                    onChange={changeJsonFile}
                  />
                </label>
                {metaList && metaList.length > 0 && (
                  <button
                    className="nc-Button relative h-auto inline-flex justify-start items-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-3 sm:px-6  ttnc-ButtonPrimary disabled:bg-opacity-70 bg-green-400 hover:bg-green-500 text-primary-shadow text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-0 ml-2"
                    onClick={handleClear}
                  >
                    <AiOutlineDelete className="ml-2" color="black" size={21} />
                    <span className="pl-2">Clear</span>
                  </button>
                )}
              </div>
              {metaData && metaData.length > 0 && (
                <p className="text-md text-[#5f5f5f]">Schema Properties</p>
              )}
              {metaList?.length > 0 &&
                metaList?.map((meta, index) => (
                  <div
                    className="grid grid-cols-3 items-start !mt-4"
                    key={index}
                  >
                    <div className="col-span-1 flex items-center">
                      {meta.trait_type}
                      <Checkbox
                        checked={!meta.disabled}
                        onChange={(e) => handleCheckFieldChange(e, index)}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={meta.value}
                        disabled={meta.disabled}
                        onChange={(e) => handleChangeText(e, index)}
                      />
                    </div>
                  </div>
                ))}

              <div className="flex flex-col pt-2 space-x-0 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 ">
                <ButtonPrimary
                  className="flex-1"
                  onClick={() => {
                    createItem();
                  }}
                >
                  Create an NFT
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
