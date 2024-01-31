import {AxiosResponse} from "axios";
import apiService from "./api";

interface UserResponse {
  count?: number;
  data?: any;
}

export const getUsers = async (
  page: number,
  itemsByPage: number,
  keyword: string,
  searchType: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/admin/get_users",
    {
      page: page,
      itemsByPage: itemsByPage,
      keyword: keyword,
      searchType: searchType,
    }
  );
};

export const getCollections = async (
  collectionPage: number,
  collectionsByPage: number,
  collectionKeyword: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/admin/get_collection_list",
    {
      page: collectionPage,
      itemsByPage: collectionsByPage,
      keyword: collectionKeyword,
    }
  );
};