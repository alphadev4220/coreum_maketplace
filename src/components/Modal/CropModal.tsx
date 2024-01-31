import { useState, useCallback, FC } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import NcModal from "components/NcComponent/NcModal";
import ButtonPrimary from "components/Button/ButtonPrimary";
import ButtonSecondary from "components/Button/ButtonSecondary";
import { uploadFile } from "app/api/utils";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";

export interface ModalCropProps {
  show: boolean;
  onCloseModalCrop: () => void;
  onOk: any;
  image: any;
}

const ModalCrop: FC<ModalCropProps> = ({
  show,
  onOk,
  onCloseModalCrop,
  image,
}) => {
  const [crop, setCrop] = useState({ aspect: 1, width: 100, height: 100 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [processing, setProcessing] = useState(false);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob((blob) => {
      setCroppedImage(blob);
    }, "image/png");
  };

  const onCropChange = (crop) => {

    setCrop(crop);
  };
  const onImageLoaded = (image) => {
    setImageRef(image);
  };

  const onCropComplete = useCallback(() => {
    if (imageRef && crop.width && crop.height) {
      getCroppedImg(imageRef, crop);
    }
  }, [imageRef, crop]);

  const renderContent = () => {
    return (
      <div className="App">
        {image && (
          <ReactCrop
            src={image}
            crop={crop}
            onImageLoaded={onImageLoaded}
            onChange={onCropChange}
            onComplete={onCropComplete}
          />
        )}

        <div className="mt-4 space-x-3">
          <ButtonPrimary
            onClick={() => {
              handleUpload();
              onCloseModalCrop();
            }}
            type="button"
          >
            Select
          </ButtonPrimary>
          <ButtonSecondary type="button" onClick={onCloseModalCrop}>
            Cancel
          </ButtonSecondary>
        </div>

      </div>
    );
  };

  const handleUpload = async () => {
    if (croppedImage) {
      const formData = new FormData();
      formData.append("itemFile", croppedImage, "croppedImage.png");
      formData.append("authorId", "hch");
      setProcessing(true);
      try {
        const response = await uploadFile(formData);
        onOk(response.path);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Uploading avatar failed.");
      } finally {
        onCloseModalCrop();
        setProcessing(false);
      }
    }
  };

  const renderTrigger = () => {
    return null;
  };

  return (
    <>
      <NcModal
        isOpenProp={show}
        onCloseModal={onCloseModalCrop}
        contentExtraClass="max-w-screen-sm"
        renderContent={renderContent}
        renderTrigger={renderTrigger}
        modalTitle={"Select an Image"}
      />

      {
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={processing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </>
  );
};

export default ModalCrop;
