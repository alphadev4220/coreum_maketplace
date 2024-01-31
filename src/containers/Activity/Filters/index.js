import React, { useState } from "react";
import cn from "classnames";
import styles from "./Filters.module.sass";
import Label from "components/StyleComponent/Label";

const Filters = ({ className, onChangeFiters }) => {
  const initialValues = [
    { label: "Sales", checked: false },
    { label: "Listings", checked: false },
    { label: "Bids", checked: false },
    { label: "Burns", checked: false },
    { label: "Followings", checked: false },
    { label: "Likes", checked: false },
    { label: "Purchase", checked: false },
    { label: "Transfers", checked: false },
  ];

  const [values, setValues] = useState(initialValues);

  const handleCheckChange = (index) => {
    const newValues = [...values];
    newValues[index].checked = !newValues[index].checked;
    setValues(newValues);
    onChangeFiters(newValues);
  };

  const handleCheckAll = (checked) => {
    const newValues = values.map((item) => ({ ...item, checked }));
    setValues(newValues);
    onChangeFiters(newValues);
  };

  const allChecked = values.every((item) => item.checked);
  const isIndeterminate = values.some((item) => item.checked) && !allChecked;

  return (
    <div className={cn(styles.filters, className)}>
      <div className={styles.info}>
        <input
          type="checkbox"
          className="focus:ring-action-primary h-6 w-6 text-primary-500 border-primary rounded border-neutral-500 bg-white dark:bg-neutral-700  dark:checked:bg-primary-500 focus:ring-primary-500"
          checked={allChecked}
          onChange={(e) => handleCheckAll(e.target.checked)}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
        />
        <label>Check All</label>
      </div>
      <div className={styles.group}>
        {values.map((item, index) => (
          <div key={index} className={styles.checkitem}>
            <input
              type="checkbox"
              className="focus:ring-action-primary h-6 w-6 text-primary-500 border-primary rounded border-neutral-500 bg-white dark:bg-neutral-700  dark:checked:bg-primary-500 focus:ring-primary-500"
              checked={item.checked}
              onChange={() => handleCheckChange(index)}
            />
            <Label>{item.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;
