import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const getTradingVolumnApi = async (
  collId: []
): Promise<UserResponse> => {
  return await apiService.post(
    "api/sale/getTradingVolumn",
    {
      collId: collId,
    }
  );
};
