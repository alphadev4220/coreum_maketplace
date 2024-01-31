import React, { useState, useEffect } from "react";
import cn from "classnames";
import Icon from "../../components/StyleComponent/Icon";
import styles from "./Profile.module.sass";
import styles1 from "./ProfileEdit.module.sass";
import styles2 from "./UploadDetails.module.sass";
import { toast } from "react-toastify";
import { config, CATEGORIES, PLATFORM_NETWORKS } from "app/config.js";
import Dropdown from "../../components/Button/Dropdown";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { nanoid } from "@reduxjs/toolkit";
import ButtonPrimary from "components/Button/ButtonPrimary";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
  selectCurrentWallet,
  selectIsCommunityMember,
} from "app/reducers/auth.reducers";
import { changeConsideringCollectionId } from "app/reducers/collection.reducers";
import FormItem from "components/StyleComponent/FormItem";
import Input from "components/StyleComponent/Input";
import Textarea from "components/StyleComponent/Textarea";
import Checkbox from "@mui/material/Checkbox";
import Label from "components/StyleComponent/Label";
import IconButton from "@mui/material/IconButton";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSigningClient } from "app/cosmwasm";
import { isSupportedEVMNetwork } from "InteractWithSmartContract/interact";
import VideoForBannerPreview from "components/Card/VideoForBannerPreview";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { checkNativeCurrencyAndTokenBalances, isVideo } from "utils/utils";
import MainSection from "components/Section/MainSection";
import {
  createCollectionApi,
  deleteCollectionApi,
  updateCollectionApi,
} from "app/api/collections";
import { uploadFile } from "app/api/utils";
import ModalCrop from "components/Modal/CropModal";
import Avatar from "components/StyleComponent/Avatar";

const ColorModeContext = React.createContext({ CollectionSelect: () => { } });

const CreateCollection = () => {
  const categoriesOptions = CATEGORIES;

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [isRizeMemberCollection, setIsRizeMemberCollection] = useState(false);
  const [termsCondtions, setTermsConditions] = useState("");
  const [categories, setCategories] = useState(categoriesOptions[0]);
  const [royaltyFields, setRoyaltyFields] = useState([]);

  const [working, setWorking] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [DEMO_NFT_ID] = React.useState(nanoid());
  const { addCollection, balances, getOwnedCollections } = useSigningClient();

  const [mode, setMode] = React.useState("light");
  const colorMode = React.useContext(ColorModeContext);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currentWallet = useAppSelector(selectCurrentWallet);
  const currentUsr = useAppSelector(selectCurrentUser);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const isUserAMemberOfCommunity = useAppSelector(selectIsCommunityMember);
  const [blurItems, setBlurItems] = useState(false);
  const [enableLaunchpad, setEnableLaunchpad] = useState(false);
  const [isCrop, setIsCrop] = useState(false);
  const openModalCrop = () => setIsCrop(true);
  const closeModalCrop = () => setIsCrop(false);

  useEffect(() => {
    if (localStorage.theme === undefined || localStorage.theme === null) {
      setMode("dark");
    } else if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setMode("dark");
    } else {
      setMode("dark");
    }
  }, []);

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setTextDescription(
      draftToHtml(convertToRaw(editorState.getCurrentContent())) || ""
    );
  };

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiStack: {
            styleOverrides: {
              root: {
                width: "100% !important",
                border: "2px solid #353945",
                borderRadius: "12px",
                color: "text-black dark:text-white",
              },
            },
          },
        },
      }),
    [mode]
  );

  const changeBanner = (event) => {
    var file = event.target.files[0];
    if (file === null) return;
    setSelectedBannerFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBannerImg(reader.result);
    };
    reader.onerror = function (error) { };
  };

  const changeAvatar = (event) => {
    var file = event.target.files[0];
    if (file === null) return;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setLogoImg(reader.result?.toString() || "");
      openModalCrop();
    };
    reader.onerror = function (error) { };
  };

  const saveCollection = async (params) => {
    let newCollectionId = 0;
    setWorking(true);
    try {
      const createResponse = await createCollectionApi(params);
      if (createResponse.code === 0) {
        newCollectionId = createResponse?.data || "";
        let isCreatingNewItem = localStorage.getItem("isNewItemCreating");
        if (isCreatingNewItem)
          localStorage.setItem("newCollectionId", newCollectionId);
        dispatch(changeConsideringCollectionId(newCollectionId));
        if (
          isSupportedEVMNetwork(currentNetworkSymbol) === true ||
          currentNetworkSymbol === PLATFORM_NETWORKS.XRPL
        ) {
          toast.success(<div>You've created a new collection.</div>);
          setTimeout(() => {
            navigate("/collectionList");
          }, 5000);
        }
        if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
          let balanceCheck = checkNativeCurrencyAndTokenBalances(0, balances);
          if (balanceCheck === false) {
            await deleteCollectionApi(newCollectionId, currentUsr._id);
          }
          let royalties = [];
          for (let idx = 0; idx < royaltyFields.length; idx++) {
            royalties.push({
              address: royaltyFields[idx].address,
              rate: royaltyFields[idx].percentage * 10000,
            });
          }
          const createdTx = await addCollection(
            currentUsr.address,
            100000,
            textName,
            "Rize2DayNFT",
            config.CW721_CODE_ID,
            1000000,
            [...royalties],
            newCollectionId
          );

          if (createdTx !== -1) {
            //read created collection info here
            let newCollections = await getOwnedCollections(currentUsr.address);

            if (newCollections?.list.length > 0) {
              let newCollectionInfo =
                newCollections.list[newCollections.list.length - 1];

              const updateResponse = await updateCollectionApi(
                {
                  collectionNumber: newCollectionInfo.id,
                  address: newCollectionInfo.collection_address,
                  cw721address: newCollectionInfo.cw721_address,
                },
                newCollectionId
              );
              if (updateResponse.code === 0) {
                toast.success(<div>You've created a new collection.</div>);
                setTimeout(() => {
                  navigate("/collectionList");
                }, 5000);
              } else {
                toast.error("DB failed!");
                await deleteCollectionApi(newCollectionId, currentUsr._id);
              }
            }
          } else {
            toast.error("Transaction failed!");
            await deleteCollectionApi(newCollectionId, currentUsr._id);
          }
        }
      } else {
        toast.error(createResponse.message);
      }
    } catch (error) {
      console.log("creating collection error : ", error);
      if (newCollectionId !== "")
        await deleteCollectionApi(newCollectionId, currentUsr._id);
      toast.error("Uploading failed");
    } finally {
      setWorking(false);
    }
  };

  const createCollection = async () => {
    if (currentUsr === null || currentUsr === undefined) {
      toast.warn("Please sign in and try again.");
      return;
    }
    if (selectedAvatarFile === null || selectedBannerFile === null) {
      toast.warn("You have to select logo and banner image.");
      return;
    }
    if (textName === "") {
      toast.warn("Collection name can not be empty.");
      return;
    }

    setWorking(true);

    const params = {};

    params.collectionLogoURL = selectedAvatarFile

    var formData = new FormData();
    formData.append("itemFile", selectedBannerFile);
    formData.append("authorId", "hch");
    try {
      const response = await uploadFile(formData);
      params.collectionBannerURL = response.path;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Uploading photo failed.");
      return;
    }

    params.collectionName = textName;
    params.collectionDescription = textDescription;
    params.collectionCategory = categories.value;
    params.collectionTerms = termsCondtions;
    params.price = 0;
    params.owner = currentUsr._id;
    params.networkSymbol = currentNetworkSymbol;
    params.creatorWallet = currentWallet;
    params.wantTobeMemberColl = isRizeMemberCollection;
    params.blurItems = blurItems;
    params.enableLaunchpad = enableLaunchpad;
    saveCollection(params);
  };

  const setAddRoyaltyField = () => {
    var rfs = royaltyFields;
    rfs.push({
      address: "",
      royalty: 0,
    });
    if (rfs?.length > 10) {
      toast.warning("You can use 10 wallets for loyalty at maximum.");
      return;
    }
    setRoyaltyFields(rfs);
    setRefresh(!refresh);
  };

  const removeRoyaltyField = (index) => {
    const mfs = royaltyFields;
    mfs.splice(index, 1);
    setRoyaltyFields(mfs);
    setRefresh(!refresh);
  };

  const handleChangeRoyaltyAddressInput = (e, index) => {
    let mfs = royaltyFields;
    mfs[index].address = e.target.value;
    setRoyaltyFields(mfs);
    setRefresh(!refresh);
  };

  const handleChangeRoyaltyPercentageInput = (e, index) => {
    let mfs = royaltyFields;
    mfs[index].percentage = e.target.value;
    let sumOfPercents = 0;
    for (let idx = 0; idx < mfs.length; idx++) {
      sumOfPercents += Number(mfs[idx].percentage);
    }
    if (sumOfPercents > 100) {
      toast.warning(
        "Sum of royalty percents should be equal or less than 100."
      );
      return;
    }
    setRoyaltyFields(mfs);
    setRefresh(!refresh);
  };

  return (
    <MainSection title="Create a Collection">
      <div className="container">
        <div style={{ paddingTop: "3rem", paddingRight: "3rem" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            Create a collection
          </h1>
        </div>
        <div
          className={styles1.user}
          style={{
            marginTop: "1rem",
          }}
        >
          <div className={styles1.details}>
            {isUserAMemberOfCommunity === true && (
              <div className="flexl mt-5 ml-0 mb-5 items-center">
                <Checkbox
                  checked={isRizeMemberCollection}
                  onChange={(e, checked) => {
                    setIsRizeMemberCollection(checked);
                  }}
                />
                <Label>Rize Member Collection</Label>
              </div>
            )}
            <div className={styles1.stage}>Logo image</div>
            <div className={styles1.text}>
              This image will also be used for navigation. 350x350 recommend
            </div>
            <div
              className={styles2.file}
              style={{
                border: "3px dashed rgb(204, 204, 204)",
                borderRadius: "50%",
                width: "160px",
                height: "160px",
                objectFit: "fill",
              }}
            >
              <div className={styles1.avatar}>
                {selectedAvatarFile && <Avatar sizeClass="w-full h-full" imgUrl={selectedAvatarFile} />}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-opacity-60 text-neutral-500">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 5H7.5C6.83696 5 6.20107 5.26339 5.73223 5.73223C5.26339 6.20107 5 6.83696 5 7.5V20M5 20V22.5C5 23.163 5.26339 23.7989 5.73223 24.2678C6.20107 24.7366 6.83696 25 7.5 25H22.5C23.163 25 23.7989 24.7366 24.2678 24.2678C24.7366 23.7989 25 23.163 25 22.5V17.5M5 20L10.7325 14.2675C11.2013 13.7988 11.8371 13.5355 12.5 13.5355C13.1629 13.5355 13.7987 13.7988 14.2675 14.2675L17.5 17.5M25 12.5V17.5M25 17.5L23.0175 15.5175C22.5487 15.0488 21.9129 14.7855 21.25 14.7855C20.5871 14.7855 19.9513 15.0488 19.4825 15.5175L17.5 17.5M17.5 17.5L20 20M22.5 5H27.5M25 2.5V7.5M17.5 10H17.5125"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="mt-1 text-xs">Add Image</span>
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".png,.jpeg,.jpg,.gif,.webp"
                onChange={changeAvatar}
              />
            </div>
          </div>
        </div>
        <div
          className={styles1.user}
          style={{
            marginTop: "1rem",
          }}
        >
          <div className={styles1.details}>
            <div className={styles1.stage}>
              {isRizeMemberCollection !== true
                ? "Banner image"
                : "Banner video/image (recommended size is 1440*400)"}
            </div>
          </div>
        </div>
        <div
          className={` ${styles2.item}`}
          style={{ border: "3px dashed rgb(204, 204, 204)", height: "200px" }}
        >
          <div
            className={`bg-input ${isVideo(selectedBannerFile?.name || "") !== true
              ? "bg-[#e6e9ee]"
              : "bg-[url('images/vector3.svg')]"
              }`}
          >
            <div className={styles2.icon}>
              <Icon name="upload-file" size="48px" />
            </div>
            {!bannerImg && (
              <div className={`  ${cn(styles1.text, "text-center")}`}>
                This
                {isRizeMemberCollection !== true
                  ? " image"
                  : " video/image"}{" "}
                will be appear at the top of your collection page. Avoid
                including too much text in this banner
                {isRizeMemberCollection !== true
                  ? " image"
                  : " video/image"}, <br />
                as the dimensions change on different devices. 1400x400
                recommend.
              </div>
            )}

            {bannerImg ? (
              isVideo(selectedBannerFile?.name || "") !== true ? (
                <img
                  id="BannerImg"
                  className={styles2.image}
                  src={bannerImg}
                  alt="Banner"
                />
              ) : (
                <VideoForBannerPreview
                  src={bannerImg}
                  nftId={DEMO_NFT_ID}
                  className="h-full absolute z-5"
                />
              )
            ) : (
              <></>
            )}
            {isRizeMemberCollection !== true ? (
              <input
                className={`${styles2.load} w-full`}
                type="file"
                accept=".png,.jpeg,.jpg,.gif,.webp"
                onChange={changeBanner}
              />
            ) : (
              <input
                className={`${styles2.load} w-full`}
                type="file"
                accept=".png,.jpeg,.jpg,.gif,.webp,.mp4"
                onChange={changeBanner}
              />
            )}
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles1.stage}>Collection Details</div>
          <div className=" flex min-h-[250px] ">
            <div className="flex flex-col min-h-full justify-evenly w-2/5">
              <FormItem label="Name *">
                <Input
                  defaultValue="name"
                  placeholder="Enter Collection Name"
                  value={textName}
                  onChange={(event) => {
                    setTextName(event.target.value);
                  }}
                />
              </FormItem>

              <FormItem label="Category">
                <Dropdown
                  className={styles.dropdown}
                  value={categories}
                  setValue={setCategories}
                  options={categoriesOptions}
                />
              </FormItem>
              <div className="flex flex-col lg:flex-row mt-5 ml-0 mb-5 items-start lg:items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    checked={blurItems}
                    onChange={(e) => {
                      setBlurItems(e.currentTarget.checked);
                    }}
                  />
                  <Label>Blur items</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    checked={enableLaunchpad}
                    onChange={(e) => {
                      setEnableLaunchpad(e.currentTarget.checked);
                    }}
                  />
                  <Label>Enable launchpad</Label>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full w-3/5 ml-5">
              <Label>Description</Label>
              <Editor
                editorState={editorState}
                wrapperClassName="demo-wrapper mt-1.5 text-black "
                editorClassName="demo-editor border-2 rounded-lg border-neutral-100 dark:border-neutral-400  min-h-[200px] text-black dark:text-white "
                onEditorStateChange={onEditorStateChange}
              />
            </div>
          </div>
          <div className="flex flex-col mt-5">
            <Label>Collection Royalties</Label>

            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={theme}>
                <div className="flex flex-col">
                  {royaltyFields &&
                    royaltyFields.length > 0 &&
                    royaltyFields.map((field, index) => {
                      return (
                        <div
                          className="flex justify-between gap-1 mt-[14px] items-center"
                          key={index}
                        >
                          <IconButton onClick={() => removeRoyaltyField(index)}>
                            <AiOutlineMinusCircle size={28} />
                          </IconButton>
                          <Input
                            placeholder={"Wallet"}
                            className="w-3/4 mr-1"
                            value={field?.address}
                            onChange={(e) =>
                              handleChangeRoyaltyAddressInput(e, index)
                            }
                          />
                          <Input
                            placeholder={"Royalty(1-100)"}
                            className="w-1/4 text-right"
                            value={field?.percentage}
                            onChange={(e) =>
                              handleChangeRoyaltyPercentageInput(e, index)
                            }
                          />
                          <div>%</div>
                        </div>
                      );
                    })}
                </div>
              </ThemeProvider>
            </ColorModeContext.Provider>
            <button
              className="rounded-2xl mt-2 p-2 border-dashed border-2 border-neutral-200 dark:border-neutral-600"
              onClick={setAddRoyaltyField}
            >
              ADD ROYALTY
            </button>
          </div>
          <div className="flex flex-col mt-5">
            <Label>Add custom terms and conditions</Label>
            <Textarea
              className="mt-1.5 h-full"
              placeholder="Enter custom terms and conditions"
              value={termsCondtions}
              onChange={(event) => {
                setTermsConditions(event.target.value);
              }}
            />
          </div>
          <div
            className={styles2.foot}
            style={{
              marginTop: "1rem",
              marginBottom: "5rem",
            }}
          >
            <ButtonPrimary
              className={cn("button", styles2.button)}
              onClick={() => createCollection()}
            >
              <span>Create Collection</span>
            </ButtonPrimary>
          </div>
        </div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
      <ModalCrop
        show={isCrop}
        onOk={setSelectedAvatarFile}
        onCloseModalCrop={closeModalCrop}
        image={logoImg}
      />
    </MainSection>
  );
};

export default CreateCollection;
