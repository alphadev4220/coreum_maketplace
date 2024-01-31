import { FC, useEffect, useState } from "react";
import Heading from "components/StyleComponent/Heading";
import axios from "axios";
import { config } from "app/config";
import HomeSlider from "./HomeSlider";

export interface SectionFeaturedNFTsProps {
  className?: string;
}

const SectionFeaturedNFTs: FC<SectionFeaturedNFTsProps> = ({
  className = "",
}) => {
  const [items, setItems] = useState([]);

  const getPopularItems = () => {
    axios
      .post(`${config.API_URL}api/item/getPopularItems`, {
        limit: 6,
      })
      .then((response) => {
        if (response.data.code === 0) {
          setItems(response.data.data || []);
        }
      })
      .catch((error) => {
        console.log("getPopularItems() error ===> ", error);
      });
  };

  useEffect(() => {
    getPopularItems();
  }, []);

  return (
    <div className={`${className}`}>
      <div className="flex items-end justify-center gap-2 lg:gap-5 mb-12 lg:mb-14 text-sm lg:text-xl">
        <Heading
          className="text-neutral-900 dark:text-neutral-50"
          fontClass="text-xl lg:text-4xl font-semibold"
          isCenter
          desc=""
        >
          Featured NFTs
        </Heading>
      </div>
      <HomeSlider items={items} />
    </div>
  );
};

export default SectionFeaturedNFTs;
