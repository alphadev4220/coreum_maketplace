import React from "react";
import cn from "classnames";
import styles from "./RemoveSale.module.sass";
import ButtonPrimary from "components/Button/ButtonPrimary";

const CancelSale = ({ className = "", onOk, onCancel, multiple = 0 }) => {
  return (
    <div className={cn(className, styles.transfer)}>
      <div className={styles.text}>
        {multiple > 0
          ? `Do you really want to remove your ${multiple} items from sale? You can put them on sale anytime`
          : "Do you really want to remove your item from sale? You can put it on sale anytime"}
      </div>
      <div className={styles.btns}>
        <ButtonPrimary className={cn("button", styles.button)} onClick={onOk}>
          Remove now
        </ButtonPrimary>

        <button
          className="bg-transparent text-[#33FF00] border-2 rounded-lg border-[#33FF00] w-full py-4"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CancelSale;
