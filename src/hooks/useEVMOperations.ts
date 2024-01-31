import { ACTIVE_CHAINS, MINTING_PRICE_LIST, PLATFORM_NETWORKS } from "app/config";
import { acceptOrEndBid, burnEVMNFT, buyNow, destroySale, getBalanceOf, payBulkMintingPriceWithNativeCurrency, placeBid, setApproveForAll, singleMintOnSale, transferEVMNFT } from "../InteractWithSmartContract/interact";
import Web3 from "web3";
import { toast } from "react-toastify";
import { useAppSelector } from "app/hooks";
import { selectCurrentNetworkSymbol, selectCurrentUser, selectGlobalProvider } from "app/reducers/auth.reducers";
import { selectDetailOfAnItem } from "app/reducers/nft.reducers";

export const useEVMOperations = () => {
    const globalProvider = useAppSelector(selectGlobalProvider);
    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const currentUsr = useAppSelector(selectCurrentUser);
    const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);

    const removeSaleOnEVM = async () => {
        try {
            const balance = await getBalanceOf(
                new Web3(globalProvider),
                currentUsr?.address,
                globalDetailNFT?._id,
                globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
            );

            if (balance === 1) {
                toast.warn("Your NFT is not on sale.");
                return;
            }

            if ((balance as any)?.message) {
                toast.warn((balance as any).message);
                return;
            }

            const result = await destroySale(
                new Web3(globalProvider),
                currentUsr?.address,
                globalDetailNFT?._id,
                globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
            );
            if ((result as any).success === true)
                toast.success((result as any).message);

        } catch (error) {
            toast.error("An error occurred during the removal process: " + error.message);
        } finally {
        }
    };

    const burnOnEVM = async () => {
        let iHaveit;
        try {
            if ((globalDetailNFT?.isSale || 0) > 0) await removeSaleOnEVM();
            iHaveit = await getBalanceOf(
                new Web3(globalProvider),
                (currentUsr as any)?.address,
                globalDetailNFT?._id,
                globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
            );
            if (iHaveit === 0) {
                toast.warn(
                    "You cannot burn NFT while it is on sale or you've not minted it ever."
                );
                return;
            }
            if (iHaveit && (iHaveit as any).message) {
                toast.warn((iHaveit as any).message);
            }
            let result = await burnEVMNFT(
                new Web3(globalProvider),
                (currentUsr as any)?.address,
                globalDetailNFT?._id,
                globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
            );
            if ((result as any).success === true)
                toast.success((result as any).message);

        } catch (err) {
            toast.error("An error occurred during the burn process.");
        } finally {

        }
    }

    const transferOnEVM = async (toAddr: string) => {
        let iHaveit;
        iHaveit = await getBalanceOf(
            new Web3(globalProvider),
            (currentUsr as any)?.address,
            globalDetailNFT?._id,
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if (iHaveit === 0) {
            toast.warn(
                "You cannot transfer NFT while it is on sale or you've not minted it ever."
            );
            return;
        }
        if (iHaveit && (iHaveit as any).message) {
            toast.warn((iHaveit as any).message);
        }
        let result = await transferEVMNFT(
            new Web3(globalProvider),
            (currentUsr as any)?.address,
            toAddr,
            globalDetailNFT?._id,
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true)
            toast.success(
                (result as any).message +
                "Check your new item in your profile 'Collectibles' ."
            );
        else toast.error((result as any).message);
    }

    const bidOnEVM = async (bidPrice: number, tokenId: string) => {
        let result = await placeBid(
            new Web3(globalProvider),
            currentUsr?.address,
            tokenId,
            Number(bidPrice),
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true)
            toast.success((result as any).message);
        else toast.error((result as any).message);

    };

    const buyOnEVM = async (tokenId: string) => {
        let result = await buyNow(
            new Web3(globalProvider),
            currentUsr?.address,
            tokenId,
            globalDetailNFT?.price,
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true) {
            toast.success(
                (result as any).message +
                "Check your new item in your profile 'Collectibles' ."
            );
        } else toast.error((result as any).message);
    };

    const listOnEVM = async (tokenId: string, aucperiod: number, price: number) => {
        let result = await setApproveForAll(
            new Web3(globalProvider),
            currentUsr?.address,
            ACTIVE_CHAINS[
                globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
            ]?.platformContractAddress || "",
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true)
            toast.success((result as any).message);
        if ((result as any).success === false) {
            toast.error((result as any).message);
            return;
        }
        result = await singleMintOnSale(
            new Web3(globalProvider),
            currentUsr?.address,
            tokenId,
            Math.floor(aucperiod),
            price,
            0,
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true) {
            toast.success((result as any).message);
        } else toast.error((result as any).message);
    }

    const acceptOnEVM = async (tokenId: string) => {
        let result = await acceptOrEndBid(
            new Web3(globalProvider),
            currentUsr?.address,
            tokenId,
            globalDetailNFT?.networkSymbol || PLATFORM_NETWORKS.COREUM
        );
        if ((result as any).success === true) {
            toast.success((result as any).message);
        } else toast.error((result as any).message);
    }

    const mintOnEVM = async (totalPrice: number) => {
        let payPrice = await payBulkMintingPriceWithNativeCurrency(
            new Web3(globalProvider),
            currentUsr?.address,
            MINTING_PRICE_LIST[currentNetworkSymbol].TREASURY_WALLET,
            totalPrice,
            currentNetworkSymbol
        );
        return payPrice;
    }

    return {
        removeSaleOnEVM,
        burnOnEVM,
        transferOnEVM,
        bidOnEVM,
        buyOnEVM,
        listOnEVM,
        acceptOnEVM,
        mintOnEVM
    }
}