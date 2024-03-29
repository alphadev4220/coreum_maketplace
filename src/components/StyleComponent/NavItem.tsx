import React, { FC, ReactNode } from "react";
import twFocusClass from "utils/twFocusClass";

export interface NavItem2Props {
  className?: string;
  radius?: string;
  onClick?: () => void;
  isActive?: boolean;
  renderX?: ReactNode;
  children?: React.ReactNode;
}

const NavItem: FC<NavItem2Props> = ({
  className = "px-3 py-2 text-sm sm:px-7 sm:py-3 capitalize",
  radius = "rounded-full",
  children,
  onClick = () => {},
  isActive = false,
  renderX,
}) => {
  return (
    <li className="nc-NavItem relative" data-nc-id="NavItem">
      {renderX && renderX}
      <button
        className={`block font-medium whitespace-nowrap ${className} ${radius} ${
          isActive
            ? "bg-[#33ff00] text-primary-50"
            : "text-neutral-6000 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 "
        } ${twFocusClass()}`}
        onClick={() => {
          onClick && onClick();
        }}
      >
        {children}
      </button>
    </li>
  );
};

export default NavItem;
