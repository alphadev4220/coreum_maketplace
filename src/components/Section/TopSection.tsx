import clsx from "clsx";
import SectionTopSlider from "./SectionTopSlider";
import ButtonLink from "components/Button/LinkButton";
import { useEffect, useState } from "react";

const TopSection = () => {
    const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  return (
    <>
      <div className="relative flex flex-col items-center justify-center mt-1 ">
        <h2 className="theme-animals text-xl lg:text-5xl font-semibold mb-2 text-neutral-900 dark:text-white text-center p-2">
          Premier NFT Marketplace for trading Coreum, XRPL, Ethereum, BSC, Polygon, Avalanche, Hbar and Cosmos.
        </h2>
        <h2 className="theme-animals text-sm lg:text-2xl text-center mb-10 text-neutral-900 dark:text-white">
          Connect with Communities and Digital Assets Crosschain!
        </h2>
        {isMobile && (
          <ButtonLink
            href={"page-search"}
            label="View All NFTs"
            className="w-full mb-10"
          ></ButtonLink>
        )}
        <SectionTopSlider />
      </div>
      <div
        className={clsx(
          "absolute bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -top-[100px] -left-[100px]"
        )}
      ></div>
    </>
  );
};

export default TopSection;
