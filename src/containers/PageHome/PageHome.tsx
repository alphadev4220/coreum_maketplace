import clsx from "clsx";
import SectionMainSlider from "components/Section/SectionMainSlider";
import SectionSponsoredDrops from "../../components/Section/SectionSponsoredDrops";
import frameImg from "images/vector.svg";
import { useAppDispatch } from "app/hooks";
import { useEffect } from "react";
import { changeBulkOpsMode } from "app/reducers/collection.reducers";
import TopSection from "components/Section/TopSection";
import SectionTopUser from "components/Section/SectionTopUser";
import SectionFeaturedNFTs from "components/Section/SectionFeaturedNFTs";
import SectionPopularCollection from "components/Section/SectionPopularCollection";
import MainSection from "components/Section/MainSection";

function PageHome() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(changeBulkOpsMode(false));
  }, []);

  return (
    <MainSection title="Home">
      <div className="relative overflow-x-clip px-10 flex flex-col gap-10 lg:gap-20 mt-[30px] mb-20 lg:mb-26">
        <TopSection />
        <div className="relative">
          <div
            className={clsx(
              "absolute bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full bottom-0 -right-[120px]"
            )}
          ></div>
          <SectionMainSlider />
        </div>

        <SectionFeaturedNFTs />
        <div className="lg:md:px-[15%] ">
          <SectionSponsoredDrops />
        </div>
        <div className="relative">
          <div
            className={clsx(
              "absolute bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -top-[100px] -left-[120px] z-0"
            )}
          ></div>
          <img
            className="absolute w-full right-0 bottom-0 opacity-5"
            src={frameImg}
            alt=""
          />
          <SectionTopUser />
        </div>
        <SectionPopularCollection />
      </div>
    </MainSection>
  );
}

export default PageHome;
