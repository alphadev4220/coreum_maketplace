import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NcImage from "components/NcComponent/NcImage";
import NetworkLogo from "../StyleComponent/NetworkLogo";
import { selectCurrentWallet } from "app/reducers/auth.reducers";
import Tooltip from "@mui/material/Tooltip";
import CardFlip from "react-card-flip";
import { useAppSelector } from "app/hooks";
import { config, ITEM_ACTION_TYPES, PLATFORM_NETWORKS } from "app/config.js";
import { NFT_EFFECT } from "../StyleComponent/EffectListBox";
import TileEffect from "../StyleComponent/TileEffect";
import axios from "axios";
import VideoForBannerPreview from "./VideoForBannerPreview";
import { toast } from "react-toastify";
import ButtonPrimary from "components/Button/ButtonPrimary";
import { isValidXRPAddress, updateItemActivity } from "app/methods";
import { xumm } from "utils/xummsdk";
import { Backdrop, CircularProgress } from "@mui/material";
import PaymentPayloadViewer from "./XRPLPayloadViewer";
import { isVideo } from "utils/utils";

export interface CardNFTProps {
  className?: string;
  imageUrl: string;
  name: string;
  NFTTokenID: string;
  transactionHash: string;
  itemId: string;
  senderAddress: string;
  actId: string;
}

const CardInWalletNFT: FC<CardNFTProps> = (props: any) => {
  const currentWallet = useAppSelector(selectCurrentWallet);
  const [className, setClassName] = useState("");
  const [isFlipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const [imageURL, setImageURL] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [name, setName] = useState(false);
  const [txHash, setTxhash] = useState("");
  const [itemId, setItemId] = useState("");
  const [actId, setActId] = useState("");
  const [senderAddress, setSenderAddress] = useState("");

  const [paymentPayload, setPaymentPayload] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (props.className) setClassName(props.className);
    if (props.imageUrl) {
      setImageURL(props.imageUrl);
    }
    if (props.NFTokenID) setTokenId(props.NFTokenID);
    if (props.name) setName(props.name);
    if (props.transactionHash) setTxhash(props.transactionHash);
    if (props.itemId) setItemId(props.itemId);
    if (props.senderAddress) setSenderAddress(props.senderAddress);
    if (props.actId) setActId(props.actId);
  }, [props]);

  const handleClickItem = async () => {
    navigate(`nft-detail/${tokenId}`);
  };

  const acceptTransfer2Me = async () => {
    let offerResponsive = await axios.post(
      `${config.API_URL}api/itemActivity/getOfferOfItemByTxHash`,
      {
        txHash: txHash,
        destination: currentWallet,
      }
    );
    const tokenOfferIndex = offerResponsive.data.data;
    const transactionBlob = {
      TransactionType: "NFTokenAcceptOffer",
      Account: currentWallet,
      NFTokenSellOffer: tokenOfferIndex,
    };

    if (!isValidXRPAddress(currentWallet)) {
      toast.error("Invalid connected address");
    } else {
      xumm
        .then(async (xummSDK) => {
          const paymentPayload = {
            txjson: transactionBlob,
          };
          try {
            const payloadResponse = await xummSDK.payload
              .createAndSubscribe(paymentPayload as any, (event) => {
                if (event.data.signed === true) {
                  setPaymentPayload(null);
                  return event.data;
                }

                if (event.data.signed === false) {
                  toast.error("User rejected wallet sign! ");
                  setProcessing(false);
                  setPaymentPayload(null);
                  return false;
                }
              })
              .catch(() => {});

            setPaymentPayload((payloadResponse as any).created);
            const resolveData = await (payloadResponse as any).resolved;

            if ((resolveData as any).signed === false) {
              toast.error("User rejected wallet sign! ");
            }

            if ((resolveData as any).signed === true) {
              const result = await xummSDK.payload.get(
                (resolveData as any).payload_uuidv4
              );

              let txHash = result.response.txid;
              await axios
                .post(`${config.API_URL}api/item/transferedNFT`, {
                  itemId: itemId,
                  sender: senderAddress,
                  receiver: currentWallet,
                })
                .then((response) => {
                  setProcessing(false);
                  if (response.data.code === 0) {
                    toast.success("You've accept an item.");
                    updateItemActivity(actId, {
                      actionType: ITEM_ACTION_TYPES.TRANSFERED,
                      transactionHash: txHash,
                    });
                    navigate(`/`);
                  } else {
                    toast.error("Internal server error.");
                  }
                })
                .catch(() => {
                  setProcessing(false);
                  toast.error("Internal server error.");
                });
            }
          } catch (e) {
            setProcessing(false);
          }
        })
        .catch(() => {
          setProcessing(false);
        });
    }
  };

  const renderView = () => {
    return (
      <div
        className={`nc-CardNFT z-10 m-auto relative flex flex-col group [ nc-box-has-hover nc-dark-box-bg-has-hover ] ${
          props?.isHome ? "!border-[#22c55e]" : ""
        } ${className}`}
        data-nc-id="CardNFT"
      >
        <div
          className="relative flex-shrink-0 "
          onClick={() => handleClickItem()}
        >
          {isVideo(imageURL || "") !== true ? (
            <NcImage
              containerClassName="flex aspect-w-12 aspect-h-10 w-full h-0 rounded-3xl overflow-hidden z-0"
              src={imageURL}
              onClick={() => {}}
              isLocal={
                imageURL.toString().includes(".") === true
              }
              className={`object-cover cursor-pointer w-full max-h-[250px] rounded-3xl overflow-hidden  group-hover:scale-[1.03] transition-transform duration-300 ease-in-out will-change-transform `}
            />
          ) : (
            <VideoForBannerPreview
              src={`${imageURL}`}
              nftId={imageURL}
              className="w-full pt-[16.66%] overflow-hidden"
            />
          )}
        </div>

        <div className="p-4 py-5 space-y-3">
          <div
            className="flex justify-between w-full"
            onClick={() => handleClickItem()}
          >
            <Tooltip
              title={(name || "").toString()}
              placement="top"
              arrow={true}
            >
              <div
                className={`w-2/3 text-md cursor-pointer `}
                onClick={() => {}}
              >
                {(name || "").toString().length > 10
                  ? (name || "").toString().substring(0, 10) + "..."
                  : (name || "").toString()}
              </div>
            </Tooltip>
            <div className={`w-1/3 cursor-pointer`} onClick={() => {}}></div>
            <div className="flex justify-between gap-2">
              <NetworkLogo
                networkSymbol={PLATFORM_NETWORKS.XRPL}
                className={`cursor-pointer`}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <ButtonPrimary onClick={() => acceptTransfer2Me()}>
              Accept
            </ButtonPrimary>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {props?.effect?.code === NFT_EFFECT.WRAP_VIEW ? (
        <TileEffect>{renderView()}</TileEffect>
      ) : props?.effect?.code === NFT_EFFECT.CARD_FLIP ? (
        <div className="relative">
          <div onClick={() => {}}>
            <div
              className="absolute top-0 aspect-w-12 aspect-h-10 w-full h-0 z-50"
              onMouseEnter={() => setFlipped(true)}
              onMouseLeave={() => setFlipped(false)}
            ></div>
          </div>
          <CardFlip isFlipped={isFlipped}>
            {renderView()}
            <div
              className={`nc-CardNFT z-10 relative flex flex-col group !border-0 [ nc-box-has-hover nc-dark-box-bg-has-hover ] ${className}`}
              data-nc-id="CardNFT"
            ></div>
          </CardFlip>
        </div>
      ) : (
        renderView()
      )}
      {
        <Backdrop
          sx={{
            width: "100vw",
            minHeight: "100vh",
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={processing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }

      {paymentPayload ? (
        <>
          <section
            className="fixed top-0 left-0 flex items-center justify-center w-[100vw] min-h-screen popup"
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
    </div>
  );
};

export default CardInWalletNFT;
