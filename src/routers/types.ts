import { ComponentType } from "react";

export interface LocationStates {
  "/"?: {};
  "/#"?: {};
  "/home2"?: {};
  "/home3"?: {};
  "/nft-detail/:tokenId"?: {};
  "/page-collection"?: {};
  "/page-search"?: {};
  "/page-author/:userId"?: {};
  "/page-upload-item"?: {};
  "/home-header-2"?: {};
  "/connect-wallet"?: {};
  "/account"?: {};
  "/login"?: {};
  "/signup"?: {};
  "/forgot-pass"?: {};
  "/subscription"?: {};
  "/message/:userId"?: {};
  "/message"?: {};
  "/airdrop"?: {};
  "/collectionList"?: {};
  "/collectionsOfCategory/:category"?: {};
  "/collectionItems/:collectionId"?: {};
  "/createCollection"?: {};
  "/editCollection/:collectionId"?: {};
  "/upload-single"?: {};
  "/upload-multiple"?: {};
  "/admin": {};
  "/activity": {};
  "/faq": {};
  "/launchpad/:collectionId": {};
  "/launchpadSetting/:collectionId": {};
  "/launchpad": {};
  "/inxrplwalletnft/:tokenId": {};
}

export type PathName = keyof LocationStates;

export interface Page {
  path: PathName;
  component: ComponentType<Object>;
}
