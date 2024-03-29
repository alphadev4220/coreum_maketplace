import { useState, useRef, useEffect } from "react";

const Clock = ({ nftItem, sysTime, setAuctionEnded }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [refresh, setRefresh] = useState(false);
  const curTime = useRef(0);

  const calculateTimeLeft = (created, period) => {
    let difference = created * 1000 + period * 1000 - curTime.current++ * 1000;
    let time = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference >= 0) {
      time = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    setTimeLeft(time);
    setRefresh(!refresh);
    return difference;
  };

  useEffect(() => {
    let intVal;
    if (sysTime > 0) {
      curTime.current = sysTime;
      calculateTimeLeft(nftItem?.auctionStarted, nftItem?.auctionPeriod);
      intVal = setInterval(() => {
        const time_left = calculateTimeLeft(
          nftItem?.auctionStarted,
          nftItem?.auctionPeriod
        );
        if (time_left <= 0) {
          curTime.current = 0;
          setAuctionEnded(true);
          clearInterval(intVal);
        }
      }, 1000);
    }

    return () => clearInterval(intVal);
  }, [sysTime]);

  return (
    <div className="flex space-x-1 sm:space-x-10">
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold sm:text-2xl">
          {(timeLeft).days || 0}
        </span>
        <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
          Days
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold sm:text-2xl">
          {(timeLeft).hours || 0} 
        </span>
        <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
          hours
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold sm:text-2xl">
          {(timeLeft).minutes || 0} 
        </span>
        <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
          minutes
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold sm:text-2xl">
          {(timeLeft).seconds || 0}
        </span>
        <span className="sm:text-lg text-neutral-500 dark:text-neutral-400">
          seconds
        </span>
      </div>
    </div>
    // <span className="text-2xl font-semibold sm:text-2xl">
    //   {timeLeft.days || 0} : {timeLeft.hours || 0} : {timeLeft.minutes || 0} :{" "}
    //   {timeLeft.seconds || 0}
    // </span>
  );
};

export default Clock;
