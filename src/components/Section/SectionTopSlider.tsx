import { FC, useEffect, useState } from "react";
import axios from "axios";
import { config } from "app/config";
import HomeSlider from "./HomeSlider";

export interface SectionTopSliderProps {}

const SectionTopSlider: FC<SectionTopSliderProps> = () => {
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

  return <HomeSlider items={items} />;
};

export default SectionTopSlider;
