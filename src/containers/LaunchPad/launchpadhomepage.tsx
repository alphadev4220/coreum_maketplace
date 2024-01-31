import { useEffect, useState } from "react";
import CollectionMintCard from "components/Launchpad/CollectionMintCard";
import CollectionSlideCard from "components/Launchpad/CollectionSlideCard";
import { config } from "app/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentNetworkSymbol } from "app/reducers/auth.reducers";
import defaultLogo from "images/default_logo.png";
import { getCollsOnANetworkApi } from "app/api/collections";

const LaunchPadHomePage = () => {
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const [collectionList, setCollectionList] = useState([]);
  const [collectionName, setCollectionName] = useState("Rize Collections");

  useEffect(() => {
    const fetchData = async () => {
      const param = {
        networkSymbol: currentNetworkSymbol === 0 ? 1 : currentNetworkSymbol,
      };
      const response = await getCollsOnANetworkApi(param);
      const data = response.data || [];
      const launchpadData = data.filter((col) => {
        return (
          col?.launchstate !== null &&
          col?.launchstate !== "" &&
          col?.launchstate > 0
        );
      });
      setCollectionList(launchpadData);
      setCollectionName(launchpadData[0]?.name);
    };
    fetchData();
  }, [currentNetworkSymbol]);

  return (
    <>
      <div className="relative w-[100vw]] h-[auto] overflow-hidden text-left text-base text-white">
        {/* --------------background paper-opacity-color--------------- */}

        <div className="flex flex-col ">
          <div className="flex-grow ">
            <img
              className="absolute top-[0px] left-[0px] object-cover w-full h-full"
              alt=""
              src="/assets/bg@2x.png"
            />

            <div className="absolute top-[0px] left-[0px] bg-lime-100 w-full h-full mix-blend-darken" />
            <div className="absolute top-[0px] left-[0px] bg-gray-100 [backdrop-filter:blur(50px)] w-full h-full mix-blend-normal" />
          </div>
        </div>

        <div className="z-[2] relative mx-auto w-[90%] md:w-[80%] h-[auto] ">
          {/* -------------MID content start----------- */}
          <div className="relative m-auto w-full h-[auto] text-19xl back flex flex-col justify-center items-center mb-20">
            {/* ----------first div------------- */}
            <div className=" w-full flex flex-col md:flex-row flex-wrap m-auto">
              <div className="relative mt-[50px] m-auto w-full">
                <div className="flex flex-col justify-center items-center">
                  <div className="text-white [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] text-[23px] md:text-[38px] font-[700] leading-10">
                    {collectionName}
                  </div>
                  {/* <div className="text-white [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] text-[20px] md:text-[28px] font-[400] leading-10">
                                        {collectionName}
                                    </div> */}
                </div>

                <CollectionSlideCard
                  data={collectionList}
                  onChange={setCollectionName}
                />
              </div>
            </div>
            <div className="relative  h-full mt-[50px] m-auto w-full flex- felx-col gap-[40px] md:gap-[70px] lg:gap-[104px]">
              <div className="m-auto w-full text-19xl back flex flex-col justify-center items-start gap-[25px] md:gap-[38px]">
                <div className="text-white [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] text-[25px] md:text-[28px] lg:text-[38px] font-[700] leading-10">
                  Live Mints
                </div>
                <div className="leading-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                  {collectionList
                    .filter((col) => {
                      return (
                        new Date().getTime() <=
                          new Date(col?.mintFinishDate).getTime() &&
                        col?.launchstate === 2
                      );
                    })
                    .map((col, index) => (
                      <CollectionMintCard
                        key={"collectionMintCard" + index}
                        name={col?.name}
                        image={
                          col?.logoURL === "" || col?.logoURL === undefined
                            ? defaultLogo
                            : `${config.UPLOAD_URL}uploads/${col.logoURL}`
                        }
                        minted={col?.itemsLength}
                        total={parseInt(col?.totalItemNumberInCID)}
                        price={col?.mintingPrice}
                        id={col?._id}
                      />
                    ))}
                </div>
              </div>
              <div className="m-auto w-full text-19xl mt-[50px]  back flex flex-col justify-center items-start gap-[25px] md:gap-[38px]">
                <div className="text-white [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] text-[25px] md:text-[28px] lg:text-[38px] font-[700] leading-10">
                  Ended
                </div>
                <div className="leading-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                  {collectionList
                    .filter((col) => {
                      return (
                        new Date().getTime() >
                          new Date(col?.mintFinishDate).getTime() &&
                        col?.launchstate === 2
                      );
                    })
                    .map((col, index) => (
                      <CollectionMintCard
                        key={"collectionMintCard" + index}
                        name={col?.name}
                        image={
                          col?.logoURL === "" || col?.logoURL === undefined
                            ? defaultLogo
                            : `${config.UPLOAD_URL}uploads/${col.logoURL}`
                        }
                        minted={col?.itemsLength}
                        total={parseInt(col?.totalItemNumberInCID)}
                        price={col?.mintingPrice}
                        id={col?._id}
                      />
                    ))}
                </div>
              </div>
              <div className="m-auto w-full text-19xl mt-[50px] back flex flex-col justify-center items-start gap-[25px] md:gap-[38px]">
                <div className="text-white [text-shadow:0px_4px_4px_rgba(51,_255,_0,_0.42)] text-[25px] md:text-[28px] lg:text-[38px] font-[700] leading-10">
                  Upcoming
                </div>
                <div className="leading-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                  {collectionList
                    .filter((col) => {
                      return col?.launchstate === 1;
                    })
                    .map((col, index) => (
                      <CollectionMintCard
                        key={"collectionMintCard" + index}
                        name={col?.name}
                        image={
                          col?.logoURL === "" || col?.logoURL === undefined
                            ? defaultLogo
                            : `${config.UPLOAD_URL}uploads/${col.logoURL}`
                        }
                        minted={col?.itemsLength}
                        total={parseInt(col?.totalItemNumberInCID)}
                        price={col?.mintingPrice}
                        id={col?._id}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------MID content end----------- */}
      </div>
    </>
  );
};

export default LaunchPadHomePage;
