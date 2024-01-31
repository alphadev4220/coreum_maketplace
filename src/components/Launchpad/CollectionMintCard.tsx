import React from "react";
import { useNavigate } from "react-router-dom";
import { abbr } from "utils/utils";

interface CollectionMintCardProps {
  image: string;
  name: string;
  total: number;
  minted: number;
  price: string;
  id: string;
}

const CollectionMintCard: React.FC<CollectionMintCardProps> = ({
  name,
  image,
  total,
  minted,
  price,
  id,
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/launchpad/${id}`);
      }}
    >
      <div
        className="rounded-lg box-border border-[0.5px] border-solid bg-black border-lime-100 flex flex-col px-[8px] py-[8px] md:py-[16px] md:px-[14px] gap-10px] md:gap-[12px]"
        style={{ cursor: "pointer" }}
      >
        <img className="rounded-lg w-[232px] h-[232px]" alt="" src={image} />
        <div className="flex flex-col gap-[0px] md:gap-[6px]">
          <div className="flex justify-between items-center text-white text-[12px] md:text-base">
            <div className="whitespace-nowrap">{abbr(name, 12)}</div>
            <div>{total === 0 ? 100 : ((minted * 100) / total).toFixed(0)}%</div>
          </div>
          <div className="flex justify-between items-center text-[#3F0] text-[11px] md:text-[14px]">
            <div>Supply {total.toLocaleString()}</div>
            <div>{price} Core</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionMintCard;
