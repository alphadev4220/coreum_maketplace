import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";

export interface SearchState {
  keywordOfFAQ?: string;
}

const initialState: SearchState = {
  keywordOfFAQ: "",
};

export const SearchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    changeFAQKeyword: (
      state,
      action: PayloadAction<SearchState["keywordOfFAQ"]>
    ) => {
      return {
        ...state,
        keywordOfFAQ: action.payload,
      };
    },
  },
});

export const { changeFAQKeyword } = SearchSlice.actions;

export const selectFAQKeyword = (state: RootState) => state.search.keywordOfFAQ;

export default SearchSlice.reducer;
