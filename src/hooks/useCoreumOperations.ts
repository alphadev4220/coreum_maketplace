import { checkNativeCurrencyAndTokenBalances } from "utils/utils";
import { useSigningClient } from "../app/cosmwasm";
import { toast } from "react-toastify";
import { COREUM_PAYMENT_COINS, ITEM_ACTION_TYPES, config } from "../app/config";
import axios from "axios";
import { saveItemActivity } from "../app/methods";
import { selectCurrentUser } from "../app/reducers/auth.reducers";
import { changeItemOwnHistory, selectDetailOfAnItem } from "../app/reducers/nft.reducers";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useMemo } from "react";

export const useCoreumOperations = () => {
  const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
  const currentUsr = useAppSelector(selectCurrentUser);
  const { cancelSaleNFT, burnNFT, transferNFT, bidNFT, sendToken, listNFT, acceptSaleNFT }: any = useSigningClient();
  const dispatch = useAppDispatch();

  const removeSaleOnCoreum = async () => {
    let balanceCheck = await checkNativeCurrencyAndTokenBalances(0, "native");
    if (!balanceCheck) {
      return;
    }
    try {
      let txHash = await cancelSaleNFT(
        currentUsr.address,
        globalDetailNFT.collection_id?.address,
        globalDetailNFT.tokenId
      );
      if (txHash === -1) {
        toast.error("Blockchian network error.");
        return;
      } else {
        await axios
          .post(`${config.API_URL}api/item/removeFromSale`, {
            itemId: globalDetailNFT._id,
          })
          .then((response) => {
            if (response.data.code === 0) {
              toast.success("Succeed in unlisting an item.");
              let params = {
                item: globalDetailNFT?._id,
                origin: currentUsr?._id,
                transactionHash: txHash,
                actionType: ITEM_ACTION_TYPES.DELISTED,
              };
              saveItemActivity(params);
            } else toast.error("Server side error");
          })
          .catch((error) => {
            toast.error("Server side error");
          });
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  const burnOnCoreum = async () => {
    try {
      let checkBalance = await checkNativeCurrencyAndTokenBalances(
        0,
        "native"
      );
      if (checkBalance === false) return;
      let txHash = await burnNFT(
        currentUsr.address,
        globalDetailNFT.collection_id.cw721address,
        globalDetailNFT.tokenId.toString()
      );
      if (txHash === -1) {
        toast.error("Network error.");
      } else {
        await axios
          .post(`${config.API_URL}api/item/burntNFT`, {
            itemId: globalDetailNFT._id || "",
          })
          .then((response) => {
            if (response.data.code === 0) {
              let params = {
                item: globalDetailNFT?._id,
                origin: currentUsr?._id,
                transactionHash: txHash,
                actionType: ITEM_ACTION_TYPES.DESTROYED,
              };
              saveItemActivity(params);
              toast.success("You've burnt an item.");

            } else {
              toast.error("Set activity error.");
            }
          })
          .catch((error) => {
            toast.error("Internal server error.");
          });
      }
    } catch (error) {
      toast.error("Transaction failed.");
    } finally {
    }
  }

  const transferOnCoreum = async (toAddr: String) => {
    try {
      let checkBalance = await checkNativeCurrencyAndTokenBalances(
        0,
        "native"
      );
      if (checkBalance === false) return;
      let txHash = await transferNFT(
        currentUsr.address,
        globalDetailNFT.collection_id.cw721address,
        toAddr,
        globalDetailNFT.tokenId.toString()
      );
      if (txHash === -1) {
        toast.error("Network error.");
      } else {
        await axios
          .post(`${config.API_URL}api/item/transferedNFT`, {
            itemId: globalDetailNFT._id,
            sender: currentUsr.address,
            receiver: toAddr,
          })
          .then((response) => {
            if (response.data.code === 0) {
              toast.success("You've sent an item.");
              let params = {
                item: globalDetailNFT?._id,
                origin: currentUsr?._id,
                destination: toAddr,
                transactionHash: txHash,
                actionType: ITEM_ACTION_TYPES.TRANSFERED,
              };
              saveItemActivity(params);
            } else {
              toast.error("Set Activity error.");
            }
          })
          .catch((error) => {
            toast.error("Internal server error.");
          });
      }
    } catch (error) {
      toast.error("Transaction failed.");
    }
  }

  const bidOnCoreum = async (bidPrice: number, tokenId: string) => {
    let balanceCheck = await checkNativeCurrencyAndTokenBalances(
      bidPrice,
      "native"
    );
    if (!balanceCheck) {
      return;
    }
    if (globalDetailNFT.coreumPaymentUnit === COREUM_PAYMENT_COINS.CORE) {
      try {
        //if payment coin is CORE
        let txHash = await bidNFT(
          currentUsr.address,
          globalDetailNFT.collection_id?.address,
          globalDetailNFT.tokenId,
          config.COIN_MINIMAL_DENOM,
          bidPrice
        );
        if (txHash === -1) {
          toast.error("Blockchian network error.");
        } else {
          await axios
            .post(`${config.API_URL}api/item/placeAbid`, {
              itemId: globalDetailNFT._id,
              bidder: currentUsr.address,
              price: bidPrice,
            })
            .then((response) => {
              if (response.data.code === 0) {
                toast.success("Successfully placed a bid.");
                let params = {
                  item: globalDetailNFT?._id,
                  price: bidPrice,
                  origin: currentUsr?._id,
                  transactionHash: txHash,
                  actionType: ITEM_ACTION_TYPES.BID,
                };
                saveItemActivity(params);
              } else {
                toast.error("Server side error.");
              }
            })
            .catch((error) => {
              toast.error("Server side error.");
            });
        }
      } catch (error) {
        toast.error("Transactioin failed.");
      }
    } else {
      try {
        //if payment token is RIZE
        let txHash = await sendToken(
          currentUsr.address,
          bidPrice,
          globalDetailNFT.tokenId,
          globalDetailNFT.collection_id?.address
        );
        if (txHash === -1) {
          toast.error("Blockchian network error.");
        } else {
          axios
            .post(`${config.API_URL}api/item/placeAbid`, {
              itemId: globalDetailNFT._id,
              bidder: currentUsr.address,
              price: bidPrice,
            })
            .then((response) => {
              if (response.data.code === 0) {
                toast.success("Successfully placed a bid.");
              } else {
                toast.error("Server side error.");
              }
            })
            .catch((error) => {
              toast.error("Server side error.");
            });
        }
      } catch (error) {
        toast.error("Transactioin failed.");
      }
    }
  };
  const buyOnCoreum = async (tokenId: string) => {
    let balanceCheck = await checkNativeCurrencyAndTokenBalances(
      globalDetailNFT.price,
      "native"
    );
    if (!balanceCheck) {
      return;
    }
    if (globalDetailNFT.coreumPaymentUnit === COREUM_PAYMENT_COINS.CORE) {
      try {
        let txHash = await bidNFT(
          currentUsr.address,
          globalDetailNFT.collection_id?.address,
          globalDetailNFT.tokenId,
          config.COIN_MINIMAL_DENOM,
          globalDetailNFT.price
        );
        if (txHash === -1) {
          toast.error("Blockchian network error.");
        } else {
          await axios
            .post(`${config.API_URL}api/item/buynow`, {
              itemId: globalDetailNFT._id,
              buyer: currentUsr.address,
              seller: globalDetailNFT.owner?.address,
              price: globalDetailNFT.price,
            })
            .then((response) => {
              if (response.data.code === 0) {
                toast.success("Successfully bought an item.");
                let params = {
                  item: globalDetailNFT._id,
                  buyer: currentUsr._id,
                  seller: globalDetailNFT.owner?._id,
                  actionType: ITEM_ACTION_TYPES.SOLD,
                  transactionHash: txHash,
                  price: globalDetailNFT.price,
                };
                saveItemActivity(params);
              } else {
                toast.error("Set activity error.");
              }
            })
            .catch((error) => {
              toast.error("Server side error.");
            });
        }
      } catch (error) {
        toast.error("Transactioin failed.");
      }
    } else {
      try {
        let txHash = await sendToken(
          currentUsr.address,
          globalDetailNFT.price,
          globalDetailNFT.tokenId,
          globalDetailNFT.collection_id?.address
        );
        if (txHash === -1) {
          toast.error("Blockchian network error.");
        } else {
          await axios
            .post(`${config.API_URL}api/item/buynow`, {
              itemId: globalDetailNFT._id,
              buyer: currentUsr.address,
              seller: globalDetailNFT.owner?.address,
              price: globalDetailNFT.price,
            })
            .then((response) => {
              if (response.data.code === 0) {
                toast.success("Successfully bought an item.");
              } else {
                toast.error("Server side error.");
              }
            })
            .catch((error) => {
              toast.error("Server side error.");
            });
        }
      } catch (error) {
        toast.error("Transactioin failed.");
      }
    }
  };

  const listOnCoreum = async (instant: boolean, aucperiod: number, price: number) => {
    try {

      let denormArg;
      denormArg =
        globalDetailNFT.coreumPaymentUnit === COREUM_PAYMENT_COINS.CORE
          ? { native: config.COIN_MINIMAL_DENOM }
          : { cw20: config.CW20_CONTRACT };
      let txhash = await listNFT(
        currentUsr.address,
        globalDetailNFT.collection_id?.cw721address,
        !instant ? "Auction" : "Fixed",
        !instant
          ? {
            Time: [
              Math.floor(Date.now() / 1000),
              Math.floor(Date.now() / 1000) + Math.floor(aucperiod),
            ],
          }
          : "Fixed",
        price,
        price,
        denormArg,
        globalDetailNFT.tokenId,
        globalDetailNFT.collection_id?.address
      );
      if (txhash !== -1) {
        //update db
        await axios
          .post(`${config.API_URL}api/item/updateForSale`, {
            itemId: globalDetailNFT._id,
            period: aucperiod,
            price: price,
            latestTxHash: txhash,
          })
          .then((response) => {
            if (response.data.code === 0) {
              toast.success("Succeed put on sale.");
              let params2 = {
                item: globalDetailNFT._id,
                price: price,
                origin: currentUsr._id,
                actionType: ITEM_ACTION_TYPES.LISTED,
                transactionHash: txhash,
              };
              saveItemActivity(params2);
            } else {
              toast.error("Server side error");
            }
          })
          .catch((error) => {
            toast.error("Server side error");
          });
      } else {
        toast.error("Blockchian network error.");
      }
    } catch (error) {
      toast.error(error.message);
    }

  }

  const acceptOnCoreum = async (tokenId: string) => {
    let balanceCheck = await checkNativeCurrencyAndTokenBalances(0, "native");
    if (!balanceCheck) {
      return;
    }
    try {
      let txHash = await acceptSaleNFT(
        currentUsr.address,
        globalDetailNFT.collection_id?.address,
        globalDetailNFT.tokenId
      );
      if (txHash === -1) {
        toast.error("Network connection error.");
      } else {
        axios
          .post(`${config.API_URL}api/item/acceptBid`, {
            itemId: globalDetailNFT._id,
          })
          .then((response) => {
            if (response.data.code === 0) {
              toast.success("You sold an item.");
              let params = {
                item: globalDetailNFT._id,
                price: globalDetailNFT?.bids[globalDetailNFT?.bids.length - 1].price,
                buyer: globalDetailNFT?.bids[globalDetailNFT?.bids.length - 1].user_id,
                seller: globalDetailNFT.owner?._id,
                actionType: ITEM_ACTION_TYPES.SOLD,
                transactionHash: txHash,
              };
              saveItemActivity(params);
            } else toast.error("Server side error.");
          })
      }
    } catch (error) {
      toast.error("Transaction failed");
    }
  }

  const getLeftDuration = useMemo(() => {
    const created = globalDetailNFT?.auctionStarted;
    const period = globalDetailNFT?.auctionPeriod;
    const time = Date.now();
    const diff = created * 1000 + period * 1000 - time;
    return (diff / 1000);
  }, [globalDetailNFT]);

  const plusPlayCount = async () => {
    await axios
      .post(
        `${config.API_URL}api/playhistory/createPlayHistory`,
        {
          itemId: globalDetailNFT?._id || "",
          userId: currentUsr?._id || "635808844de50f7f88494338",
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(changeItemOwnHistory(result.data.data || []));
      })
      .catch(() => { });
  };
  
  return {
    removeSaleOnCoreum,
    burnOnCoreum,
    transferOnCoreum,
    bidOnCoreum,
    buyOnCoreum,
    listOnCoreum,
    acceptOnCoreum,
    getLeftDuration,
    plusPlayCount
  };
};
