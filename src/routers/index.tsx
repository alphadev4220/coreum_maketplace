import { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Page } from "./types";
import ScrollToTop from "./ScrollToTop";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Footer from "components/HeaderFooter/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "app/config";

import { SigningCosmWasmProvider } from "../app/cosmwasm.js";
import HeaderLogged from "components/HeaderFooter/HeaderLogged";
import { Backdrop, CircularProgress } from "@mui/material";
import { FaAngleUp } from "react-icons/fa";
import EmptyPage from "containers/EmptyPage";

const PageHome = lazy(() => import("containers/PageHome/PageHome"));
const PageUploadItem = lazy(() => import("containers/PageUploadItem"));
const PageUploadMultipleItem = lazy(
  () => import("containers/PageUploadMultipleItem")
);
const DetailNFT = lazy(() => import("containers/NftDetailPage/DetailNFT"));
const PageSearch = lazy(() => import("containers/PageSearch"));
const AuthorPage = lazy(() => import("containers/AuthorPage/AuthorPage"));
const AccountPage = lazy(() => import("containers/AccountPage/AccountPage"));
const UploadVariants = lazy(() => import("containers/UploadVariants"));
const PageMessage = lazy(() => import("containers/PageMessage/PageMessage"));
const Admin = lazy(() => import("containers/Admin"));
const CollectionList = lazy(
  () => import("containers/Collections/collectionList")
);
const ItemsOfCollection = lazy(
  () => import("containers/Collections/ItemsOfCollection")
);
const CreateCollection = lazy(
  () => import("containers/Collections/createCollection")
);
const EditCollection = lazy(
  () => import("containers/Collections/editCollection")
);
const Activity = lazy(() => import("containers/Activity"));
const PageFAQ = lazy(() => import("containers/FaqPage/FAQ"));
const PageLaunchPad = lazy(() => import("containers/LaunchPad/launchpadpage"));
const LaunchPadSetting = lazy(
  () => import("containers/LaunchPad/launchpadSetting")
);
const LaunchPadHome = lazy(
  () => import("containers/LaunchPad/launchpadhomepage")
);

export const pages: Page[] = [
  { path: "/", component: PageHome },
  { path: "/#", component: PageHome },
  { path: "/upload-single", component: PageUploadItem },
  { path: "/upload-multiple", component: PageUploadMultipleItem },
  { path: "/nft-detail/:tokenId", component: DetailNFT },
  { path: "/page-search", component: PageSearch },
  { path: "/page-author/:userId", component: AuthorPage },
  { path: "/account", component: AccountPage },
  { path: "/page-upload-item", component: UploadVariants },
  { path: "/message/:userId", component: PageMessage },
  { path: "/message", component: PageMessage },
  { path: "/admin", component: Admin },
  { path: "/collectionList", component: CollectionList },
  { path: "/collectionItems/:collectionId", component: ItemsOfCollection },
  { path: "/createCollection", component: CreateCollection },
  { path: "/editCollection/:collectionId", component: EditCollection },
  { path: "/activity", component: Activity },
  { path: "/faq", component: PageFAQ },
  { path: "/launchpad/:collectionId", component: PageLaunchPad },
  { path: "/launchpadSetting/:collectionId", component: LaunchPadSetting },
  { path: "/launchpad", component: LaunchPadHome },
];

const MyRoutes = ({ mode }) => {
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiCheckbox: {
            styleOverrides: {
              root: {
                color: mode === "dark" ? "white" : "black",
              },
            },
          },
        },
      }),
    [mode]
  );

  const fetchData = async () => {
    try {
      const resp = await axios.get(`${config.API_URL}api/collection/search`);
      setCollections(resp.data.collections);
      setItems(resp.data.items);
      setUsers(resp.data.usersData);
    } catch (err) {
      console.log("Error Search Items: ", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <BrowserRouter>
      <SigningCosmWasmProvider>
        <ThemeProvider theme={theme}>
          <ScrollToTop />
          <HeaderLogged collections={collections} items={items} users={users} />
          <Suspense
            fallback={
              <div>
                <div
                  style={{
                    height: "70vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                ></div>
                <Backdrop
                  sx={{
                    color: "#ffffff3f",
                    backgroundColor: "#000000cc",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                  }}
                  open={true}
                >
                  <CircularProgress color="inherit" />
                </Backdrop>
              </div>
            }
          >
            <Routes>
              {pages.map(({ component: Component, path }) => (
                <Route key={path} element={<Component />} path={path} />
              ))}
              <Route path="*" element={<EmptyPage />} />
            </Routes>
          </Suspense>
          <Footer />
          <FaAngleUp
            className="icon-position icon-style"
            onClick={onClickScrollTop}
          ></FaAngleUp>
        </ThemeProvider>
      </SigningCosmWasmProvider>
    </BrowserRouter>
  );
};

export default MyRoutes;
