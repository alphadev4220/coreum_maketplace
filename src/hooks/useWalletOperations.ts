import { ACTIVE_CHAINS, PLATFORM_NETWORKS, config } from "app/config";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { isEmpty } from "app/methods";
import { changeAuthor, changeWalletAddress, selectCurrentNetworkSymbol, selectCurrentUser, selectCurrentWallet, selectWalletStatus } from "app/reducers/auth.reducers";
import { selectDetailOfAnItem } from "app/reducers/nft.reducers";
import axios from "axios";
import { useMemo } from "react";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const useWalletOperations = () => {
    const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const currentUsr = useAppSelector(selectCurrentUser);
    const walletStatus = useAppSelector(selectWalletStatus);
    const globalAccount = useAppSelector(selectCurrentWallet);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const Login = (params: any) => {
        axios({
            method: "post",
            url: `${config.baseUrl}users/login`,
            data: params,
        })
            .then(function (response) {
                if (response.data.code === 0) {
                    //set the token to sessionStroage
                    const token = response.data.token;
                    localStorage.setItem("jwtToken", response.data.token);
                    const decoded = jwt_decode(token);
                    dispatch(changeAuthor((decoded as any)._doc));
                } else {
                    dispatch(changeWalletAddress(""));
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const checkWalletAddrAndChainId = () => {
        if (
            currentNetworkSymbol !==
            (globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM)
        ) {
            toast.warn(
                `Please connect your wallet to ${ACTIVE_CHAINS[
                    globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
                ]?.name || ""
                } and try again.`
            );
            return false;
        }
        if (
            isEmpty(currentUsr) === true ||
            currentUsr?._id === undefined ||
            currentUsr?._id === ""
        ) {
            toast.warn("Please log in first.");
            return false;
        }
        if (walletStatus === false) {
            toast.warn("Please connect and unlock your wallet.");
            return false;
        }
        if (
            globalAccount &&
            currentUsr &&
            currentUsr.address &&
            globalAccount.toLowerCase() !== currentUsr.address.toLowerCase()
        ) {
            toast.warn(
                "Wallet addresses are not equal. Please check current wallet to your registered wallet."
            );
            return false;
        }
        return true;
    };

    return {
        checkWalletAddrAndChainId,
        Login
    }
}