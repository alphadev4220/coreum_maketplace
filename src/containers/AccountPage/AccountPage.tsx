import Label from "components/StyleComponent/Label";
import { FC, useEffect, useState } from "react";
import Avatar from "components/StyleComponent/Avatar";
import ButtonPrimary from "components/Button/ButtonPrimary";
import Input from "components/StyleComponent/Input";
import Textarea from "components/StyleComponent/Textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeAuthor,
  changeDetailedUserInfo,
  selectCurrentUser,
} from "app/reducers/auth.reducers";
import InputItem from "./InputItem";
import { getUserInfo, updateUser } from "app/api/users";
import { Backdrop, CircularProgress } from "@mui/material";
import { ValidateEmail, ValidateWebsiteLink } from "utils/utils";
import MainSection from "components/Section/MainSection";
import ModalCrop from "components/Modal/CropModal";

export interface AccountPageProps {
  className?: string;
}

const AccountPage: FC<AccountPageProps> = () => {
  const currentUsr = useAppSelector(selectCurrentUser);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [nameText, setNameText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [bioText, setBioText] = useState("");
  const [websiteText, setWebsiteText] = useState("");
  const [facebookText, setFacebookText] = useState("");
  const [twitterText, setTwitterText] = useState("");
  const [telegramText, setTelegramText] = useState("");
  const [spotifyText, setSpotifyText] = useState("");
  const [instagramText, setInstagramText] = useState("");
  const [soundCloudText, setSoundCloudText] = useState("");
  const [bandcampText, setBandcampText] = useState("");
  const [walletAccountText, setWalletAccountText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [newAvatar, setNewAvatar] = useState("");
  const [isCrop, setIsCrop] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const openModalCrop = () => setIsCrop(true);
  const closeModalCrop = () => setIsCrop(false);

  useEffect(() => {
    setNameText(currentUsr?.username || "");
    setEmailText(currentUsr?.email?.toString() || "");
    setBioText(currentUsr?.userBio?.toString() || "");
    setEmailText(currentUsr?.email?.toString() || "");
    setWebsiteText(currentUsr?.websiteURL?.toString() || "");
    setFacebookText(currentUsr?.facebook?.toString() || "");
    setTwitterText(currentUsr?.twitter?.toString() || "");
    setTelegramText(currentUsr?.telegram?.toString() || "");
    setSpotifyText(currentUsr?.spotify?.toString() || "");
    setInstagramText(currentUsr?.instagram?.toString() || "");
    setSoundCloudText(currentUsr?.soundcloud?.toString() || "");
    setBandcampText(currentUsr?.bandcamp?.toString() || "");
    setWalletAccountText(currentUsr?.address?.toString() || "");
    setSelectedAvatarFile(currentUsr?.avatar);
  }, [currentUsr]);

  const changeAvatar = (event: any) => {
    var file = event.target.files[0];
    if (file === null) return;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNewAvatar(reader.result?.toString() || "");
      openModalCrop();
    };
    reader.onerror = function () {};
  };

  const onClickUpdate = async () => {
    const params = {
      email: emailText,
      address: walletAccountText,
      username: nameText,
      websiteURL: websiteText,
      userBio: bioText,
      verified: true,
      banner: "",
      twitter: twitterText,
      facebook: facebookText,
      telegram: telegramText,
      spotify: spotifyText,
      instagram: instagramText,
      soundcloud: soundCloudText,
      bandcamp: bandcampText,
      avatar: selectedAvatarFile,
    };
    if (emailText !== "") {
      let correct = ValidateEmail(emailText);
      if (!correct) {
        toast.error("Invalid email.");
        params.email = "";
        return;
      }
    }
    if (walletAccountText !== "") {
    } else {
      toast.warn("Wallet account can not be empty.");
      return;
    }
    if (nameText === "") {
      toast.warn("Username can not be empty.");
      return;
    }
    params.username = nameText;
    if (websiteText !== "") {
      let correct = ValidateWebsiteLink(websiteText);
      if (!correct) {
        toast.warn("Invalid custom url.");
        params.websiteURL = "";
        return;
      }
    } else params.websiteURL = "";

    if (facebookText !== "") {
      let correct = ValidateWebsiteLink(facebookText);
      if (!correct) {
        toast.warn(
          "Invalid facebook url. Please input full path including https."
        );
        params.facebook = "";
        return;
      }
    } else params.facebook = "";

    if (twitterText !== "") {
      let correct = ValidateWebsiteLink(twitterText);
      if (!correct) {
        toast.warn(
          "Invalid twitter url. Please input full path including https."
        );
        params.twitter = "";
        return;
      }
    } else params.twitter = "";

    if (telegramText !== "") {
      let correct = ValidateWebsiteLink(telegramText);
      if (!correct) {
        toast.warn(
          "Invalid telegram url. Please input full path including https."
        );
        params.telegram = "";
        return;
      }
    } else params.telegram = "";

    if (spotifyText !== "") {
      let correct = ValidateWebsiteLink(spotifyText);
      if (!correct) {
        toast.warn(
          "Invalid spotify url. Please input full path including https."
        );
        params.spotify = "";
        return;
      }
    } else params.spotify = "";

    if (instagramText !== "") {
      let correct = ValidateWebsiteLink(instagramText);
      if (!correct) {
        toast.warn(
          "Invalid instagram url. Please input full path including https."
        );
        params.instagram = "";
        return;
      }
    } else params.instagram = "";

    if (soundCloudText !== "") {
      let correct = ValidateWebsiteLink(soundCloudText);
      if (!correct) {
        toast.warn(
          "Invalid soundcloud url. Please input full path including https."
        );
        params.soundcloud = "";
        return;
      }
    } else params.soundcloud = "";

    if (bandcampText !== "") {
      let correct = ValidateWebsiteLink(bandcampText);
      if (!correct) {
        toast.warn(
          "Invalid bandcamp url. Please input full path including https."
        );
        params.bandcamp = "";
        return;
      }
    } else params.bandcamp = "";

    if (selectedAvatarFile && selectedAvatarFile !== "") {
      params.avatar = selectedAvatarFile;
    }
    setProcessing(true);
    try {
      const updateResponse = await updateUser(params, currentUsr?._id);
      if (updateResponse.code === 0) {
        const userInfoResponse = await getUserInfo(currentUsr._id);
        dispatch(changeAuthor(userInfoResponse.data));
        dispatch(changeDetailedUserInfo(userInfoResponse.data));
        toast.success("Successfully updated the profile");
        navigate("/");
      } else {
        toast.warn(updateResponse.message);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("An error occured");
    }
    setProcessing(false);
  };

  return (
    <MainSection title="Account">
      <div className="container">
        <div className="max-w-4xl mx-auto my-12 space-y-8 sm:lg:my-16 lg:my-24 sm:space-y-10">
          {/* HEADING */}
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Profile settings
            </h2>
            <span className="block mt-3 text-neutral-500 dark:text-neutral-400">
              You can set preferred display name, create your profile URL and
              manage other personal settings.
            </span>
          </div>
          <div className="w-full border-b-2 border-neutral-100 dark:border-neutral-600"></div>
          <div className="flex flex-col md:flex-row">
            <div className="flex items-start flex-shrink-0">
              <div className="relative flex overflow-hidden rounded-full">
                <Avatar sizeClass="w-32 h-32" imgUrl={selectedAvatarFile} />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black cursor-pointer bg-opacity-60 text-neutral-50">
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
                  <span className="mt-1 text-xs">Change Image</span>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => changeAvatar(e)}
                />
              </div>
            </div>
            <div className="flex-grow max-w-3xl mt-10 space-y-5 md:mt-0 md:pl-16 sm:space-y-6 md:sm:space-y-7">
              <div>
                <Label>Username</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Eden Tuan"
                  value={nameText}
                  onChange={(e) => setNameText(e.target.value)}
                />
              </div>

              <InputItem
                label="Email"
                value={emailText}
                onChange={setEmailText}
              ></InputItem>

              <div>
                <Label>Bio</Label>
                <Textarea
                  rows={5}
                  className="mt-1.5"
                  placeholder="Something about yourself in a few words."
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-2.5">
                <InputItem
                  className="mt-2"
                  label="Website"
                  value={websiteText}
                  onChange={setWebsiteText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Facebook"
                  value={facebookText}
                  onChange={setFacebookText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Twitter"
                  value={twitterText}
                  onChange={setTwitterText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Telegram"
                  value={telegramText}
                  onChange={setTelegramText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Spotify"
                  value={spotifyText}
                  onChange={setSpotifyText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Instagram"
                  value={instagramText}
                  onChange={setInstagramText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Soundcloud"
                  value={soundCloudText}
                  onChange={setSoundCloudText}
                ></InputItem>
                <InputItem
                  className="mt-2"
                  label="Bandcamp"
                  value={bandcampText}
                  onChange={setBandcampText}
                ></InputItem>
              </div>
              <div>
                <Label>Wallet Address</Label>
                <div className="mt-1.5 relative text-neutral-700 dark:text-neutral-300">
                  <Input
                    className="!pr-10 "
                    placeholder="0x1bde388826caab77bfe80148abdce6830606e2c6"
                    value={walletAccountText}
                    onChange={(e) => setWalletAccountText(e.target.value)}
                  />

                  <span className="absolute right-2.5 cursor-pointer top-1/2 -translate-y-1/2 ">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21.6602 10.44L20.6802 14.62C19.8402 18.23 18.1802 19.69 15.0602 19.39C14.5602 19.35 14.0202 19.26 13.4402 19.12L11.7602 18.72C7.59018 17.73 6.30018 15.67 7.28018 11.49L8.26018 7.30001C8.46018 6.45001 8.70018 5.71001 9.00018 5.10001C10.1702 2.68001 12.1602 2.03001 15.5002 2.82001L17.1702 3.21001C21.3602 4.19001 22.6402 6.26001 21.6602 10.44Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.0603 19.3901C14.4403 19.8101 13.6603 20.1601 12.7103 20.4701L11.1303 20.9901C7.16034 22.2701 5.07034 21.2001 3.78034 17.2301L2.50034 13.2801C1.22034 9.3101 2.28034 7.2101 6.25034 5.9301L7.83034 5.4101C8.24034 5.2801 8.63034 5.1701 9.00034 5.1001C8.70034 5.7101 8.46034 6.4501 8.26034 7.3001L7.28034 11.4901C6.30034 15.6701 7.59034 17.7301 11.7603 18.7201L13.4403 19.1201C14.0203 19.2601 14.5603 19.3501 15.0603 19.3901Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <ButtonPrimary
                  className="w-full"
                  onClick={() => {
                    onClickUpdate();
                  }}
                >
                  Update profile
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalCrop
        show={isCrop}
        onOk={setSelectedAvatarFile}
        onCloseModalCrop={closeModalCrop}
        image={newAvatar}
      />
      {
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={processing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </MainSection>
  );
};

export default AccountPage;