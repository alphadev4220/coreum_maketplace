import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const getDiscountApi = async (
  colId: string,
  userId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/mintingReferral/getDiscount",
    {
      collId: colId,
      userId: userId,
    }
  );
};

export const updateWlMintCountApi = async (
  colId: string,
  userId: string,
  mintingCount: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/mintingReferral/updateWlMintCount",
    {
      collId: colId,
      userId: userId,
      count: mintingCount,
    }
  );
};

export const updateReferralCountApi = async (
  referralData: any
): Promise<UserResponse> => {
  return await apiService.post(
    "api/mintingReferral/updateReferralCount",
    {
      data: referralData,
    }
  );
};

export const getWlMintedCountApi = async (): Promise<UserResponse> => {
  return await apiService.post(
    "api/mintingReferral/getWlMintedCount",
    ""
  );
};

export const generateReferralUrlApi = async (
  collectionId: string,
  currentUser: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/mintingReferral/generateReferralUrl",
    {
      collectionId: collectionId,
      referrerId: currentUser,
    }
  );
};