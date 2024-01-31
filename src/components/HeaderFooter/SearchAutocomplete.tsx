import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "components/StyleComponent/Input";
import NcImage from "components/NcComponent/NcImage";
import { IconButton } from "@mui/material";
import { AiOutlineSearch } from "react-icons/ai";
import { MdOutlineClose } from "react-icons/md";
import ItemTypeImageIcon from "components/ItemIcon/ItemTypeImageIcon";
import ItemTypeAudioIcon from "components/ItemIcon/ItemTypeAudioIcon";
import ItemTypeVideoIcon from "components/ItemIcon/ItemTypeVideoIcon";
import ItemType3DIcon from "components/ItemIcon/ItemType3DIcon";
import { FILE_TYPE } from "app/config";
import { useSigningClient } from "app/cosmwasm";
import FilterIcon from "../../images/icons/filter.svg";
import FilterBlackIcon from "../../images/icons/filter-black.svg";
import { changeFAQKeyword } from "app/reducers/search.reducers";
import { useAppDispatch } from "app/hooks";
import { Tooltip } from "react-tooltip";

const SearchAutocomplete = (props: any) => {
  const { collections, items, users } = props;
  const dispatch = useAppDispatch();
  const [searchInput, setSearchInput] = useState("");
  const [searchCollections, setSearchCollections] = useState([]);
  const [searchItems, setSearchItems] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [isSearchingFAQ, setIsSearchingFAQ] = useState(false);
  const { isOpenFilter, setOpenFilter }: any = useSigningClient();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (event: any) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    if (searchInput.length >= 1) {
      // Filter collections, items, and users based on searchInput
      const filteredCollections = collections.filter((collection) =>
        (collection.name || "")
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
      const filteredItems = items.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(searchInput.toLowerCase()) ||
          (item.creator || "").toLowerCase().includes(searchInput.toLowerCase())
      );
      let filteredUsers = [];

      if (users) {
        filteredUsers = users.filter(
          (user) =>
            user.username.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.address.toLowerCase().includes(searchInput.toLowerCase())
        );
      }

      setSearchCollections(filteredCollections);
      setSearchItems(filteredItems);
      setSearchUsers(filteredUsers);
    } else {
      dispatch(changeFAQKeyword(searchInput));
    }
  }, [searchInput]);

  const handleClear = () => {
    setSearchInput("");
    setSearchCollections([]);
    setSearchItems([]);
    setSearchUsers([]);
    if (isSearchingFAQ === true) {
      dispatch(changeFAQKeyword(""));
    }
  };

  const handleNavigate = (url: any) => {
    navigate(url);
    handleClear();
  };

  const handlefilter = () => {
    setOpenFilter(!isOpenFilter);
  };

  useEffect(() => {
    if (location?.pathname.toString().includes("faq") === true) {
      setIsSearchingFAQ(true);
    } else {
      setIsSearchingFAQ(false);
      dispatch(changeFAQKeyword(""));
    }
  }, [location]);

  return (
    <div className="max-w-lg w-full">
      <div className="relative flex justify-evenly max-w-lg w-full items-center gap-2">
        <label
          htmlFor="search-input"
          className="relative text-neutral-500 dark:text-neutral-300 w-full"
        >
          <Input
            className={`shadow-lg border-0 dark:border ${
              isSearchingFAQ === true
                ? "pointer-events-none focus:pointer-events-none "
                : ""
            } `}
            id="search-input"
            type="search"
            placeholder="Type your keywords"
            sizeClass="pl-14 py-2 pr-5 md:pl-16"
            rounded="rounded-full"
            onChange={handleSearch}
            value={searchInput}
          />
          {searchInput && (
            <IconButton
              className="!absolute !right-2.5 !top-1/2 !transform !-translate-y-1/2"
              onClick={handleClear}
            >
              <MdOutlineClose />
            </IconButton>
          )}
          <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl md:left-6">
            <AiOutlineSearch color={"#33ff00"} />
          </span>
        </label>
        {location?.pathname === "/page-search" && (
          <div
            className="cursor-pointer"
            data-tooltip-id="search-tooltip"
            data-tooltip-content="Please Search NFT Here!"
          >
            <img
              className="hidden dark:block"
              src={FilterIcon}
              onClick={handlefilter}
              alt=""
            />
            <img
              className="block dark:hidden"
              src={FilterBlackIcon}
              onClick={handlefilter}
              alt=""
            />
          </div>
        )}

        {searchInput && isSearchingFAQ === false && (
          <div className="absolute w-full h-fit max-h-[50vh] overflow-y-auto top-[50px] rounded-2xl bg-white dark:bg-neutral-800 px-2 py-2">
            {searchCollections?.length === 0 &&
              items?.length === 0 &&
              users?.length === 0 && (
                <p className="text-white text-center my-1">No Results</p>
              )}
            {searchCollections?.length > 0 && (
              <>
                <p className="ml-3 mt-2 mb-0 text-neutral-400">Collections</p>
                {searchCollections?.map((collection, index) => {
                  return (
                    <div
                      className="flex cursor-pointer items-center justify-between rounded-xl gap-2 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      key={index}
                      onClick={() => {
                        handleNavigate(
                          `/collectionItems/${(collection as any)?._id}`
                        );
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <NcImage
                          containerClassName="flex rounded-lg overflow-hidden z-0"
                          src={collection?.logoURL}
                          isLocal={true}
                          className="object-cover w-8 h-8"
                        />
                        <span className="text-white">{collection?.name}</span>
                      </div>
                      <div></div>
                    </div>
                  );
                })}
              </>
            )}
            {searchItems?.length > 0 && (
              <>
                <p className="ml-3 mt-2 mb-0 text-neutral-400">NFTs</p>
                {searchItems?.map((item, index) => {
                  return (
                    <div
                      className="flex cursor-pointer items-center justify-between rounded-xl gap-2 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      key={index}
                      onClick={() => {
                        handleNavigate(`/nft-detail/${(item as any)?._id}`);
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <NcImage
                          containerClassName="flex rounded-lg overflow-hidden z-0"
                          isLocal={
                            item?.fileType > FILE_TYPE.IMAGE
                          }
                          src={item?.logoURL}
                          className="object-cover w-8 h-8"
                        />
                        <span className="text-white">{item?.name}</span>
                      </div>
                      <div>
                        {item?.fileType === FILE_TYPE.IMAGE ? (
                          <ItemTypeImageIcon className="w-8 md:w-10 !h-9 text-white" />
                        ) : item?.fileType === FILE_TYPE.AUDIO ? (
                          <ItemTypeAudioIcon className="w-8 md:w-10 !h-9 text-white" />
                        ) : item?.fileType === FILE_TYPE.VIDEO ? (
                          <ItemTypeVideoIcon className="w-8 md:w-10 !h-9 text-white" />
                        ) : (
                          <ItemType3DIcon className="w-8 md:w-10 !h-9 text-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {searchUsers?.length > 0 && (
              <>
                <p className="ml-3 mt-2 mb-0 text-neutral-400">Users</p>
                {searchUsers?.map((user, index) => {
                  return (
                    <div
                      className="flex cursor-pointer items-center justify-between rounded-xl gap-2 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      key={index}
                      onClick={() => {
                        handleNavigate(`/page-author/${(user as any)?._id}`);
                      }}
                    >
                      <div className="flex gap-2 items-center">
                        <NcImage
                          containerClassName="flex rounded-lg overflow-hidden z-0"
                          src={user?.avatar}
                          isLocal={true}
                          className="object-cover w-8 h-8"
                        />
                        <span className="text-white">{user?.username}</span>
                      </div>
                      <div></div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
      <Tooltip id="search-tooltip" />
    </div>
  );
};

export default SearchAutocomplete;
