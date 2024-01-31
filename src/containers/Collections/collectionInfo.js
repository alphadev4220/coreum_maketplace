import { getOwnersApi } from "app/api/collections";
import { getTradingVolumnApi } from "app/api/sales";
import { config } from "app/config";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CollectionInfo = ({
  itemsLength,
  collectionId,
  unitPrice,
  launchpadState,
}) => {
  const [tradingVolumn, setTradingVolumn] = useState(0);
  const [ownersCount, setOwnersCount] = useState(0);

  const calcuateOwnersCount = async () => {
    try {
      const response = await getOwnersApi(collectionId);
      const data = response.list || [];
      let uniqueOwners = new Set(data);
      setOwnersCount(uniqueOwners.size);
      return uniqueOwners.size;
    } catch (error) {
      console.log("Failed to get Owners: ", error.message);
      return 0;
    }
  };

  const getCollectionTradingVolumn = async () => {
    try {
      const response = await getTradingVolumnApi(collectionId);
      let volumn = response.data;
      if (launchpadState === 2) {
        volumn += itemsLength * unitPrice;
      }
      setTradingVolumn(volumn);
    } catch (error) {
      console.log(error);
      toast.error(error);
      setTradingVolumn(0);
    }
  };

  useEffect(() => {
    const fetchInfo = async () => {
      await getCollectionTradingVolumn();
      await calcuateOwnersCount();
    };
    if (collectionId !== null && collectionId === "") return;
    fetchInfo();
  }, [collectionId]);

  return (
    <div className="grid grid-cols-2  gap-2 ">
      <div className="border-[2px] border-gray-700 min-h-[100px] rounded-lg  flex flex-col items-center justify-evenly p-2">
        <span className="text-[#33ff00] text-center">All Items</span>
        <span
          className="dark:text-white text-black w-full truncate text-center"
          data-tooltip-id="my-tooltip"
        >
          {itemsLength || 0}
        </span>
      </div>
      <div className="border-[2px] border-gray-700 min-h-[100px] rounded-lg  flex flex-col items-center justify-evenly p-2">
        <span className="text-[#33ff00] text-center">Owners</span>
        <span
          className="dark:text-white text-black w-full truncate text-center"
          data-tooltip-id="my-tooltip"
        >
          {ownersCount || 0}
        </span>
      </div>
      <div className="border-[2px] border-gray-700 min-h-[100px] rounded-lg  flex flex-col items-center justify-evenly p-2">
        <span className="text-[#33ff00] text-center">Trading volume</span>
        <span
          className="dark:text-white text-black w-full truncate text-center"
          data-tooltip-id="my-tooltip"
        >
          {tradingVolumn}
        </span>
      </div>
      <div className="border-[2px] border-gray-700 min-h-[100px] rounded-lg  flex flex-col items-center justify-evenly p-2">
        <span className="text-[#33ff00] text-center">Collection history</span>
        <span className="dark:text-white text-black w-full truncate text-center flex justify-evenly">
          <a
            className="border-2 p-1 border-gray-700 rounded-md cursor-pointer"
            href={`${config.API_URL}api/itemActivity/dwSCVStats?collId=${collectionId}`}
          >
            CSV
          </a>
          <a
            className="border-2 p-1 border-gray-700 rounded-md cursor-pointer"
            href={`${config.API_URL}api/itemActivity/dwWORDStats?collId=${collectionId}`}
          >
            WORD
          </a>
        </span>
      </div>
    </div>
  );
};

export default CollectionInfo;
