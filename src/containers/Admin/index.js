import { useEffect, useState } from "react";
import styled from "styled-components";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { config } from "app/config.js";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import { Tab } from "@headlessui/react";
import { TbMoodEmpty } from "react-icons/tb";
import { getShortAddress } from "app/methods";
import { useNavigate } from "react-router-dom";
import { Backdrop, Checkbox, CircularProgress } from "@mui/material";
import { getCollections, getUsers } from "app/api/admin";
import { registerLaunch } from "app/api/collections";
import MainSection from "components/Section/MainSection";

var socket = io(`${config.socketUrl}`);

const Styles = styled.div`
  display: flex;
  padding: 10px;
  flex-direction: column;
  align-items: center;
  div {
    display: flex;
    justify-content: center;
  }

  table {
    margin-top: 20px;
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      text-align: center;
      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

const Admin = () => {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [itemsByPage, setItemsByPage] = useState(10);
  const [itemList, setItemList] = useState([]);
  const [searchType, setSearchType] = useState(0);
  const [keyword, setKeyword] = useState("");

  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionCount, setCollectionCount] = useState(1);
  const [collectionsByPage, setCollectionsByPage] = useState(10);
  const [collectionList, setCollectionList] = useState([]);
  const [launchState, setLaunchState] = useState([]);
  const [collectionKeyword, setCollectionKeyword] = useState("");
  const [processing, setProcessing] = useState(false);

  const TABS = ["Launchpad"];
  const navigate = useNavigate();

  const handleChange = (event, value) => {
    setPage(value);
  };
  const handleCollectionChange = (event, value) => {
    setCollectionPage(value);
  };

  const getUserList = async () => {
    setProcessing(true);
    try {
      const response = await getUsers(page, itemsByPage, keyword, searchType);
      setItemList(response.data);
      setCount(Math.ceil(response.count / itemsByPage));
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getCollectionList = async () => {
    setProcessing(true);
    try {
      var response = await getCollections(
        collectionPage,
        collectionsByPage,
        collectionKeyword
      );
      setCollectionList(response.data);
      var stateList = [];
      response.data.map((item) => {
        if (item.launchstate !== 2) stateList.push(false);
        else stateList.push(true);
      });
      setLaunchState(stateList);
      setCollectionCount(Math.ceil(response.count / collectionsByPage));
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const changeStatus = async () => {
    socket.emit("UpdateStatus", { type: "UPDATE_USER_AUTH" });
  };

  const changeLaunchState = async (index) => {
    setProcessing(true);

    var item = collectionList[index];
    var status = 0;
    if (launchState[index] === true) {
      status = 1;
    } else {
      status = 2;
    }

    try {
      const result = await registerLaunch(item._id, status);
      if (result.code === 0) {
        getCollectionList();
      } else {
        console.log("Error:", result.message);
      }
    } catch (error) {
      console.log("Error:", error);
    }
    setProcessing(false);
  };

  useEffect(() => {
    getUserList();
    setItemsByPage(10);
  }, [page]);

  useEffect(() => {
    getCollectionList();
    setCollectionsByPage(10);
  }, [collectionPage]);

  const renderLaunchpad = () =>
    collectionList.length !== 0 ? (
      <Styles>
        <div className="h-[100%]">
          <TextField
            id="outlined-basic"
            label="Collection Address"
            variant="outlined"
            sx={{
              minWidth: 300,
              backgroundColor: "transparent",
              verticalAlign: "center",
            }}
            onChange={() => {}}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setCollectionKeyword(event.target.value);
                getCollectionList();
              }
            }}
          />
          <Button variant="outlined" onClick={getUserList}>
            SEARCH
          </Button>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Address</th>
              <th>MintStartDate</th>
              <th>MintFinishDate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collectionList &&
              collectionList.length > 0 &&
              collectionList.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{(page - 1) * itemsByPage + index + 1}</td>
                    <td>{row.name}</td>
                    <td
                      onClick={() => {
                        navigate(`/launchpad/${row._id}`);
                      }}
                      className="cursor-pointer"
                    >
                      {getShortAddress(row.address)}
                    </td>
                    <td>
                      {new Date(
                        row.mintStartDate || Date.now()
                      )?.toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(
                        row.mintFinishDate || Date.now()
                      )?.toLocaleDateString()}
                    </td>
                    <td>
                      <Checkbox
                        checked={launchState[index]}
                        onChange={() => {
                          changeLaunchState(index);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <Stack spacing={2} className="mt-4">
          <Pagination
            count={collectionCount}
            page={collectionPage}
            onChange={handleCollectionChange}
          />
        </Stack>
      </Styles>
    ) : (
      <div className="flex w-full h-[300px]  gap-4 text-gray-400 items-center justify-center">
        <TbMoodEmpty size={22}></TbMoodEmpty>
        No Launchpad Collections
      </div>
    );

  const renderAccounts = () => (
    <Styles>
      <div>
        <Box sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Search Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={searchType}
              label="Search Type"
              onChange={(event) => {
                setSearchType(event.target.value);
              }}
            >
              <MenuItem value={0}>Username</MenuItem>
              <MenuItem value={1}>Wallet Address</MenuItem>
              <MenuItem value={2}>Social</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TextField
          id="outlined-basic"
          label="Input"
          variant="outlined"
          sx={{ minWidth: 300 }}
          onChange={(event) => {
            setKeyword(event.target.value);
            getUserList();
          }}
        />
        <Button variant="outlined" onClick={getUserList}>
          SEARCH
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Username</th>
            <th>Wallet Address</th>
            <th>Social</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {itemList &&
            itemList.length > 0 &&
            itemList.map((row, index) => {
              return (
                <tr key={index}>
                  <td>{(page - 1) * itemsByPage + index + 1}</td>
                  <td>{row.username}</td>
                  <td>{row.address}</td>
                  <td>{row.socials}</td>
                  <td>
                    <Checkbox
                      checked={row.verified}
                      onChange={(event) => {
                        changeStatus(event, index);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <Stack spacing={2}>
        <Pagination count={count} page={page} onChange={handleChange} />
      </Stack>
    </Styles>
  );
  const renderTabItem = (item) => {
    switch (item) {
      case "Verified Account":
        return renderAccounts();

      case "Launchpad":
        return renderLaunchpad();

      default:
        return null;
    }
  };

  return (
    <MainSection title="AdminPage">
      <div className="sm:px-0 flex flex-col justify-between">
        <Tab.Group>
          <Tab.List className="flex justify-start pd-1 space-x-2.5 rounded-full bordedr border-neutral-300 dark:border-neutral-500 px-2">
            {TABS.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `px-3.5 sm:px-8 py-1.5 sm:py-2 text-xs sm:text-sm leading-5 font-medium rounded-full focus:outline-none focus:ring-2 ring-primary-300 ${
                    selected
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4" style={{ minHeight: "60vh" }}>
            {TABS.map((tab, idx) => (
              <Tab.Panel
                key={"adminLaunchPad" + idx}
                className="flex align-items-center justify-center"
              >
                {renderTabItem(tab, idx)}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={processing}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      </div>
    </MainSection>
  );
};

export default Admin;
