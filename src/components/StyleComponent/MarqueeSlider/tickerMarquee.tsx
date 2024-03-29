import React from "react";
import Marquee from "react-easy-marquee";
import { config } from "app/config";
import VideoForPreview from "components/Card/VideoForPreview";
import { useNavigate } from "react-router-dom";

interface HighlightPropArg {
  items: any;
  className?: string;
  speed?: number;
  delay?: number;
  width?: number;
  spaceBetween?: number;
}

const Highlight: React.FC<HighlightPropArg> = ({
  className = "",
  items,
  delay = 10,
  speed = 5,
  width = 300,
  spaceBetween = 500,
}) => {
  const navigate = useNavigate();
  return (
    <div className="highlight-section w-full">
      <Marquee
        height={`${width}px`}
        duration={speed}
        reverse={true}
        align="center"
        width="100%"
      >
        {items?.map((item: any, index: number) => (
          <div
            className={`card`}
            key={index}
            style={{
              width: `${width}px`,
              aspectRatio: "1",
              marginLeft: `${spaceBetween}px`,
              marginRight: `${spaceBetween}px`,
              cursor: "pointer"
            }}
            onClick={() => navigate('collectionItems/' + item.collection_id._id)}
          >
            {item && item.logoURL ? (
              <>
                {item.logoURL.toString().includes(".") === false ? (
                  <img
                    className="object-cover w-full h-full"
                    src={`${config.ipfsGateway}${item.logoURL}`}
                    width={width}
                    height={width}
                    alt=""
                    loading="lazy"
                  />
                ) : item.logoURL.toString().toLowerCase().includes(".mp4") ===
                  true ? (
                  <VideoForPreview
                    src={item?.logoURL}
                    isLocal={true}
                    nftId={item?._id || ""}
                    className="object-cover w-full h-full flex items-center justify-center"
                  />
                ) : (
                  <img
                    className="object-cover w-full h-full"
                    src={`${config.UPLOAD_URL}uploads/${item.logoURL}`}
                    width={width}
                    height={width}
                    alt=""
                    loading="lazy"
                  />
                )}
              </>
            ) : (
              <></>
            )}
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Highlight;
