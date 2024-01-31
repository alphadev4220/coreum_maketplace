import {AxiosResponse} from "axios";
import apiService from "./api";

interface FileUploadResponse {
  path?: string;
  data?: any;
  message?: string;
}

export const uploadFile = async (
  formData: FormData
): Promise<FileUploadResponse> => {
  return await apiService.post(
    "api/utils/upload_file",
    formData,
    {
      headers: {"Content-Type": "multipart/form-data"},
    }
  );
};

interface WLUploadResponse {
  code?: number;
  path?: any;
  data?: any;
  message?: string;
}

export const uploadmintingWL = async (
  formData: FormData,
  collId: string
): Promise<WLUploadResponse> => {
  return await apiService.post(
    "api/utils/uploadmintingWL",
    formData,
    {
      headers: {"Content-Type": "multipart/form-data"},
      collectionId: collId,
    }
  );
};
