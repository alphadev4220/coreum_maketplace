import { useEffect, useState } from "react";
import Heading from "components/StyleComponent/Heading";
import React, { FC } from "react";
import SortOrderFilter from "./SortOrderFilter";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { config } from "app/config";
import { changePopular, selectPopularUsers } from "app/reducers/user.reducers";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import {
  changeFollow,
  changeFollowingList,
  changeFollowList,
} from "app/reducers/flollow.reducers";
import { toast } from "react-toastify";
import { isEmpty } from "app/methods";
import CardAuthorBox from "components/Card/CardAuthorBox";

export interface SectionTopUserProps {
  className?: string;
  gridClassName?: string;
}

const sortOrder = ["Last 24 hours", "Last 7 days", "Last 30 days", "All"];
const dateOptions = [
  { value: 1, text: "Last 24 hours" },
  { value: 2, text: "Last 7 days" },
  { value: 3, text: "Last 30 days" },
  { value: 4, text: "All" },
];
const directionOptions = ["Sellers", "Buyers"];

const SectionTopUser: FC<SectionTopUserProps> = ({
  className = "",
  gridClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}) => {
  const popular = useAppSelector(selectPopularUsers);
  const auth = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const [date, setDate] = useState(sortOrder[3]);
  const [direction, setDirection] = useState(directionOptions[0]);
  const [items, setItems] = useState([]);

  const getPopularUserList = (time: any, limit: any) => {
    // time : timeframe, 0: all, 1: today, 2: this month, 3: 3 months, 4: year

    axios
      .post(
        `${config.API_URL}api/users/get_popular_user_list`,
        { limit: limit, time: time },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(changePopular(result.data.data));
      })
      .catch(() => {});
  };

  useEffect(() => {
    getPopularUserList(
      dateOptions.find((item) => item.text === date)?.value,
      4
    );
  }, [date]);

  // useEffect(() => {
  //   socket.on("UpdateStatus", (data) => {
  //     getPopularUserList(
  //       dateOptions.find((item) => item.text === date)?.value,
  //       4
  //     );
  //   });
  // }, []);

  useEffect(() => {
    setUserList();
  }, [popular, direction]);

  const setUserList = () => {
    if (popular) {
      if (direction === "Sellers") {
        setItems((popular as any).seller);
      } else {
        setItems((popular as any).buyer);
      }
    }
  };

  const toggleFollow = (my_id: string, target_id: string) => {
    axios
      .post(
        `${config.API_URL}api/follow/toggle_follow`,
        { my_id, target_id },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then(() => {
        dispatch(changeFollow(true));
      })
      .catch(() => {
        dispatch(changeFollow(false));
      });
  };

  const getFollowList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    await axios
      .post(
        `${config.API_URL}api/follow/get_follows`,
        { limit: limit, my_id: user_id },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(changeFollowList(result.data.data || []));
      })
      .catch(() => {});
  };

  const getFollowingList = async (user_id: string, limit: number) => {
    if (isEmpty(user_id)) return;
    await axios
      .post(
        `${config.API_URL}api/follow/get_followings`,
        { limit: limit, my_id: user_id },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(
          changeFollowingList(
            result.data && result.data.data ? result.data.data : []
          )
        );
      })
      .catch(() => {});
  };

  const updateFollowings = () => {
    if (isEmpty(auth?._id || "")) return;
    getFollowList(auth?._id || "", 10);
    getFollowingList(auth?._id || "", 10);
  };

  const toggleFollowing = (targetId: string) => {
    if (isEmpty(targetId) || isEmpty(auth?._id)) {
      toast.warn("Please log in first.");
      return;
    }
    toggleFollow(auth?._id || "", targetId);
  };

  const renderCard = (x: any, index: number) => {
    return (
      <CardAuthorBox
        key={"popular_user" + index}
        onUpdate={updateFollowings}
        onUnfollow={toggleFollowing}
        item={x}
      />
    );
  };

  const renderTopUserSection = () => {
    return (
      <div className="flex justify-center items-center gap-2 lg:gap-5 mb-12 lg:mb-16 flex-row">
        <Heading
          rightPopoverText="Creators"
          options={directionOptions}
          value={direction}
          setValue={setDirection}
          fontClass="text-xl lg:text-4xl font-semibold"
          className="sm:mb-0"
        >
          Top
        </Heading>
        <div className="">
          <SortOrderFilter
            value={date}
            setValue={setDate}
            options={sortOrder}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full relative ${className}`}
      data-nc-id="SectionGridAuthorBox"
    >
      {renderTopUserSection()}
      {items && items.length > 0 && (
        <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {items.map((x, index) => renderCard(x, index))}
        </div>
      )}
    </div>
  );
};

export default SectionTopUser;
