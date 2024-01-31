import axios from "axios";
import { PINATA_JWT, NFT_STORAGE_TOKEN } from "../app/config";
import { NFTStorage } from "nft.storage";

const JWT = "Bearer " + PINATA_JWT;

export const pinFileToIPFS = async (file) => {
  let ipfsCid = "";
  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: "File name",
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT,
        },
      }
    );
    ipfsCid = res.data.IpfsHash;
  } catch (error) {
    ipfsCid = null;
  }
  return ipfsCid;
};



export const storeSingleNFT = async (file) => {
  let ipfsCid = "";
  const storage = new NFTStorage({ token: NFT_STORAGE_TOKEN });
  try {
    const metadata = await storage.store({
      name: file.name || "NFT",
      description: 'My NFT on Nft storage',
      image: file
    })
    // console.log(metadata.data)
    return metadata.data.image.href
    // const formData = new FormData();
    // formData.append("file", file);

    // const metadata = JSON.stringify({
    //   name: file.name || "File name",
    // });
    // formData.append("nftStorageMetadata", metadata);

    // const options = JSON.stringify({
    //   cidVersion: 0,
    // });
    // formData.append("nftStorageOptions", options);

    // const res = await axios.post(
    //   "https://api.nft.storage/upload",
    //   formData,
    //   {
    //     maxBodyLength: "Infinity",
    //     headers: {
    //       "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
    //       Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
    //     },
    //   }
    // );
    // ipfsCid = res.data.value.cid;
  } catch (error) {
    ipfsCid = null;
  }
  return ipfsCid;
};

export const pinJSONToNFTStorage = async (jsonObj) => {
  let ipfsCid = "";
  try {
    let res = await axios.post(
      "https://api.nft.storage/upload",
      { ...jsonObj },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
        },
      }
    );
    ipfsCid = res.data.value.cid;
  } catch (error) {
    ipfsCid = null;
  }
  return ipfsCid;
};

export const pinJSONToIPFS = async (jsonObj) => {
  let ipfsCid = "";
  try {
    let res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      { ...jsonObj },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: JWT,
        },
      }
    );
    ipfsCid = res.data.IpfsHash;
  } catch (error) {
    ipfsCid = null;
  }
  return ipfsCid;
};

export const UPLOADING_FILE_TYPES = {
  OTHERS: 0,
  JSON: 1,
};

export const pinDirectoryToPinata = async (
  filelist,
  type = UPLOADING_FILE_TYPES.IMAGE
) => {
  let ipfsCid = "";
  try {
    if (filelist?.length <= 0) return null;
    const formData = new FormData();

    Array.from(filelist).forEach((file) => {
      formData.append("file", file);
    });

    const metadata = JSON.stringify({
      name: `${type}_${Date.now()}`,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT,
          },
        }
      );
      ipfsCid = res.data.IpfsHash;
    } catch (error) {
      ipfsCid = null;
    }
  } catch (error) {
    ipfsCid = null;
  }

  return ipfsCid;
};

export const storeNFT = async (files) => {
  const storage = new NFTStorage({ token: NFT_STORAGE_TOKEN });
  const cid = await storage.storeDirectory(files);
  return cid;
};

export const pinUpdatedJSONDirectoryToNFTStorage = async (
  namelist,
  jsonlist,
  type = UPLOADING_FILE_TYPES.IMAGE
) => {
  let ipfsCid = "";
  try {
    if (jsonlist?.length <= 0) return null;
    let formData = new FormData();
    for (let idx = 0; idx < jsonlist.length; idx++) {
      const blob = new Blob([JSON.stringify(jsonlist[idx])], { type: "application/json" });
      formData.append(
        "file",
        blob,
        `${namelist[idx].name}`
      );
    }

    const metadata = JSON.stringify({
      name: `${type}_${Date.now()}`,
    });
    formData.append("nftStorageMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("nftStorageOptions", options);
    try {
      const res = await axios.post("https://api.nft.storage/upload", formData, {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
        },
      });
      ipfsCid = res.data.value.cid;
    } catch (error) {
      console.log(error)
      ipfsCid = null;
    }
  } catch (error) {
    console.log(error)
    ipfsCid = null;
  }

  return ipfsCid;
};

export const pinUpdatedJSONDirectoryToPinata = async (
  namelist,
  jsonlist,
  type = UPLOADING_FILE_TYPES.IMAGE
) => {
  let ipfsCid = "";
  try {
    if (jsonlist?.length <= 0) return null;
    let formData = new FormData();
    for (let idx = 0; idx < jsonlist.length; idx++) {
      formData.append(
        "file",
        new Blob([jsonlist[idx]], { type: "application/json" }),
        `json/${namelist[idx].name}`
      );
    }

    const metadata = JSON.stringify({
      name: `${type}_${Date.now()}`,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);
    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT,
          },
        }
      );
      ipfsCid = res.data.IpfsHash;
    } catch (error) {
      ipfsCid = null;
    }
  } catch (error) {
    ipfsCid = null;
  }

  return ipfsCid;
};
