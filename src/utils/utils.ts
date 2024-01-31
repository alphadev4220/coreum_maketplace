import axios from "axios";
import {config, FILE_TYPE, PLATFORM_NETWORKS} from "app/config";
import {isEmpty} from "app/methods";
import crypto from "crypto-browserify";

const IV_LENGTH = 16;

export function convertMicroDenomToDenom(
  amount: number | string,
) {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount / 10 ** 6;
  return isNaN(amount) ? 0 : amount;
}

export function convertDenomToMicroDenom(
  amount: number | string,
  denom: number = 6
): string {
  if (typeof amount === "string") {
    amount = Number(amount);
  }
  amount = amount * 10 ** 6;
  return isNaN(amount) ? "0" : String(amount).split(".")[0];
}

export async function getSystemTime(): Promise<number> {
  try {
    const resp = await axios.get(`${config.API_URL}api/users/system_time`);
    return resp.data as number;
  } catch (err) {
    console.log(err);
  }
  return 0;
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isVideo = (fileName) => {
  if (fileName && fileName.toString() !== "") {
    if (
      fileName.toString().includes("mp4") === true ||
      fileName.toString().includes("MP4") === true
    ) {
      return true;
    }
  }
  return false;
};
export const copyToClipboard = (data: any) => {
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(data);
  } else {
    var textField = document.createElement("textarea");
    textField.innerText = data;
    textField.style.position = "fixed";
    textField.style.left = "-999999px";
    textField.style.top = "-999999px";
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  }
};

export const debounce = (func: any, wait: any) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
export const isJsonObject = (data) => {
  try {
    const parsedData = JSON.parse(data);
    return typeof parsedData === "object" && parsedData !== null;
  } catch (error) {
    return false;
  }
};

export const getLinkPathToJSON = (metadataURI, name) => {
  if (isEmpty(metadataURI) === false) {
    // if (metadataURI?.toString()?.includes(".json") === true) {
    return `${config.ipfsGateway}${metadataURI
      .replace("https://", "")
      .replace("ipfs.io/", "")
      .replace("ipfs://", "")
      .replace("ipfs://ipfs/", "")
      .replace("cloudflare-ipfs.com/", "")
      .replace("ipfs/", "")}`;
    // }
    // else if (name?.toString()?.includes("#") === true) {
    //   let suffixStr = name?.toString().split("#");
    //   suffixStr = suffixStr[1];
    //   const returnURL = `${config.ipfsGateway}${
    //     metadataURI
    //     .replace("https://", "")
    //     .replace("ipfs.io/", "")
    //     .replace("ipfs://", "")
    //     .replace("ipfs/", "")}/${parseInt(suffixStr)}.json`;
    //   return returnURL;
    // }
    // else {
    //   return `${config.ipfsGateway}${metadataURI}`;
    // }
  } else return "";
};
export const getFileType = (fileName) => {
  if (
    fileName.toString().includes("png") ||
    fileName.toString().includes("PNG") ||
    fileName.toString().includes("jpg") ||
    fileName.toString().includes("JPG") ||
    fileName.toString().includes("gif") ||
    fileName.toString().includes("GIF") ||
    fileName.toString().includes("webp") ||
    fileName.toString().includes("WEBP") ||
    fileName.toString().includes("jpeg") ||
    fileName.toString().includes("JPEG")
  )
    return FILE_TYPE.IMAGE;
  if (
    fileName.toString().includes("mp3") ||
    fileName.toString().includes("MP3")
  )
    return FILE_TYPE.AUDIO;
  if (
    fileName.toString().includes("mp4") ||
    fileName.toString().includes("MP4") ||
    fileName.toString().includes("webm") ||
    fileName.toString().includes("WEBM")
  )
    return FILE_TYPE.VIDEO;
  if (
    fileName.toString().includes("glb") ||
    fileName.toString().includes("GLB")
  )
    return FILE_TYPE.THREED;
};

export function abbr(string, length = 6, suffix = "...") {
  if (string && string.length > length) {
    return `${string.substring(0, length)}${suffix}`;
  }
  return string;
}

export function ValidateEmail(email: string) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

export function ValidateWebsiteLink(weblink: string) {
  return /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/.test(
    weblink
  );

}

export function checkNativeCurrencyAndTokenBalances(
  tokenAmountShouldPay,
  balances
) {
  return !(balances[config.COIN_MINIMAL_DENOM] <= 0 ||
    (tokenAmountShouldPay > 0 && balances.cw20 <= tokenAmountShouldPay));

}

export const validateSignature = (text, signature, secret) => {
  if (isEmpty(text) === true) return false;

  const hash = crypto.createHmac("sha256", secret).update(text).digest("hex");

  return hash === signature;
};

export function decrypt(text, secret) {
  if (isEmpty(text) === true) return "";
  let textParts = text.split(":");

  if (textParts?.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }

  let iv = Buffer.from(textParts.shift(), "hex");

  if (iv?.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }

  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher;
  let secretKey = Buffer.from(secret, "base64");

  try {
    decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  } catch (err) {
    throw new Error("Unable to create decipher");
  }

  let decrypted;

  try {
    decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
  } catch (err) {
    throw new Error("Unable to decrypt data");
  }

  return decrypted.toString();
}

export const calcFloorPrice = (items) => {
  let isCollectionOnSale = false;
  for (let idx = 0; idx < items.length; idx++) {
    if (items[idx].isSale > 0) {
      isCollectionOnSale = true;
      break;
    }
  }

  if (isCollectionOnSale === true) {
    let minPrice = 0;
    for (let i = 1; i < items.length; i++) {
      if (items[i].isSale === 0) continue;
      if (items[i]?.isSale === 2) {
        if (items[i].bids && items[i].bids.length > 0) {
          minPrice = items[i].bids[items[i].bids.length - 1].price;
        }
      } else {
        minPrice = items[i]?.price;
      }
      break;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].isSale === 0) continue;
      if (items[i].isSale === 2) {
        if (items[i].bids && items[i].bids.length > 0) {
          if (minPrice > items[i].bids[items[i].bids.length - 1].price)
            minPrice = items[i].bids[items[i].bids.length - 1].price;
        }
      } else {
        if (minPrice > items[i].price) minPrice = items[i].price;
      }
    }
    return minPrice;
  } else {
    return 0;
  }
};

export const isSupportedEVMNetwork = (currentNetwork) => {
  return currentNetwork === PLATFORM_NETWORKS.ETHEREUM ||
    currentNetwork === PLATFORM_NETWORKS.BSC ||
    currentNetwork === PLATFORM_NETWORKS.AVALANCHE ||
    currentNetwork === PLATFORM_NETWORKS.POLYGON;
};

export const handleKeyPress = (
  event: React.KeyboardEvent<HTMLInputElement>
) => {
  // const keyCode = event.keyCode || event.which;
  // const keyValue = String.fromCharCode(keyCode);
  // Get the key from the event
  var keyValue = event.key;

  // Allow only numeric digits (0-9), backspace, delete, left and right arrow keys
  // and prevent the input of other characters
  if (
    !/^[0-9.]+$/.test(keyValue) &&
    keyValue !== "Backspace" &&
    keyValue !== "Delete" &&
    keyValue !== "ArrowRight" &&
    keyValue !== "ArrowLeft"
  ) {
    event.preventDefault();
  }
};

export const promiseWithTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Promise timed out after " + ms + " milliseconds"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
};
