import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "components/HeaderFooter/Logo";
import MenuBar from "components/StyleComponent/MenuBar";
import AvatarDropdown from "./AvatarDropdown";
import ShoppingCart from "./ShoppingCart";
import ButtonPrimary from "components/Button/ButtonPrimary";
import { useSigningClient } from "app/cosmwasm";
import md5 from "md5";
import SearchAutocomplete from "./SearchAutocomplete";
import { NETWORK_ITEMS } from "app/config";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeWalletStatus,
  selectCurrentNetworkSymbol,
  selectCurrentWallet,
} from "app/reducers/auth.reducers";
import { selectWalletStatus } from "app/reducers/auth.reducers";
import { getShortAddress, isEmpty } from "app/methods";
import { xumm } from "utils/xummsdk";
import WalletModal from "components/Modal/WalletModal";
import { Backdrop } from "@mui/material";
import VideoPlayer from "components/StyleComponent/videoplayer";
import { useWalletOperations } from "hooks/useWalletOperations";

const MainNavLogged = (props) => {
  const { collections, items, users } = props;
  const dispatch = useAppDispatch();
  const {
    client,
    signingClient,
    loadClient,
    connectWallet: connectToCoreum,
  }: any = useSigningClient();
  const walletStatus = useAppSelector(selectWalletStatus);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const walletAddress = useAppSelector(selectCurrentWallet);
  const [xSDK, setXummSDK] = useState(null);
  const [visibleWalletModal, setVisibleWalletModal] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const openWalletModal = () => setVisibleWalletModal(true);
  const closeWalletModal = () => setVisibleWalletModal(false);
  const { Login } = useWalletOperations();

  const pageDropItems = [
    { to: "/page-search", label: "Marketplace" },
    {
      href: "https://launchpad.rize2day.com",
      label: "Launchpad",
      target: "_blank",
      rel: "noreferrer",
    },
    {
      href: "https://stake-coreum.rize2day.com",
      label: "Stake Coreum",
      target: "_blank",
      rel: "noreferrer",
    },
    { to: "/faq", label: "FAQ" },
    { to: "/", label: "Lock" },
    {
      href: "https://sologenic.org/bridge",
      label: "Bridge",
      target: "_blank",
      rel: "noreferrer",
    },
    { to: "/", label: "Vote", isDisabled: true },
    { to: "/", label: "LLE", isDisabled: true },
    { to: "/", label: "Core Dex", isDisabled: true },
  ];

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(walletAddress)) {
      dispatch(changeWalletStatus(true));
      const params = { address: "", password: "" };
      params.address = walletAddress;
      params.password = md5(walletAddress);
      Login(params);
    } else {
      dispatch(changeWalletStatus(false));
    }
  }, [walletAddress]);

  useEffect(() => {
    (async () => {
      try {
        if (!client) {
          await loadClient();
        }
      } catch (err) {
        setTimeout(() => loadClient(), 1000);
      }
    })();
  }, [client, loadClient]);

  useEffect(() => {
    (async () => {
      try {
        if (
          !signingClient &&
          localStorage.getItem("address") &&
          localStorage.getItem("wallet_type")
        ) {
          await connectToCoreum(localStorage.getItem("wallet_type"));
        }
      } catch (err) { }
    })();
  }, [signingClient, connectToCoreum]);

  useEffect(() => {
    xumm.then((xummSDK) => {
      // console.log("loginXumm xummSDK", xummSDK.runtime);
      if (!xummSDK.runtime) return;
      const xrt = { ...xummSDK.runtime };
      setXummSDK(xummSDK);

      xummSDK.environment.bearer
        ?.then((r) => {
          console.log("bearer", r);
        })
        .catch((err) => {
          console.log("error with bearer", err);
        });
      if (xrt.xapp) {
        // console.log("XAPP in App");
        xummSDK.environment.ott?.then((r) => console.log("ott App", r));
      }

      if (xrt.browser && !xrt.xapp) {
        // console.log("WEBAPP in App");
        xummSDK.environment.openid?.then((r) => {
          console.log("openid App", r);
        });
      }
    });
  }, []);

  const PageDropMenu = () => {
    return (
      <div className="relative grid bg-white dark:bg-neutral-800 px-2 py-2">
        {pageDropItems.map((item) =>
          item.href ? (
            <a
              key={"href" + item.label}
              href={item.label !== "Bridge" ? item.href : null}
              target={item.target}
              rel={item.rel}
              onClick={() => {
                item.label === "Bridge" && setShowSplash(true);
              }}
              className={`inset-0 py-1 px-4 whitespace-nowrap dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg ${item.isDisabled
                ? "opacity-40"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={"link" + item.label}
              to={item.to}
              className={`inset-0 py-1 px-4 whitespace-nowrap dark:text-white text-neutral-900 text-sm transition cursor-pointer duration-150 ease-in-out rounded-lg ${item.isDisabled
                ? "opacity-40"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    );
  };

  return (
    <div className={`nc-MainNavLogged relative z-10 ${"onTop "}`}>
      <div className="px-4 pt-3 relative flex justify-between items-center space-x-4 xl:space-x-8">
        <div className="flex justify-start flex-grow items-center space-x-3 sm:space-x-8 lg:space-x-10">
          <Logo />
          <div className="hidden md:block">
            <SearchAutocomplete
              collections={collections}
              items={items}
              users={users}
            />
          </div>
          {!isMobile && (
            <Link
              to={"/page-search"}
              className="group py-3 px-6 h-[50px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center lg:text-xl text-lg font-medium hover:text-opacity-100 relative !outline-none whitespace-nowrap"
            >
              View All NFTs
            </Link>
          )}
        </div>
        {isMobile ?
          <div className="group py-3 px-6 h-[50px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center lg:text-xl text-sm font-medium hover:text-opacity-100 relative !outline-none border border-yellow-500 whitespace-nowrap">
            The site is undergoing...
          </div> :
          <div className="group py-3 px-6 h-[50px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center lg:text-xl text-lg font-medium hover:text-opacity-100 relative !outline-none border border-yellow-500">
            The site is undergoing upgrades to align with the Coreum upgrade.
          </div>
        }
        {/* <div className="hidden lg:flex">
          <div className="relative dropdown">
            <div className={`dropbtn p-2`}>
              <div className="group py-3 px-6 h-[50px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center lg:text-xl text-lg font-medium hover:text-opacity-100 relative !outline-none">
                Pages
              </div>
            </div>
            <div className="dropdown-content">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                {PageDropMenu()}
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="hidden lg:flex relative">
          <ButtonPrimary
            onClick={() => {
              openWalletModal();
            }}
            sizeClass="px-4 py-2 sm:px-5 my-2"
          >
            {currentNetworkSymbol > 0 && (
              <img
                src={`${
                  NETWORK_ITEMS.find(
                    (item) => item.network === currentNetworkSymbol
                  ).icon
                }`}
                className="w-[25px] h-[25px] ring-black ring-2 rounded-2xl"
                width={25}
                height={25}
                alt=""
                loading="lazy"
              />
            )}
            {isEmpty(walletAddress) === false && walletStatus === true ? (
              <span className="pl-2">{getShortAddress(walletAddress)}</span>
            ) : (
              <span className="pl-2">Wallet connect</span>
            )}
          </ButtonPrimary>
        </div> */}
        {/* {!isEmpty(walletAddress) && <AvatarDropdown />}
        {!isMobile && <ShoppingCart />}
        <div className="flex items-center space-x-3 lg:hidden">
          <MenuBar />
        </div> */}
      </div>

      <WalletModal
        show={visibleWalletModal}
        onOk={openWalletModal}
        onCloseModal={closeWalletModal}
        xummProvider={xSDK}
      />

      <div className="px-4 py-3 relative flex justify-center items-center space-x-4 xl:space-x-8 md:hidden lg:hidden">
        <SearchAutocomplete
          collections={collections}
          items={items}
          users={users}
        />
      </div>
      <Backdrop
        sx={{
          color: "#ffffff3f",
          backgroundColor: "#000000cc",
          zIndex: 1000,
        }}
        open={showSplash}
      >
        {showSplash === true && (
          <VideoPlayer onClose={() => setShowSplash(false)} />
        )}
      </Backdrop>
    </div>
  );
};

export default MainNavLogged;
