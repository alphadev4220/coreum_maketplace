import { FC, Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NcImage from "components/NcComponent/NcImage";
import ButtonPrimary from "components/Button/ButtonPrimary";
import SocialsList from "components/StyleComponent/SocialsList";
import FollowButton from "components/Button/FollowButton";
import { MdOutlineVerified } from "react-icons/md";

import { Tab } from "@headlessui/react";
import EffectListBox, {
  NFT_EFFECT,
} from "components/StyleComponent/EffectListBox";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeDetailedUserInfo,
  selectCurrentUser,
  changeOtherUserInfo,
  selectCurrentNetworkSymbol,
} from "app/reducers/auth.reducers";
import {
  changeFollow,
  changeFollowList,
  changeFollowingList,
  changeIsExists,
} from "app/reducers/flollow.reducers";
import { PLATFORM_NETWORKS, config } from "app/config";
import { useParams } from "react-router-dom";
import { getMidAddress, isEmpty } from "app/methods";
import { changeCollectionList } from "app/reducers/collection.reducers";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import CopyButton from "components/Button/CopyButton";
import { UserData } from "app/reducers/auth.reducers";
import CollectionCard from "components/Card/CollectionCard";
import styles from "../Collections/Profile.module.sass";
import { PROFILE_TABS } from "app/config";
import { FiFacebook } from "react-icons/fi";
import {
  TbBrandTelegram,
  TbBrandTwitter,
  TbBrandSpotify,
  TbBrandInstagram,
  TbBrandSoundcloud,
} from "react-icons/tb";
import { FaBandcamp } from "react-icons/fa";
import { convertHexToString } from "xrpl";
import CardInWalletNFT from "components/Card/CardInWalletNFT";
import CardForAcceptTRansferNFT from "components/Card/CardForAcceptTRansferNFT";
import { Backdrop, CircularProgress } from "@mui/material";
import CardNFTComponent from "components/Card/CardNFTComponent";
import CardAuthorBox from "components/Card/CardAuthorBox";
import { SocialType } from "components/StyleComponent/SocialsList";
import {
  getExistsStatus,
  getFollowings,
  getFollows,
  setFollow,
} from "app/api/follow";
import { getUserInfo } from "app/api/users";
import { getCollectionList } from "app/api/collections";
import { getTransferPendings } from "app/api/itemActivity";
import MainSection from "components/Section/MainSection";
import { useItemsApiServices } from "app/api/useItemsApiServices";


var socket = io(`${config.socketUrl}`);

export interface AuthorPageProps {
  className?: string;
}

export interface UserItemFetchingParams {
  start?: number;
  last?: number;
  activeindex?: number;
}

const AuthorPage: FC<AuthorPageProps> = () => {
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const currentUsr = useAppSelector(selectCurrentUser);
  const [userSocials, setUerSocials] = useState(Array<SocialType>);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { getItemsofUser, getNFTsInWallet } = useItemsApiServices();

  const [isliked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState(PROFILE_TABS.ALLNFTS);
  const activeIndex = useRef(PROFILE_TABS.ALLNFTS);
  const [items, setItems] = useState([]);
  const { userId } = useParams(); //taget_id in making follow
  const [detailedUserInfo, setDetailedUserInfo] = useState<UserData>();
  const [effect, setEffect] = useState(NFT_EFFECT.NO_EFFECT);
  const moreLoading = useRef(false);
  const isEnd = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [processing, setProcessing] = useState(false);
  const categories = [
    "All Nfts",
    "Liked",
    "Following",
    "Followers",
    "Collections",
    "In wallet",
    "Transfer",
  ];
  useEffect(() => {
    var socs = [];
    if (detailedUserInfo?.facebook)
      socs.push({
        name: "Facebook",
        icon: <FiFacebook color={"#33FF00"} />,
        href: detailedUserInfo?.facebook,
      });
    if (detailedUserInfo?.telegram)
      socs.push({
        name: "Telegram",
        icon: <TbBrandTelegram color={"#33FF00"} />,
        href: detailedUserInfo?.telegram,
      });
    if (detailedUserInfo?.twitter)
      socs.push({
        name: "Twitter",
        icon: <TbBrandTwitter color={"#33FF00"} />,
        href: detailedUserInfo?.twitter,
      });
    if (detailedUserInfo?.spotify)
      socs.push({
        name: "Spotify",
        icon: <TbBrandSpotify color={"#33FF00"} />,
        href: detailedUserInfo?.spotify,
      });
    if (detailedUserInfo?.instagram)
      socs.push({
        name: "Instagram",
        icon: <TbBrandInstagram color={"#33FF00"} />,
        href: detailedUserInfo?.instagram,
      });
    if (detailedUserInfo?.soundcloud)
      socs.push({
        name: "SoundCloud",
        icon: <TbBrandSoundcloud color={"#33FF00"} />,
        href: detailedUserInfo?.soundcloud,
      });
    if (detailedUserInfo?.bandcamp)
      socs.push({
        name: "BandCamp",
        icon: <FaBandcamp color={"#33FF00"} />,
        href: detailedUserInfo?.bandcamp,
      });
    setUerSocials(socs);
  }, [detailedUserInfo]);

  const getIsExists = async (user_id: string, target_id: string) => {
    if (isEmpty(user_id) || isEmpty(target_id)) return;
    try {
      const response = await getExistsStatus(user_id, target_id);
      if (response.code === 0) {
        setIsLiked(response.data);
        dispatch(changeIsExists(response.data));
      } else {
        console.log("Error:", response.message);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };
  const toggleFollow = async (my_id: string, target_id: string) => {
    if (isEmpty(my_id) || isEmpty(target_id)) return;
    try {
      const response = await setFollow(my_id, target_id);
      if (response.code === 0) {
        dispatch(changeFollow({ follow_status: true }));
      } else {
        console.log("Warn:", response.message);
        dispatch(changeFollow({ follow_status: false }));
      }
    } catch (error) {
      console.log("Error:", error);
      dispatch(changeFollow({ follow_status: false }));
    }
  };

  const getDetailedUserInfo = async (userId: string, isForMine = true) => {
    if (isEmpty(userId)) return;

    try {
      const response = await getUserInfo(userId);
      const userData = response.data || {};

      if (isForMine) {
        dispatch(changeDetailedUserInfo(userData));
      } else {
        dispatch(changeOtherUserInfo(userData));
      }
      setDetailedUserInfo(userData);
    } catch (error) {
      console.error("Get detailed userInfo failed.", error);
    }
  };

  const getFollowList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    setProcessing(true);

    try {
      const response = await getFollows(limit, user_id);
      const followData = response.data || [];
      if (followData.length < limit) {
        isEnd.current = true;
      }
      setItems(followData);
      dispatch(changeFollowList(followData));
    } catch (error) {
      console.error("Failed to get follow list", error);
    } finally {
      setProcessing(false);
    }
  };

  const getFollowingList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    setProcessing(true);
    try {
      const response = await getFollowings(user_id, limit);
      const followingData = response.data || [];

      if (followingData.length < limit) isEnd.current = true;
      setItems(followingData);
      dispatch(changeFollowingList(followingData));
    } catch (error) {
      console.error("Failed to get following list", error);
    } finally {
      setProcessing(false);
    }
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
      adjustedWindowHeight + adjustedScrollPosition + 100 >= adjustedDocumentHeight
    );
  };
  useEffect(() => {
    localStorage.setItem("currentItemCount", "0");
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!isEnd.current) {
        if (!moreLoading.current && isScrollAtBottom()) {
          moreLoading.current = true;
          getItemsOfUserByConditions(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getItemsOfUserByConditions = async (restart) => {

    if (isEmpty(userId)) return;

    let currentItemCount = Number(localStorage.getItem("currentItemCount")) || 0;
    if (restart) {
      currentItemCount = 0;
    }
    localStorage.setItem("currentItemCount", currentItemCount.toString());

    const params = {
      start: currentItemCount,
      last: currentItemCount + 10,
      activeindex: activeIndex.current,
      userId: userId
    };

    setProcessing(true);

    try {
      const response = await getItemsofUser(params);
      const itemsData = response.data || [];
      isEnd.current = itemsData.length < 10;

      const newList = itemsData.map(itemData => ({
        ...itemData.item_info,
        isLiked: itemData.item_info.likes.includes(currentUsr._id),
        owner: itemData.owner_info,
        creator: itemData.creator_info,
        blur: itemData.blurItems,
        users: [{ avatar: itemData.creator_info.avatar }],
        collection_id: itemData.collection_info
      }));

      setItems(restart ? newList : items => items.concat(newList));
      localStorage.setItem("currentItemCount", (currentItemCount + newList.length).toString());
    } catch (error) {
      console.error("get_items_of_user: ", error);
    } finally {
      moreLoading.current = false;
      setProcessing(false);
    }
  };

  const getCollections = async (limit, currentUserId) => {
    setProcessing(true);

    try {
      const response = await getCollectionList(
        limit,
        currentUserId,
        currentNetworkSymbol
      );
      const data = response.data || [];
      if (data.length < limit) isEnd.current = true;
      setItems(data);
      dispatch(changeCollectionList(data));
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getTransferPendingItems = async (userId) => {
    setProcessing(true);
    let pendingItems = [];

    try {
      const response = await getTransferPendings(userId);
      const itemArray = response.data || [];
      pendingItems = itemArray.map((item) => ({
        imageUrl: item?.item?.logoURL,
        name: item?.item?.name,
        NFTTokenID: item?.item?.tokenId,
        transactionHash: item?.transactionHash,
        itemId: item?.item?._id,
        senderAddress: item?.origin?.address,
        actId: item?._id,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setItems(pendingItems);
      setProcessing(false);
    }
  };

  useEffect(() => {
    getDetailedUserInfo(
      userId || "",
      (userId || "") === (currentUsr?._id || "")
    );
  }, [userId]);

  useEffect(() => {
    socket.on("UpdateStatus", () => {
      getDetailedUserInfo(
        userId || "",
        (userId || "") === (currentUsr?._id || "")
      );
      getIsExists(currentUsr?._id || "", userId || "");
      const selectedTabFunction = tabFunctions[activeTab];
      if (selectedTabFunction) {
        selectedTabFunction();
      }
    });
    getIsExists(currentUsr?._id || "", userId || "");
  }, []);

  const readWalletNFTs = async () => {
    setProcessing(true);
    try {
      const response = await getNFTsInWallet(currentUsr?.address || "");
      const accountNFTs = response.data || [];
      const resultArray = accountNFTs
        .filter((item) => item.URI !== undefined)
        .map((item) => ({
          ...item,
          URI: convertHexToString(item.URI.toString()),
        }));

      setItems(resultArray);
    } catch (error) {
      console.error("error >>> ", error);
    } finally {
      setProcessing(false);
    }
  };

  const tabFunctions = {
    [PROFILE_TABS.ALLNFTS]: () => {
      if (userId !== undefined) {
        getItemsOfUserByConditions(true);
      }
    },
    [PROFILE_TABS.LIKED]: () => {
      if (userId !== undefined) {
        getItemsOfUserByConditions(true);
      }
    },
    [PROFILE_TABS.FOLLOWING]: () => {
      getFollowingList(userId || "", 10);
    },
    [PROFILE_TABS.FOLLOWERS]: () => {
      getFollowList(userId || "", 10);
    },
    [PROFILE_TABS.COLLECTIONS]: () => {
      getCollections(10, userId || "");
    },
    [PROFILE_TABS.INWALLETNFTS]: () => {
      readWalletNFTs();
    },
    [PROFILE_TABS.TRANSFER]: () => {
      getTransferPendingItems(userId);
    },
  };

  useEffect(() => {
    setItems([]);
    const selectedTabFunction = tabFunctions[activeTab];
    if (selectedTabFunction) {
      selectedTabFunction();
    }
  }, [activeTab, userId]);

  const toggleFollowing = (targetId: string) => {
    if (isEmpty(targetId) || isEmpty(currentUsr?._id)) {
      toast.warn("Please log in first.");
      return;
    }
    toggleFollow(currentUsr?._id || "", targetId);
  };

  const handleMessage = () => {
    if (!isEmpty(currentUsr)) {
      navigate(`/message/${userId}`);
    }
  };

  const onSelectEffect = (v: any) => {
    setEffect(v);
  };

  return (
    <MainSection title="Profile">
      <div className="w-full">
        <div className="container mt-2 lg:mt-3">
          <div
            className={`relative bg-white dark:bg-[#191818] dark:border dark:border-neutral-600 p-5 lg:p-8 rounded-3xl md:rounded-[40px] shadow-xl flex flex-col md:flex-row
          ${isMobile && "items-center"}`}
          >
            <div className={`flex-shrink-0 w-64`}>
              <NcImage
                src={detailedUserInfo?.avatar}
                isLocal={true}
                containerClassName="aspect-w-1 aspect-h-1 rounded-3xl overflow-hidden"
              />
            </div>
            <div
              className={`flex-grow pt-5 md:pt-1 md:ml-6 xl:ml-14 md:mr-6 xl:mr-14`}
            >
              <div>
                <h2
                  className={`inline-flex items-center text-2xl font-semibold sm:text-3xl lg:text-4xl ${
                    isMobile && "flex justify-center w-full"
                  }`}
                >
                  <span>{detailedUserInfo?.username || ""}</span>
                  {Boolean(detailedUserInfo?.verified) === true && (
                    <MdOutlineVerified className="ml-2 text-[#33FF00] w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8" />
                  )}
                </h2>
                <div
                  className={`flex items-center text-sm font-medium space-x-2.5 mt-2.5 text-[#33ff00] cursor-pointer ${
                    isMobile && "justify-center w-full"
                  }`}
                >
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {getMidAddress(detailedUserInfo?.address) || " "}
                  </span>
                  <CopyButton data={detailedUserInfo?.address} />
                </div>
                <span className="block max-h-[100px] mt-4 text-sm text-neutral-500 dark:text-neutral-400 overflow-y-auto">
                  {detailedUserInfo?.userBio || ""}
                </span>
              </div>
              <div className="mt-4 ">
                <SocialsList
                  socials={userSocials}
                  className="flex items-center gap-3 lg:gap-5 pt-4"
                />
              </div>
            </div>
            <div
              className={`flex flex-col justify-center md:static ${
                isMobile && "mt-5"
              } gap-5`}
            >
              {!isEmpty(currentUsr) &&
                currentUsr?._id !== detailedUserInfo?._id && (
                  <FollowButton
                    isFollowing={isliked}
                    fontSize="text-sm md:text-base font-medium"
                    sizeClass="px-4 py-1 md:py-2.5 h-8 md:!h-10 sm:px-6 lg:px-8"
                    onTogglefollow={toggleFollowing}
                    // afterExcute={getIsExists}
                  />
                )}
              {!isEmpty(currentUsr) &&
                currentUsr?._id !== detailedUserInfo?._id && (
                  <ButtonPrimary
                    className="relative z-10"
                    fontSize="text-sm font-medium"
                    sizeClass="px-4 py-1 md:py-2.5 h-8 md:!h-10 sm:px-6 lg:px-8"
                    onClick={handleMessage}
                  >
                    Send Message
                  </ButtonPrimary>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 space-y-16 lg:pb-28 lg:pt-20 lg:space-y-28">
        <main>
          <Tab.Group>
            <Tab.List className="flex space-x-0 overflow-x-auto sm:space-x-2">
              {categories.map((item, index) => {
                const shouldRenderTab =
                  index < categories.length - 2 ||
                  (index >= categories.length - 2 &&
                    currentNetworkSymbol === PLATFORM_NETWORKS.XRPL);

                if (!shouldRenderTab) {
                  return null;
                }

                return (
                  <Tab key={"tab" + index} as={Fragment}>
                    <button
                      className={`flex-shrink-0 block font-medium px-4 py-2 text-sm sm:px-6 sm:py-2.5 capitalize rounded-full focus:outline-none ${
                        index === activeIndex.current
                          ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900"
                          : "text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-100/70 dark:hover:bg-neutral-800"
                      }`}
                      onClick={() => {
                        isEnd.current = false;
                        setActiveTab(index);
                        activeIndex.current = index;
                      }}
                    >
                      {item}
                    </button>
                  </Tab>
                );
              })}
            </Tab.List>
            <div className="flex items-end justify-end mt-5 lg:mt-0">
              <EffectListBox onSelected={onSelectEffect} />
            </div>
            <Tab.Panels>
              <>
                <div className="grid mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 lg:mt-10 place-items-center">
                  {items &&
                    items.map((x, index) =>
                      activeTab === PROFILE_TABS.ALLNFTS ? (
                        <CardNFTComponent
                          item={x}
                          key={"nfts" + index}
                          hideHeart={true}
                          effect={effect}
                          isProfile={true}
                        />
                      ) : activeTab === PROFILE_TABS.LIKED ? (
                        <CardNFTComponent
                          item={x}
                          key={"liked" + index}
                          effect={effect}
                          hideHeart={true}
                          isProfile={true}
                        />
                      ) : activeTab === PROFILE_TABS.FOLLOWING ? (
                        <CardAuthorBox
                          following={true}
                          key={"following" + index}
                          item={x}
                          effect={effect}
                        />
                      ) : activeTab === PROFILE_TABS.FOLLOWERS ? (
                        <CardAuthorBox
                          following={false}
                          key={"followers" + index}
                          item={x}
                          effect={effect}
                        />
                      ) : activeTab === PROFILE_TABS.COLLECTIONS ? (
                        <CollectionCard
                          className={styles.card}
                          collection={x}
                          key={"collections" + index}
                          isEditable={false}
                        />
                      ) : activeTab === PROFILE_TABS.INWALLETNFTS ? (
                        <CardInWalletNFT
                          className={"w-[300px]"}
                          key={"inwallet" + index}
                          {...x}
                        />
                      ) : (
                        activeTab === PROFILE_TABS.TRANSFER && (
                          <CardForAcceptTRansferNFT
                            className={"w-[300px]"}
                            key={"pendingtransfer" + index}
                            {...x}
                          />
                        )
                      )
                    )}
                </div>
              </>
            </Tab.Panels>
          </Tab.Group>
        </main>
      </div>
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

export default AuthorPage;
