import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import {
  UPLOADING_FILE_TYPES,
  pinUpdatedJSONDirectoryToNFTStorage,
  storeNFT,
} from "../../utils/pinatasdk";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { styled } from "@mui/system";

import { CATEGORIES, config } from "app/config";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeDetailedCollection,
  selectDetailedCollection,
} from "app/reducers/collection.reducers";
import parse from "html-react-parser";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import Switch from "@mui/material/Switch";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import { useSigningClient } from "app/cosmwasm";
import Dropdown from "components/Button/Dropdown";
import "./launchpad.css";
import {
  getCollectionDetails,
  updateCollectionApi,
  updateWithJsonCIDApi,
} from "app/api/collections";
import { uploadFile, uploadmintingWL } from "app/api/utils";
import { handleKeyPress } from "utils/utils";

const CustomDateTimePicker = styled(DateTimePicker)(() => ({
  "& .MuiInputBase-root": {
    color: "#fff",
    margin: 0,
    padding: 0,
  },
  "& .MuiIconButton-root ": {
    padding: 0,
  },
  "& .MuiInputBase-input": {
    padding: 0,
    backgroundColor: "#000",
  },
  "& .MuiSvgIcon-root": {
    fill: "#33ff00",
  },
  "& .MuiPickersDateTimePickerInput-iconButton": {
    color: "#33ff00",
  },
  "& .MuiIconButton-label": {
    color: "#33ff00",
  },
  "& .MuiTypography-root": {
    color: "#33ff00",
  },
  "& .MuiFormLabel-root": {
    color: "#33ff00",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#33ff00",
  },
}));

const PageLunchpadSetting = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { collectionConfig, applyTreasuryWallets }: any = useSigningClient();
  const detailedCollectionInfo = useAppSelector(selectDetailedCollection);
  const currentUser = useAppSelector(selectCurrentUser);

  const isValidUser =
    currentUser?._id === detailedCollectionInfo?.owner?._id &&
    detailedCollectionInfo?.launchstate !== 2;
  const [mintStartDate, setMintStartDate] = useState<Date | null>(
    new Date("2014-08-18T21:11:54")
  );
  const [mintFinishDate, setMintFinishDate] = useState<Date | null>(
    new Date("2014-08-18T21:11:54")
  );
  const [flashSaleDate, setFlashSaleDate] = useState<Date | null>(
    new Date("2014-08-18T21:11:54")
  );
  const [editIntro, setEditIntro] = useState(false);
  const [title, setTitle] = useState(detailedCollectionInfo?.name);
  const [desc, setDesc] = useState(detailedCollectionInfo?.description);
  const [uploading, setUploading] = useState(false);
  const [editPrice, setEditPrice] = useState(false);
  const [editNftInfo, setEditNftInfo] = useState(false);
  const [price, setPrice] = useState("321");
  const [nftName, setNftName] = useState("Ghospers");
  const [editOverview, setEditOverview] = useState(false);
  const [overview, setOverview] = useState(
    "This piece is inspired by the beauty of nature and the power of the elements. It represents the harmony between man and nature and the importance of preserving our planet for future generations. This artwork is a tribute to the great artists of the past who have inspired me throughout my career. It is a celebration of creativity and imagination and"
  );
  const [editContact, setEditContact] = useState(false);
  const [website, setWebsite] = useState("https://www.xyz.com");
  const [discord, setDiscord] = useState("https://www.discord.com");
  const [youtube, setYoutube] = useState("https://www.youtube.com");
  const [twitter, setTwitter] = useState("https://www.twitter.com");
  const [enableReferral, setEnableReferral] = useState(false);
  const [referralSettings, setReferralSettings] = useState([]);
  const [treasuryFields, setTreasuryFields] = useState([]);
  const { collectionId } = useParams();
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [jsonFileList, setJsonFileList] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);
  const [working, setWorking] = useState(false);
  const [selectedMintingWLFile, setSelectedMintingWLFile] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [enablePublicSale, setEnablePublicSale] = useState(false);
  const [editDiscountRate, setEditDiscountRate] = useState(false);
  const [wlDiscountRate, setWLDiscountRate] = useState(100);
  const [editWLMintableMax, setEditWLMintableMax] = useState(false);
  const [wlMintableMax, setWLMintableMax] = useState(0);
  const categoriesOptions = CATEGORIES;
  const [categories, setCategories] = useState(categoriesOptions[0]);
  const [imageNameList, setImageNameList] = useState([]);

  const getDetailedCollectionInfor = async (collectionId) => {
    try {
      const response = await getCollectionDetails(collectionId);
      const data = response?.data || {};
      dispatch(changeDetailedCollection(data));
      setMintStartDate(new Date(data?.mintStartDate));
      setMintFinishDate(new Date(data?.mintFinishDate));
      setFlashSaleDate(new Date(data?.flashSaleDate));
      setWebsite(data?.websiteURL || "");
      setYoutube(data?.yutubeURL || "");
      setDiscord(data?.discordURL || "");
      setTwitter(data?.twitterURL || "");
      setReferralSettings(data?.referrals || []);
      setEnableReferral(data?.appplyReferral || false);
      setEnablePublicSale(data?.saleMode || false);
      setWLDiscountRate(data?.wlDiscountRate || 100);
      setWLMintableMax(data?.wlMintableMax || 0);
      readCollection();
    } catch (error) {
      console.log(error);
    }
  };

  const readCollection = async () => {
    try {
      let collectionInfo = await collectionConfig(
        detailedCollectionInfo?.address
      );
      const treasuryWallets = collectionInfo?.wallets || [];
      let temp = [];
      for (let idx = 0; idx < treasuryWallets?.length; idx++) {
        temp.push({
          address: treasuryWallets[idx]?.address,
          percentage: treasuryWallets[idx]?.rate / 10000,
        });
      }
      setTreasuryFields(temp);
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (collectionId && collectionId.toString().length === 24) {
      getDetailedCollectionInfor(collectionId);
    }
  }, [collectionId]);

  const changeAvatar = (event) => {
    var file = event.target.files[0];
    if (file === null) return;
    setSelectedAvatarFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setLogoImg((reader as any)?.result || "");
    };
    reader.onerror = function () {};
    document.getElementById("preSelectSentence").style.display = "none";
  };

  const updateCollectionLog = async () => {
    if (logoImg === null || logoImg === undefined) {
      toast.warn("You should select logo image.");
      return;
    }
    var formData = new FormData();
    formData.append("itemFile", selectedAvatarFile);
    formData.append("authorId", "rize");

    try {
      const uploadResponse = await uploadFile(formData);
      const logoPath = uploadResponse.path;
      const params = { logoURL: logoPath };

      const response = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (response.code !== 0) {
        throw new Error(response.message);
      }
      toast.success("You've updated Image.");
    } catch (error) {
      console.log(error);
      toast.error("Error:", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
    }
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  const handleDescChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(event.target.value);
  };
  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);

    if (!isNaN(numericValue)) {
      setPrice(value);
    }
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNftName(event.target.value);
  };
  const handleOverviewChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setOverview(event.target.value);
  };
  const handleWebsiteChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWebsite(event.target.value);
  };
  const handleTwitterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTwitter(event.target.value);
  };
  const handleDiscordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDiscord(event.target.value);
  };
  const handleYoutubeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYoutube(event.target.value);
  };

  const handleSubmintWLMintableMax = async () => {
    try {
      const params = {
        wlMintableMax: wlMintableMax,
      };
      const response = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (response.code !== 0) {
        throw new Error(response.message);
      }
      toast.success(
        "You've updated awarded mintable count for whitelisted wallets."
      );
    } catch (error) {
      console.log(error);
      toast.error("Error", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
      setEditWLMintableMax(false);
    }
  };

  const handleSubmitWLDiscountRate = async () => {
    try {
      const params = {
        wlDiscountRate: wlDiscountRate,
      };
      const response = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (response.code !== 0) {
        throw new Error(response.message);
      }
      toast.success("You've updated discount rate for whitelisted wallets.");
    } catch (error) {
      toast.error("Error", error);
      console.log(error?.message || "");
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
      setEditDiscountRate(false);
    }
  };

  const handleWLMintableMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);

    if (!isNaN(numericValue)) {
      setWLMintableMax(numericValue);
    }
  };

  const handleWLDiscountRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);

    if (!isNaN(numericValue)) {
      if (numericValue >= 0 && numericValue <= 100)
        setWLDiscountRate(numericValue);
      else toast.warn("Invalid rate");
    }
  };

  const handleReferralNumChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);

    if (!isNaN(numericValue)) {
      let mfs = referralSettings;
      mfs[index].num = numericValue;
      setReferralSettings(mfs);
      setRefresh(!refresh);
    }
  };

  const handleReferralRateChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    const processedValue = value.replace(/[^0-9]/g, "");

    const numericValue = parseInt(processedValue);

    if (!isNaN(numericValue)) {
      let mfs = referralSettings;
      // for (let idx = 0; idx < mfs?.length; idx++) {
      //   sumOfPercents += Number(mfs[idx].rate);
      // }
      // if (sumOfPercents > 100) {
      //   toast.warning(
      //     "Sum of referral rates should be equal or less than 100."
      //   );
      //   return;
      // }
      mfs[index].rate = numericValue;
      setReferralSettings(mfs);
      setRefresh(!refresh);
    }
  };

  const setAddTreasuryField = () => {
    var rfs = treasuryFields;
    rfs.push({
      address: "",
      royalty: 0,
    });
    if (rfs?.length > 10) {
      toast.warning("You can use 10 wallets for loyalty at maximum.");
      return;
    }
    setTreasuryFields(rfs);
    setRefresh(!refresh);
  };

  const removeTreasuryField = (index) => {
    const mfs = treasuryFields;
    mfs.splice(index, 1);
    setTreasuryFields(mfs);
    setRefresh(!refresh);
  };

  const handleChangeTreasuryAddressInput = (e, index) => {
    let mfs = treasuryFields;
    mfs[index].address = e.target.value;
    setTreasuryFields(mfs);
    setRefresh(!refresh);
  };

  const handleChangeTreasuryPercentageInput = (e, index) => {
    let mfs = treasuryFields;
    mfs[index].percentage = e.target.value;
    // let sumOfPercents = 0;
    // for (let idx = 0; idx < mfs.length; idx++) {
    //   sumOfPercents += Number(mfs[idx].percentage);
    // }
    // if (sumOfPercents > 100) {
    //   toast.warning(
    //     "Sum of treasury percents should be equal or less than 100."
    //   );
    //   return;
    // }
    setTreasuryFields(mfs);
    setRefresh(!refresh);
  };

  // ---------------onclick handlers-----------------
  const handleSubmit = async () => {
    //save title and description
    try {
      const params = {
        name: title,
        description: desc,
      };
      const response = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (response.code !== 0) {
        throw new Error(response.message);
      }
      toast.success("You've updated collection name and description.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
      setEditIntro(false);
    }
  };

  const handleEditIntro = () => {
    setEditIntro(true);
  };
  const handleSubmitPrice = async () => {
    try {
      if (
        !collectionId || collectionId === "" ||
        collectionId.toString().length !== 24
      ) {
        throw new Error("Please select a collection and try again.");
      }
      if (Number(price) <= 0 || isNaN(Number(price)) === true) {
        throw new Error("Please input valid price.");
      }
      //communicate with backend for new price
      const params = {
        mintingPrice: price || 0,
      };
      const updateResponse = await updateCollectionApi(params, collectionId);
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }
      toast.success("You've applied new minting price.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      setEditPrice(false);
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
    }
  };

  const handlePriceIntro = () => {
    setEditPrice(true);
  };
  const handleSubmitNftInfo = async () => {
    //name , type
    try {
      const params = {
        name: nftName,
        category: categories.value,
      };
      const updateResponse = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }

      toast.success("You've updated collection name and category.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      setEditNftInfo(false);
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
    }
  };

  const handleSubmitSchedule = async () => {
    try {
      const params = {
        mintStartDate: mintStartDate,
        mintFinishDate: mintFinishDate,
        flashSaleDate: flashSaleDate,
      };
      const updateResponse = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }

      toast.success("You've updated schedule.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
    }
  };

  const handleEditNftInfo = () => {
    setEditNftInfo(true);
  };
  const handleSubmitOverview = async () => {
    try {
      const params = {
        overview: overview,
      };
      const updateResponse = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }
      toast.success("You've updated overview.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
      setEditOverview(false);
    }
  };

  const handleEditOverview = () => {
    setEditOverview(true);
  };
  const handleSubmitContact = async () => {
    // Check if the URL starts with "https://"
    if (website !== "" && !website.startsWith("https://")) {
      toast.warn('Website URL is not valid or does not include "https://"');
      return;
    }
    if (youtube !== "" && !youtube.startsWith("https://www.youtube.com")) {
      toast.warn(
        'Youtube URL is not valid or does not include "https://www.youtube.com"'
      );
      return;
    }
    if (twitter !== "" && !twitter.startsWith("https://twitter.com")) {
      toast.warn(
        'Twitter URL is not valid or does not include "https://twitter.com"'
      );
      return;
    }
    if (discord !== "" && !discord.startsWith("https://discord.com")) {
      toast.warn(
        'Discord URL is not valid or does not include "https://discord.com"'
      );
      return;
    }

    try {
      const params = {
        websiteURL: website,
        yutubeURL: youtube,
        twitterURL: twitter,
        discordURL: discord,
      };
      const updateResponse = await updateCollectionApi(
        params,
        detailedCollectionInfo?._id
      );
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }

      toast.success("You've updated contacts.");
    } catch (error) {
      console.log(error?.message || "");
      toast.error("Error:", error);
    } finally {
      getDetailedCollectionInfor(detailedCollectionInfo?._id);
      setEditContact(false);
    }
  };

  const handleEditContact = () => {
    setEditContact(true);
  };

  const handleClickUploadMintingWLFile = async () => {
    if (selectedMintingWLFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("itemFile", selectedMintingWLFile || "");
      formData.append("authorId", "rize");
      formData.append("collectionId", collectionId);
      try {
        const response = await uploadmintingWL(
          formData,
          collectionId ? collectionId : ""
        );
        if (response.code !== 0) {
          throw new Error(response.message);
        }
        toast.success("You've updated WL file.");
      } catch (error) {
        console.log(error);
        toast.error("Uploading wl file failed.");
      } finally {
        setUploading(false);
        setSelectedMintingWLFile(null);
      }
    }
  };

  const handleRemoveReferral = (index: number) => {
    let mfs = referralSettings;
    mfs.splice(index, 1);
    setReferralSettings(mfs);
    setRefresh(!refresh);
  };

  const handleAddReferral = () => {
    try {
      console.log("handle Add referral 0000 ");
      var rfs = [...referralSettings];
      rfs.push({
        num: 1,
        rate: 1,
      });
      if (rfs?.length > 5) {
        toast.warning("You can use 5 wallets for royalty at maximum.");
        return;
      }
      setReferralSettings(rfs);
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitchReferral = async (value) => {
    setWorking(true);
    try {
      const params = {
        appplyReferral: value,
      };
      const updateResponse = await updateCollectionApi(params, collectionId);
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }

      setEnableReferral(value);
      if (value === true) toast.success("You've enabled referrals.");
      if (value === false) toast.success("You've disabled referrals.");
    } catch (error) {
      console.log(error);
      toast.error("Uploading wl file failed.");
    } finally {
      setWorking(false);
    }
  };

  const handleSwitchSaleMode = async (value) => {
    setWorking(true);
    setEnablePublicSale(value);
    try {
      const params = {
        saleMode: value,
      };
      const updateResponse = await updateCollectionApi(params, collectionId);
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }
      if (value === true) toast.success("You've changed sale mode to presale.");
      if (value === false)
        toast.success("You've changed sale mode to public sale.");
    } catch (error) {
      console.log(error);
      toast.error("Uploading wl file failed.");
    } finally {
      setWorking(false);
    }
  };

  const handleApplyReferrals = async () => {
    let mfs = referralSettings;
    let sumOfPercents = 0;
    for (let idx = 0; idx < mfs?.length; idx++) {
      sumOfPercents += Number(mfs[idx].rate);
    }
    if (sumOfPercents > 100) {
      toast.warning("Sum of referral rates should be equal or less than 100.");
      return;
    }
    try {
      const params = {
        referrals: referralSettings,
        appplyReferral: enableReferral,
      };
      const updateResponse = await updateCollectionApi(params, collectionId);
      if (updateResponse.code !== 0) {
        throw new Error(updateResponse.message);
      }
      toast.success("You've successfully updated referral settings.");
    } catch (error) {
      console.log(error);
      toast.error("Uploading wl file failed.");
    }
  };

  const handleApplyTreasuries = async () => {
    if (!treasuryFields || treasuryFields?.length <= 0) return;
    let sumOfPercents = 0;
    let isEmpty = 0;
    for (let idx = 0; idx < treasuryFields.length; idx++) {
      sumOfPercents += Number(treasuryFields[idx].percentage);
      if (
        treasuryFields[idx].percentage === "" ||
        treasuryFields[idx].address === ""
      )
        isEmpty++;
    }
    if (sumOfPercents > 100) {
      toast.warning(
        "Sum of treasury percents should be equal or less than 100."
      );
      return;
    }
    if (isEmpty > 0) {
      toast.warning("Empty fields.");
      return;
    }

    try {
      setWorking(true);
      let temp = [];
      for (let idx = 0; idx < treasuryFields?.length; idx++) {
        temp.push({
          address: treasuryFields[idx]?.address,
          rate: Number(treasuryFields[idx]?.percentage) * 10000,
        });
      }

      let txHash = await applyTreasuryWallets(
        currentUser.address,
        detailedCollectionInfo.address,
        temp
      );
      setWorking(false);
      if (txHash !== -1) {
        toast.success("You've successfully updated treasury wallet.");
        readCollection();
      } else {
        toast.error("Failed in applying treasury wallet setting.");
      }
    } catch (error) {
      setWorking(false);
      console.log(error);
      toast.error("Failed in applying treasury wallet  settings.");
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

  const updateJson = (json, replsceImgStr) => {
    let updated = json;
    updated["image"] = replsceImgStr;
    return updated;
  };

  const handleUploadAll = async () => {
    if (detailedCollectionInfo?.jsonFolderCID !== "") {
      toast.error("This collection has already uploaded files");
      setWorking(false);
      return;
    }
    if (!collectionId || collectionId.toString().length !== 24) {
      toast.warn("Please select a collection and try again.");
      setWorking(false);
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
      if (cid !== null) {
        const imagesFolderCid = cid;
        var updatedJsonList = [];
        for (let idx = 0; idx < jsonFileList.length; idx++) {
          const json = JSON.parse(jsonFileList[idx]);

          const updatedJson = updateJson(
            json,
            `ipfs://${imagesFolderCid}/${imageFileList[idx].name}`
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
            setTimeout(() => {
              applyForMinting(cidOfJsonFolder);
            }, 200);
          }
          setJsonFileList([]);
          setWorking(false);
        }
      }
      setImageFileList([]);
      setWorking(false);
    }
  };

  const applyForMinting = async (newJsonFolderCID) => {
    if (collectionId && newJsonFolderCID) {
      if (collectionId?.toString()?.length === 24) {
      } else {
        return;
      }
      const response = await axios.get(
        `${config.ipfsGateway}${newJsonFolderCID}`
      );

      let fethedStr = response.data.toString();
      let itemCount = fethedStr.split("<tr>").length - 2;
      try {
        const response = await updateWithJsonCIDApi(
          collectionId,
          newJsonFolderCID,
          itemCount
        );
        if (response.code !== 0) {
          throw new Error(response.message);
        }
        const updatedResponse = await getCollectionDetails(collectionId);
        let updatedColl = updatedResponse.data || {};
        dispatch(changeDetailedCollection(updatedColl));
      } catch (error) {
        console.log(error);
        const errorMessage = error.message || "An unexpected error occurred";
        toast.error(`Error: ${errorMessage}`);
      } finally {
      }
    }
  };

  const handleSelectMintingWLFile = (files) => {
    let file = files[0];
    if (file) {
      setSelectedMintingWLFile(file);
    }
  };

  useEffect(() => {
    if (working) {
      document.documentElement.classList.add("no-scroll"); // Add no-scroll class to html element
    } else {
      document.documentElement.classList.remove("no-scroll"); // Remove no-scroll class from html element
    }

    return () => {
      document.documentElement.classList.remove("no-scroll"); // Clean up on component unmount
    };
  }, [working]);

  // const handleSwitchChange = (event) => {
  //   console.log("handle switch>>>>>>>>>");
  //   setEnablePublicSale(event.target.checked);
  // };

  return (
    <>
      {isValidUser ? (
        <div
          className="relative bg-[rgba(99,185,78,0.32)] w-screen h-[auto] overflow-hidden text-left text-base text-white"
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
          <div className="relative m-auto w-[80%] h-[auto] mt-[100px] mb-[100px] rounded-3xl ">
            <div
              className="absolute top-0 left-0 w-full h-full bg-black opacity-30 rounded-3xl"
              style={{ boxShadow: " 0px 2px 21px 19px rgba(51,255,0,0.32)" }}
            ></div>

            <div className="m-auto w-[100%] h-[auto] text-19xl back flex flex-col justify-center items-center shadow-2xl ">
              <div className=" w-[100%] flex flex-row flex-wrap m-auto firstDiv mt-[50px]">
                {!editIntro && (
                  <div
                    className="  bg-[rgba(51, 255, 0, 0.01)] editFirst cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={handleEditIntro}
                  >
                    <img src="/assets/edit.png" alt="" />
                  </div>
                )}
                {editIntro && (
                  <div
                    className="  bg-[rgba(51, 255, 0, 0.01)] saveFirst cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={handleSubmit}
                  >
                    Save
                  </div>
                )}
                <div className="relative h-auto flex flex-col items-center flex-no-wrap m-auto nftCard">
                  <div className="mt-16 w-[100%] flex flex-row flex-wrap m-auto firstDiv">
                    <div className="w-[200px] h-[200px]  relative overflow-hidden flex flex-col flex-no-wrap m-auto p-4 bg-[#33ff000f] rounded-3xl ">
                      {detailedCollectionInfo &&
                        detailedCollectionInfo.logoURL !== "" && (
                          <img
                            className="w-full h-full object-cover rounded-xl [box-shadow:0px_-6px_14px_rgba(51,_255,_0,_0.42)]"
                            id="avatarImg"
                            src={
                              logoImg ||
                              `${config.UPLOAD_URL}uploads/${detailedCollectionInfo.logoURL}`
                            }
                            alt="Avatar"
                          />
                        )}
                      <input
                        className=" absolute top-0 left-0 opacity-0 w-full h-full"
                        type="file"
                        onChange={changeAvatar}
                      />
                    </div>
                  </div>
                  <div
                    className=" rounded-3xl bg-[rgba(51, 255, 0, 0.01)] hover:bg-[#23ad00]  shadow-[0px_0px_28px_#33ff00_inset] animate-pulse transition-1s duration-90000 flex flex-row items-center justify-center text-center text-lg  
                            w-[198px] h-[52px] mt-4 text-white cursor-pointer"
                    onClick={() => updateCollectionLog()}
                  >
                    <i className="fas fa-plus mr-3"></i> UPLOAD
                  </div>
                </div>
                {!editIntro && (
                  <div className="w-3/5 h-auto flex flex-col flex-no-wrap m-auto">
                    <b className="relative [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] mb-5 mt-5 md:mt-0 text-[25px] md:text-[30px] lg:text-[38px] ">
                      {detailedCollectionInfo?.name || ""}
                    </b>
                    <div className="relative w-[auto] text break-all">
                      {parse(detailedCollectionInfo?.description || "")}
                    </div>
                    <div className="divider my-6" />
                  </div>
                )}
                {editIntro && (
                  <div className="w-3/5 h-auto flex flex-col flex-no-wrap m-auto mt-[20px] md:mt-[30px]">
                    <input
                      className="relative rounded-3xl bg-black w-[90%] editTitle mb-[10px] md:mb-[20px]"
                      type="text"
                      value={title}
                      placeholder="Enter a title"
                      onChange={handleTitleChange}
                    />
                    <textarea
                      id="message"
                      rows={6}
                      className="editDesc relative bg-black rounded-3xl shadow-[0px_16px_34px_rgba(51,_255,_0,_0.15),_0px_-16px_34px_rgba(51,_255,_0,_0.15),_0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset]"
                      placeholder="Enter a description"
                      value={desc}
                      onChange={handleDescChange}
                    />
                    <div className="divider my-6" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden mt-5 md:mt-8 flex flex-col items-start justify-start gap-[78px] md:gap-[38px] z-[2] w-[90%]">
                <div className="flex flex-row items-center justify-center lg:justify-start w-[90%]">
                  <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Collection Preview
                  </b>
                </div>
                <div className="uploadDivMain text-center text-lg">
                  <label className="uploadDivRight w-[45%]">
                    <div className="w-[100%] h-[100%] flex flex-col justify-center item-center aspect-video rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset]  cursor-pointer">
                      <div className="flex flex-col">
                        <div className="relative flex flex-col justify-center items-center gap-[30px]">
                          <img
                            className="relative w-[50px] h-[50px] md:w-[65px] md:h-[65px] overflow-hidden shrink-0"
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
                          <div className="relative [text-shadow:0px_2px_4px_rgba(51,_255,_0,_0.42)]">
                            <p className="m-0">{`Upload png up-to `}</p>
                            <p className="m-0">
                              {imageFileList?.length > 0
                                ? `${imageFileList?.length} files`
                                : `10k files here..`}
                            </p>
                          </div>
                        </div>
                        <div className="mt-10 relative flex flex-col justify-center items-center gap-[30px]">
                          <img
                            className="relative w-[50px] h-[50px] md:w-[65px] md:h-[65px] overflow-hidden shrink-0"
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
                          <div className="relative [text-shadow:0px_2px_4px_rgba(51,_255,_0,_0.42)]">
                            <p className="m-0">{`Upload json up-to `}</p>
                            <p className="m-0">
                              {jsonFileList?.length > 0
                                ? `${jsonFileList?.length} files`
                                : `10k json files here..`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <div className="uploadDivLeft text-left text-base flex flex-col justify-between">
                    <div className="uploadDivLeftA rounded-3xl shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] box-border  relative">
                      <div className="flex-1 flex flex-row lg:p-2.5 items-center justify-center gap-[8px] md:gap-[8px] lg:gap-[28px] z-[0]">
                        <div className="flex-1 flex flex-row items-center justify-start gap-[2px] md:gap-[8px] lg:gap-[22px] text-xl">
                          <img
                            className="relative rounded-[9.54px] w-[50px] h-[50px] md:w-[40px] md:h-[40px] lg:h-[62px] lg:h-[62px] overflow-hidden shrink-0"
                            alt=""
                            src="/assets/sigma.png"
                          />
                          <div className="flex-1 flex flex-row items-center justify-start gap-[2px]">
                            <div className="relative opacity-[0.5] text-[10px] md:text-[15px] lg:text-[18px] whitespace-nowrap">
                              Minting Price:
                            </div>
                            {!editPrice && (
                              <div className="flex-1 relative text-[20px] md:text-[30px] lg:text-[48px] font-medium text-center px-2">
                                {detailedCollectionInfo?.mintingPrice || 0}
                              </div>
                            )}
                            {editPrice && (
                              <div className="w-[100%] h-[100%] flex flex-col justify-center items-center">
                                <input
                                  className="relative rounded-3xl bg-black w-[90%]  font-medium text-center px-2 text-white h-[30px] md:h-[50px] shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] outline-none my-0"
                                  type="text"
                                  // Regular expression to allow only numbers
                                  value={price}
                                  onKeyDown={handleKeyPress}
                                  onChange={handlePriceChange}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {!editPrice && (
                          <img
                            className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                            alt=""
                            src="/assets/edit.png"
                            onClick={handlePriceIntro}
                          />
                        )}
                        {editPrice && (
                          <div
                            className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                            style={{ cursor: "pointer" }}
                            onClick={handleSubmitPrice}
                          >
                            <img src="/assets/tick.png" alt="" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className=" w-[100%] h-[324px] text-xl overflow-y-auto scrollbar-thin scrollbar-thumb-green-400
                    flex flex-col justify-center items-center
                  "
                    >
                      <div
                        className=" rounded-3xl bg-[rgba(51, 255, 0, 0.01)] hover:bg-[#23ad00]  shadow-[0px_0px_28px_#33ff00_inset] animate-pulse transition-1s duration-90000 flex flex-row items-center justify-center text-center text-lg  
                            w-[260px] h-[80px] mt-4 text-white"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleUploadAll()}
                      >
                        <i className="fas fa-plus mr-3"></i> UPLOAD NFTS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="nftInfo items-start" id="grantParent ">
                <div id="parent">
                  <div className="heading flex flex-row justify-between items-center">
                    <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] ">
                      NFT Information
                    </b>
                    {!editNftInfo && (
                      <img
                        className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                        alt=""
                        src="/assets/edit.png"
                        onClick={handleEditNftInfo}
                      />
                    )}
                    {editNftInfo && (
                      <div
                        className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onClick={handleSubmitNftInfo}
                      >
                        <img src="/assets/tick.png" alt="" />
                      </div>
                    )}
                  </div>
                  <div className="rounded-3xl child">
                    <div className="subChild">
                      <div>Name</div>
                      {!editNftInfo && (
                        <div>{detailedCollectionInfo?.name || ""}</div>
                      )}
                      {editNftInfo && (
                        <div>
                          <input
                            className="relative border-b-2 border-[#33ff00] bg-black font-medium text-center px-2 text-white outline-none my-0 text-10px"
                            type="text"
                            value={nftName}
                            onChange={handleNameChange}
                            placeholder={nftName}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="subChild">
                      <div>Total Minted</div>
                      <div>{detailedCollectionInfo?.items?.length || 0}</div>
                    </div>
                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="subChild items-center">
                      <div className="w-[50%]">NFT Type</div>
                      <div className="w-[50%] text-right">
                        {!editNftInfo && (
                          <div>
                            {CATEGORIES.find(
                              (item) =>
                                item.value === detailedCollectionInfo?.category
                            )?.text || "Arts"}
                          </div>
                        )}
                        {editNftInfo && (
                          <div>
                            <Dropdown
                              className="w-full"
                              value={categories}
                              setValue={setCategories}
                              options={categoriesOptions}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div id="parent">
                  <div className="heading mt-10 flex justify-between items-center">
                    <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] ">
                      Sale mode
                    </b>
                  </div>
                  <div className="rounded-3xl child">
                    <div className="subChild">
                      <div></div>
                      <div className="relative "></div>
                    </div>
                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="flex items-center justify-center">
                      <div>Public Sale</div>
                      <Switch
                        checked={enablePublicSale}
                        onChange={(e, checked) => {
                          handleSwitchSaleMode(checked);
                        }}
                      />
                      <div>Presale</div>
                    </div>
                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="subChild">
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
                <div id="parent">
                  <div className="heading mt-10 flex justify-between items-center">
                    <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] ">
                      Schedule
                    </b>
                    <div
                      className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={handleSubmitSchedule}
                    >
                      <img src="/assets/tick.png" alt="" />
                    </div>
                  </div>
                  <div className="rounded-3xl child">
                    <div className="subChild">
                      <div>Mint Start</div>
                      <div className="relative">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <CustomDateTimePicker
                            label=""
                            value={mintStartDate}
                            onChange={setMintStartDate}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="subChild">
                      <div>Mint Finish</div>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <CustomDateTimePicker
                            label=""
                            value={mintFinishDate}
                            onChange={setMintFinishDate}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>

                    <div className="mx-3 relative box-border h-px border-t-[1px] border-solid border-[rgb(46 56 43)]" />
                    <div className="subChild">
                      <div>WL Sale</div>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <CustomDateTimePicker
                            label=""
                            value={flashSaleDate}
                            onChange={setFlashSaleDate}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------forth div------------- */}
              <div className="relative w-[90%] h-auto flex flex-col flex-wrap m-auto  mt-10 ml ">
                <div className="heading flex flex-row justify-between items-center">
                  <b className=" leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Project Overview
                  </b>
                  {!editOverview && (
                    <img
                      className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                      alt=""
                      src="/assets/edit.png"
                      onClick={handleEditOverview}
                    />
                  )}
                  {editOverview && (
                    <div
                      className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={handleSubmitOverview}
                    >
                      <img src="/assets/tick.png" alt="" />
                    </div>
                  )}
                </div>
                {!editOverview && (
                  <div className="rounded-3xl bg-black shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] flex flex-col py-[26px] px-8 box-border items-center justify-center text-3xl m-auto mt-5">
                    <div className="flex-1 relative w-[100%] text-sm sm:text-lg">
                      {detailedCollectionInfo?.overview || ""}
                    </div>
                  </div>
                )}
                {editOverview && (
                  <div className="rounded-3xl bg-black shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] flex flex-col py-[26px] px-8 box-border items-center justify-center text-3xl m-auto mt-5">
                    <div className="flex-1 relative w-[100%] text-sm sm:text-lg">
                      <textarea
                        className="relative  bg-black w-[100%] font-medium  px-2 text-white outline-none my-0 text-15px"
                        rows={6}
                        value={overview}
                        onChange={handleOverviewChange}
                        placeholder={overview}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ----------fifth view div------------- */}
              <div className="relative  w-[90%] h-auto flex flex-col flex-wrap m-auto  mt-10 ">
                <div className="heading flex flex-row justify-between items-center">
                  <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Project Contact
                  </b>
                  {!editContact && (
                    <img
                      className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                      alt=""
                      src="/assets/edit.png"
                      onClick={handleEditContact}
                    />
                  )}
                  {editContact && (
                    <div
                      className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={handleSubmitContact}
                    >
                      <img src="/assets/tick.png" alt="" />
                    </div>
                  )}
                </div>
                {!editContact && (
                  <div className="rounded-3xl bg-black shadow-[0px_16px_34px_rgba(51,_255,_0,_0.15),_0px_-16px_34px_rgba(51,_255,_0,_0.15),_0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] h-auto flex flex-row flex-wrap sm:flex-no-wrap box-border items-center justify-evenly gap-[15px] mt-5 p-5">
                    <img
                      className="relative overflow-hidden hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-7542.svg"
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      className="relative  overflow-hidden hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-75411.svg"
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      className="relative  hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/frame-7539.svg"
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      className="relative hover:animate-pulse transition-ease duration-90000 contactImg"
                      alt=""
                      src="/assets/twitter.png"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}
                {/* -------fifth edit div----- */}
                {editContact && (
                  <div className="rounded-3xl bg-black shadow-[0px_16px_34px_rgba(51,_255,_0,_0.15),_0px_-16px_34px_rgba(51,_255,_0,_0.15),_0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] w-[100%] h-auto box-border m-auto mt-5 p-5 editContact">
                    <div className="editContactChild flex flex-col gap-[15px]">
                      <div className="w-[100%] flex flex-row justify-around items-center">
                        <div className="w-[20%] flex flex-row justify-center items-center ">
                          <img
                            className="relative overflow-hidden contactImg"
                            alt=""
                            src="/assets/frame-7542.svg"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] ">
                          <input
                            className="relative bg-black w-[80%] font-medium text-center  text-white outline-none my-0 text-20px ml-3 border-none bg-transparent"
                            type="text"
                            value={website}
                            onChange={handleWebsiteChange}
                            placeholder={website}
                          />
                        </div>
                      </div>
                      <div className="w-[100%] flex flex-row justify-around items-center">
                        <div className="w-[20%] flex flex-row justify-center items-center">
                          <img
                            className="relative  overflow-hidden hover:animate-pulse transition-ease duration-90000 contactImg"
                            alt=""
                            src="/assets/frame-75411.svg"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] ">
                          <input
                            className="relative bg-black w-[80%] font-medium text-center  text-white outline-none my-0 text-20px ml-3 border-none bg-transparent"
                            type="text"
                            value={youtube}
                            onChange={handleYoutubeChange}
                            placeholder={youtube}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="editContactChild flex flex-col gap-[15px]">
                      <div className="w-[100%] flex flex-row justify-around items-center">
                        <div className="w-[20%] flex flex-row justify-center items-center">
                          <img
                            className="relative hover:animate-pulse transition-ease duration-90000 contactImg"
                            alt=""
                            src="/assets/twitter.png"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] ">
                          <input
                            className="relative bg-black w-[80%] font-medium text-center  text-white outline-none my-0 text-20px ml-3 border-none bg-transparent"
                            type="text"
                            value={twitter}
                            onChange={handleTwitterChange}
                            placeholder={twitter}
                          />
                        </div>
                      </div>
                      <div className="w-[100%] flex flex-row justify-around items-center">
                        <div className="w-[20%] flex flex-row justify-center items-center">
                          <img
                            className="relative  hover:animate-pulse transition-ease duration-90000 contactImg"
                            alt=""
                            src="/assets/frame-7539.svg"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] ">
                          <input
                            className="relative bg-black w-[80%] font-medium text-center  text-white outline-none my-0 text-20px ml-3 border-none bg-transparent"
                            type="text"
                            value={discord}
                            onChange={handleDiscordChange}
                            placeholder={discord}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ----------sixth div--------- */}
              <div className="overflow-hidden mt-5 md:mt-8 flex flex-col items-start justify-start gap-[38px] z-[2] w-[90%]">
                <div className="flex flex-row items-center justify-center lg:justify-start w-[90%]">
                  <b className="relative leading-[54px] text-[25px] md:text-[30px] lg:text-[38px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    More Options
                  </b>
                </div>

                <div className="uploadDivMain text-center text-lg">
                  <label className="uploadDivRight w-[45%]">
                    <input
                      type="file"
                      accept=".txt"
                      hidden
                      onChange={(e) => {
                        handleSelectMintingWLFile(e.target.files);
                      }}
                    />
                    <div className="w-[100%] h-[100%] flex flex-col justify-center item-center aspect-video rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset]  cursor-pointer">
                      {selectedMintingWLFile ? (
                        <div className="flex flex-col justify-center items-center gap-[30px]">
                          <button
                            className="rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] w-[162px] h-[42px] flex flex-row items-center justify-center gap-[8px] cursor-pointer text-white font-medium"
                            disabled={uploading}
                            style={{ opacity: uploading ? ".5" : "1" }}
                            onClick={() => handleClickUploadMintingWLFile()}
                          >
                            <img
                              className="relative w-6 h-6"
                              alt=""
                              src="/vector8.svg"
                            />
                            {uploading ? "Uploading..." : "Upload"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-center gap-[30px]">
                          <img
                            className="relative w-[50px] h-[50px] md:w-[65px] md:h-[65px] overflow-hidden shrink-0"
                            alt=""
                            src="/assets/addFile.png"
                          />
                          <div className="relative [text-shadow:0px_2px_4px_rgba(51,_255,_0,_0.42)] mt-3 p-0.5">
                            <p className="m-0">{`Upload txt file of whitelisted wallets`}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                  <label className="flex flex-col w-[45%]">
                    <div className=" text-left text-base flex flex-col justify-between">
                      <div className="uploadDivLeftC rounded-3xl shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] box-border  relative">
                        <div className="flex-1 flex flex-row lg:p-2.5 items-center justify-center gap-[8px] md:gap-[8px] lg:gap-[28px] z-[0]">
                          <div className="flex-1 flex flex-row items-center justify-start gap-[2px] md:gap-[8px] lg:gap-[22px] text-xl">
                            <div className="flex-1 flex flex-row items-center justify-start gap-[2px]">
                              <div className="relative opacity-[0.5] text-[10px] md:text-[15px] lg:text-[18px] whitespace-nowrap">
                                Award mintable count:
                              </div>
                              {!editWLMintableMax && (
                                <div className="flex-1 relative text-[20px] md:text-[30px] lg:text-[48px] font-medium text-center px-2">
                                  {detailedCollectionInfo?.wlMintableMax || 0}
                                </div>
                              )}
                              {editWLMintableMax && (
                                <div className="w-[100%] h-[100%] flex flex-col justify-center items-center">
                                  <input
                                    className="relative rounded-3xl bg-black w-[90%]  font-medium text-center px-2 text-white h-[30px] md:h-[50px] shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] outline-none my-0"
                                    type="text"
                                    // Regular expression to allow only numbers
                                    value={wlMintableMax}
                                    onKeyDown={handleKeyPress}
                                    onChange={handleWLMintableMaxChange}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {!editWLMintableMax && (
                            <img
                              className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                              alt=""
                              src="/assets/edit.png"
                              onClick={() => setEditWLMintableMax(true)}
                            />
                          )}
                          {editWLMintableMax && (
                            <div
                              className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleSubmintWLMintableMax()}
                            >
                              <img src="/assets/tick.png" alt="" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className=" mt-5  text-left text-base flex flex-col justify-between">
                      <div className="uploadDivLeftC rounded-3xl shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] box-border  relative">
                        <div className="flex-1 flex flex-row lg:p-2.5 items-center justify-center gap-[8px] md:gap-[8px] lg:gap-[28px] z-[0]">
                          <div className="flex-1 flex flex-row items-center justify-start gap-[2px] md:gap-[8px] lg:gap-[22px] text-xl">
                            <div className="flex-1 flex flex-row items-center justify-start gap-[2px]">
                              <div className="relative opacity-[0.5] text-[10px] md:text-[15px] lg:text-[18px] whitespace-nowrap">
                                Discount rate(%):
                              </div>
                              {!editDiscountRate && (
                                <div className="flex-1 relative text-[20px] md:text-[30px] lg:text-[48px] font-medium text-center px-2">
                                  {detailedCollectionInfo?.wlDiscountRate || 0}
                                </div>
                              )}
                              {editDiscountRate && (
                                <div className="w-[100%] h-[100%] flex flex-col justify-center items-center">
                                  <input
                                    className="relative rounded-3xl bg-black w-[90%]  font-medium text-center px-2 text-white h-[30px] md:h-[50px] shadow-[0px_0px_10px_6px_rgba(51,_255,_0,_0.78)_inset] outline-none my-0"
                                    type="text"
                                    // Regular expression to allow only numbers
                                    value={wlDiscountRate}
                                    onKeyDown={handleKeyPress}
                                    onChange={handleWLDiscountRateChange}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {!editDiscountRate && (
                            <img
                              className="relative w-[20px] h-[20px] md:w-[28px] md:h-[28px  ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                              alt=""
                              src="/assets/edit.png"
                              onClick={() => setEditDiscountRate(true)}
                            />
                          )}
                          {editDiscountRate && (
                            <div
                              className=" relative w-[20px] h-[20px] md:w-[28px] md:h-[28px ] lg:w-[38px] lg:h-[38px] cursor-pointer"
                              onClick={() => handleSubmitWLDiscountRate()}
                            >
                              <img src="/assets/tick.png" alt="" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ----------seventh div--------- */}
              <div className="overflow-hidden mt-5 md:mt-10 flex flex-col items-start justify-start gap-[28px] z-[2] w-[90%]">
                <div className="flex flex-row items-center justify-center lg:justify-start w-[100%] lg:w-[90%]">
                  <b className="relative leading-[54px] text-[19px] md:text-[28px] lg:text-[30px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Set and Share Referral
                  </b>
                </div>

                <div className="bg-[rgba(0, 0, 0, 0.52)] w-full flex flex-col md:flex-row md:justify-between items-center">
                  <div className="relative text-[18px] md:text-[26px] lg:text-[28px] ">
                    Enable referral mint link and set rates
                  </div>
                  <Switch
                    color="success"
                    checked={enableReferral}
                    onChange={(e, checked) => {
                      handleSwitchReferral(checked);
                    }}
                  />
                </div>
                {enableReferral && (
                  <>
                    {referralSettings &&
                      referralSettings.length > 0 &&
                      referralSettings.map((setting, index) => (
                        <div
                          key={index}
                          className="bg-transparent w-[100%] flex flex-row justify-between items-center"
                        >
                          <button
                            className="flex flex-col h-[56px] justify-center items-center bg-transparent cursor-pointer"
                            onClick={() => handleRemoveReferral(index)}
                          >
                            <img
                              src="/assets/clear.png"
                              alt="Clear"
                              className="clearButton"
                            />
                          </button>
                          <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] flex h-[56px] justify-between items-center px-6">
                            <div className="relative bg-black w-[90%] font-medium text-start  text-[#808080] outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px]">
                              Numbers of Referral
                            </div>
                            <input
                              className="relative bg-black w-[30%] font-medium text-end  text-white outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px] border-none"
                              type="text" // Regular expression to allow only numbers
                              value={setting?.num}
                              onChange={(e) =>
                                handleReferralNumChange(e, index)
                              }
                              onKeyDown={handleKeyPress}
                              placeholder={setting?.num}
                            />
                          </div>
                          <div className="text-[12px] md:text-[16px] lg:text-[20px]">
                            =
                          </div>
                          <div className="w-[20%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] flex flex-row h-[56px] justify-around items-center">
                            <input
                              className="relative bg-transparent w-[70%] font-medium text-center  text-white outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px] border-none"
                              type="text" // Regular expression to allow only numbers
                              value={setting?.rate}
                              onChange={(e) =>
                                handleReferralRateChange(e, index)
                              }
                              onKeyDown={handleKeyPress}
                              placeholder={setting?.rate}
                            />
                            <div className="pr-[7px] md:pr-[10px] lg:pr-[5px] text-[13px] md:text-[15px] lg:text-[17px]">
                              %
                            </div>
                          </div>
                        </div>
                      ))}
                    <div
                      className="addReferralButton cursor-pointer rounded-3xl h-[56px] text-[12px] md:text-[16px] lg:text-[20px] flex items-center"
                      onClick={() => handleAddReferral()}
                    >
                      Add
                      <img src="/assets/add.png" alt="+" height={25} />
                    </div>
                    <div
                      className="addReferralButton cursor-pointer rounded-3xl h-[56px] text-[12px] md:text-[16px] lg:text-[20px] flex items-center"
                      onClick={() => handleApplyReferrals()}
                    >
                      Apply
                    </div>
                  </>
                )}
                <div className="divider my-6" />
                <div className="flex flex-row items-center justify-center lg:justify-start w-[100%] lg:w-[100%]">
                  <b className="relative leading-[54px] text-[19px] md:text-[28px] lg:text-[30px] [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)]">
                    Set single or multiple treasuries
                  </b>
                </div>

                {treasuryFields &&
                  treasuryFields.length > 0 &&
                  treasuryFields.map((royalty, index) => (
                    <div
                      className="bg-transparent w-[100%] flex flex-row justify-between items-center"
                      key={index}
                    >
                      <button
                        className="flex flex-col bg-transparent h-[56px] justify-center items-center cursor-pointer"
                        onClick={() => removeTreasuryField(index)}
                      >
                        <img
                          src="/assets/clear.png"
                          alt="Clear"
                          className="clearButton"
                        />
                      </button>
                      <div className="w-[70%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] flex flex-col h-[56px] justify-center items-center">
                        <div className="relative bg-black w-[90%] font-medium text-start  text-[#808080] outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px]">
                          <input
                            className="relative bg-black w-full font-medium text-start  text-white 
                              outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px] border-none"
                            type="text"
                            value={royalty?.address}
                            onChange={(e) =>
                              handleChangeTreasuryAddressInput(e, index)
                            }
                            placeholder="Wallet address"
                          />
                        </div>
                      </div>
                      <div className="w-[20%] rounded-3xl bg-black shadow-[0px_8px_16px_rgba(51,_255,_0,_0.15),_0px_-8px_16px_rgba(51,_255,_0,_0.15),_0px_0px_5px_3px_rgba(51,_255,_0,_0.78)_inset] flex flex-row h-[56px] justify-around items-center">
                        <input
                          className="relative bg-transparent w-[70%] font-medium text-center  text-white outline-none my-0 text-[12px] md:text-[16px] lg:text-[20px] border-none"
                          type="text"
                          // pattern="[0-9]*" // Regular expression to allow only numbers
                          value={royalty?.percentage}
                          onChange={(e) =>
                            handleChangeTreasuryPercentageInput(e, index)
                          }
                          onKeyDown={handleKeyPress}
                          placeholder={royalty?.percentage}
                        />
                        <div className="pr-[7px] md:pr-[10px] lg:pr-[5px] text-[13px] md:text-[15px] lg:text-[17px]">
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                <div
                  className="addReferralButton rounded-3xl h-[56px] text-[12px] md:text-[16px] lg:text-[20px] cursor-pointer"
                  onClick={() => setAddTreasuryField()}
                >
                  Add
                  <img src="/assets/add.png" alt="+" height={25} />
                </div>
                <div
                  className="addReferralButton rounded-3xl h-[56px] text-[12px] md:text-[16px] lg:text-[20px] flex items-center cursor-pointer"
                  onClick={() => handleApplyTreasuries()}
                >
                  Apply
                </div>
              </div>

              <div className="buttonsLastDiv gap-[50px] relative w-[90%] h-[auto] text-center text-xl my-10">
                <div
                  className="buttonsLast rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[62px] my-5 hover:animate-pulse transition-ease duration-90000"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/launchpad/${collectionId}`)}
                >
                  Preview Launchpad
                </div>
                <div
                  className="buttonsLast rounded-3xl bg-[rgba(51, 255, 0, 0.01)] shadow-[0px_0px_28px_#33ff00_inset] flex flex-col py-0 px-7 items-center justify-center h-[62px]  my-5 hover:animate-pulse transition-ease duration-90000"
                  style={{ cursor: "pointer" }}
                >
                  Confirm for Approval
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 w-full "></div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] p-5">
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      )}

      <Backdrop
        sx={{
          color: "#ffffff3f",
          backgroundColor: "#000000cc",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={working}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};
export default PageLunchpadSetting;