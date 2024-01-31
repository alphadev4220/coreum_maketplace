import { AxiosResponse } from "axios";
import apiService, { UserResponse } from "./api";
import { changeItemDetail, changeItemOwnHistory, selectDetailOfAnItem } from "app/reducers/nft.reducers";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useEffect, useState } from "react";


// Define the parameters for the API call
interface GetItemsParams {
    start: number;
    last: number;
    activeindex: number; // Assuming 'activeIndex' is a number
    userId: string;
}

export const useItemsApiServices = () => {
    const dispatch = useAppDispatch();
    const globalDetailNFT = useAppSelector(selectDetailOfAnItem);
    const [curUnitPrice, setCurUnitPrice] = useState(0);

    const getItemsofUser = async (params: GetItemsParams): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/get_items_of_user', params);
        return response;
    };

    const getNFTsInWallet = async (walletAddress: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/getNFTsInWallet',
            { wallet: walletAddress }
        );
        return response;
    };

    const bulkTransferApi = async (itemIds: [], sender: string, receiver: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/bulkTransferNFTs',
            {
                itemIds: itemIds,
                sender: sender,
                receiver: receiver
            }
        );
        return response;
    };

    const bulkBurnApi = async (itemIds: [], collectionId: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/bulkBurnNFTs',
            {
                itemIds: itemIds,
                collectionId: collectionId,
            }
        );
        return response;
    };

    const bulkRemoveFromSaleApi = async (itemIds: []): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/bulkRemoveFromSale',
            {
                itemIds: itemIds,
            }
        );
        return response;
    };

    const bulkPutOnSaleApi = async (tokenIds: [], aucPeriod: number, price: number, txHash: string, collectionAddr: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/bulkUpdateForSale',
            {
                itemIds: tokenIds,
                period: aucPeriod,
                price: price,
                latestTxHash: txHash,
                collectionAddr: collectionAddr,
            }
        );
        return response;
    };

    const bulkCreateApi = async (params: any): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/bulkcreate522',
            { params: params }
        );
        return response;
    };

    const deleteManyByIdsApi = async (idArray: string[], collId: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/deleteManyByIds',
            {
                idArray: idArray,
                collId: collId,
            }
        );
        return response;
    };

    const updateTokenIdsApi = async (idArray: string[], startId: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/updateTokenIds',
            {
                idArray: idArray,
                startTokenId: startId,
            }
        );
        return response;
    };

    const getUserItemsOnACollApi = async (collId: string, userId: string): Promise<UserResponse> => {
        const response: AxiosResponse<UserResponse> = await apiService.post('api/item/getUserItemsOnAColl',
            {
                collId: collId,
                userId: userId,
            }
        );
        return response;
    };
    const getNftDetail = async (id: string) => {
        try {

            const detailResponse: AxiosResponse<UserResponse> = await apiService.post('api/item/get_detail',
                { id: id },
            );
            const itemData = detailResponse.data || {};
            dispatch(changeItemDetail(itemData));

            const historyResponse: AxiosResponse<UserResponse> = await apiService.post('api/item/get_owner_history',
                { item_id: id },
            );
            const historyData: any = historyResponse.data || [];
            dispatch(changeItemOwnHistory(historyData));
        } catch (error) {
            console.error("Error fetching item history:", error);
        }
    };

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response: AxiosResponse<UserResponse> = await apiService.post('api/item/getCurrencyPrice',
                    {
                        networkSymbol: globalDetailNFT.networkSymbol,
                    }
                );
                setCurUnitPrice(parseFloat((response as any).priceOnUsd));
            } catch (error) {
                console.error('Error fetching currency price:', error);
                // Handle error appropriately
            }
        };

        fetchPrice();
    }, [globalDetailNFT])

    const fetchPriceForNetworkSymbol = async (networkSymbol) => {
        try {
            const response: AxiosResponse<UserResponse> = await apiService.post('api/item/getCurrencyPrice',
                {
                    networkSymbol: networkSymbol,
                }
            );

            return {
                networkSymbol,
                priceOnUsd: parseFloat((response as any).priceOnUsd),
            };
        } catch (error) {
            console.error('Error fetching price for networkSymbol:', networkSymbol, error);
            return {
                networkSymbol,
                priceOnUsd: null, // or any default value
            };
        }
    }

    return {
        getItemsofUser,
        getNFTsInWallet,
        bulkTransferApi,
        bulkBurnApi,
        bulkRemoveFromSaleApi,
        bulkPutOnSaleApi,
        bulkCreateApi,
        deleteManyByIdsApi,
        updateTokenIdsApi,
        getUserItemsOnACollApi,
        getNftDetail,
        curUnitPrice,
        fetchPriceForNetworkSymbol
    };
}
