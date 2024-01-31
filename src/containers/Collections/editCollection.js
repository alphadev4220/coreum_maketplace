import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import Icon from "../../components/StyleComponent/Icon";
import styles from "./Profile.module.sass";
import styles1 from "./ProfileEdit.module.sass";
import styles2 from "./UploadDetails.module.sass";
import { toast } from "react-toastify";
import { config, CATEGORIES } from "app/config.js";
import Dropdown from "../../components/Button/Dropdown";
import { useAppSelector } from "app/hooks";

import ButtonPrimary from "components/Button/ButtonPrimary";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import FormItem from "components/StyleComponent/FormItem";
import Input from "components/StyleComponent/Input";
import Checkbox from "@mui/material/Checkbox";
import Label from "components/StyleComponent/Label";
import { useNavigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import VideoForBannerPreview from "components/Card/VideoForBannerPreview";
import { nanoid } from "@reduxjs/toolkit";
import {
  EditorState,
  convertFromHTML,
  convertToRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { isVideo } from "utils/utils";
import defaultLogo from "images/default_logo.png";
import defaultBanner from "images/default_banner.jpg";
import { getCollectionDetails, updateCollectionApi } from "app/api/collections";
import { uploadFile } from "app/api/utils";
import MainSection from "components/Section/MainSection";

const EditCollection = () => {
  const categoriesOptions = CATEGORIES;
  const [DEMO_NFT_ID] = React.useState(nanoid());

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [categories, setCategories] = useState(categoriesOptions[0]);
  const [floorPrice, setFloorPrice] = useState(0);
  const [oldData, setOldData] = useState({});
  const [working, setWorking] = useState(false);
  const [blurItems, setBlurItems] = useState(false);
  const [enableLaunchpad, setEnableLaunchpad] = useState(false);

  const navigate = useNavigate();
  const currentUsr = useAppSelector(selectCurrentUser);
  const { collectionId } = useParams();

  useEffect(() => {
    const setData = async () => {
      try {
        setWorking(true);
        const response = await getCollectionDetails(collectionId);
        const collection = response.data;
        if (currentUsr && currentUsr?._id !== collection?.owner._id) {
          navigate("/");
          setWorking(false);
          return;
        }
        setOldData(collection);
        setTextName(collection.name);
        setCategories(
          categoriesOptions.find(
            (category) => category.value === collection.category
          )
        );
        setFloorPrice(collection.price);
        setEnableLaunchpad(collection?.enableLaunchpad || false);

        const contentBlocks = convertFromHTML(collection.description);
        const contentState = ContentState.createFromBlockArray(contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (error) {
        console.log(error);
      } finally {
        setWorking(false);
      }
    };
    setData();
  }, [collectionId]);

  const changeBanner = (event) => {
    var file = event.target.files[0];
    if (file === null) return;
    setSelectedBannerFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBannerImg(reader.result);
    };
    reader.onerror = function (error) {};
  };

  const changeAvatar = (event) => {
    var file = event.target.files[0];
    if (file === null) return;
    setSelectedAvatarFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setLogoImg(reader.result);
    };
    reader.onerror = function (error) {};
    document.getElementById("preSelectSentence").style.display = "none";
  };

  const saveCollection = async (params) => {
    setWorking(true);
    try {
      const response = await updateCollectionApi(params, oldData?._id);
      if (response.code === 0) {
        toast.success("Successfully updated collection");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("creating collection error : ", error);
      toast.error("Update collection failed");
    } finally {
      setWorking(false);
    }
  };

  const updateCollection = async () => {
    if (currentUsr === null || currentUsr === undefined) {
      toast.warn("Please sign in and try again.");
      return;
    }
    if (textName === "") {
      toast.warn("Collection name can not be empty.");
      return;
    }
    setWorking(true);
    const params = {};
    if (logoImg !== oldData.logoURL) {
      var formData = new FormData();
      formData.append("itemFile", selectedAvatarFile);
      formData.append("authorId", "rize");

      try {
        const response = await uploadFile(formData);
        if (response.code === 0) {
          params.logoURL = response.path;
        } else {
          toast.warn(response.message);
        }
      } catch (error) {
        toast.error("Logo Uploading failed.");
      } finally {
        setWorking(false);
      }
    }

    if (bannerImg !== oldData.bannerURL) {
      formData = new FormData();
      formData.append("itemFile", selectedBannerFile);
      formData.append("authorId", "hch");
      try {
        const response = await uploadFile(formData);
        if (response.code === 0) {
          params.bannerURL = response.path;
        } else {
          toast.warn(response.message);
        }
      } catch (error) {
        toast.error("Banner Uploading failed.");
      } finally {
        setWorking(false);
      }
    }

    if (textName !== oldData.name) {
      params.name = textName;
    }
    if (textDescription !== oldData.description) {
      params.description = textDescription;
    }
    if (categories.value !== oldData.category) {
      params.category = categories.value;
    }
    if (floorPrice !== oldData.price) {
      params.price = floorPrice;
    }
    params.blurItems = blurItems;
    params.enableLaunchpad = enableLaunchpad;
    saveCollection(params);
  };
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setTextDescription(
      draftToHtml(convertToRaw(editorState.getCurrentContent())) || ""
    );
  };

  return (
    <MainSection title="Edit a Collection">
      <div className="container">
        <div style={{ paddingTop: "3rem", paddingRight: "3rem" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            Edit a collection
          </h1>
        </div>
        <div
          className={styles1.user}
          style={{
            marginTop: "1rem",
          }}
        >
          <div className={styles1.details}>
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
              }}
            >
              <div id="preSelectSentence" style={{ position: "absolute" }}>
                <div className={styles2.icon}>
                  <Icon name="upload-file" size="24px" />
                </div>
              </div>
              <input
                className={styles1.load}
                type="file"
                accept=".png,.jpeg,.jpg,.gif,.webp"
                onChange={changeAvatar}
              />
              <div className={styles1.avatar}>
                <img
                  id="avatarImg"
                  src={
                    logoImg !== ""
                      ? logoImg
                      : `${config.UPLOAD_URL}uploads/${oldData.logoURL}`
                  }
                  alt={defaultLogo}
                />
              </div>
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
            <div className={styles1.stage}>Banner image</div>
            <div className={styles1.text}>
              This image will be appear at the top of your collection page.
              Avoid including too much text in this banner image, as the
              dimensions change on different devices. 1400x400 recommend.
            </div>
          </div>
        </div>
        <div
          className={styles2.item}
          style={{ border: "3px dashed rgb(204, 204, 204)", height: "200px" }}
        >
          <div className={styles2.file}>
            <div className={styles2.icon}>
              <Icon name="upload-file" size="48px" />
            </div>
            <input
              className={styles2.load}
              type="file"
              onChange={changeBanner}
            />
            <div>
              {isVideo(bannerImg || "") !== true ? (
                <img
                  id="BannerImg"
                  className={styles2.image}
                  src={
                    bannerImg !== ""
                      ? bannerImg
                      : `${config.UPLOAD_URL}uploads/${oldData.bannerURL}`
                  }
                  alt={defaultBanner}
                />
              ) : (
                <VideoForBannerPreview
                  nftId={DEMO_NFT_ID}
                  className={styles2.image}
                  src={
                    bannerImg !== ""
                      ? bannerImg
                      : `${config.UPLOAD_URL}uploads/${oldData.bannerURL}`
                  }
                  alt={defaultBanner}
                />
              )}
            </div>
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
                  disabled
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
                wrapperClassName="demo-wrapper mt-1.5 "
                editorClassName="demo-editor border-2 rounded-lg border-neutral-100 dark:border-neutral-400  min-h-[200px]"
                onEditorStateChange={onEditorStateChange}
              />
            </div>
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
              onClick={() => updateCollection()}
              // type="button" hide after form customization
              type="button"
            >
              <span>Save Collection</span>
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
    </MainSection>
  );
};

export default EditCollection;