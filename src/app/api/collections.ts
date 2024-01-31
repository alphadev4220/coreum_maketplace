import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const registerLaunch = async (
  colId: string,
  state: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/register_launch",
    {colId: colId, state: state}
  );
};

export const getCollectionList = async (
  limit: number,
  userId: string,
  networkSymbol: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/getUserCollections",
    {
      limit: limit,
      userId: userId,
      connectedNetworkSymbol: networkSymbol,
    }
  );
};

export const getSearchInaCollection = async (
  params: any
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/onSearchInACollection",
    params
  );
};

export const getCollectionDetails = async (
  colId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/detail",
    {
      id: colId,
    }
  );
};

// used for remove collection and items
export const removeOne = async (id: string): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/removeOne",
    {
      _id: id,
    }
  );
};

interface CreateCollectionResponse {
  _id?: string;
  data?: any;
}
export const createCollectionApi = async (
  params: any
): Promise<CreateCollectionResponse> => {
  return await apiService.post("api/collection", params);
};

//used for remove only collection
export const deleteCollectionApi = async (
  id: string,
  owner: string
): Promise<CreateCollectionResponse> => {
  return await apiService.post("api/collection/delete", {
    _id: id,
    owner: owner || "",
  });
};

export const updateCollectionApi = async (
  params,
  id
): Promise<UserResponse> => {
  return await apiService.put(
    `api/collection/${id}`,
    params
  );
};

export const getOwnersApi = async (id: string): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/getOwners",
    {
      colId: id,
    }
  );
};

export const getCollsOnANetworkApi = async (
  param: any
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/getCollsOnANetwork",
    param
  );
};

export const updateExplicitApi = async (
  userId: string,
  colId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/updateExplicit",
    {
      userId: userId,
      collId: colId,
    }
  );
};

export const increaseMintedCountApi = async (
  collId: string,
  addCount: number,
  mintedIndexs: any
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/increaseMintedCount",
    {
      collId: collId,
      addCount: addCount,
      mintedIndexs: mintedIndexs,
    }
  );
};

export const getRandomIdsForBulkMintApi = async (
  collId: string,
  mintingCount: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/getRandomIdsForBulkMint",
    {
      collId: collId,
      mintingCount: mintingCount,
    }
  );
};

export const registerLaunchApi = async (
  collId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/register_launch",
    {
      colId: collId,
      state: 1,
    }
  );
};

export const updateWithJsonCIDApi = async (
  collId: string,
  newJsonFolderCID: string,
  itemCount: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/collection/updateWithJsonCID",
    {
      collId: collId,
      jsonFolderCID: newJsonFolderCID,
      totalItemNumberInCID: itemCount,
    }
  );
};
