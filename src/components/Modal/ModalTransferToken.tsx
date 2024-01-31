import { PLATFORM_NETWORKS } from "app/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentNetworkSymbol } from "app/reducers/auth.reducers";
import React, { FC, useEffect, useRef, useState } from "react";
import ButtonPrimary from "components/Button/ButtonPrimary";
import ButtonSecondary from "components/Button/ButtonSecondary";
import Input from "components/StyleComponent/Input";
import NcModal from "components/NcComponent/NcModal";

export interface ModalTransferTokenProps {
  show: boolean;
  onCloseModalTransferToken: () => void;
  onOk: any;
  multiple?: number;
}

const ModalTransferToken: FC<ModalTransferTokenProps> = ({
  show,
  onOk,
  onCloseModalTransferToken,
  multiple = 0,
}) => {
  const textareaRef = useRef(null);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const [toAddr, setToAddr] = useState("");

  const onContinue = () => {
    onOk(toAddr);
  };

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        const element: HTMLTextAreaElement | null = textareaRef.current;
        if (element) {
          (element as HTMLTextAreaElement).focus();
          (element as HTMLTextAreaElement).setSelectionRange(
            (element as HTMLTextAreaElement).value.length,
            (element as HTMLTextAreaElement).value.length
          );
        }
      }, 400);
    }
  }, [show]);

  const renderContent = () => {
    return (
      <form action="#">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
          {multiple > 1 ? `Transfer ${multiple} NFTs` : "Transfer NFT"}
        </h3>
        <span className="text-sm">
          {currentNetworkSymbol === PLATFORM_NETWORKS.XRPL
            ? "For this transfer to be completed, the recipient must accept it through their wallet."
            : "You can transfer nfts from your address to another."}
        </span>
        <div className="mt-8 ">
          <Input
            ref={textareaRef}
            placeholder="Paste address"
            type={"text"}
            value={toAddr}
            onChange={(e) => setToAddr(e.target.value)}
          />
        </div>
        <div className="mt-4 space-x-3">
          <ButtonPrimary type="button" onClick={() => {
            onCloseModalTransferToken();
            onContinue();
          }}>
            Submit
          </ButtonPrimary>
          <ButtonSecondary type="button" onClick={onCloseModalTransferToken}>
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
      onCloseModal={onCloseModalTransferToken}
      contentExtraClass="max-w-lg"
      renderContent={renderContent}
      renderTrigger={renderTrigger}
      modalTitle={multiple > 1 ? "Transfer NFTs" : "Transfer NFT"}
    />
  );
};

export default ModalTransferToken;
