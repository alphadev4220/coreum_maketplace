import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "images/default_avatar.png";
import { MY_ADDRESS, RIZE_ADDRESS, config } from "app/config.js";
import { AiOutlineUser, AiOutlineMessage, AiFillEye } from "react-icons/ai";
import { FiActivity, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { useSigningClient } from "app/cosmwasm";
import { isEmpty } from "app/methods";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectCurrentUser,
  selectCurrentWallet,
  changeAuthor,
  changeNetworkSymbol,
  changeGlobalProvider,
  changeWalletAddress,
  changeWalletStatus,
} from "app/reducers/auth.reducers";
import axios from "axios";
import {
  changeNotifyList,
  selectNotifyList,
} from "app/reducers/notify.reducers";

export const getNotifiesByLimit =
  (limit, userId, filter = []) =>
  () => {
    axios
      .post(
        `${config.baseUrl}notify/getlist`,
        { limit, userId, filter },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        changeNotifyList(result.data.data);
      })
      .catch(() => {});
  };

export default function AvatarDropdown() {
  const { loadClient, connectWallet, disconnect }: any = useSigningClient();

  const notifiesList = useAppSelector(selectNotifyList);
  const globalUser = useAppSelector(selectCurrentUser);
  const [hasNew, setHasNew] = useState(false);
  const [hasNewLaunchpad, setHasNewLaunchpad] = useState(false);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const walletAddress = useAppSelector(selectCurrentWallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getCollectionList();
  }, []);

  // useEffect(() => {
  //   const socket = io();
  //   socket.on("UpdateStatus", (data) => {
  //     console.log("Launchpad request!");
  //     if (data.type === "LAUNCHPAD_APPROVAL") {
  //       getCollectionList();
  //     }
  //   });
  // }, []);
  const getCollectionList = async () => {
    var data = await axios.post(
      `${config.API_URL}api/admin/get_collection_list`,
      {
        all: "all",
      }
    );

    for (let i = 0; i < data.data.data.length; i++) {
      if (data.data.data[i].launchstate === 1) {
        setHasNewLaunchpad(true);
        break;
      }
    }
  };
  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    if (globalUser._id) getNotifiesByLimit(50, globalUser._id);
  }, [globalUser]);

  useEffect(() => {
    if (notifiesList) {
      var temp = false;
      for (var i = 0; i < notifiesList.length; i++) {
        if (notifiesList[i].is_new === true) {
          temp = true;
          break;
        }
      }
      setHasNew(temp);
    }
  }, [notifiesList]);

  const loadWeb3 = async () => {
    await loadClient();

    let account = localStorage.getItem("address");
    let wallet_type = localStorage.getItem("wallet_type");
    if (account && wallet_type) {
      await connectWallet(wallet_type);
    }
  };
  const onClickLogout = async () => {
    localStorage.removeItem("jwtToken");
    dispatch(changeAuthor({}));
    dispatch(changeWalletAddress(""));
    dispatch(changeNetworkSymbol(0));
    dispatch(changeGlobalProvider(null));
    dispatch(changeWalletStatus(false));

    await disconnect();
    dispatch(changeWalletStatus(false));
    dispatch({ type: "LOGIN_OUT" });
    localStorage.removeItem("address");

    navigate("/");
  };

  useEffect(() => {
    if (localStorage.theme === undefined || localStorage.theme === null) {
      toDark();
    } else if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      toDark();
    } else {
      toLight();
    }
  }, []);

  const toDark = () => {
    setIsDarkMode(true);
    const root = document.querySelector("html");
    if (!root) return;
    !root.classList.contains("dark") && root.classList.add("dark");
    localStorage.theme = "dark";
  };

  const toLight = () => {
    setIsDarkMode(false);
    const root = document.querySelector("html");
    if (!root) return;
    root.classList.remove("dark");
    localStorage.theme = "light";
  };

  function _toogleDarkMode() {
    if (localStorage.theme === "light") {
      toDark();
    } else {
      toLight();
    }
  }

  return (
    <div className="AvatarDropdown">
      <div className="relative dropdown">
        {hasNewLaunchpad === true && (
          <div className="bg-[#33ff00] w-2 h-2 rounded-full absolute right-0 top-0"></div>
        )}
        <div
          className={`dropbtn p-2 inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <img
            src={
              !isEmpty(globalUser) && !isEmpty(globalUser?.avatar)
                ? `${config.UPLOAD_URL}uploads/${globalUser?.avatar}`
                : defaultAvatar
            }
            alt=""
            className="lg:md:w-14 lg:md:h-14 w-12 h-12 rounded-full lg:md:border-4 border-2 border-[#33ff00]"
          />
        </div>
        <div className="dropdown-content avatar-dropdown-content z-10 w-screen max-w-[220px] px-4 -right-10 sm:right-0 sm:px-0">
          <div className="overflow-hidden shadow-lg rounded-3xl ring-1 ring-black ring-opacity-5">
            <div className="relative grid grid-cols-1 gap-6 px-6 bg-white dark:bg-neutral-800 py-7">
              {(globalUser?.address === RIZE_ADDRESS ||
                globalUser?.address === MY_ADDRESS) && (
                <div
                  onClick={() => navigate(`/admin`)}
                  className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                >
                  <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300 relative">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.2101 15.74L15.67 19.2801C15.53 19.4201 15.4 19.68 15.37 19.87L15.18 21.22C15.11 21.71 15.45 22.05 15.94 21.98L17.29 21.79C17.48 21.76 17.75 21.63 17.88 21.49L21.42 17.95C22.03 17.34 22.32 16.63 21.42 15.73C20.53 14.84 19.8201 15.13 19.2101 15.74Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.7001 16.25C19.0001 17.33 19.84 18.17 20.92 18.47"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.40991 22C3.40991 18.13 7.25994 15 11.9999 15C13.0399 15 14.0399 15.15 14.9699 15.43"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {hasNewLaunchpad === true && (
                      <div className="bg-[#33ff00] w-1 h-1 rounded-full absolute right-0 top-0"></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium ">{"Admin Page"}</p>
                  </div>
                </div>
              )}
              <div
                onClick={() =>
                  navigate(`/page-author/${globalUser?._id || "1"}`)
                }
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <AiOutlineUser size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"My Profile"}</p>
                </div>
              </div>
              <div
                onClick={() => navigate("/account")}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.2101 15.74L15.67 19.2801C15.53 19.4201 15.4 19.68 15.37 19.87L15.18 21.22C15.11 21.71 15.45 22.05 15.94 21.98L17.29 21.79C17.48 21.76 17.75 21.63 17.88 21.49L21.42 17.95C22.03 17.34 22.32 16.63 21.42 15.73C20.53 14.84 19.8201 15.13 19.2101 15.74Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.7001 16.25C19.0001 17.33 19.84 18.17 20.92 18.47"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.40991 22C3.40991 18.13 7.25994 15 11.9999 15C13.0399 15 14.0399 15.15 14.9699 15.43"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Edit profile"}</p>
                </div>
              </div>
              <div
                onClick={() => navigate(`/message`)}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <AiOutlineMessage size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Messages"}</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/collectionList")}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"My Collections"}</p>
                </div>
              </div>

              <div
                onClick={() => {}}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <AiFillEye size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Watchlist"}</p>
                </div>
              </div>

              <div
                onClick={() => navigate(`/createCollection`)}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <MdOutlineCreateNewFolder size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Create"}</p>
                </div>
              </div>

              <div
                onClick={() => {
                  navigate("/activity");
                }}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300 relative">
                  <FiActivity size={22} />
                  {hasNew === true && (
                    <div className="bg-[#33ff00] w-1 h-1 rounded-full absolute right-0 top-0"></div>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Activity Log"}</p>
                </div>
              </div>

              <div
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <FiHelpCircle size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Tutorial"}</p>
                </div>
              </div>

              <div
                onClick={_toogleDarkMode}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  {!isDarkMode ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.03009 12.42C2.39009 17.57 6.76009 21.76 11.9901 21.99C15.6801 22.15 18.9801 20.43 20.9601 17.72C21.7801 16.61 21.3401 15.87 19.9701 16.12C19.3001 16.24 18.6101 16.29 17.8901 16.26C13.0001 16.06 9.00009 11.97 8.98009 7.13996C8.97009 5.83996 9.24009 4.60996 9.73009 3.48996C10.2701 2.24996 9.62009 1.65996 8.37009 2.18996C4.41009 3.85996 1.70009 7.84996 2.03009 12.42Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.14 19.14L19.01 19.01M19.01 4.99L19.14 4.86L19.01 4.99ZM4.86 19.14L4.99 19.01L4.86 19.14ZM12 2.08V2V2.08ZM12 22V21.92V22ZM2.08 12H2H2.08ZM22 12H21.92H22ZM4.99 4.99L4.86 4.86L4.99 4.99Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </p>
                </div>
              </div>

              <div
                onClick={() => {}}
                className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
              >
                <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                  <FiSettings size={22} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium ">{"Settings"}</p>
                </div>
              </div>
              {isEmpty(walletAddress) === false && (
                <div
                  onClick={() => {
                    onClickLogout();
                  }}
                  className="flex items-center p-2 -m-3 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                >
                  <div className="flex items-center justify-center flex-shrink-0 text-neutral-500 dark:text-neutral-300">
                    <FiLogOut size={22} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium ">{"Disconnect"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
