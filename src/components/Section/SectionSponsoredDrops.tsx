import { HOMIS_COLLECTION_ID, config } from "app/config";
import Heading from "components/StyleComponent/Heading";
import { FC, useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { sleep } from "utils/utils";
import CardLarge from "components/Card/CardLarge";
import { SampleNextArrow, SamplePrevArrow } from "../Button/NextPrevButton";
import { useItemsApiServices } from "app/api/useItemsApiServices";

export interface SectionSponsoredDropsProps {
  className?: string;
}

const SectionSponsoredDrops: FC<SectionSponsoredDropsProps> = ({
  className = "",
}) => {
  const [items, setItems] = useState([]);
  const { fetchPriceForNetworkSymbol } = useItemsApiServices();

  useEffect(() => {
    getSponsoredItems();
  }, []);

  const getSponsoredItems = async () => {
    axios
      .post(`${config.API_URL}api/item/getSponsoredItems`, {
        limit: 5,
        collId: HOMIS_COLLECTION_ID,
      })
      .then(async (response) => {
        const item_data = response.data.data || [];
        const uniqueNetworkSymbols = Array.from(new Set(item_data.map(item => item.networkSymbol)));

        try {
          const pricePromises = uniqueNetworkSymbols.map(networkSymbol =>
            fetchPriceForNetworkSymbol(networkSymbol)
          );

          const prices = await Promise.all(pricePromises);
          const pricesObject = prices.reduce((obj, item) => {
            obj[item.networkSymbol] = item.priceOnUsd;
            return obj;
          }, {});
          setItems(item_data.map(item => ({
            ...item,
            priceUsd: pricesObject[item.networkSymbol]
          })));

        } catch (error) {
          console.error('Error fetching all prices:', error);
          return []; // or any appropriate error handling
        }
      })
      .catch((error) => {
        console.log("getSponsoredItems() error ===> ", error);
      });
  };

  const settings = {
    lazyLoad: true,
    infinite: true,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    initialSlide: 0,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
  };

  return (
    <div className={`relative ${className} z-[999]`}>
      <div className="relative flex flex-col items-center justify-center mt-1 mb-6">
        <Heading
          className="text-neutral-900 dark:text-neutral-50 mb-4"
          fontClass="text-xl  lg:text-4xl font-semibold"
          isCenter
          desc=""
        >
          Sponsored Drops
        </Heading>
        <p className="text-sm lg:text-xl text-center text-neutral-900 dark:text-white mb-6">
          Want your project listed here contact us!
        </p>
      </div>
      <Slider {...settings} style={{ width: "100%" }}>
        {items &&
          items.length > 0 &&
          items.map((item, index) => (
            <CardLarge
              className="item nft-name"
              item={item}
              key={index}
              price={item.priceUsd}
            />
          ))}
      </Slider>
    </div>
  );
};

export default SectionSponsoredDrops;
