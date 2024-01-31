import { useEffect, useState } from "react";
import { xumm } from "utils/xummsdk";

const PaymentPayloadViewer = ({ payload }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [runtime, setRuntime] = useState();

  useEffect(() => {
    if (/Mobi/.test(navigator.userAgent)) {
      setIsMobile(true);
    }
    xumm.then((xummSDK) => {
      setRuntime((xummSDK as any).runtime);
    });
  }, []);

  /**
   * only when on a mobile webapp and the user is not in the xumm app
   * do we want to show the link to open the xumm app
   *
   * @param {*} uuid
   * @param {*} runtime
   */
  const handleSignPopup = async (uuid, runtime) => {
    if (isMobile && runtime.browser && !runtime.xapp) {
      window.location.href = `https://xumm.app/sign/${uuid}`;
    }
  };

  return (
    <>
      {payload && (
        <div className="flex flex-col">
          {payload.refs && payload.refs.qr_png && (
            <div className="flex flex-col w-full justify-center">
              <div className="text-white text-2xl font-mono w-full text-center flex justify-center">
                <img
                  className="w-96 rounded"
                  src={payload.refs.qr_png}
                  alt="qr_code"
                  loading="lazy"
                />
              </div>
              <div className="my-5 text-md text-center">
                Scan this QR with Xumm
              </div>
            </div>
          )}

          {payload.refs && isMobile && (
            <div
              onClick={() => handleSignPopup(payload.uuid, runtime)}
              className="btn-common bg-[#33ff00] text-white uppercase"
            >
              Sign in XUMM
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PaymentPayloadViewer;
