import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const updateUser = async (
  params: any,
  userId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/users/update",
    {
      ...params,
      _id: userId,
    }
  );
};

export const getUserInfo = async (userId: string): Promise<UserResponse> => {
  return await apiService.post(
    "api/users/findOne",
    {userId}
  );
};

export interface IsInMintingWLResponse {
  code?: number;
  data?: any; // Replace 'any' with a more specific type
  wlInfor?: any;
}

export const isInMintingWLApi = async (
  colId: string,
  address: string
): Promise<IsInMintingWLResponse> => {
  return await apiService.post(
    "api/users/isInMintingWL",
    {
      collectionId: colId,
      wallet: address,
    }
  );
};
