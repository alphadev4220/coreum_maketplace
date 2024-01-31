/*jshint esversion: 6 */

import React from "react";
import { FC } from "react";
import "./SelectableCard.css";

export interface SelectabelCardProps {
  selected?: boolean;
  onClick;
  children?: React.ReactNode;
}

const SelectableCard: FC<SelectabelCardProps> = ({
  children,
  onClick,
  selected,
}) => {
  var isSelected = selected ? "selected" : "";
  var className = "selectable " + isSelected;
  return (
    <div className={`nftcard`}>
      <div className={className} onClick={onClick}>
        {children}
        <div className="check">
          <span className="checkmark">✔</span>
        </div>
      </div>
    </div>
  );
};

export default SelectableCard;
