import React, { useEffect, useState } from "react";
import ButtonClose from "components/Button/ButtonClose";
import Logo from "components/HeaderFooter/Logo";
import { Link, useNavigate } from "react-router-dom";
import ButtonPrimary from "components/Button/ButtonPrimary";
import SocialsList, { SocialType } from "components/StyleComponent/SocialsList";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeAuthor,
  changeWalletAddress,
  changeWalletStatus,
  selectCurrentNetworkSymbol,
  selectCurrentWallet,
  selectWalletStatus,
} from "app/reducers/auth.reducers";
import { NETWORK_ITEMS, config } from "app/config";
import { getShortAddress, isEmpty } from "app/methods";
import axios from "axios";
import { xumm } from "utils/xummsdk";
import md5 from "md5";
import jwt_decode from "jwt-decode";
import WalletModal from "components/Modal/WalletModal";
import { FiFacebook, FiYoutube } from "react-icons/fi";
import { TbBrandTelegram, TbBrandTwitter } from "react-icons/tb";
import { RxDiscordLogo } from "react-icons/rx";
import Settings from "components/Settings";
import { useWalletOperations } from "hooks/useWalletOperations";

export const infura_Id = "84842078b09946638c03157f83405213";

const socialLinks: SocialType[] = [
  { name: "Facebook", icon: <FiFacebook color={'#33FF00'} />, href: "https://facebook.com/rize2day" },
  { name: "Youtube", icon: <FiYoutube color={'#33FF00'} />, href: "https://youtube.com/rize2day" },
  { name: "Twitter", icon: <TbBrandTwitter color={'#33FF00'} />, href: "https://twitter.com/rize2day" },
  { name: "Telegram", icon: <TbBrandTelegram color={'#33FF00'} />, href: "https://t.me/rize2day" },
  { name: "Discord", icon: <RxDiscordLogo color={'#33FF00'} />, href: "https://discord.com/rize2day" },
];

export interface NavMobileProps {
  onClickClose?: () => void;
}

const NavMobile: React.FC<NavMobileProps> = ({
  onClickClose,
}) => {
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const walletStatus = useAppSelector(selectWalletStatus);
  const walletAddress = useAppSelector(selectCurrentWallet);
  const dispatch = useAppDispatch();
  const [xSDK, setXummSDK] = useState(null);
  const [visibleWalletModal, setVisibleWalletModal] = useState(false);
  const {Login} = useWalletOperations();
  const openWalletModal = () => setVisibleWalletModal(true);
  const closeWalletModal = () => setVisibleWalletModal(false);


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
  }, [walletAddress, dispatch]);

  const _renderItem = () => {
    return (
      <div className="flex flex-col items-center gap-2">
        <Link
          to={"/"}
          className=" rounded-81xl bg-lime-200 hover:bg-[#23ad00]  
          shadow-[0px_0px_28px_#33ff00_inset] flex flex-col items-center justify-center text-center 
          text-base md:text-xl   text-white w-[198px] h-[52px] font-bold  "
        >
          <span onClick={onClickClose}>
            Marketplace
          </span>
        </Link>
        <Link
          to={"/launchpad"}
          className=" rounded-81xl bg-lime-200 hover:bg-[#23ad00]  
          shadow-[0px_0px_28px_#33ff00_inset] flex flex-col items-center justify-center text-center 
          text-base md:text-xl   text-white w-[198px] h-[52px] font-bold  "
        >
          <span onClick={onClickClose}>
            Launchpad
          </span>
        </Link>
        <a
          target="_blank"
          href={"https://stake-coreum.rize2day.com/"}
          className=" rounded-81xl bg-lime-200 hover:bg-[#23ad00]  
          shadow-[0px_0px_28px_#33ff00_inset] flex flex-col items-center justify-center text-center 
          text-base md:text-xl   text-white w-[198px] h-[52px] font-bold  "
          rel="noreferrer"
        >
          <span onClick={onClickClose}>
            Stake Coreum
          </span>
        </a>
      </div>
    );
  };

  useEffect(() => {
    xumm.then((xummSDK) => {
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
        console.log("XAPP in App");
        xummSDK.environment.ott?.then((r) => console.log("ott App", r));
      }

      if (xrt.browser && !xrt.xapp) {
        // setXummClientType("WEBAPP");
        xummSDK.environment.openid?.then((r) => {
          console.log("openid App", r);
        });
      }
    });
  }, []);
  return (
    <div className="overflow-y-auto w-full max-w-sm h-screen py-2 transition transform shadow-lg ring-1 dark:ring-neutral-700 bg-white dark:bg-[#191818] divide-y-2 divide-neutral-100 dark:divide-neutral-800">
      <div className="py-6 px-5">
        <Logo />
        <div className="flex flex-col mt-5 text-neutral-700 dark:text-neutral-300 text-sm">
          <ButtonPrimary
            onClick={() => {
              openWalletModal();
            }}
            sizeClass="px-4 py-2 sm:px-5 my-2 flex items-center"
          >
            {currentNetworkSymbol > 0 &&
              <img
                src={`${NETWORK_ITEMS.find((item) => item.network === currentNetworkSymbol).icon}`}
                className="w-[25px] h-[25px] ring-black ring-2 rounded-2xl"
                width={25}
                height={25}
                alt=""
                loading="lazy"
              />
            }
            {isEmpty(walletAddress) === false && walletStatus === true ? (
              <span className="pl-2">{getShortAddress(walletAddress)}</span>
            ) : (
              <span className="pl-2">Wallet connect</span>
            )}
          </ButtonPrimary>
          <div className="flex justify-between items-center mt-4">
            <SocialsList socials={socialLinks} className="flex items-center gap-1 sm:gap-2" />
            <span className="block">
              <Settings className="bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </span>
          </div>
        </div>
        <span className="absolute right-2 top-2 p-1">
          <ButtonClose onClick={onClickClose} />
        </span>
      </div>

      <ul className="flex flex-col py-6 px-2 space-y-1">
        {_renderItem()}
      </ul>
      <WalletModal
        show={visibleWalletModal}
        onOk={openWalletModal}
        onCloseModal={closeWalletModal}
        xummProvider={xSDK}
      />
    </div>
  );
};

export default NavMobile;
