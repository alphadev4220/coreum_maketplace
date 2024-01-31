import React, { FC } from "react";
import ButtonPrimary from "components/Button/ButtonPrimary";
import NcModal from "components/NcComponent/NcModal";
import { NETWORK_ITEMS, PLATFORM_NETWORKS, RPC_URLs, config } from "app/config";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeGlobalProvider,
  changeMemberOrNot,
  changeNetworkSymbol,
  changeWalletAddress,
  changeWalletStatus,
  selectCurrentNetworkSymbol,
} from "app/reducers/auth.reducers";
import { useSigningClient } from "app/cosmwasm";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import axios from "axios";
import { toast } from "react-toastify";
import {
  changeNetwork,
  isSupportedNetwork,
} from "InteractWithSmartContract/interact";
import Web3Modal from "web3modal";
import { providerOptions } from "InteractWithSmartContract/providerOptions";
import Web3 from "web3";

export interface WalletModalProps {
  show: boolean;
  onCloseModal: () => void;
  onOk: any;
  xummProvider: any;
}
export const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: false,
  disableInjectedProvider: false,
  providerOptions,
});

export const infura_Id = "84842078b09946638c03157f83405213";

const WalletModal: FC<WalletModalProps> = ({
  show,
  onCloseModal,
  xummProvider,
}) => {
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const dispatch = useAppDispatch();
  const {
    connectWallet: connectToCoreum,
    disconnect: disconnectFromCoreum,
  }: any = useSigningClient();

  const loginXumm = () => {
    xummProvider
      .authorize()
      .then((res) => {
        if (res.me) {
          dispatch(changeWalletAddress(res?.me?.sub));
        }
        dispatch(changeWalletStatus(true));
        dispatch(changeNetworkSymbol(PLATFORM_NETWORKS.XRPL));
      })
      .catch((err) => {
        console.log("error with auth", err);
      });
  };

  let previousNetworkSymbol = currentNetworkSymbol;

  const handleSelectNetwork = async (networkSymbol) => {
    previousNetworkSymbol = currentNetworkSymbol;

    if (networkSymbol === PLATFORM_NETWORKS.COREUM) {
      dispatch(changeNetworkSymbol(networkSymbol));
    } else if (networkSymbol === PLATFORM_NETWORKS.XRPL) {
      disconnectFromCoreum();
      await loginXumm();
    } else {
      disconnectFromCoreum();
      dispatch(changeNetworkSymbol(networkSymbol));
    }
  };

  const NetworkMenu = () => {
    return (
      <div className="relative grid grid-cols-2 lg:md:grid-cols-3 w-full bg-white dark:bg-neutral-800 py-2">
        {NETWORK_ITEMS.map(
          (item) =>
            !item.isDisabled && (
              <div
                key={"networks" + item.network}
                className="hover:bg-neutral-100 dark:hover:bg-neutral-700 py-2 px-4 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                onClick={() => handleSelectNetwork(item.network)}
              >
                <img
                  src={item.icon}
                  className="w-[25px] h-[25px]"
                  alt=""
                  loading="lazy"
                ></img>
                <span className="dark:text-white text-neutral-900 text-sm">
                  {item.label}
                </span>
              </div>
            )
        )}
      </div>
    );
  };
  const isCommunityMember = (walletAddress) => {
    try {
      axios
        .post(`${config.baseUrl}users/isCommunityMember`, {
          wallet: walletAddress || "",
        })
        .then((response) => {
          let isM = response.data.data || false;
          dispatch(changeMemberOrNot(isM));
        });
    } catch (error) {
      console.log("isM error ===> ", error);
      dispatch(changeMemberOrNot(false));
    }
  };
  const handleWalletConnect = async () => {
    try {
      const walletconnect = new WalletConnectConnector({
        rpc: RPC_URLs,
        bridge: "https://bridge.walletconnect.org",
        qrcode: true,
        infuraId: infura_Id,
      });

      let connector_update = await walletconnect.activate();

      if (
        RPC_URLs.keys.filter((item) => {
          return item === connector_update.chainId;
        }).length === 0
      ) {
        walletconnect.deactivate();
        localStorage.removeItem("walletconnect");
        dispatch(changeWalletAddress(""));
        return;
      }

      const provider = connector_update.provider;

      const account = connector_update.account;

      dispatch(changeWalletAddress(account));
      isCommunityMember(account);

      dispatch(changeGlobalProvider(provider));
    } catch (error) {
      console.log(error);
      dispatch(changeWalletAddress(""));
    }
  };
  const authenticate = async (wallet_type) => {
    await connectToCoreum(wallet_type);
  };
  const walletOptions = [
    { id: "keplr", label: "Keplr", icon: "/images/icons/keplr.png" },
    { id: "leap", label: "Leap", icon: "/images/icons/leap.png" },
    {
      id: "cosmostation",
      label: "Cosmostation",
      icon: "/images/icons/cosmostation.png",
    },
    {
      id: "walletconnect",
      label: "WalletConnect",
      icon: "/images/icons/walletconnect.png",
    },
  ];

  const WalletOption = () => {
    const handleWalletOption = (id) => {
      if (id === "keplr") {
        authenticate("keplr");
      } else if (id === "leap") {
        authenticate("leap");
      } else if (id === "cosmostation") {
        authenticate("cosmostation");
      } else if (id === "walletconnect") {
        handleWalletConnect();
      }
    };

    return (
      <div className="relative flex justify-evenly bg-white dark:bg-neutral-800 py-2">
        {walletOptions.map(({ id, icon }) => (
          <div
            key={"walletoptions" + id}
            className=" flex justify-center py-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
            onClick={() => handleWalletOption(id)}
          >
            <img
              src={icon}
              className="w-[40px] h-[40px] lg:md:w-[50px] lg:md:h-[50px]"
              alt=""
              loading="lazy"
            />
            {/* <span className="dark:text-white text-neutral-900 text-sm">
                            {label}
                        </span> */}
          </div>
        ))}
      </div>
    );
  };

  const walletEthOptions = [
    { id: "metamask", label: "MetaMask", icon: "/images/icons/metamask.png" },
    {
      id: "walletconnect",
      label: "WalletConnect",
      icon: "/images/icons/walletconnect.png",
    },
  ];

  const onClickChangeEVMNetwork = async (networkSymbol) => {
    try {
      let switchingResult = false;
      let result = await changeNetwork(networkSymbol);
      if (result) {
        if (result.success === true) {
          dispatch(changeNetworkSymbol(networkSymbol));
          switchingResult = true;
        } else {
          toast.warning(
            <div>
              <span>{result.message}</span>
              <br></br>
              <span>
                Please check your wallet. Try adding the chain to Wallet first.
              </span>
            </div>
          );
        }
      }
      return switchingResult;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const onClickConnectEVMWallet = async () => {
    try {
      const provider = await web3Modal.connect();

      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();

      if (accounts[0]) {
        dispatch(changeWalletAddress(accounts[0]));
        isCommunityMember(accounts[0]);
      } else {
        dispatch(changeWalletAddress(""));
        dispatch(changeMemberOrNot(false));
      }
      dispatch(changeGlobalProvider(provider));
    } catch (error) {
      console.log(error);
      dispatch(changeWalletAddress(""));
    }
  };

  const handleMetaMask = async () => {
    let switchingResult = await onClickChangeEVMNetwork(currentNetworkSymbol);
    if (
      switchingResult === false &&
      isSupportedNetwork(previousNetworkSymbol) === true
    ) {
      handleSelectNetwork(previousNetworkSymbol);
    }
    if (switchingResult === true) onClickConnectEVMWallet();
  };

  const WalletEthOption = () => {
    const handWalletOption = (id) => {
      if (id === "metamask") {
        handleMetaMask();
      } else if (id === "walletconnect") {
        handleWalletConnect();
      }
    };

    return (
      <div className="relative flex justify-evenly gap-2 bg-white dark:bg-neutral-800 px-2 py-2">
        {walletEthOptions.map(({ id, icon }) => (
          <div
            key={"walletethoptions" + id}
            className="flex justify-center py-2 px-2  transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
            onClick={() => handWalletOption(id)}
          >
            <img
              src={icon}
              className="w-[40px] lg:md:w-[50px]"
              alt=""
              loading="lazy"
            />
            {/* <span className="dark:text-white text-neutral-900 text-sm">
                            {label}
                        </span> */}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col justify-between items-center gap-2 w-full mt-2">
        {NetworkMenu()}
        <div className="w-[80%]">
          {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM ? (
            <div className="overflow-hidden rounded-2xl shadow-lg  ">
              {WalletOption()}
            </div>
          ) : (
            <></>
          )}
          {currentNetworkSymbol === PLATFORM_NETWORKS.ETHEREUM ||
          currentNetworkSymbol === PLATFORM_NETWORKS.BSC ||
          currentNetworkSymbol === PLATFORM_NETWORKS.POLYGON ||
          currentNetworkSymbol === PLATFORM_NETWORKS.AVALANCHE ? (
            <div className="overflow-hidden rounded-2xl shadow-lg">
              {WalletEthOption()}
            </div>
          ) : (
            <></>
          )}
        </div>
        <ButtonPrimary
          onClick={onCloseModal}
          sizeClass="px-4 py-2 sm:px-5 my-2 flex items-center w-[200px]"
        >
          Ok
        </ButtonPrimary>
      </div>
    );
  };

  const renderTrigger = () => {
    return null;
  };

  return (
    <NcModal
      isOpenProp={show}
      onCloseModal={onCloseModal}
      contentExtraClass="max-w-screen-sm"
      renderContent={renderContent}
      renderTrigger={renderTrigger}
      modalTitle={"Select a chain and a wallet"}
    />
  );
};

export default WalletModal;
