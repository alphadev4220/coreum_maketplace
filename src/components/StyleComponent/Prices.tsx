import {
  ACTIVE_CHAINS,
  COREUM_PAYMENT_COINS,
  PLATFORM_NETWORKS,
} from "app/config";
import { isSupportedEVMNetwork } from "InteractWithSmartContract/interact";
import { FC } from "react";

export interface PricesProps {
  className?: string;
  item?: any;
  contentClass?: string;
  labelTextClassName?: string;
  labelText?: string;
}

const Prices: FC<PricesProps> = ({
  className = "pt-3",
  item,
  contentClass = "py-1.5 md:py-2 px-2.5 md:px-3.5 text-sm sm:text-base font-semibold",
  labelTextClassName = "bg-white",
  labelText = Math.random() > 0.4 ? "Price" : "Current Bid",
}) => {
  return (
    <div className={`${className}`}>
      <div
        className={`flex items-baseline border-2 border-[#33ff00] rounded-lg relative ${contentClass} `}
      >
        <span
          className={`block absolute w-max font-normal bottom-full translate-y-1 p-1 -mx-1 text-xs text-neutral-500 dark:text-neutral-400 ${labelTextClassName}`}
        >
          {labelText}
        </span>
        <span className=" text-[#33ff00] !leading-none ">
          {item?.isSale === 2
            ?
            <div>
              <span className="font-[MyCutomFont]">{
                item.bids && item.bids.length > 0
                  ? item.bids[item.bids.length - 1].price
                    ? item.bids[item.bids.length - 1].price
                    : 0
                  : item?.price
              }</span>
              {
                item.networkSymbol === PLATFORM_NETWORKS.COREUM
                  ? item.coreumPaymentUnit === COREUM_PAYMENT_COINS.RIZE
                    ? " RIZE"
                    : " CORE"
                  : ""
              }
              {
                isSupportedEVMNetwork(item.networkSymbol) === true
                  ? ACTIVE_CHAINS[item.networkSymbol]?.currency || " ETH"
                  : ""
              }
              {
                item.networkSymbol === PLATFORM_NETWORKS.XRPL ? " XRP" : ""
              }
            </div>
            : item?.isSale === 1
              ?
              <div>
                <span className="font-[MyCutomFont] text-[1.1rem]">{item?.price || "0 "}</span>
                {item.networkSymbol === PLATFORM_NETWORKS.COREUM
                  ? item.coreumPaymentUnit === COREUM_PAYMENT_COINS.RIZE
                    ? " RIZE"
                    : " CORE"
                  : ""
                }
                {isSupportedEVMNetwork(item.networkSymbol) === true
                  ? ACTIVE_CHAINS[item.networkSymbol]?.currency || " ETH"
                  : ""
                }
                {item.networkSymbol === PLATFORM_NETWORKS.XRPL ? " XRP" : ""
                }
              </div>
              : "Not listed"}
        </span>
      </div>
    </div>
  );
};

export default Prices;
