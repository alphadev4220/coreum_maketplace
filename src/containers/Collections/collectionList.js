import { useEffect, useState } from "react";
import styles from "./Profile.module.sass";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import cn from "classnames";
import ButtonPrimary from "components/Button/ButtonPrimary";
import {
  changeCollectionList,
  selectConllectionList,
} from "app/reducers/collection.reducers";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
} from "app/reducers/auth.reducers";
import CollectionCard from "components/Card/CollectionCard";
import { useSigningClient } from "app/cosmwasm";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import { getCollectionList, removeOne } from "app/api/collections";
import MainSection from "components/Section/MainSection";

const CollectionList = () => {
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const currentUsr = useAppSelector(selectCurrentUser);
  const collections = useAppSelector(selectConllectionList);
  const { removeCollection } = useSigningClient();
  const dispatch = useAppDispatch();
  const history = useNavigate();
  const [working, setWorking] = useState(false);

  const fetchCollections = async (limit, currentUserId) => {
    setWorking(true);
    try {
      const response = await getCollectionList(
        limit,
        currentUserId,
        currentNetworkSymbol
      );
      const colData = response.data || [];
      dispatch(changeCollectionList(colData));
    } catch (err) {
      console.log(err);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    fetchCollections(90, currentUsr._id);
  }, [currentUsr._id]);

  const createNewCollection = () => {
    history("/createCollection");
  };

  const handleRemove = (_id, collectionNumber) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "Do you want to remove the collection?",
      showCancelButton: true,
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      setWorking(true);
      try {
        const resp = await removeCollection(
          currentUsr?.address,
          collectionNumber
        );
        if (resp !== -1) {
          await removeOne(_id);
          fetchCollections(90, currentUsr._id);
          setWorking(false);
          toast.success("Successfully removed the collection");
        }
      } catch (err) {
        setWorking(false);
        console.log(err);
      }
    });
  };

  return (
    <MainSection title="My Collections">
      <div className="container">
        <div style={{ paddingTop: "3rem", paddingRight: "5rem" }}>
          <h1>My Collections</h1>
        </div>
        <div
          style={{
            margin: "1rem",
          }}
        >
          <ButtonPrimary
            className={cn("button-stroke button-small", styles.btns)}
            onClick={() => createNewCollection()}
          >
            <span>Create a collection</span>
          </ButtonPrimary>
        </div>
        {collections !== undefined && collections !== null && (
          <div
            id="sliderWrapper"
            className={styles.list}
            style={{ minHeight: "calc(100vh - 500px)" }}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {collections && collections.length > 0
                ? collections.map((x, index) => (
                    <CollectionCard
                      className={styles.card}
                      collection={x}
                      key={"collectoinCard" + index}
                      onRemove={handleRemove}
                    />
                  ))
                : null}
            </div>
          </div>
        )}
        <div style={{ marginBottom: "5rem" }}>
          <span>&nbsp;&nbsp;</span>
        </div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </MainSection>
  );
};

export default CollectionList;
