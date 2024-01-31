import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const getTransferPendings = async (
  userId: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/itemActivity/getUserCollections",
    {
      userId,
    }
  );
};
