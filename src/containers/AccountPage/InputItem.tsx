import Label from "components/StyleComponent/Label";
import { FC } from "react";
import Input from "components/StyleComponent/Input";

export interface InputItemProps {
  className?: string;
  label?: string;
  value: string;
  onChange;
}

const InputItem: FC<InputItemProps> = ({
  className = "",
  label = "Input",
  value,
  onChange,
}: InputItemProps) => {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5 flex">
        <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
          <i className="text-2xl las la-envelope"></i>
        </span>
        <Input
          className="!rounded-l-none"
          placeholder="example@email.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputItem;
