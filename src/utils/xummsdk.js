import { xummConfig } from "app/config";
import { Client } from "xrpl";
import { Xumm } from "xumm";

export const getXummSDK = async () => {
  const xumm = await new Xumm(xummConfig.AppId);

  // console.log("====== XUMM runtime", xumm.runtime);

  if (xumm.runtime.xapp) {
    // console.log("XAPP");
    xumm.user.account.then(
      (account) => (document.getElementById("account").innerText = account)
    );
    xumm.xapp.on("destination", (data) => {
      // console.log(
      //   "A-xapp-destination@",
      //   data.destination?.name,
      //   data.destination?.address,
      //   data?.reason
      // );
    });
    xumm.on("destination", (data) => {
      // console.log(
      //   "B-xapp-destination@",
      //   data.destination?.name,
      //   data.destination?.address,
      //   data?.reason
      // );
    });
  }

  if (xumm.runtime.browser && !xumm.runtime.xapp) {
    // console.log("WEBAPP");
    xumm.on("error", (error) => {
      // console.log("error", error);
    });
    xumm.on("success", async () => {
      // console.log("success", await xumm.user.account);
    });
    xumm.on("retrieved", async () => {
      // console.log(
      //   "Retrieved: from localStorage or mobile browser redirect",
      //   await xumm.user.account
      // );
    });
  }

  return xumm;
};

export const xumm = getXummSDK();

export const handleTxPayloadNativeWS = () => {};

export const connectClient = async () => {
  const client = new Client("wss://xrplcluster.com");
  await client.connect();

  return client;
};
