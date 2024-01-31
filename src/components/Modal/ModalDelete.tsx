import React, { FC } from "react";
import ButtonPrimary from "components/Button/ButtonPrimary";
import ButtonSecondary from "components/Button/ButtonSecondary";
import NcModal from "components/NcComponent/NcModal";

export interface ModalDeleteProps {
  show: boolean;
  onCloseModalDelete: () => void;
  onOk: any;
  multiple?: number;
}

const ModalDelete: FC<ModalDeleteProps> = ({
  show,
  onOk,
  onCloseModalDelete,
  multiple = 0,
}) => {
  const handleClickSubmitForm = () => {
    onOk();
  };

  const renderContent = () => {
    return (
      <form action="#">
        <span className="text-sm">
          {multiple > 1
            ? `Are you sure you want to delete ${multiple} NFTs? You can't undo this action.`
            : `Are you sure you want to delete this NFT? You cannot undo this action.`}
        </span>
        <div className="mt-4 space-x-3">
          <ButtonPrimary onClick={() => {
            handleClickSubmitForm();
            onCloseModalDelete();
          }}
            type="button">
            Delete
          </ButtonPrimary>
          <ButtonSecondary type="button" onClick={onCloseModalDelete}>
            Cancel
          </ButtonSecondary>
        </div>
      </form>
    );
  };

  const renderTrigger = () => {
    return null;
  };

  return (
    <NcModal
      isOpenProp={show}
      onCloseModal={onCloseModalDelete}
      contentExtraClass="max-w-screen-sm"
      renderContent={renderContent}
      renderTrigger={renderTrigger}
      modalTitle={multiple > 1 ? "Burn NFTs" : "Burn NFT"}
    />
  );
};

export default ModalDelete;
