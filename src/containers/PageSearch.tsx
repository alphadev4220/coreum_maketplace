import React, {FC, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import RizeFilterSearchPage from "components/StyleComponent/RizeFilterSearchPage";
import axios from "axios";
import {CATEGORIES, config} from "app/config";
import {isEmpty} from "app/methods";
import {useSigningClient} from "app/cosmwasm";
import frameImg from "images/vector.svg";
import {useAppDispatch, useAppSelector} from "app/hooks";
import {selectCurrentUser} from "app/reducers/auth.reducers";
import {changeBulkOpsMode} from "app/reducers/collection.reducers";
import {Backdrop, CircularProgress} from "@mui/material";
import CardNFTComponent from "components/Card/CardNFTComponent";
import MainSection from "components/Section/MainSection";

export const navLinks = [{ value: 0, text: "All items" }, ...CATEGORIES];
export const dateOptions = [
  { value: 0, text: "Newest" },
  { value: 1, text: "Oldest" },
  { value: 2, text: "Price: Low to High" },
  { value: 3, text: "Price: High to Low" },
  { value: 4, text: "Most Like" },
  { value: 5, text: "Least Like" },
];
export const priceOptions = [
  { value: 0, text: "Highest price" },
  { value: 1, text: "The lowest price" },
];
export const likesOptions = [
  { value: 0, text: "Most liked" },
  { value: 1, text: "Least liked" },
];
export const creatorOptions = [
  { value: 0, text: "All" },
  { value: 1, text: "Verified only" },
];
export const statusOptions = [
  { value: 0, text: "All" },
  { value: 1, text: "On Sale" },
  { value: 2, text: "On Auction" },
  { value: 3, text: "Listed" },
];

export interface PageSearchProps {
  className?: string;
}

const PageSearch: FC<PageSearchProps> = ({ className = "" }) => {
  const currentUsr = useAppSelector(selectCurrentUser);

  const [date, setDate] = useState(0);
  const [likes, setLikes] = useState(0);
  const [creator, setCreator] = useState(0);
  const [status, setStatus] = useState(0);
  const [chain, setChain] = useState(0);
  const [range, setRange] = useState([0, 100000]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fileType, setFileType] = useState(0);
  const [checked, setChecked] = React.useState([]);
  const [items, setItems] = useState([]);
  const [viewNoMore, setViewNoMore] = useState(false);
  const { isOpenFilter }: any = useSigningClient();
  const [category, setCategory] = useState(0);
  const pageRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const dispatch = useAppDispatch();
  // const [moreLoading, setMoreLoading] = useState(false);
  const moreLoading = useRef(false);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    onResetFilter();
    dispatch(changeBulkOpsMode(false));
    moreLoading.current = false;
  }, []);

  useEffect(() => {
    localStorage.setItem("currentItemCount", "0");
    var param = {
      date: dateOptions[date].value,
      category: navLinks[category].value,
      status: statusOptions[status].value,
    };
    (param as any).price = priceOptions[0].value;
    (param as any).likes = likesOptions[likes].value;
    (param as any).creator = creatorOptions[creator].value;
    (param as any).range = [range[0], range[1]];
    (param as any).sortmode = dateOptions[date].value;
    (param as any).fileType = fileType;
    (param as any).chain = chain;
    localStorage.setItem("searchFilter", JSON.stringify(param));
    getCollectionList(true);
  }, [
    date,
    category,
    fileType,
    likes,
    creator,
    range,
    checked,
    status,
    priceMin,
    priceMax,
    chain,
  ]);

  const getCollectionList = (reStart) => {
    
    if (reStart) {
      setProcessing(true);
      setItems([]);
    }

    const filterParams = JSON.parse(localStorage.getItem("searchFilter") || '{}');
    let currentItemCount = Number(localStorage.getItem("currentItemCount")) || 0;

    const param = {
      start: reStart ? 0 : currentItemCount,
      last: reStart ? 10 : currentItemCount + 10,
      ...filterParams,
    };

    let currentInfo = JSON.parse(localStorage.getItem("hideCollections") || '{}');
    let currentInfo1 = JSON.parse(localStorage.getItem("hideItems") || '{}');

    axios.post(`${config.API_URL}api/collection/onsearch`, param)
      .then((result) => {
        const newList = result.data.list.map(itemData => {
          const item = itemData.item_info;
          item.isLiked = item.likes.includes(currentUsr._id);
          item.owner = itemData.owner_info;
          item.blur = itemData.blurItems;
          item.users = [{ avatar: itemData.creator_info.avatar }];

          const collectionHideFlag = Boolean(currentInfo[itemData._id]);
          const itemHideFlag = Boolean(currentInfo1[itemData.item_info._id]);

          item.hideItem = collectionHideFlag || itemHideFlag;
          item.verified = itemData.creator_info?.verified;

          return item;
        });

        const isListEmpty = isEmpty(newList);
        const isEnd = newList.length < 10;

        setViewNoMore(isListEmpty);
        setIsEnd(isEnd);

        if (reStart) {
          setItems(newList);
        } else {
          setItems(prevItems => prevItems.concat(newList));
        }

        localStorage.setItem("currentItemCount", (currentItemCount + newList.length).toString());
      })
      .catch((error) => {
        console.error('Error fetching collection list:', error);
        // Handle the error appropriately here
      })
      .finally(() => {
        moreLoading.current = false;
        setProcessing(false);
      });
  };

  const onResetFilter = () => {
    localStorage.setItem("currentItemCount", "0");
    let initFilter = {
      category: 0,
      creator: 0,
      date: 0,
      fileType: 0,
      likes: 0,
      price: 0,
      range: [0, 100000],
      sortmode: 0,
      status: 0,
      chain: 0,
    };
    localStorage.setItem("searchFilter", JSON.stringify(initFilter));
    setCategory(0);
    setDate(0);
    setLikes(0);
    setCreator(0);
    setStatus(0);
    setRange([0, 100000]);
    setChecked([]);
    setPriceMax("");
    setPriceMin("");
    setFileType(0);
  };

  const isScrollAtBottom = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    // Calculate the adjusted heights based on the zoom level
    const zoomFactor = 1 / window.devicePixelRatio; // Get the zoom factor
    const adjustedWindowHeight = windowHeight * zoomFactor;
    const adjustedDocumentHeight = documentHeight * zoomFactor;
    const adjustedScrollPosition = scrollPosition * zoomFactor;

    return ((adjustedWindowHeight + adjustedScrollPosition) * 2) >= adjustedDocumentHeight;
  };


  useEffect(() => {
    const handleScroll = () => {

      if (!isEnd) {
        if (!moreLoading.current && isScrollAtBottom()) {
          moreLoading.current = true;
          getCollectionList(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const renderEffect = () => {
    const rows = [];
    for (
      let i = 150, j = 0;
      i < pageRef?.current?.clientHeight;
      i += 500, j++
    ) {
      rows.push(
        <div
          className={clsx(
            "absolute z-auto bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full",
            j % 2 === 0 ? "-left-[100px]" : "-right-[100px]"
          )}
          style={{ top: i + "px" }}
          key={"effectKey" + i}
        ></div>
      );
    }
    return <div className="absolute top-0 right-0 w-full">{rows}</div>;
  };

  return (
    <MainSection
      title="Explorer"
      className={`nc-PageSearch relative min-h-[calc(100vh-346px)] ${className}`}
    >
      <div className="container-fluid absolute top-0 z-20">
        <header className="mx-auto flex flex-col">
          <RizeFilterSearchPage
            className="mb-2"
            isOpen={isOpenFilter}
            onChangeCategory={setCategory}
            categoryValue={category}
            onChangeDate={setDate}
            dateValue={date}
            onChangeCreator={setCreator}
            creatorValue={creator}
            onChangeStatus={setStatus}
            statusValue={status}
            onChangeRange={setRange}
            rangeValue={range}
            onChangeFileType={setFileType}
            fileTypeValue={fileType}
            onChangeChain={setChain}
            chainValue={chain}
          />
        </header>
      </div>

      <div
        className="relative h-full py-6 lg:pb-28 lg:pt-10 space-y-16 lg:space-y-28 overflow-hidden"
        style={{ minHeight: "inherit" }}
      >
        <main ref={pageRef} className="h-full">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10 mt-8 lg:mt-10 place-items-center">
            {items &&
              items.length > 0 &&
              items.map((x, index) => (
                <CardNFTComponent item={x} key={index} isLiked={x.isLiked} />
              ))}
          </div>

          <div className=" text-center mt-10 m-10">
            <span>
              &nbsp;
              {(viewNoMore === true || items?.length === 0) && "No more items"}
              &nbsp;
            </span>
          </div>
          {renderEffect()}
          <img
            className="absolute w-full right-0 bottom-1/4 opacity-5"
            src={frameImg}
            alt=""
          />
        </main>
      </div>
      {
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={processing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </MainSection>
  );
};

export default PageSearch;
