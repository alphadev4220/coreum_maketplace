import React, { FC } from "react";
import { useParams } from "react-router-dom";
import ButtonPrimary, {
  ButtonPrimaryProps,
} from "components/Button/ButtonPrimary";
import ButtonSecondary from "components/Button/ButtonSecondary";

export interface FollowButtonProps extends ButtonPrimaryProps {
  isFollowing?: boolean;
  onTogglefollow?: any;
  afterExcute?: any;
}

const FollowButton: FC<FollowButtonProps> = ({
  className = "relative z-10",
  sizeClass = "px-4 py-1.5 min-w-[84px]",
  fontSize = "text-sm font-medium",
  isFollowing,
  onTogglefollow,
  afterExcute,
}) => {
  // const [following, setFollowing] = React.useState(isFollowing);
  const { userId } = useParams();

  return !isFollowing ? (
    <ButtonPrimary
      className={className}
      sizeClass={sizeClass}
      fontSize={fontSize}
      onClick={() => {
        onTogglefollow(userId || "");
        afterExcute && setTimeout(() => afterExcute(), 1000);
      }}
    >
      Follow
    </ButtonPrimary>
  ) : (
    <ButtonSecondary
      className={className}
      sizeClass={sizeClass}
      fontSize={fontSize}
      onClick={() => {
        onTogglefollow(userId || "");
        afterExcute && setTimeout(() => afterExcute(), 1000);
      }}
    >
      <span className="text-sm ">Following</span>
    </ButtonSecondary>
  );
};

export default FollowButton;
