import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "components/StyleComponent/Avatar";
import VerifyIcon from "components/StyleComponent/VerifyIcon";
import FollowButton from "components/Button/FollowButton";
import { isEmpty } from "app/methods";

export interface CardAuthorBoxProps {
  className?: string;
  following?: boolean;
  item?: any;
  effect?: any;
  onUpdate?: () => void;
  onUnfollow?: (id: string) => void;
}

const CardAuthorBox: FC<CardAuthorBoxProps> = ({
  className = "",
  following,
  item,
  onUpdate,
  onUnfollow,
}) => {
  const [consideringUser, setConsideringUser] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const onFollow = (targetId: string) => {
    if (isEmpty(targetId)) return;
    if (onUnfollow) onUnfollow(targetId);
    setTimeout(() => {
      if (onUpdate) onUpdate();
      setTimeout(() => {
        if (onUpdate) onUpdate();
      }, 1000);
    }, 1000);
  };

  useEffect(() => {
    setConsideringUser(item);
  }, [item]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);
  return (
    <>
      {isEmpty(consideringUser) === false ? (
        <div
          className={`nc-CardAuthorBox3 relative  ${
            isMobile ? "h-[150px]" : "h-[250px] min-w-[250px]"
          } flex flex-col p-4 overflow-hidden cursor-pointer [ nc-box-has-hover ] [ nc-dark-box-bg-has-hover ]  ${className}`}
          data-nc-id="CardAuthorBox3"
          onClick={() => {
            navigate(`/page-author/${(consideringUser as any)?._id || "1"}`);
          }}
        >
          <div>
            <div className="text-center">
              <Avatar
                containerClassName="!shadow-xl"
                sizeClass="w-20 h-20 text-2xl"
                radius="rounded-full"
                imgUrl={(consideringUser as any)?.avatar}
              />
            </div>
            <div className="mt-2.5 flex items-start justify-center">
              <div>
                <h2 className={`text-base font-medium flex items-center`}>
                  <span className="">{(consideringUser as any)?.username}</span>
                  <VerifyIcon />
                </h2>
              </div>
              {onUnfollow && following === true && (
                <FollowButton
                  isFollowing={following}
                  onTogglefollow={onFollow}
                />
              )}
            </div>
            {!isMobile && (
              <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 author-box text-center overflow-y-auto">
                {(consideringUser as any)?.userBio || "No description"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default CardAuthorBox;
