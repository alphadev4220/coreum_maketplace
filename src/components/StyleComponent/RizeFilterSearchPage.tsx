import { FC } from "react";
import RizeFilters from "components/StyleComponent/RizeFilters";
import { Transition } from "@headlessui/react";

export interface RizeFilterSearchPageProps {
  className?: string;
  isOpen: boolean;
  onChangeCategory: any;
  categoryValue: any;
  onChangeDate: any;
  dateValue: any;
  onChangeCreator: any;
  creatorValue: any;
  onChangeStatus: any;
  statusValue: any;
  onChangeRange: any;
  rangeValue: any;
  onChangeFileType: any;
  fileTypeValue: any;
  onChangeChain: any;
  chainValue: any;
}

const RizeFilterSearchPage: FC<RizeFilterSearchPageProps> = ({
  className = "mb-12",
  isOpen,
  onChangeCategory,
  categoryValue,
  onChangeDate,
  dateValue,
  onChangeCreator,
  creatorValue,
  onChangeStatus,
  statusValue,
  onChangeRange,
  rangeValue,
  onChangeFileType,
  fileTypeValue,
  onChangeChain,
  chainValue,
}) => {
  return (
    <div className={`flex flex-col items-center relative ${className}`}>
      <Transition
        show={isOpen}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <RizeFilters
          onChangeCategory={onChangeCategory}
          categoryValue={categoryValue}
          onChangeDate={onChangeDate}
          dateValue={dateValue}
          onChangeStatus={onChangeStatus}
          statusValue={statusValue}
          onChangeRange={onChangeRange}
          rangeValue={rangeValue}
          onChangeCreator={onChangeCreator}
          creatorValue={creatorValue}
          fileTypeValue={fileTypeValue}
          onChangeFileType={onChangeFileType}
          onChangeChain={onChangeChain}
          chainValue={chainValue}
        />
      </Transition>
    </div>
  );
};

export default RizeFilterSearchPage;
