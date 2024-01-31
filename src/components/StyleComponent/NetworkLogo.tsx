import { NETWORK_ITEMS} from "app/config";

const NetworkLogo = ({ networkSymbol = 0, className = "" }) => {
  return (
    <div className={`${className} min-w-[32px]`}>
      <div className="flex justify-center items-center">
        <img
          src={`${NETWORK_ITEMS.find((item) =>item.network === networkSymbol).icon}`}
          className="w-[32px] h-[32px]"
          width={30}
          height={30}
          alt=""
          loading="lazy"
        ></img>
      </div>

    </div>
  );
};

export default NetworkLogo;
