import clsx from "clsx";
import Marquee3D from "components/StyleComponent/Marquee3D";
import axios from "axios";
import { config } from "app/config";
import { useEffect, useState } from "react";
import Heading from "components/StyleComponent/Heading";
import ButtonLink from "components/Button/LinkButton";

const SectionMainSlider = () => {
  const [rizeMemeberCollectionId, setRizeMemberCollectionId] = useState(
    "6460aff6565e58a809f2f414"
  );
  const getRizeMemberCollectionId = () => {
    axios
      .post(`${config.API_URL}api/collection/getRizeMemberCollectionId`)
      .then((response) => {
        setRizeMemberCollectionId(response.data.data[0]);
      })
      .catch((error) => {
        console.log("getRizeMemberCollectionId() error ===> ", error);
      });
  };
  useEffect(() => {
    getRizeMemberCollectionId();
  }, []);
  return (
    <>
      <div className="relative flex flex-col items-center justify-center mt-1 mb-6">
        <div className="flex items-end justify-between gap-2 lg:gap-5 mb-12 lg:mb-14 text-sm lg:text-xl">
          <Heading
            className="text-neutral-900 dark:text-neutral-50"
            fontClass="text-xl lg:text-4xl font-semibold"
            isCenter={true}
            desc=""
          >
            Rize Member NFTs
          </Heading>
          <ButtonLink
            href={"collectionItems/" + rizeMemeberCollectionId}
          ></ButtonLink>
        </div>
        <p className="text-sm lg:text-xl text-center text-neutral-900 dark:text-white -mt-[35px] mb-6">
          A limited collection of 3D meditative sculptures that contain unique
          form and material compositions. Fully interoperable and XR ready.
        </p>
      </div>
      <div
        className={clsx(
          "absolute bg-[#33FF00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -top-[100px] -left-[100px]"
        )}
      ></div>
      <Marquee3D />
    </>
  );
};

export default SectionMainSlider;
