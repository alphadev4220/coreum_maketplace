import { ITEM_ACTION_TYPES, config, xummConfig } from "app/config";
import { useAppSelector } from "app/hooks";
import { isValidXRPAddress, saveItemActivity } from "app/methods";
import { selectCurrentUser, selectCurrentWallet } from "app/reducers/auth.reducers";
import { selectDetailOfAnItem } from "app/reducers/nft.reducers";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { getXummSDK } from "utils/xummsdk";

export const useXRPOperations = async () => {
    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const currentUsr = useAppSelector(selectCurrentUser);
    const currentWallet = useAppSelector(selectCurrentWallet);
    const [paymentPayload, setPaymentPayload] = useState(null);

    const removeSaleOnXRP = async () => {
        try {
            const offerResponse = await axios.post(
                `${config.API_URL}api/item/getOffersOfItem`, { tokenId: globalDetailNFT?.tokenId }
            );
            const nftSellOffers = offerResponse?.data?.sellOffers;

            if (!nftSellOffers || nftSellOffers.length === 0) {
                toast.error("No sell offers!");
                return;
            }

            const latestOfferIndex = nftSellOffers.result.offers[0].nft_offer_index;
            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return;
            }

            const transactionBlob = {
                TransactionType: "NFTokenCancelOffer",
                Account: currentWallet,
                NFTokenOffers: [latestOfferIndex],
            };

            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();

            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            const response = await axios.post(`${config.API_URL}api/item/removeFromSale`, {
                itemId: globalDetailNFT._id,
            });

            if (response.data.code === 0) {
                toast.success("Succeed in de-listing an item.");
                saveItemActivity({
                    item: globalDetailNFT?._id,
                    origin: currentUsr?._id,
                    transactionHash: txHash,
                    actionType: ITEM_ACTION_TYPES.DELISTED,
                });

            } else {
                toast.error("Server side error");
            }
        } catch (error) {
            toast.error("Error occurred: " + error.message || "An unknown error occurred");
        } finally {
        }
    };

    const burnOnXRP = async () => {
        try {
            const transactionBlob = {
                TransactionType: "NFTokenBurn",
                Account: currentWallet,
                NFTokenID: globalDetailNFT?.tokenId,
            };
            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return;
            }
            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();
            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            const response = await axios.post(`${config.API_URL}api/item/burntNFT`, {
                itemId: globalDetailNFT._id || "",
            });

            if (response.data.code === 0) {
                toast.success("You've burnt an item.");
                saveItemActivity({
                    item: globalDetailNFT?._id,
                    origin: currentUsr?._id,
                    transactionHash: txHash,
                    actionType: ITEM_ACTION_TYPES.DESTROYED,
                });

            } else {
                toast.error("Server side error");
            }
        } catch (error) {
            toast.error("Error occurred: " + error.message || "An unknown error occurred");
        } finally {
        }

    };

    const trasnferOnXRP = async (toAddr: String) => {
        try {
            const transactionBlob = {
                TransactionType: "NFTokenCreateOffer",
                Account: currentWallet || "",
                NFTokenID: globalDetailNFT?.tokenId,
                Destination: toAddr,
                Amount: "0", //Enter the Amount of the sell offer in drops (millionths of an XRP)
                Flags: 1, // A Flags value of 1 indicates that this transaction is a sell offer
            };
            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return;
            }
            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();
            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            toast.success("You've created an transfer offer.");
            let params = {
                item: globalDetailNFT?._id,
                origin: currentUsr?._id,
                destination: toAddr,
                transactionHash: txHash,
                actionType: ITEM_ACTION_TYPES.PENDINGTRANSFER,
            };
            saveItemActivity(params);


        } catch (error) {
            console.error("NFT Transfer Error:");
            console.error(error);
        }
    };

    const bidOnXRP = async (bidPrice: number, tokenId: string) => {
        try {
            const transactionBlob = {
                TransactionType: "NFTokenCreateOffer",
                Account: currentWallet || "",
                Owner: globalDetailNFT?.owner?.address, //Owner should be present and different from Account field
                NFTokenID: globalDetailNFT?.tokenId,
                Amount: (
                    globalDetailNFT?.price *
                    10 ** xummConfig.decimalOfXRP
                ).toString(),
                Flags: 0,
            };

            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return;
            }

            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();
            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            const response = await axios.post(`${config.API_URL}api/item/placeAbid`, {
                itemId: globalDetailNFT._id,
                bidder: currentUsr.address,
                price: bidPrice,
            });

            if (response.data.code === 0) {
                toast.success("Successfully placed a bid.");
                saveItemActivity({
                    item: globalDetailNFT?._id,
                    price: bidPrice,
                    origin: currentUsr?._id,
                    transactionHash: txHash,
                    actionType: ITEM_ACTION_TYPES.BID,
                });

            } else {
                toast.error("Server side error");
            }

        } catch (error) {
            toast.error("Error occurred: " + error.message || "An unknown error occurred");
        } finally {
        }
    };
    const buyOnXRP = async (tokenId: string) => {
        try {
            const transactionBlob = {
                TransactionType: "NFTokenCreateOffer",
                Account: currentWallet || "",
                Owner: globalDetailNFT?.owner?.address, //Owner should be present and different from Account field
                NFTokenID: globalDetailNFT?.tokenId,
                Amount: (
                    globalDetailNFT?.price *
                    10 ** xummConfig.decimalOfXRP
                ).toString(),
                Flags: 0,
            };

            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return
            }

            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();
            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            const response = await axios.post(`${config.API_URL}api/item/buynow`, {
                itemId: globalDetailNFT._id,
                buyer: currentUsr.address,
                seller: globalDetailNFT.owner?.address,
                price: globalDetailNFT.price,
                txHash: txHash,
            });

            if (response.data.code === 0) {
                toast.success("Successfully bought an item.");
                saveItemActivity({
                    item: globalDetailNFT._id,
                    buyer: currentUsr._id,
                    seller: globalDetailNFT.owner?._id,
                    actionType: ITEM_ACTION_TYPES.SOLD,
                    transactionHash: txHash,
                });

            } else {
                toast.error("Server side error");
            }


        } catch (error) {
            toast.error("Error occurred: " + error.message || "An unknown error occurred");
        } finally {
        }
    };

    const listOnXRP = async (price: number, aucperiod: number) => {
        try {
            const transactionBlob = {
                TransactionType: "NFTokenCreateOffer",
                Account: currentWallet || "",
                NFTokenID: globalDetailNFT?.tokenId,
                Destination: xummConfig.AdminAdress,
                Amount: (
                    (price *
                        10 ** xummConfig.decimalOfXRP *
                        (1000 - xummConfig.BrokerFee)) /
                    1000
                ).toString(), //Enter the Amount of the sell offer in drops (millionths of an XRP)
                Flags: 1, // A Flags value of 1 indicates that this transaction is a sell offer
            };
            if (!isValidXRPAddress(currentWallet)) {
                toast.error("Invalid connected address");
                return;
            }
            const xummSDK = await getXummSDK(); // Assuming getXummSDK() returns the xumm SDK instance
            await xummSDK.ping();
            const payload = { txjson: transactionBlob };
            const payloadResponse = await xummSDK.payload.createAndSubscribe(payload as any, (event) => {
                if (!event.data.signed) {
                    toast.error("User rejected wallet sign!");
                    return false;
                }
                setPaymentPayload(null);
                return event.data;
            });

            if (!payloadResponse) return;

            setPaymentPayload(payloadResponse.created);
            const resolveData = await payloadResponse.resolved;
            if (!(resolveData as any).signed) return;

            const result = await xummSDK.payload.get((resolveData as any).payload_uuidv4);
            const txHash = result.response.txid;

            const response = await axios.post(`${config.API_URL}api/item/updateForSale`, {
                itemId: globalDetailNFT._id,
                period: aucperiod,
                price: price,
                latestTxHash: txHash,
            });

            if (response.data.code === 0) {
                toast.success("Succeed put on sale.");
                saveItemActivity({
                    item: globalDetailNFT._id,
                    price: price,
                    origin: currentUsr._id,
                    actionType: ITEM_ACTION_TYPES.LISTED,
                    transactionHash: txHash,
                });

            } else {
                toast.error("Server side error");
            }
        } catch (error) {
            toast.error("Error occurred: " + error.message || "An unknown error occurred");
        } finally {
        }
    };

    const acceptOnXRP =async (tokenId:string) => {
        await axios
        .post(`${config.API_URL}api/item/acceptBid`, {
          itemId: globalDetailNFT._id,
        })
        .then((response) => {
          if (response.data.code === 0) {
            toast.success("You sold an item.");
          } else {
            toast.error("Server side error.");
          }
        })
        .catch((error) => {
          toast.error("Server side error.");
        });
    }

    return {
        removeSaleOnXRP,
        paymentPayload,
        burnOnXRP,
        trasnferOnXRP,
        bidOnXRP,
        buyOnXRP,
        listOnXRP,
        acceptOnXRP
    };
}