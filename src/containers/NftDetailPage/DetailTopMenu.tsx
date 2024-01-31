import { PLATFORM_NETWORKS, config } from "app/config";
import { isEmpty } from "app/methods";
import { FC, useCallback, useState } from "react";

import ModalTransferToken from "components/Modal/ModalTransferToken";
import ModalDelete from "components/Modal/ModalDelete";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { changeItemDetail, selectDetailOfAnItem } from "app/reducers/nft.reducers";
import { selectCurrentNetworkSymbol, selectCurrentUser } from "app/reducers/auth.reducers";
import { Backdrop, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useWalletOperations } from "hooks/useWalletOperations";
import { useEVMOperations } from "hooks/useEVMOperations";
import { useCoreumOperations } from "hooks/useCoreumOperations";
import { useXRPOperations } from "hooks/useXRPOperations";

const DetailTopMenu = () => {

    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const currentUsr = useAppSelector(selectCurrentUser);
    const { checkWalletAddrAndChainId }: any = useWalletOperations();
    const { burnOnEVM, transferOnEVM } = useEVMOperations();
    const { burnOnCoreum, transferOnCoreum } = useCoreumOperations();
    const { burnOnXRP, trasnferOnXRP }: any = useXRPOperations();

    const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
    const [processing, setProcessing] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTransfering, setIsTransfering] = useState(false);
    const [isBurning, setIsBurning] = useState(false);
    const openModalBurn = () => setIsBurning(true);
    const openModalTransferToken = () => setIsTransfering(true);
    const closeModalBurn = () => setIsBurning(false);
    const closeModalTransferToken = () => setIsTransfering(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const setFavItem = async (target_id: string, user_id: string) => {
        setProcessing(true);
        if (isEmpty(target_id) || isEmpty(user_id)) return;
        await axios
            .post(
                `${config.API_URL}api/users/set_fav_item`,
                { target_id: target_id, user_id: user_id },
                {
                    headers: {
                        "x-access-token": localStorage.getItem("jwtToken"),
                    },
                }
            )
            .then(async (result) => {
                await axios
                    .post(
                        `${config.API_URL}api/item/get_detail`,
                        { id: globalDetailNFT?._id || "" },
                        {
                            headers: {
                                "x-access-token": localStorage.getItem("jwtToken"),
                            },
                        }
                    )
                    .then((result) => {
                        dispatch(changeItemDetail(result.data.data || {}));
                        setProcessing(false);
                    })
                    .catch(() => {
                        setProcessing(false);
                    });
            });
    };
    const handleMessage = (msg: any) => {
        let id = msg?._id ? msg._id : msg;
        if (currentUsr && currentUsr._id && currentUsr?._id !== id) {
            navigate("/message/" + id);
        } else {
            toast.warn("A NFT you select is not yours");
        }
    };

    const toggleFav = () => {
        if (currentUsr === undefined || Object.keys(currentUsr).length === 0) {
            toast.error("Please connect your wallet first");
            return;
        }
        setFavItem(globalDetailNFT._id, currentUsr?._id);
    };

    const handleOptionClick = () => {
        return {};
    };

    const validateOwnership = useCallback(() => {
        if (globalDetailNFT?.owner._id !== currentUsr?._id) {
            toast.warn("You are not the owner of this NFT.");
            return false;
        }
        return true;
    }, [globalDetailNFT, currentUsr]);


    const validateSaleStatus = useCallback(() => {
        if (globalDetailNFT?.isSale > 0) {
            toast.warn("You cannot burn listed NFT.");
            return false;
        }
        return true;
    }, [globalDetailNFT]);

    const burnToken = async () => {
        if (!validateOwnership()) return;
        if (!validateSaleStatus()) return;

        setProcessing(true);
        if (!checkWalletAddrAndChainId) {
            setProcessing(false);
            return;
        }
        try {
            switch (currentNetworkSymbol) {
                case PLATFORM_NETWORKS.EVM:
                    await burnOnEVM();
                    break;
                case PLATFORM_NETWORKS.COREUM:
                    await burnOnCoreum();
                    break;
                case PLATFORM_NETWORKS.XRPL:
                    await burnOnXRP();
                    break;
                default:
                    toast.error("Unsupported network.");
            }
        } catch (error) {
            toast.error("Error occurred: " + error.message);
        } finally {
            setProcessing(false);
            if (globalDetailNFT?.collection_id !== null) {
                navigate(
                    `/collectionItems/${globalDetailNFT?.collection_id?._id || ""
                    }`
                );
            } else {
                navigate(`/page-author/${currentUsr?._id || ""}`);
            }
        }
    };

    const transferToken = async (toAddr: string) => {
        if (!validateOwnership()) return;
        if (!validateSaleStatus()) return;

        setProcessing(true);
        if (!checkWalletAddrAndChainId) {
            setProcessing(false);
            return;
        }
        try {
            switch (currentNetworkSymbol) {
                case PLATFORM_NETWORKS.EVM:
                    await transferOnEVM(toAddr);
                    break;
                case PLATFORM_NETWORKS.COREUM:
                    await transferOnCoreum(toAddr);
                    break;
                case PLATFORM_NETWORKS.XRPL:
                    await trasnferOnXRP();
                    break;
                default:
                    toast.error("Unsupported network.");
            }
        } catch (error) {
            toast.error("Error occurred: " + error.message);
        } finally {
            setProcessing(false);
            if (globalDetailNFT?.collection_id !== null) {
                navigate(
                    `/collectionItems/${globalDetailNFT?.collection_id?._id || ""
                    }`
                );
            } else {
                navigate(`/page-author/${currentUsr?._id || ""}`);
            }
        }
    };

    const reportToken = async () => {
        try {
            await axios.post(`${config.API_URL}api/collection/addReport`, {
                collId: globalDetailNFT?.collection_id?._id,
                userId: currentUsr?._id,
                itemId: globalDetailNFT?._id,
            });
            toast.success("You've reported this item.");
        } catch (error) {
            console.log(error?.message);
        }
    };

    return (
        <div className={`w-[full] flex items-center justify-center gap-2 lg:ml-[56px] lg:gap-5 mt-[30px]`}>
            <div
                className=" relative rounded-81xl bg-lime-200 bullets cursor-pointer"
                onClick={toggleFav}
            >
                <img
                    src="/assets/heart.png"
                    alt=""
                    className="cursor-pointer"
                />
                <div className="hidden lg:inline">Likes</div>
                <div className="">
                    ({globalDetailNFT?.likes ? globalDetailNFT.likes.length : 0}
                    )
                </div>
            </div>
            <div className=" relative rounded-81xl bg-lime-200 bullets">
                <img src="/assets/comments.png" alt="" />
                <div className="hidden lg:inline">Comments</div>
                <div className=""> (0)</div>
            </div>
            <div className=" relative rounded-81xl bg-lime-200 bullets">
                <img src="/assets/views.png" alt="" />
                <div className="hidden lg:inline">Views</div>
                <div className="">
                    {" "}
                    ({globalDetailNFT?.views ? globalDetailNFT?.views : 0}){" "}
                </div>
            </div>
            {
                <div
                    className=" relative rounded-81xl bg-lime-200 bullets cursor-pointer"
                    onClick={handleToggleDropdown}
                >
                    <div className="hidden lg:inline">More Actions</div>
                    <svg
                        width="28"
                        height="22"
                        viewBox="0 0 28 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g filter="url(#filter0_di_261_1553)">
                            <path
                                d="M24 16H4V13.2H24V16ZM24 2V4.8H4V2H24ZM24 10.4H4V7.6H24V10.4Z"
                                fill="white"
                            />
                        </g>
                        <defs>
                            <filter
                                id="filter0_di_261_1553"
                                x="0"
                                y="0"
                                width="28"
                                height="22"
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                            >
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                />
                                <feOffset dy="2" />
                                <feGaussianBlur stdDeviation="2" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0.2 0 0 0 0 1 0 0 0 0 0 0 0 0 0.42 0"
                                />
                                <feBlend
                                    mode="normal"
                                    in2="BackgroundImageFix"
                                    result="effect1_dropShadow_261_1553"
                                />
                                <feBlend
                                    mode="normal"
                                    in="SourceGraphic"
                                    in2="effect1_dropShadow_261_1553"
                                    result="shape"
                                />
                                <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                />
                                <feOffset dy="-2" />
                                <feGaussianBlur stdDeviation="1.5" />
                                <feComposite
                                    in2="hardAlpha"
                                    operator="arithmetic"
                                    k2="-1"
                                    k3="1"
                                />
                                <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0.2 0 0 0 0 1 0 0 0 0 0 0 0 0 0.45 0"
                                />
                                <feBlend
                                    mode="normal"
                                    in2="shape"
                                    result="effect2_innerShadow_261_1553"
                                />
                            </filter>
                        </defs>
                    </svg>

                    {isDropdownOpen && (
                        <div className="absolute right-[0px] top-[35px] md:flex">
                            <div className=" bg-lime-300 rounded-xl shadow-lg nftDetailsDropdown">
                                <div
                                    className="rounded-xl hover:bg-opacity-5 hover:bg-lime-400 nftDetailsDropdownItem"
                                    onClick={() => handleOptionClick()}
                                >
                                    <div className="flex justify-center" style={{ width: "20%" }}>
                                        <img
                                            className="relative"
                                            alt=""
                                            src="/assets/share.png"
                                        />
                                    </div>
                                    <div className="nftDetailsDropdownText">Share</div>
                                </div>
                                <div
                                    className="rounded-xl hover:bg-opacity-5 hover:bg-lime-400 nftDetailsDropdownItem"
                                    onClick={() => {
                                        handleMessage((globalDetailNFT as any)?.owner);
                                        handleOptionClick();
                                    }}
                                >
                                    <div className="flex justify-center" style={{ width: "20%" }}>
                                        <img
                                            className="relative"
                                            alt=""
                                            src="/assets/message.png"
                                        />
                                    </div>
                                    <div className="nftDetailsDropdownText">Message</div>
                                </div>
                                <div
                                    className="rounded-xl hover:bg-opacity-5 hover:bg-lime-400 nftDetailsDropdownItem"
                                    onClick={() => {
                                        openModalTransferToken();
                                        handleOptionClick();
                                    }}
                                >
                                    <div className="flex justify-center" style={{ width: "20%" }}>
                                        <img
                                            className="relative"
                                            alt=""
                                            src="/assets/transfer.png"
                                        />
                                    </div>
                                    <div className="nftDetailsDropdownText">Transfer</div>
                                </div>
                                <div
                                    className="rounded-xl hover:bg-opacity-5 hover:bg-lime-400 nftDetailsDropdownItem"
                                    onClick={() => {
                                        openModalBurn();
                                        handleOptionClick();
                                    }}
                                >
                                    <div className="flex justify-center" style={{ width: "20%" }}>
                                        <img
                                            className="relative"
                                            alt=""
                                            src="/assets/burn.png"
                                        />
                                    </div>
                                    <div className="nftDetailsDropdownText">Burn</div>
                                </div>
                                <div
                                    className="rounded-xl hover:bg-opacity-5 hover:bg-lime-400 nftDetailsDropdownItem"
                                    onClick={() => {
                                        reportToken();
                                        handleOptionClick();
                                    }}
                                >
                                    <div className="flex justify-center" style={{ width: "20%" }}>
                                        <img
                                            className="relative"
                                            alt=""
                                            src="/assets/bug.png"
                                        />
                                    </div>
                                    <div className="nftDetailsDropdownText">Report</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
            <ModalDelete
                show={isBurning}
                onOk={burnToken}
                onCloseModalDelete={closeModalBurn}
            />
            <ModalTransferToken
                show={isTransfering}
                onOk={transferToken}
                onCloseModalTransferToken={closeModalTransferToken}
            />
            {
                <Backdrop
                    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={processing}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            }
        </div>
    );
};

export default DetailTopMenu;
