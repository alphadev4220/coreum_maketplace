import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NcImage from "components/NcComponent/NcImage";
import NetworkLogo from "../StyleComponent/NetworkLogo";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import Tooltip from "@mui/material/Tooltip";
import CardFlip from "react-card-flip";
import { useAppSelector } from "app/hooks";
import { config, FILE_TYPE, PLATFORM_NETWORKS } from "app/config.js";
import { NFT_EFFECT } from "../StyleComponent/EffectListBox";
import TileEffect from "../StyleComponent/TileEffect";
import axios from "axios";
import VideoForBannerPreview from "./VideoForBannerPreview";
import { toast } from "react-toastify";
import { isVideo } from "utils/utils";

export interface CardNFTProps {
  className?: string;
  Flags?: number;
  Issuer?: string;
  NFTTokenID?: string;
  NFTTokenTaxon?: number;
  TransferFee?: number;
  URI?: string;
  nft_serial?: string;
}

const CardInWalletNFT: FC<CardNFTProps> = (props: any) => {
  const currentUsr = useAppSelector(selectCurrentUser);
  const [className, setClassName] = useState("");
  const [isFlipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({});
  const [imageHash, setImageHash] = useState("");
  const [tokenId, setTokenId] = useState("");

  const fetchMetadata = async (url) => {
    try {
      let metadata = await axios.get(
        url.toString().includes("https://") === false
          ? `${config.ipfsGateway}${url
              .replace("ipfs://", "")
              .replace("ipfs/", "")}`
          : url
      );
      if (metadata && (metadata as any).data) {
        metadata = (metadata as any).data;
        let imgurl =
          (metadata as any).image || (metadata as any).image_url || "";
        imgurl =
          imgurl.toString().includes("https://") === false
            ? String(imgurl).replace("ipfs://", "").replace("ipfs/", "")
            : imgurl;
        setImageHash(imgurl);
        (metadata as any).image =
          imgurl.toString().includes("https://") === false
            ? `${config.ipfsGateway}${imgurl}`
            : imgurl;
      }
      setMetadata(metadata);
    } catch (error) {
      console.log("Error on fetching metadata >>> ", error?.message);
    }
  };

  useEffect(() => {
    if (props.className) setClassName(props.className);
    if (props.URI) {
      fetchMetadata(props.URI);
    }
    if (props.NFTokenID) setTokenId(props.NFTokenID);
  }, [props]);

  function getAttributes(obj) {
    var result = [];
    for (var prop in obj) {
      if (prop === "attributes") {
        if (Array.isArray(obj[prop])) {
          result.push(obj[prop]);
        } else {
          console.log("attributes is not an array");
        }
      }
      if (typeof obj[prop] === "object") {
        result = result.concat(getAttributes(obj[prop]));
      }
    }
    return result;
  }

  const importNFT = async () => {
    try {
      var attributes = getAttributes(metadata);
      let metalist = [];
      if (attributes.length > 0) {
        for (let idx = 0; idx < attributes.length; idx++) {
          if (
            (attributes[idx]["trait_type"] || attributes[idx]["key"]) &&
            attributes[idx]["value"]
          ) {
            let obj = {
              key: attributes[idx]["trait_type"] || attributes[idx]["key"],
              value: attributes[idx]["value"],
            };
            metalist.push(obj);
          }
        }
      }
      let resonseData = await axios.post(
        `${config.API_URL}api/item/importXRPItem`,
        {
          tokenId: tokenId,
          itemName: (metadata as any)?.name || "",
          itemLogoURL: imageHash || "",
          itemDescription: (metadata as any)?.description || "",
          fileType: FILE_TYPE.IMAGE,
          metadataURI: props.URI,
          metaData: [...metalist], //do attributes reading
          owner: currentUsr?._id || "",
        }
      );
      if (resonseData.data.code === 0) {
        navigate(`/nft-detail/${resonseData?.data?.data?._id}`);
      } else {
        toast.error("Internal Server Error");
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
  };

  const handleClickItem = async () => {
    await importNFT();
  };

  const renderView = () => {
    return (
      <div
        className={`nc-CardNFT z-10 m-auto relative flex flex-col group [ nc-box-has-hover nc-dark-box-bg-has-hover ] ${
          props?.isHome ? "!border-[#22c55e]" : ""
        } ${className}`}
        data-nc-id="CardNFT"
        onClick={() => handleClickItem()}
      >
        <div className="relative flex-shrink-0 ">
          {isVideo((metadata as any)?.image || "") !== true ? (
            <NcImage
              containerClassName="flex aspect-w-12 aspect-h-10 w-full h-0 rounded-3xl overflow-hidden z-0"
              src={`${(metadata as any)?.image}`}
              isXRP={true}
              onClick={() => {}}
              className={`object-cover cursor-pointer w-full max-h-[250px] rounded-3xl overflow-hidden  group-hover:scale-[1.03] transition-transform duration-300 ease-in-out will-change-transform `}
            />
          ) : (
            <VideoForBannerPreview
              src={`${(metadata as any)?.image}`}
              nftId={(metadata as any)?.image}
              className="w-full pt-[16.66%] overflow-hidden"
            />
          )}
        </div>

        <div className="p-4 py-5 space-y-3">
          <div className="flex justify-between w-full">
            <Tooltip
              title={((metadata as any)?.name || "").toString()}
              placement="top"
              arrow={true}
            >
              <div
                className={`w-2/3 text-md cursor-pointer `}
                onClick={() => {}}
              >
                {((metadata as any)?.name || "").toString().length > 10
                  ? ((metadata as any)?.name || "")
                      .toString()
                      .substring(0, 10) + "..."
                  : ((metadata as any)?.name || "").toString()}
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
    </div>
  );
};

export default CardInWalletNFT;
