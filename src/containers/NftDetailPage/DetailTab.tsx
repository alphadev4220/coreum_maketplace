import { Tab } from "@headlessui/react"
import { ACTION_PROPS, ACTIVE_CHAINS, ITEM_ACTION_TYPES, config } from "app/config";
import { getShortAddress, isEmpty } from "app/methods";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FiExternalLink } from "react-icons/fi";
import { getLinkPathToJSON } from "utils/utils";

import { useNavigate } from "react-router-dom";
import Avatar from "components/StyleComponent/Avatar";
import { getItemPriceUnitText } from "./ItemPriceUnitText";
import { useAppSelector } from "app/hooks";
import { selectDetailOfAnItem } from "app/reducers/nft.reducers";
import axios from "axios";
import { useItemsApiServices } from "app/api/useItemsApiServices";

export interface DetailTabProps {
    className?: string;
    isMobile?: boolean;
    attributes?;
}

const DetailTab: FC<DetailTabProps> = ({ className = "", isMobile, attributes }: DetailTabProps) => {
    const TABS = ["History", "Properties", "Bids", "Data"];
    const navigate = useNavigate();
    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const [itemActivities, setItemActivities] = useState([]);
    const { curUnitPrice } = useItemsApiServices();
    useEffect(() => {
        getItemActivities();
    }, [globalDetailNFT])

    const getItemActivities = useCallback(() => {
        if ((globalDetailNFT as any)?._id?.toString()?.length === 24) {
            axios
                .post(`${config.API_URL}api/itemActivity/getItemActivities`, {
                    itemId: (globalDetailNFT as any)?._id,
                    limit: 10,
                })
                .then((response) => {
                    setItemActivities(response.data.data);
                })
                .catch((error) => { });
        }
    }, [globalDetailNFT]);

    const renderTabBidHistory = () => {
        return (
            <div className="properties">
                <div className="propertiesHeading">Bids</div>

                <div className="propertiesDetails rounded-3xl overflow-y-scroll max-h-[650px]">
                    {(globalDetailNFT?.bids as any)?.length > 0 ?
                        (globalDetailNFT?.bids as any).map((item: any, index: number) => (
                            <div
                                key={index}
                                className="w-full flex flex-col items-center py-4 "
                            >
                                <div
                                    className="propertiesLine "
                                    onClick={() =>
                                        navigate(`/page-author/${item?.user_id?._id || ""}`)
                                    }
                                >
                                    <Avatar
                                        sizeClass="h-10 w-10"
                                        radius="rounded-full"
                                        imgUrl={item?.user_id?.avatar}
                                    />
                                    <span className="flex flex-col ml-4 text-neutral-500 dark:text-neutral-400">
                                        <span className="flex items-center text-sm">
                                            <span className="">
                                                {`${item?.price || 0} 
                        ${getItemPriceUnitText(globalDetailNFT)} by `}
                                            </span>
                                            <span className="ml-1 font-medium text-neutral-900 dark:text-neutral-200">
                                                {item?.user_id?.username === undefined || item?.user_id?.username === "" ? "Anonymous" : item?.user_id?.username}
                                            </span>
                                        </span>
                                        <span className="mt-1 text-xs">
                                            {new Date(item?.Time * 1000).toLocaleString()}
                                        </span>
                                    </span>
                                </div>

                                {(globalDetailNFT?.bids as any)?.length > 1 && <div className="pageDivider" />}
                            </div>
                        )) : "No Bids"}
                </div>
            </div>
        );
    };

    const renderTabProvenance = () => {
        return !isMobile ? (
            <div className="properties">
                <div className="propertiesHeading">History</div>
                <div className="propertiesDetails rounded-3xl ">
                    {itemActivities && itemActivities?.length > 0 ? (
                        <div className="w-full overflow-y-scroll max-h-[550px]">
                            <table className="mx-auto" style={{ width: "-webkit-fill-available" }}>
                                <thead>
                                    <tr className=" border-b border-[#2f4f4f] my-2">
                                        <td className="py-3 " align="center">
                                            ACTION
                                        </td>
                                        <td className="py-3" align="center">
                                            PRICE($)
                                        </td>
                                        <td className="py-3" align="center">
                                            ORIGIN
                                        </td>
                                        <td className="py-3" align="center">
                                            RECEIVER
                                        </td>
                                        <td className="py-3" align="center">
                                            TIME
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemActivities.map((activity, index) =>
                                        <tr
                                            className="border-b border-[#2f4f4f] my-2"
                                            key={index}
                                        >
                                            <td className=" py-4 px-5" align="center">
                                                <div className="flex items-center gap-1">
                                                    <span>
                                                        <img
                                                            className="w-5 h-5 "
                                                            alt=""
                                                            src={ACTION_PROPS[activity.actionType].icon}
                                                        />
                                                    </span>
                                                    <span>{ACTION_PROPS[activity.actionType].label}</span>
                                                </div>
                                            </td>
                                            <td className=" py-4 px-5" align="center">
                                                <span>
                                                    {activity?.price > 0 ? (activity?.price * curUnitPrice)?.toFixed(2) : "---"}
                                                </span>
                                            </td>
                                            <td className=" py-4 px-5" align="center">
                                                {getShortAddress(activity?.origin?.address)}
                                            </td>
                                            <td className=" py-4 px-5" align="center">
                                                {
                                                    (activity?.actionType === ITEM_ACTION_TYPES.LISTED || activity?.actionType === ITEM_ACTION_TYPES.BID || activity?.actionType === ITEM_ACTION_TYPES.DESTROYED) ? "---" :
                                                        (activity?.actionType === ITEM_ACTION_TYPES.DELISTED || activity?.actionType === ITEM_ACTION_TYPES.MINTED) ?
                                                            getShortAddress(activity?.origin?.address) :
                                                            (activity?.actionType === ITEM_ACTION_TYPES.SOLD || activity?.actionType === ITEM_ACTION_TYPES.TRANSFERED) &&
                                                            getShortAddress(activity?.to?.address)
                                                }
                                            </td>
                                            <td className=" py-4 px-5" align="center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <a
                                                        href={`${ACTIVE_CHAINS[activity?.item?.networkSymbol]
                                                            ?.blockScanUrl
                                                            }${activity?.transactionHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <BiLinkExternal className="text-[#33ff00] cursor-pointer" />
                                                    </a>
                                                    <span>
                                                        {new Date(
                                                            activity?.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : "No History"}
                </div>
            </div>
        ) : (
            <div className="properties">
                <div className="propertiesHeading">History</div>
                {itemActivities && itemActivities?.length > 0 ?
                    <div className="propertiesMobileDetails rounded-3xl overflow-hidden overflow-y-scroll h-[350px]">
                        <ul>
                            <div className="w-full flex flex-col justify-center items-center px-1 overflow-x-scroll">
                                {itemActivities.map((activity, index) => (
                                    <table
                                        className="flex-wrap w-full md:min-w-[700px] md:ml-5  rounded-lg "
                                        key={index}
                                    >
                                        <tr className=" ">
                                            <td className="py-3" colSpan={2} align="center">
                                                {`Action History ${index + 1}`}
                                            </td>
                                        </tr>

                                        <tbody>
                                            <tr>
                                                <td className="py-2 " align="center">
                                                    ACTION
                                                </td>
                                                <td className="py-3" align="center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span>
                                                            <img
                                                                className="w-5 h-5 "
                                                                alt=""
                                                                src={ACTION_PROPS[activity.actionType].icon}
                                                            />
                                                        </span>
                                                        <span>{ACTION_PROPS[activity.actionType].label}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 " align="center">
                                                    PRICE
                                                </td>
                                                <td className=" py-2" align="center">
                                                    <span>
                                                        {activity?.price ? (activity?.price * curUnitPrice)?.toFixed(2) : "---"}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-3" align="center">
                                                    ORIGIN
                                                </td>
                                                <td className=" py-2" align="center">
                                                    {getShortAddress(activity?.origin?.address)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-3" align="center">
                                                    RECEIVER
                                                </td>
                                                <td className=" py-2" align="center">
                                                    {
                                                        (activity?.actionType === ITEM_ACTION_TYPES.LISTED || activity?.actionType === ITEM_ACTION_TYPES.BID || activity?.actionType === ITEM_ACTION_TYPES.DESTROYED) ? "---" :
                                                            (activity?.actionType === ITEM_ACTION_TYPES.DELISTED || activity?.actionType === ITEM_ACTION_TYPES.MINTED) ?
                                                                getShortAddress(activity?.origin?.address) :
                                                                (activity?.actionType === ITEM_ACTION_TYPES.SOLD || activity?.actionType === ITEM_ACTION_TYPES.TRANSFERED) &&
                                                                getShortAddress(activity?.to?.address)
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-3" align="center">
                                                    TIME
                                                </td>
                                                <td className=" py-2" align="center">
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <a
                                                            href={`${ACTIVE_CHAINS[activity?.item?.networkSymbol]
                                                                ?.blockScanUrl
                                                                }${activity?.transactionHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <BiLinkExternal className="text-[#33ff00] cursor-pointer" />
                                                        </a>
                                                        <span>
                                                            {new Date(
                                                                activity?.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                ))}
                            </div>
                        </ul>
                    </div> :
                    <div className="flex justify-center items-center propertiesMobileDetails rounded-3xl overflow-hidden overflow-y-scroll h-[100px]">
                        No History
                    </div>
                }
            </div>
        );
    };
    const renderTabProperties = () => {
        return (
            <div className="properties">
                <div className="propertiesHeading">Properties</div>

                <div className="propertiesDetails rounded-3xl  overflow-y-scroll max-h-[650px]">
                    {attributes?.length > 0 ?
                        attributes?.map((item, index) => (
                            <div key={index} className="w-full flex flex-col items-center ">
                                <div className="propertiesLine">
                                    <div>{item?.trait_type || item?.key}</div>
                                    <div className="font-[300] text-gray-400 trancate text-ellipsis overflow-hidden">
                                        {item?.value}
                                    </div>
                                </div>

                                <div className="pageDivider" />
                            </div>
                        )) :
                        globalDetailNFT?.metaData &&
                            globalDetailNFT?.metaData?.length > 0 ?
                            globalDetailNFT?.metaData.map((item, index) => (
                                <div key={index} className="w-full flex flex-col items-center">
                                    <div className="propertiesLine">
                                        <div>{item?.trait_type || item?.key}</div>
                                        <div className="font-[300] text-gray-400 trancate text-ellipsis overflow-hidden">
                                            {item?.value}
                                        </div>
                                    </div>

                                    <div className="pageDivider" />
                                </div>
                            )) :
                            "No Properties"
                    }
                </div>
            </div>
        );
    };

    const renderTabItem = (item: string) => {
        switch (item) {
            case "Bids":
                return renderTabBidHistory();

            case "History":
                return renderTabProvenance();

            case "Properties":
                return renderTabProperties();

            default:
                return null;
        }
    };

    return (
        <Tab.Group>
            <Tab.List className="flex justify-start py-1 flex-wrap space-x-2.5 rounded-full ">
                {TABS.map((tab, index) =>
                    isEmpty(globalDetailNFT?.metadataURI) === false &&
                        index === 3 ? (
                        <Tab
                            key={index}
                            className="my-1 px-3.5 sm:px-8 py-2 sm:py-3 leading-5  focus:outline-none focus:ring-2 ring-primary-300 bg-[#2E3F29]  rounded-81xl  text-2xl"
                        >
                            <a
                                href={getLinkPathToJSON(globalDetailNFT?.metadataURI, globalDetailNFT?.name)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex justify-center items-center"
                            >
                                <span className="px-2">Data</span>
                                <FiExternalLink className="w-4 h-4" />
                            </a>
                        </Tab>
                    ) :
                        (
                            index < 3 && (
                                <Tab
                                    key={index}
                                    className={({ selected }) =>
                                        `my-1 px-3.5 sm:px-8 py-2 sm:py-3 leading-5 rounded-full focus:outline-none focus:ring-2 ring-primary-300 ${selected
                                            ? "bg-[#33FF00]  rounded-81xl text-black text-2xl"
                                            : "bg-[#2E3F29]  rounded-81xl text-2xl"
                                        }`
                                    }
                                >
                                    {tab}
                                </Tab>
                            )
                        )
                )}
            </Tab.List>
            <Tab.Panels className="mt-4">
                {TABS.map((tab, idx) => (
                    <Tab.Panel key={"tab" + idx} className={"rounded-xl"}>
                        {renderTabItem(tab)}
                    </Tab.Panel>
                ))}
            </Tab.Panels>
        </Tab.Group>
    );
};

export default DetailTab;
