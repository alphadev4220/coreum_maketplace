import {createContext, useContext, useEffect, useState} from "react";
import {toast} from "react-toastify";
import axios from "axios";
import {CosmWasmClient, SigningCosmWasmClient,} from "@cosmjs/cosmwasm-stargate";
import {coin} from "@cosmjs/launchpad";

import {chainConfig, config, PLATFORM_NETWORKS} from "./config.js";
import {isEmpty} from "app/methods";
import {isDeliverTxFailure} from "@cosmjs/stargate";
import {convertDenomToMicroDenom, convertMicroDenomToDenom,} from "utils/utils";
import {useAppDispatch} from "../app/hooks.ts";
import {changeNetworkSymbol, changeWalletAddress,} from "./reducers/auth.reducers";

const getWalletProvider = (wallet_type) => {
  let provider = null;
  switch (wallet_type) {
    case "keplr":
      if (window.keplr) provider = window.keplr;
      break;
    case "leap":
      if (window.leap) provider = window.leap;
      break;
    case "cosmostation":
      if (window.cosmostation) provider = window.cosmostation.providers.keplr;
      break;
    default:
      break;
  }

  return provider;
};

const defaultFee = {
  amount: [],
  gas: "1000000",
};

const CosmwasmContext = createContext({});
export const useSigningClient = () => useContext(CosmwasmContext);

export const SigningCosmWasmProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [signingClient, setSigningClient] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [balances, setBalances] = useState({});
  const [isOpenFilter, setOpenFilter] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dispatch = useAppDispatch();

  const MARKETPLACE = config.MARKETPLACE;
  const CW20_CONTRACT = config.CW20_CONTRACT;

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  const loadClient = async () => {
    try {
      const temp = await CosmWasmClient.connect(config.RPC_URL);
      setClient(temp);
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const connectWallet = async (wallet_type, new_config = null) => {
    const provider = await getWalletProvider(wallet_type);
    let walletConfig = chainConfig;
    if (!isEmpty(new_config)) {
      walletConfig = new_config;
    }

    if (provider === null) {
      alert(`Please ${wallet_type} wallet to continue.`);
      switch (wallet_type) {
        case "keplr":
          window.open("https://www.keplr.app/", "_blank");
          break;
        case "leap":
          window.open("https://leapwallet.io/", "_blank");
          break;
        case "cosmostation":
          window.open("https://cosmostation.io/", "_blank");
          break;
        default:
          break;
      }

      return;
    } else {
      if (provider.experimentalSuggestChain) {
        try {
          await provider.experimentalSuggestChain(walletConfig);
        } catch (error) {
          console.log(error);
          toast.error("Please select a chain");
          return;
        }
      } else {
        toast.warn("Please use the recent version of wallet extension");
        return;
      }
    }

    try {
      await provider.enable(walletConfig.chainId);
    } catch (err) {
      console.log(err);
      return;
    }

    try {
      const offlineSigner = await provider.getOfflineSigner(
        walletConfig.chainId
      );
      const tempClient = await SigningCosmWasmClient.connectWithSigner(
        walletConfig.rpc,
        offlineSigner
      );
      setSigningClient(tempClient);

      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      setWalletAddress(address);
      dispatch(changeNetworkSymbol(PLATFORM_NETWORKS.COREUM));
      dispatch(changeWalletAddress(address));
      localStorage.setItem("address", address);
      localStorage.setItem("wallet_type", wallet_type);
    } catch (err) {
      console.log("Connect Wallet: ", err);
    }
  };

  const disconnect = () => {
    if (signingClient) {
      localStorage.removeItem("address");
      localStorage.removeItem("wallet_type");
      localStorage.removeItem("walletconnect");
      signingClient.disconnect();
    }
    setWalletAddress("");
    dispatch(changeNetworkSymbol(0));
    dispatch(changeWalletAddress(""));
    setSigningClient(null);
  };

  const fetchBalance = async () => {
    try {
      if (!walletAddress) return;
      const balanceList = {};
      const resp = await axios({
        method: "get",
        url: `${config.REST_URL}/bank/balances/${walletAddress}`,
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      });
      const result = resp.data.result;
      for (let i = 0; i < result.length; i++) {
        balanceList[result[i].denom] = result[i].amount;
      }
      if (client) {
        const resp2 = await client.queryContractSmart(config.CW20_CONTRACT, {
          balance: { address: walletAddress },
        });
        balanceList.cw20 = convertMicroDenomToDenom(resp2.balance);
      }
      setBalances(balanceList);
    } catch (error) {
      console.log("Blance error 2: ", error);
    }
  };

  const getTokenBalance = async (address) => {
    try {
      const resp = await signingClient.queryContractSmart(
        config.CW20_CONTRACT,
        {
          balance: {
            address: address,
          },
        }
      );
      setBalances({
        ...balances,
        cw20: convertMicroDenomToDenom(resp.balance),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getConfig = async () => {
    if (!client) return;
    try {
        return await client.queryContractSmart(MARKETPLACE, {
          config: {},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getOwnedCollections = async (address) => {
    if (!client) return;
    try {
        return await client.queryContractSmart(MARKETPLACE, {
          owned_collections: {owner: address},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const listCollections = async () => {
    if (!client) return;
    try {
        return await client.queryContractSmart(MARKETPLACE, {
          list_collections: {},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const collectionConfig = async (address) => {
    if (!client) return;
    if (address === undefined || address === "") return;
    try {
        return await client.queryContractSmart(address, {
          get_config: {},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const collection = async (id) => {
    if (!client) return;
    try {
        return await client.queryContractSmart(MARKETPLACE, {
          collection: {id: parseInt(id)},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const numOffers = async () => {
    if (!client) return;
    try {
      const result = await client.queryContractSmart(MARKETPLACE, {
        get_count: {},
      });
      return result.count;
    } catch (err) {
      console.log(err);
    }
  };

  const addCollection = async (
    owner,
    maxTokens,
    name,
    symbol,
    tokenCodeId,
    maximumRoyaltyFee,
    royalties,
    uri
  ) => {
    try {
      if (!signingClient) return -1;
      const result = await signingClient.execute(
        owner,
        MARKETPLACE,
        {
          add_collection: {
            owner: owner,
            max_tokens: maxTokens,
            name: name,
            symbol: symbol,
            token_code_id: tokenCodeId,
            maximum_royalty_fee: maximumRoyaltyFee,
            royalties: royalties,
            uri: uri,
            wallets: [{ address: owner, rate: 1000000 }],
          },
        },
        defaultFee,
        undefined,
        []
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const removeCollection = async (owner, id) => {
    try {
      if (!signingClient) return -1;
      const result = await signingClient.execute(
        owner,
        MARKETPLACE,
        {
          remove_collection: {
            id,
          },
        },
        defaultFee,
        undefined,
        []
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const applyTreasuryWallets = async (
    sender,
    collectionContract,
    treasuries
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        { set_payment_wallets: { wallets: treasuries } },
        defaultFee
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const batchMint = async (
    sender,
    collectionContract,
    uris,
    names,
    descList,
    imagePaths,
    logoPath,
    attributes
  ) => {
    if (!signingClient) return -1;
    try {
      let owners = [];
      const extension = [];
      for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < attributes[i].length; j++) {
          attributes[i][j].value = attributes[i][j].value.toString();
        }
      }

      for (let idx = 0; idx < uris.length; idx++) {
        owners.push(sender);
        extension.push({
          name: names[idx],
          description: descList[idx],
          external_url: logoPath[idx],
          image: imagePaths[idx],
          attributes: attributes[idx],
        });
      }

      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (uris.length / 100)).toString(),
      };

      const result = await signingClient.execute(
        sender,
        collectionContract,
        { batch_mint: { uri: uris, owner: owners, extension } },
        fee
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const batchMintAndPay = async (
    sender,
    collectionContract,
    uris,
    names,
    descList,
    paths,
    metas,
    price,
    fmint
  ) => {
    if (!signingClient) return -1;
    try {
      let owners = [];
      const extension = [];
      for (let idx = 0; idx < uris.length; idx++) {
        owners.push(sender);
        extension.push({
          name: names[idx],
          description: descList[idx],
          image: paths[idx],
          attributes: metas[idx],
        });
      }
      let result;
      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (uris.length / 100)).toString(),
      };
      if (!fmint) {
        result = await signingClient.execute(
          sender,
          collectionContract,
          {
            send_payment: {
              collection_addr: collectionContract,
              uri: uris,
              extension: extension,
              owner: owners,
            },
          },
          fee,
          undefined,
          [coin(convertDenomToMicroDenom(price), config.COIN_MINIMAL_DENOM)]
        );
      } else {
        let fee = {
          amount: [],
          gas: (500000 + 8000000 * (uris.length / 100)).toString(),
        };
        result = await signingClient.execute(
          sender,
          collectionContract,
          {
            batch_mint: {
              uri: uris,
              extension: extension,
              owner: owners,
            },
          },
          fee
        );
      }
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const mintNFT = async (
    sender,
    collectionContract,
    name,
    description,
    attributes,
    imagePath,
    previewPath,
    uri
  ) => {
    if (!signingClient) return -1;
    try {
      const extension = {
        name: name,
        description: description,
        image: imagePath,
        external_url: previewPath,
        attributes: attributes,
        timestamp: Date.now(),
      };
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          mint: {
            uri: uri,
            extension: extension,
          },
        },
        defaultFee
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const burnNFT = async (sender, cw721Address, token_id) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          burn: {
            token_id,
          },
        },
        defaultFee
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const bulkBurnNFT = async (sender, cw721Address, tokenIds) => {
    if (!signingClient) return -1;

    try {
      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (tokenIds.length / 100)).toString(),
      };
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          bulk_burn: {
            token_ids: tokenIds.map((item) => item.toString()),
          },
        },
        fee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const listNFT = async (
    sender,
    cw721Address,
    sale_type,
    duration_type,
    initial_price,
    reserve_price,
    denom,
    tokenId,
    targetContract
  ) => {
    try {
      if (!signingClient) return -1;
      initial_price = convertDenomToMicroDenom(initial_price);
      reserve_price = initial_price;
      const msg = {
        start_sale: {
          token_ids: [tokenId.toString()],
          sale_type,
          duration_type,
          initial_price,
          reserve_price,
          // denom: { cw20: config.CW20_CONTRACT },
          denom: denom,
        },
      };
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          send_nft: {
            contract: targetContract,
            token_id: tokenId.toString(),
            msg: btoa(JSON.stringify(msg)),
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const bulkListNFT = async (
    sender,
    cw721Address,
    sale_type,
    duration_type,
    initial_price,
    reserve_price,
    denom,
    tokenIds,
    collectionContract
  ) => {
    try {
      if (!signingClient) return -1;
      initial_price = convertDenomToMicroDenom(initial_price);
      reserve_price = initial_price;
      const token_ids = tokenIds.map((id) => id.toString());
      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (token_ids.length / 100)).toString(),
      };
      const msg = {
        start_sale: {
          token_ids,
          sale_type,
          duration_type,
          initial_price,
          reserve_price,
          // denom: { cw20: config.CW20_CONTRACT },
          denom: denom,
        },
      };
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          bulk_send_nft: {
            contract: collectionContract,
            token_ids: token_ids,
            msg: btoa(JSON.stringify(msg)),
          },
        },
        fee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const sendToken = async (sender, amount, token_id, collectionAddr) => {
    try {
      if (!signingClient) return -1;
      const msg = { propose: { token_id } };
      const result = await signingClient.execute(
        sender,
        CW20_CONTRACT,
        {
          send: {
            contract: collectionAddr,
            amount: convertDenomToMicroDenom(amount),
            msg: btoa(JSON.stringify(msg)),
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const bidNFT = async (
    sender,
    collectionContract,
    token_id,
    denom,
    amount
  ) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          propose: {
            token_id,
            denom,
          },
        },
        defaultFee,
        undefined,
        [coin(convertDenomToMicroDenom(amount), config.COIN_MINIMAL_DENOM)]
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const updateNFT = async (
    sender,
    collectionContract,
    token_id,
    sale_type,
    duration_type,
    initial_price,
    reserve_price,
    denom
  ) => {
    if (!signingClient) return -1;
    try {
      initial_price = convertDenomToMicroDenom(initial_price);
      reserve_price = initial_price;
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          edit_sale: {
            token_id,
            sale_type,
            duration_type,
            initial_price,
            reserve_price,
            denom,
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };
  const acceptSaleNFT = async (sender, collectionContract, token_id) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          accept_sale: {
            token_id,
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const cancelSaleNFT = async (sender, collectionContract, token_id) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          cancel_sale: {
            token_id,
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const bulkCancelSaleNFT = async (sender, collectionContract, tokenids) => {
    if (!signingClient) return -1;
    try {
      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (tokenids.length / 100)).toString(),
      };
      const result = await signingClient.execute(
        sender,
        collectionContract,
        {
          batch_delist: {
            token_ids: tokenids,
          },
        },
        fee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const transferNFT = async (sender, cw721Address, recipient, token_id) => {
    if (!signingClient) return -1;
    try {
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          transfer_nft: {
            recipient,
            token_id,
          },
        },
        defaultFee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const bulkTransferNFT = async (sender, cw721Address, recipient, tokenids) => {
    if (!signingClient) return -1;
    try {
      let fee = {
        amount: [],
        gas: (500000 + 8000000 * (tokenids.length / 100)).toString(),
      };
      const result = await signingClient.execute(
        sender,
        cw721Address,
        {
          bulk_transfer_nfts: {
            recipient: recipient,
            token_ids: tokenids.map((item) => item.toString()),
          },
        },
        fee,
        undefined
      );
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  };

  const batchMintForHomies = async (
    sender,
    collectionContract,
    uris,
    names,
    price,
    fmint
  ) => {
    if (!signingClient || !sender) {
      console.error("stargateClient undefined or address undefined.");
      return -1;
    }
    try {
      let owners = [];
      for (let idx = 0; idx < uris.length; idx++) owners.push(sender);
      const extension = [];
      let result;
      names.map((name) => {
        extension.push({
          name,
        });
      });
      if (!fmint) {
        result = await signingClient.execute(
          sender,
          "core19ezpe7tvtua0vjq05cfewczuyjqa2fk9sle7g8cpj6fx5vr9munqg4pghc",
          {
            send_payment: {
              collection_addr: collectionContract,
              uri: uris,
              extension: extension,
              owner: owners,
            },
          },
          defaultFee,
          undefined,
          [coin(convertDenomToMicroDenom(price), config.COIN_MINIMAL_DENOM)]
        );
      } else {
        result = await signingClient.execute(
          sender,
          collectionContract,
          {
            batch_mint: {
              uri: uris,
              extension: extension,
              owner: owners,
            },
          },
          defaultFee
        );
      }
      if (isDeliverTxFailure(result)) {
        return -1;
      } else {
        return result.transactionHash;
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <CosmwasmContext.Provider
      value={{
        walletAddress,
        client,
        balances,
        signingClient,
        isOpenFilter,
        cartCount,
        setOpenFilter,
        setCartCount,
        loadClient,
        connectWallet,
        disconnect,
        fetchBalance,
        getTokenBalance,
        getConfig,
        getOwnedCollections,
        listCollections,
        collection,
        removeCollection,
        numOffers,
        addCollection,
        mintNFT,
        burnNFT,
        listNFT,
        sendToken,
        bidNFT,
        acceptSaleNFT,
        cancelSaleNFT,
        transferNFT,
        updateNFT,
        collectionConfig,
        batchMint,
        batchMintAndPay,
        applyTreasuryWallets,
        bulkListNFT,
        bulkCancelSaleNFT,
        bulkBurnNFT,
        bulkTransferNFT,
        batchMintForHomies,
      }}
    >
      {children}
    </CosmwasmContext.Provider>
  );
};
