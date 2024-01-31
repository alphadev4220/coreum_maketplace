import { config } from "app/config";
import { FC } from "react";

interface VideoForNftProps {
  src?: string;
  className?: string;
  isLocal?: boolean;
  nftId: string;
  containStrict?: boolean;
}

const VideoForPreview: FC<VideoForNftProps> = ({
  className = "absolute inset-0 z-20 flex items-center justify-center bg-neutral-700 rounded-3xl overflow-hidden",
  src = "./nft.mp4",
  isLocal = true,
  containStrict = false,
}) => {
  const renderContent = (newClass = "") => {
    return (
      <div
        className={`${className} ${newClass} `}
        title="Play"
        dangerouslySetInnerHTML={{
          __html: containStrict
            ? `<video class="w-full h-full object-cover" playsinline autoplay loop muted style="contain:strict;border-radius:25px">
                    <source src=${
                      isLocal ? config.API_URL + src : config.ipfsGateway + src
                    } type="video/mp4" />
                    our browser does not support the video tag.
                  </video>`
            : `<video class="w-full h-full object-cover" playsinline autoplay loop muted>
                  <source src=${
                    isLocal ? config.API_URL + src : config.ipfsGateway + src
                  } type="video/mp4" />
                  our browser does not support the video tag.
                </video>`,
        }}
      />
    );
  };

  return <>{renderContent()}</>;
};

export default VideoForPreview;
