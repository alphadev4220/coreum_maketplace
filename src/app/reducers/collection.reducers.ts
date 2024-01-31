import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";

export interface CollectionData {
  appplyReferral: boolean;
  twitterURL: string;
  discordURL: string;
  yutubeURL: string;
  websiteURL: string;
  flashSaleDate: string;
  mintStartDate: number;
  mintFinishDate: string | number | Date;
  mintedArray: any;
  mintedCountOfCID: number;
  totalItemNumberInCID: number;
  _id?: string;
  bannerURL?: string;
  logoURL?: string;
  name?: string;
  description?: string;
  items?: Array<string>;
  itemslength?: number;
  hotCollections?: Array<any>;
  owner?: any;
  address?: string;
  cw721address?: string;
  collectionNumber?: number;
  launchstate?: number;
  jsonFolderCID?: string;
  mintingPrice?: number;
  category?: number;
  overview?: string;
  wlMintableMax?: number;
  wlDiscountRate?: number;
}

export interface CollectionsState {
  collection?: CollectionData;
  detail?: CollectionData;
  list?: Array<CollectionData>;
  consideringId?: string;
  owner?: {};
  hotCollections?: [];
  bulkOpsMode?: boolean;
  bulkSelectedArray?: Array<any>;
  bulkCollection: string;
}

const initialState: CollectionsState = {
  collection: {
    appplyReferral: false,
    twitterURL: "",
    discordURL: "",
    yutubeURL: "",
    websiteURL: "",
    flashSaleDate: "",
    mintStartDate: 0,
    mintFinishDate: "",
    mintedArray: undefined,
    mintedCountOfCID: 0,
    totalItemNumberInCID: 0,
  },
  detail: {
    appplyReferral: false,
    twitterURL: "",
    discordURL: "",
    yutubeURL: "",
    websiteURL: "",
    flashSaleDate: "",
    mintStartDate: 0,
    mintFinishDate: "",
    mintedArray: undefined,
    mintedCountOfCID: 0,
    totalItemNumberInCID: 0,
  },
  list: [],
  hotCollections: [],
  consideringId: "",
  bulkOpsMode: false,
  bulkSelectedArray: [],
  bulkCollection: "",
};

export const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    setBulkCollectionAddress: (state, action: PayloadAction<any>) => {
      return {
        ...state,
        bulkCollection: action.payload,
      };
    },
    setBulkSelectArray: (state, action: PayloadAction<Array<any>>) => {
      return {
        ...state,
        bulkSelectedArray: [...action.payload],
      };
    },
    emptyBulkSelectedArray: (state) => {
      return {
        ...state,
        bulkSelectedArray: [],
      };
    },
    changeBulkSelectedArray: (state, action: PayloadAction<any>) => {
      const id2remove = action.payload?._id;
      const index = state.bulkSelectedArray.findIndex(
        (item) => item?._id === id2remove
      );
      if (index >= 0) {
        return {
          ...state,
          bulkSelectedArray: state.bulkSelectedArray.filter(
            (item) => item?._id !== id2remove
          ),
        };
      } else {
        return {
          ...state,
          bulkSelectedArray: [...state.bulkSelectedArray, action.payload],
        };
      }
    },
    removeFromBulkSelectedArray: () => {
      // let id2remove = action.payload?._id;
      // return {
      //   ...state,
      //   bulkSelectedArray: state.bulkSelectedArray.filter(
      //     (item) => item?._id !== id2remove
      //   ),
      // };
    },
    add2BulkSelectedArray: (
      state,
      action: PayloadAction<CollectionsState["bulkSelectedArray"]>
    ) => {
      return {
        ...state,
        bulkSelectedArray: [...state.bulkSelectedArray, action.payload],
      };
    },
    changeBulkOpsMode: (
      state,
      action: PayloadAction<CollectionsState["bulkOpsMode"]>
    ) => {
      return {
        ...state,
        bulkOpsMode: action.payload,
      };
    },
    changeHotCollections: (
      state,
      action: PayloadAction<CollectionsState["hotCollections"]>
    ) => {
      return {
        ...state,
        hotCollections: action.payload,
      };
    },
    changeCollection: (
      state,
      action: PayloadAction<CollectionsState["collection"]>
    ) => {
      return {
        ...state,
        collection: action.payload,
      };
    },
    changeDetailedCollection: (
      state,
      action: PayloadAction<CollectionsState["detail"]>
    ) => {
      return {
        ...state,
        detail: action.payload,
      };
    },
    changeCollectionList: (
      state,
      action: PayloadAction<CollectionsState["list"]>
    ) => {
      return {
        ...state,
        list: action.payload,
      };
    },
    changeConsideringCollectionId: (
      state,
      action: PayloadAction<CollectionsState["consideringId"]>
    ) => {
      return {
        ...state,
        consideringId: action.payload,
      };
    },
  },
});

export const {
  setBulkCollectionAddress,
  setBulkSelectArray,
  emptyBulkSelectedArray,
  changeBulkSelectedArray,
  removeFromBulkSelectedArray,
  add2BulkSelectedArray,
  changeBulkOpsMode,
  changeCollection,
  changeDetailedCollection,
  changeCollectionList,
  changeConsideringCollectionId,
  changeHotCollections,
} = collectionSlice.actions;

export const selectBulkContractAddress = (state: RootState) =>
  state.collection.bulkCollection;

export const selectBulkSelectedArray = (state: RootState) =>
  state.collection.bulkSelectedArray;

export const selectBulkOpsMode = (state: RootState) =>
  state.collection.bulkOpsMode;

export const selectCurrentCollectionState = (state: RootState) =>
  state.collection;

export const selectConsideringCollection = (state: RootState) =>
  state.collection.collection;

export const selectDetailedCollection = (state: RootState) =>
  state.collection.detail;

export const selectConllectionList = (state: RootState) =>
  state.collection.list;

export const selectConsideringCollectionId = (state: RootState) =>
  state.collection.consideringId;

export const selectHotCollections = (state: RootState) =>
  state.collection.hotCollections;

export default collectionSlice.reducer;
