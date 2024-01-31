import { useEffect, useState, useRef } from "react";
import Filters from "./Filters";
import { changeNotifyList } from "app/reducers/notify.reducers";
import { config } from "app/config";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectNotifyList } from "app/reducers/notify.reducers";
import { selectCurrentUser } from "app/reducers/auth.reducers";
import axios from "axios";
import ButtonPrimary from "components/Button/ButtonPrimary";
import Avatar from "components/StyleComponent/Avatar";
import { Backdrop, CircularProgress } from "@mui/material";
import { TbMoodEmpty } from "react-icons/tb";
import styles from "./Activity.module.sass";
import MainSection from "components/Section/MainSection";

const navLinks = ["My activity", "Following", "All activity"];

const Activity = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const notifiesList = useAppSelector(selectNotifyList);
  const currentUsr = useAppSelector(selectCurrentUser);
  const userRef = useRef();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (currentUsr) {
      userRef.current = currentUsr._id;
    }
  }, [currentUsr]);

  const getNotifiesByLimit = (limit, userId, filter = []) => {
    setProcessing(true);
    axios
      .post(
        `${config.baseUrl}notify/getlist`,
        { limit, userId, filter },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(changeNotifyList(result.data.data));
        setProcessing(false);
      })
      .catch(() => {
        setProcessing(false);
      });
  };

  const getMyNotifiesByLimit = (limit, userId, filter = []) => {
    setProcessing(true);
    axios
      .post(
        `${config.baseUrl}notify/getmylist`,
        { limit, userId, filter },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then((result) => {
        dispatch(changeNotifyList(result.data.data));
        setProcessing(false);
      })
      .catch(() => {
        setProcessing(false);
      });
  };

  const markAllAsRead = (notifyIds, userId) => {
    setProcessing(true);
    axios
      .post(
        `${config.baseUrl}notify/markAllAsRead`,
        { notifyIds, userId },
        {
          headers: {
            "x-access-token": localStorage.getItem("jwtToken"),
          },
        }
      )
      .then(() => {
        setTimeout(() => {
          if (activeIndex === 1) {
            getNotifiesByLimit(50, userRef.current, [5]);
          } else if (activeIndex === 0) {
            getMyNotifiesByLimit(50, userRef.current);
          } else {
            getNotifiesByLimit(50, userRef.current);
          }
        }, 2000);
        setProcessing(false);
      })
      .catch(() => {
        setProcessing(false);
      });
  };

  const onClickMarkAllAsRead = () => {
    if (notifiesList && notifiesList.length > 0) {
      let idList = [];
      let j;
      for (j = 0; j < notifiesList.length; j++)
        idList.push(notifiesList[j]._id);
      markAllAsRead(idList, userRef.current);
      dispatch(changeNotifyList());
    }
  };

  useEffect(() => {
    var reshapedFilters = [];
    if (selectedFilters && selectedFilters.length > 0) {
      for (var j = 0; j < selectedFilters.length; j++) {
        if (!selectedFilters[j].checked) continue;
        switch (selectedFilters[j].label) {
          default:
            break;
          case "Sales":
            reshapedFilters.push(1);
            break;
          case "Listings":
            reshapedFilters.push(2);
            break;
          case "Bids":
            reshapedFilters.push(3);
            break;
          case "Burns":
            reshapedFilters.push(4);
            break;
          case "Followings":
            reshapedFilters.push(5);
            break;
          case "Likes":
            reshapedFilters.push(6);
            break;
          case "Purchase":
            reshapedFilters.push(7);
            break;
          case "Transfers":
            reshapedFilters.push(8);
            break;
        }
      }
    }
    if (reshapedFilters.length > 0) {
      getNotifiesByLimit(50, userRef.current, reshapedFilters);
    }
  }, [selectedFilters]);

  useEffect(() => {
    if (activeIndex === 1) {
      getNotifiesByLimit(50, userRef.current, [5]);
    } else if (activeIndex === 0) {
      getMyNotifiesByLimit(50, userRef.current);
    } else {
      getNotifiesByLimit(50, userRef.current);
    }
  }, [activeIndex]);

  const goDetail = (url) => {
    navigate(url);
  };

  return (
    <MainSection title="Activity Log" className="pt-[20px]">
      <div className="container flex flex-col align-center pb-20">
        <div className={"m-4"}>
          {navLinks &&
            navLinks.length > 0 &&
            navLinks.map((x, index) => (
              <button
                className={` px-4 py-2 ${
                  index === activeIndex
                    ? " bg-[#33ff00] text-black rounded-xl p-1"
                    : "text-[#33ff00]"
                }`}
                onClick={() => setActiveIndex(index)}
                key={index}
              >
                {x}
              </button>
            ))}
        </div>
        <div className="flex align-start gap-20px">
          <div className="flex-wrap md:min-w-[500px] md:mr-5 w-[100%] rounded-xl border-2">
            <div className="min-h-[500px] overflow-y-auto mt-8">
              {notifiesList && notifiesList.length > 0 ? (
                notifiesList.map((x, index) => (
                  <div
                    className={
                      notifiesList?.readers?.includes(userRef.current)
                        ? styles.readItem
                        : styles.item
                    }
                    key={"notifiesList" + index}
                    onClick={() => {
                      goDetail(x.url);
                    }}
                  >
                    <div className="m-2">
                      <Avatar
                        imgUrl={x?.imgUrl}
                        sizeClass="w-15 h-15 sm:w-12 sm:h-12"
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 space-y-1">
                      <div className="md:text-xl sm:text-md text-[#33ff00] ">
                        {x.subTitle}
                      </div>
                      <div className="md:text-lg sm:text-sm text-gray-500 dark:text-gray-400">
                        {x.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-400">
                        {x.date
                          ? moment(x.date).format("YYYY-MM-DD HH:mm:ss")
                          : ""}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex align-center justify-center h-full">
                  <TbMoodEmpty width={"22px"} height={"22px"} /> &nbsp;No Activities
                </div>
              )}
            </div>
            {notifiesList && notifiesList.length > 0 && (
              <div className="my-5 flex justify-center ">
                <ButtonPrimary
                  className="w-[30%] !mr-16 text-center"
                  onClick={() => onClickMarkAllAsRead()}
                >
                  <span>Mark all as read</span>
                </ButtonPrimary>
              </div>
            )}
          </div>
          <Filters
            className={"min-w-[250px] p-6 rounded-xl border-2 h-[370px]"}
            onChangeFiters={setSelectedFilters}
          />
        </div>
        {
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={processing}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      </div>
    </MainSection>
  );
};

export default Activity;
