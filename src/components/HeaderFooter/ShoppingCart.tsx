import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import NcImage from "components/NcComponent/NcImage";
import CloseIcon from "@material-ui/icons/Close";
import { useSigningClient } from "app/cosmwasm";
import PricesUnit from "components/StyleComponent/PricesUnit";
import VideoForPreview from "components/Card/VideoForPreview";
import { AiOutlineDelete } from "react-icons/ai";
import { FILE_TYPE, config } from "app/config";
import ShoppingCartIcon from "../../images/icons/shopping-cart.svg";
import { isVideo } from "utils/utils";

const ShoppingCart = () => {
  const [isOpen, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const { cartCount, setCartCount }: any = useSigningClient();
  const navigate = useNavigate();

  useEffect(() => {
    let cartInfo = JSON.parse(localStorage.getItem("shoppingCart"));
    if (cartInfo && cartInfo.length > 0) {
      setCartCount(cartInfo.length);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (cartCount > 0) {
          let cartInfo = JSON.parse(localStorage.getItem("shoppingCart"));
          const resp = await axios.post(
            `${config.API_URL}api/item/findManyByIds`,
            { idArray: cartInfo },
            {
              headers: {
                "x-access-token": localStorage.getItem("jwtToken"),
              },
            }
          );
          const data = resp.data.data;
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [cartCount]);

  const handleNavigate = (url: any) => {
    navigate(url);
    setOpen(false);
  };

  const handleRemove = (_id) => {
    let cartInfo = JSON.parse(localStorage.getItem("shoppingCart"));
    if (cartInfo && cartInfo.length > 0) {
      const index = cartInfo.findIndex((item: any) => item === _id);
      if (index > -1) {
        cartInfo.splice(index, 1);
        toast.success("Successfully removed from cart");
        localStorage.setItem("shoppingCart", JSON.stringify(cartInfo));
        setCartCount(cartInfo.length);
      }
    }
  };

  const handleClear = () => {
    toast.success("Successfully removed all from cart");
    localStorage.removeItem("shoppingCart");
    setCartCount(0);
  };

  return (
    <>
      <div
        className="w-[26px] h-[26px] cursor-pointer relative"
        onClick={() => setOpen(true)}
      >
        <img className="rize-icon-sm" src={ShoppingCartIcon} alt="" />
        {cartCount > 0 && (
          <span className="badge absolute -top-2 -right-2">{cartCount}</span>
        )}
      </div>
      <div>
        <div
          className={`shopping-cart-container bg-white border border-black border-opacity-5 dark:bg-neutral-800 dark:border-neutral-600 text-neutral-900 dark:text-neutral-300 ${
            isOpen ? "opacity-100 translate-x-0" : "opacity-0  translate-x-full"
          }`}
        >
          <div className="shopping-cart-header">
            <div className="flex justify-between">
              <h1 className="text-xl">Your cart</h1>
              <div onClick={() => setOpen(false)}>
                <CloseIcon className="cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="shopping-cart-body">
            <div className="flex justify-between">
              <span className="text-md">{cartCount} items</span>
              <div className="text-md cursor-pointer" onClick={handleClear}>
                Clear all
              </div>
            </div>
            <div className="flex flex-col mt-4">
              {items.length > 0 && (
                <>
                  {items.map((item, index) => {
                    return (
                      <div
                        className="flex items-center justify-between rounded-xl gap-2 px-2 py-4 group hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        key={index}
                      >
                        <div
                          className="flex gap-2 items-center cursor-pointer w-2/3"
                          onClick={() => {
                            handleNavigate(`/nft-detail/${(item as any)?._id}`);
                          }}
                        >
                          <div className="w-14 h-14">
                            {isVideo(item?.logoURL) === false ? (
                              <NcImage
                                containerClassName="flex rounded-lg overflow-hidden z-0"
                                src={(item as any)?.logoURL}
                                isLocal={
                                  item?.fileType > FILE_TYPE.IMAGE
                                }
                                className="object-cover w-14 h-14"
                              />
                            ) : (
                              <VideoForPreview
                                src={(item as any)?.logoURL}
                                isLocal={
                                  item?.fileType > FILE_TYPE.IMAGE
                                }
                                nftId={item?._id}
                                className="object-cover rounded-lg overflow-hidden w-14 h-14"
                              />
                            )}
                          </div>
                          <span className="truncate">{item?.name}</span>
                        </div>
                        <div className="w-1/3 flex justify-end">
                          <PricesUnit
                            className="block group-hover:hidden truncate"
                            item={item}
                          />
                          <div
                            className="cursor-pointer hidden group-hover:block"
                            onClick={() => handleRemove(item?._id)}
                          >
                            <AiOutlineDelete size={22} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className={`shopping-cart ${
            isOpen ? "opacity-100 h-screen" : "opacity-0 h-0"
          }`}
        ></div>
      </div>
    </>
  );
};

export default ShoppingCart;