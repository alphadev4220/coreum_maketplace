import {AxiosResponse} from "axios";
import apiService, {UserResponse} from "./api";

export const getExistsStatus = async (
  user_id: string,
  target_id: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/follow/get_isExists",
    {user_id: user_id, target_id: target_id}
  );
};

export const setFollow = async (
  my_id: string,
  target_id: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/follow/toggle_follow",
    {my_id: my_id, target_id: target_id}
  );
};

export const getFollows = async (
  limit: number,
  my_id: string
): Promise<UserResponse> => {
  return await apiService.post(
    "api/follow/get_follows",
    {limit: limit, my_id: my_id}
  );
};

export const getFollowings = async (
  user_id: string,
  limit: number
): Promise<UserResponse> => {
  return await apiService.post(
    "api/follow/get_followings",
    {limit: limit, my_id: user_id}
  );
};