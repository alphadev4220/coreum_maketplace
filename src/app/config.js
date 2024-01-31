const devnet = false;
const useTestBackend = false;

export const config = {
  bunnyURL: "https://storage.bunnycdn.com/ ",
  // ipfsGateway: "https://cloudflare-ipfs.com/ipfs/",
  ipfsGateway: "https://nftstorage.b-cdn.net/ipfs/",
  socketUrl: useTestBackend
    ? "https://test.rize2day.com"
    : "https://rizenfts.com",
  baseUrl: useTestBackend
    ? "https://test.rize2day.com/api/"
    : "https://rizenfts.com/api/",
  API_URL: useTestBackend ? "https://test.rize2day.com/" : "https://rize2day.com/",
  UPLOAD_URL: "https://rize2day.b-cdn.net/",
  RPC_URL: devnet
    ? "https://rizenfts.com/cosmwasm/"
    : "https://rizenfts.com/cosmwasm/", //'https://rpc-test.coreum.hexskrt.net/',
  REST_URL: devnet
    ? "https://rizenfts.com/cosmwasm-rest/"
    : // : "https://full-node.mainnet-1.coreum.dev:1317/",
      "https://rizenfts.com/rest",
  DATA_LAYER: devnet ? "" : "",
  FAUCET_URL: "",
  CHAIN_ID: devnet ? "coreum-devnet-1" : "coreum-mainnet-1",
  CHAIN_NAME: devnet ? "Coreum Devnet 1" : "Coreum Mainnet",
  COIN_DENOM: devnet ? "DCORE" : "CORE",
  COIN_MINIMAL_DENOM: devnet ? "ducore" : "ucore",
  COIN_TYPE: devnet ? 990 : 990,
  COIN_DECIMALS: 6,
  COIN_GECKOID: devnet ? "coreum" : "coreum",
  PREFIX: devnet ? "devcore" : "core",
  AVG_GAS_STEP: 0.005,
  MAXIMUM_UPLOAD: 2000,

  MARKETPLACE: devnet
    ? "devcore1xryveqc63z0l2q6h4a3h0c02ftscwdlm0f2elhngczgau9lefpmqzn69lq"
    : "core1m9gwwnd02kan9948mc5twpk6k5k3gg336pt4esqy4a2gnuj35dfsule5kq",
  CW721_CONTRACT: "devcore...",
  CW721_OWNER: "devcore...",
  CW20_CONTRACT: devnet
    ? "devcore143gjvxqvea69v0hqp2p6wtz386hhgdn06uw7xntyhleahaunjkqs0jx6pc"
    : "core1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3slwumn4",
  COLLECTION_CODE_ID: devnet ? 42 : 31,
  CW721_CODE_ID: devnet ? 41 : 75, //4,
  COINGECKO_URL: "https://api.coingecko.com/api/v3",
};

export const NFT_STORAGE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI2Q2U5NjQyNWZCM2E4QjhFNUEyQzY2OEUzNDBmYjQ5MURiYzYzQUEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2OTIzOTUzMzcxMiwibmFtZSI6IkNvcmUgRGV2IFNvbG8ifQ.426t9cdEGL2D1092izAXfvjT1KveOGC-rjN-oGczB4k";
export const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxYTY2NTdhMi1jYmYzLTQzOGEtODI4Yy02ZTg1Y2U3MzBiNmUiLCJlbWFpbCI6InN1cHBvcnRAcml6ZTJkYXkuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjFkZWUxYTYzMDAwMzA3NTUyYjEyIiwic2NvcGVkS2V5U2VjcmV0IjoiYzMwNjg5YjViM2U1MmM1MTFlYTc5ZGRkODdhNmExODJlNzUyMWY1ZTRmMTA5ZjU5OTMxMTg0Mzk3OGY0YmUwNiIsImlhdCI6MTY3ODI3NTIxN30.N4WqxO0FsBz_m-zsAlbVzN2ZoXktiTFisFHXtgyDw38";

export const RIZE_ADDRESS = "core1vjqlhj9ec4yuf93xmggfc4n9nl522y7mteh483";
export const MY_ADDRESS = "core195ply22yw08edsk5342ajhz6gn6rn5s5667yu6";
export const RIZE_ADDRESS_ID = "642a7bb1af1d742e5f0a1c60";
export const ADMIN_ADDRESS_ID = "643cf0d37c81d21a1c351d4a";
export const chainConfig = {
  chainId: config.CHAIN_ID,
  chainName: config.CHAIN_NAME,
  rpc: config.RPC_URL,
  rest: config.REST_URL,
  stakeCurrency: {
    coinDenom: config.COIN_DENOM,
    coinMinimalDenom: config.COIN_MINIMAL_DENOM,
    coinDecimals: config.COIN_DECIMALS,
    coinGeckoId: config.COIN_GECKOID,
  },
  bip44: {
    coinType: config.COIN_TYPE,
  },
  bech32Config: {
    bech32PrefixAccAddr: `${config.PREFIX}`,
    bech32PrefixAccPub: `${config.PREFIX}pub`,
    bech32PrefixValAddr: `${config.PREFIX}valoper`,
    bech32PrefixValPub: `${config.PREFIX}valoperpub`,
    bech32PrefixConsAddr: `${config.PREFIX}valcons`,
    bech32PrefixConsPub: `${config.PREFIX}valconspub`,
  },
  currencies: [
    {
      coinDenom: config.COIN_DENOM,
      coinMinimalDenom: config.COIN_MINIMAL_DENOM,
      coinDecimals: config.COIN_DECIMALS,
      coinGeckoId: config.COIN_GECKOID,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: config.COIN_DENOM,
      coinMinimalDenom: config.COIN_MINIMAL_DENOM,
      coinDecimals: config.COIN_DECIMALS,
      coinGeckoId: config.COIN_GECKOID,
      gasPriceStep: {
        low: 0.0625,
        average: 0.1,
        high: 62.5,
      },
      features: ["cosmwasm"],
    },
  ],
  gasPriceStep: {
    low: 0.0625,
    average: 0.1,
    high: 62.5,
  },
  features: ["cosmwasm"],
  // coinType: config.COIN_TYPE,
  beta: true,
};

export const xummConfig = {
  name: "Rize2Day",
  env: "production",
  xrplRPC: "https://s1.ripple.com",
  AppId: useTestBackend
    ? "aad1b88d-6bf0-43a4-b7c7-c29e399c1537"
    : "37513572-bd7f-4945-9552-a359bd0dcea4",
  AdminAdress: "r3Z6HovoCY9oKcdcbbnis7GBPdh6kyvGhE",
  decimalOfXRP: 6,
  BrokerFee: 25, //25 means 2.5%,
};

export const PLATFORM_NETWORKS = {
  COREUM: 1,
  ETHEREUM: 2,
  BSC: 3,
  POLYGON: 4,
  AVALANCHE: 5,
  XRPL: 6,
  NEAR: 7,
  COSMOS: 8,
  SOLANA: 9,
  HEDERA: 10,
  TEZOS: 11,
};

export const FILE_TYPE = {
  ALL: 0,
  IMAGE: 1,
  AUDIO: 2,
  VIDEO: 3,
  THREED: 4,
};
export const NETWORK_ITEMS = [
  {
    network: PLATFORM_NETWORKS.COREUM,
    label: "Coreum",
    icon: "/images/icons/core.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.ETHEREUM,
    label: "Ethereum",
    icon: "/images/icons/eth.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.BSC,
    label: "BSC",
    icon: "/images/icons/bsc.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.POLYGON,
    label: "Polygon",
    icon: "/images/icons/polygon.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.AVALANCHE,
    label: "Avalanche",
    icon: "/images/icons/avax.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.XRPL,
    label: "XRPL",
    icon: "/images/icons/xrp2.png",
    isDisabled: false,
  },
  {
    network: PLATFORM_NETWORKS.NEAR,
    label: "Near",
    icon: "/images/icons/near.png",
    isDisabled: true,
  },
  {
    network: PLATFORM_NETWORKS.COSMOS,
    label: "Cosmos",
    icon: "/images/icons/atom.png",
    isDisabled: true,
  },
  {
    network: PLATFORM_NETWORKS.SOLANA,
    label: "Solana",
    icon: "/images/icons/solana.png",
    isDisabled: true,
  },
  {
    network: PLATFORM_NETWORKS.HEDERA,
    label: "Hedera",
    icon: "/images/icons/hedera.png",
    isDisabled: true,
  },
  {
    network: PLATFORM_NETWORKS.TEZOS,
    label: "Tezos",
    icon: "/images/icons/tezos.png",
    isDisabled: true,
  },
];

export const COREUM_PAYMENT_COINS = {
  CORE: 0,
  RIZE: 1,
};
export const MINTING_PRICE_LIST = {
  [PLATFORM_NETWORKS.COREUM]: {
    PRICE: 1,
    // TREASURY_WALLET: "core1utss0qnda5q2a0z9jzsnmvsnngw6yjerzgjjcq",
    TREASURY_WALLET: "core1xpda8kryemwvzfq2c046ukn86x3ltgm5yg98a0",
  },
  [PLATFORM_NETWORKS.ETHEREUM]: {
    price: 0.05,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.BSC]: {
    price: 0.1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.POLYGON]: {
    price: 1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
  [PLATFORM_NETWORKS.AVALANCHE]: {
    price: 1,
    TREASURY_WALLET: "0x84361F0e0fC4B4eA94B137dB7EF69537a19aCb69",
  },
};
export const MINTING_TREASURY_WALLET = "";

export const COMPENSATION_ARRAY = [
  "core1xle6485jdpazywlxpxxtq29396d2ckhxf70wwr",
  "core1nxvwy3cntrlmnh9l56v2hu5vw0yde88u9a7mk5",
  "core1dmxna33azqkefvlkfdyz2h2cztcpzwv0nmwyrp",
  "core1a74he4phcxnr5wp0pjyj094xlskggczdev5y6j",
  "core195ply22yw08edsk5342ajhz6gn6rn5s5667yu6",
];

export const CATEGORIES = [
  { value: 1, text: "Arts" },
  { value: 2, text: "Games" },
  { value: 3, text: "Sports" },
  { value: 4, text: "Photography" },
  { value: 5, text: "Utility" },
];

export const PROPERTY_TYPES = [
  { value: 1, text: "string" },
  { value: 2, text: "boolean" },
  { value: 3, text: "number" },
  { value: 4, text: "textarea" },
];

export const PROFILE_TABS = {
  ALLNFTS: 0,
  LIKED: 1,
  FOLLOWING: 2,
  FOLLOWERS: 3,
  COLLECTIONS: 4,
  INWALLETNFTS: 5,
  TRANSFER: 6,
};

export const INFURA_KEY = "1b4c44fdf5a0404b91ee1a85db0aed9a";

export const ipfsUrl = "https://ipfs.infura.io/ipfs/";
export const platformContractAbi = require("../InteractWithSmartContract/RizeNFTFactory.json");
export const nftContractAbi = require("../InteractWithSmartContract/nftContract-abi.json");

export const RPC_URLs = {
  1: "https://rpc.ankr.com/eth",
  56: "https://bsc-dataseed1.binance.org/",
  137: "https://polygon-rpc.com/",
  43114: "https://avalanche-c-chain.publicnode.com",
  421613: "https://goerli-rollup.arbitrum.io/rpc",
  97: "https://data-seed-prebsc-1-s2.binance.org:8545/",
  80001: "https://matic-mumbai.chainstacklabs.com",
  43113: "https://api.avax-test.network/ext/bc/C/rpc",
  "coreum-mainnet-1": "https://rize2day.com/cosmwasm",
};

export const EVM_MAINNETS_LIST = {
  [PLATFORM_NETWORKS.XRPL]: {
    name: "XRPL mainnet",
    id: 9999,
    currency: "XRP",
    blockScanUrl: "https://livenet.xrpl.org/transactions/",
  },
  [PLATFORM_NETWORKS.COREUM]: {
    name: "Coreum mainnet",
    id: 88888,
    currency: "CORE",
    blockScanUrl: "https://explorer.coreum.com/coreum/transactions/",
  },
  [PLATFORM_NETWORKS.ETHEREUM]: {
    name: "Ethereum Mainnet",
    id: 1,
    rpcURL: "https://rpc.ankr.com/eth",
    currency: "ETH",
    platformContractAddress: "0xc589c0f6e997f64D1710F1B8e2D7585a5Cc9b6c8",
    nftContractAddress: "0x5d3a24D949CaEcA51680A26B040F2a5Ed23A8772",
    blockScanUrl: "https://etherscan.io/tx/",
    gasPriceCandidate: {
      low: 25000000000,
      medium: 26000000000,
      high: 30000000000,
    },
  },
  [PLATFORM_NETWORKS.BSC]: {
    name: "BNB Smart Chain Mainnet",
    id: 56,
    rpcURL: "https://bsc-dataseed1.binance.org/",
    currency: "BNB",
    platformContractAddress: "0xc589c0f6e997f64D1710F1B8e2D7585a5Cc9b6c8",
    nftContractAddress: "0x5d3a24D949CaEcA51680A26B040F2a5Ed23A8772",
    blockScanUrl: "https://bscscan.com/tx/",
    gasPriceCandidate: {
      low: 5000000000,
      medium: 5100000000,
      high: 5200000000,
    },
  },
  [PLATFORM_NETWORKS.POLYGON]: {
    name: "Polygon Mainnet",
    id: 137,
    rpcURL: "https://polygon-rpc.com/",
    currency: "MATIC",
    platformContractAddress: "0xc589c0f6e997f64D1710F1B8e2D7585a5Cc9b6c8",
    nftContractAddress: "0x5d3a24D949CaEcA51680A26B040F2a5Ed23A8772",
    blockScanUrl: "https://polygonscan.com/tx/",
    gasPriceCandidate: {
      low: 70000000000,
      medium: 86000000000,
      high: 94000000000,
    },
  },
  [PLATFORM_NETWORKS.AVALANCHE]: {
    name: "Avalanche Network C-Chain",
    id: 43114,
    rpcURL: "https://avalanche-c-chain.publicnode.com",
    currency: "AVAX",
    platformContractAddress: "0xc589c0f6e997f64D1710F1B8e2D7585a5Cc9b6c8",
    nftContractAddress: "0x5d3a24D949CaEcA51680A26B040F2a5Ed23A8772",
    blockScanUrl: "https://snowtrace.io/tx/",
    gasPriceCandidate: {
      low: 27000000000,
      medium: 28000000000,
      high: 29000000000,
    },
  },
};

export const EVM_TESTNETS_LIST = {
  [PLATFORM_NETWORKS.XRPL]: {
    name: "XRPL testnet",
    id: 9999,
    currency: "XRP",
    blockScanUrl: "https://testnet.xrpl.org/transactions/",
  },
  [PLATFORM_NETWORKS.COREUM]: {
    name: "Coreum mainnet",
    id: 99999,
    currency: "CORE",
    blockScanUrl: "https://explorer.testnet-1.coreum.dev/coreum/transactions/",
  },
  [PLATFORM_NETWORKS.ETHEREUM]: {
    name: "Arbitrum Goerli Testnet",
    id: 421613,
    rpcURL: "https://goerli-rollup.arbitrum.io/rpc",
    currency: "ETH",
    platformContractAddress: "0x4b5626425A62458aa1A5256c75bF678B5e90C2bA",
    nftContractAddress: "0xCA091f771124dF584620af06C43ddF49e0BB502D",
    blockScanUrl: "https://goerli.arbiscan.io/tx/",
    gasPriceCandidate: {
      low: 25000000000,
      medium: 26000000000,
      high: 30000000000,
    },
  },
  [PLATFORM_NETWORKS.BSC]: {
    name: "Binance test network",
    id: 97,
    rpcURL: "https://data-seed-prebsc-1-s2.binance.org:8545/",
    currency: "tBNB",
    platformContractAddress: "0x80f164614Eaf18Ef7C26a0493fA5f7704fC28872",
    nftContractAddress: "0xE94D4b4B35D36a2312D0849F19a15206c0a60BF7",
    blockScanUrl: "https://testnet.bscscan.com/tx/",
    gasPriceCandidate: {
      low: 5000000000,
      medium: 5100000000,
      high: 5200000000,
    },
  },
  [PLATFORM_NETWORKS.POLYGON]: {
    name: "Mumbai",
    id: 80001,
    rpcURL: "https://matic-mumbai.chainstacklabs.com",
    currency: "MATIC",
    platformContractAddress: "0xd74D56EF5d3FA684C82C02bBd0E23200698eB207",
    nftContractAddress: "0x49ce808C1F91910CCF9f570E23353e997AaEF6D2",
    blockScanUrl: "https://mumbai.polygonscan.com/tx/",
    gasPriceCandidate: {
      low: 70000000000,
      medium: 86000000000,
      high: 94000000000,
    },
  },
  [PLATFORM_NETWORKS.AVALANCHE]: {
    name: "Avalanche Testnet",
    id: 43113,
    rpcURL: "https://api.avax-test.network/ext/bc/C/rpc",
    currency: "AVAX",
    platformContractAddress: "0x041B30E3AF9b2108f38aFCBa6d976d132B8D690C",
    nftContractAddress: "0x9d4EB3F30854cA4B46554313611F110E57104e9C",
    blockScanUrl: "https://testnet.snowtrace.io/tx/",
    gasPriceCandidate: {
      low: 27000000000,
      medium: 28000000000,
      high: 29000000000,
    },
  },
};

export const RIZE_MEMBER_NFTS = {
  LAYER1: [
    "QmSyruFkgTnaRGx47sTTN7yh7eiu5TZCB5TJg7kUAxDXAE",
    "QmcZo6uh32NxnTFuVzLwchWyVUo2z9aziDPYNEetj1dwR9",
    "QmdW9EEZKwQho3PJ1yXarhFC4J2jeDwhC84tjJdh62Vfav",
    "QmdfGsxc7zaiZ6pJFz37d9uB2V3k1P73euKLRr9YHRxvFb",
    "QmW49RS77UR52gKAkk5k9dFyPBR5dLGV5P9dn79s7GmFzs",
    "QmetedrJMJaybyBEAAaxRhyWYxH9hDdHEzew3Smz2qH2YB",
    "QmbQBQMmA36m2mqNxCE2hGbhDZsZT7UAQc8gQn7g69FRqH",
    "QmPPQ2TDuA2en4AkQTfyQhiK1u7ynrxR4hVXKv7umCVd8t",
    "QmSN8cABRggUnMEi4TsiER2DuYNymnMACAmPf4pHBQiYed",
    "QmatSYW7bc55BbNd22uA5r6zMKXcpcgCWLtu8MbAtPzqN2",
    "QmRdLwYHk2YLsLoK3ee7twzHMs1SdNitBYqcnFvSdpu3EA",
    "QmYyjGhxGGDVv7t6BKSb4HsK3JANGg3QowWD9SG3GFBCsY",
    "QmaFYsXoqjZm8L6K9m3sRwDbYHTX945ZH5pn6oLox9BmzZ",
    "QmPQM1kkiT8yWhDHsJryboK4iNMh9E9jnk8JpG2ZEeUpF7",
    "QmPXFQ4rWv9nB7LP9zqwLHF9uZd2MkBdFEdL54rk5GRd5X",
    "QmXnF27fWYRdpUU4dVixt81iJC4JjuPaTtuPPCZMGZZb1R",
    "QmcUuFqNWxMz222vcpXNsSSwmo8g4JeUMe75LKeoZrD61B",
    "QmXRmWZqdHVYdTw4vfHmjqyMGRrU5ZwNdybLwuSMGNPJ3U",
    "QmZQ4VQYxGKbCHcZaB8T6b45RVc8QHaizSqnT6LsZzGqbv",
    "Qmev3Vjb9EeXAvEYqj6KoAfy77Mwn2eyXpkMBbG7XYk66q",
    "QmQNMRXmzPgJztnk71YnDK7a2RX18qS65mmDCvJqe7VfKt",
  ],
  LAYER2: [
    "QmSyruFkgTnaRGx47sTTN7yh7eiu5TZCB5TJg7kUAxDXAE",
    "QmcZo6uh32NxnTFuVzLwchWyVUo2z9aziDPYNEetj1dwR9",
    "QmdW9EEZKwQho3PJ1yXarhFC4J2jeDwhC84tjJdh62Vfav",
    "QmdfGsxc7zaiZ6pJFz37d9uB2V3k1P73euKLRr9YHRxvFb",
    "QmW49RS77UR52gKAkk5k9dFyPBR5dLGV5P9dn79s7GmFzs",
    "QmetedrJMJaybyBEAAaxRhyWYxH9hDdHEzew3Smz2qH2YB",
    "QmbQBQMmA36m2mqNxCE2hGbhDZsZT7UAQc8gQn7g69FRqH",
    "QmPPQ2TDuA2en4AkQTfyQhiK1u7ynrxR4hVXKv7umCVd8t",
    "QmSN8cABRggUnMEi4TsiER2DuYNymnMACAmPf4pHBQiYed",
    "QmatSYW7bc55BbNd22uA5r6zMKXcpcgCWLtu8MbAtPzqN2",
    "QmRdLwYHk2YLsLoK3ee7twzHMs1SdNitBYqcnFvSdpu3EA",
    "QmYyjGhxGGDVv7t6BKSb4HsK3JANGg3QowWD9SG3GFBCsY",
    "QmaFYsXoqjZm8L6K9m3sRwDbYHTX945ZH5pn6oLox9BmzZ",
    "QmPQM1kkiT8yWhDHsJryboK4iNMh9E9jnk8JpG2ZEeUpF7",
    "QmPXFQ4rWv9nB7LP9zqwLHF9uZd2MkBdFEdL54rk5GRd5X",
    "QmXnF27fWYRdpUU4dVixt81iJC4JjuPaTtuPPCZMGZZb1R",
    "QmcUuFqNWxMz222vcpXNsSSwmo8g4JeUMe75LKeoZrD61B",
    "QmXRmWZqdHVYdTw4vfHmjqyMGRrU5ZwNdybLwuSMGNPJ3U",
    "QmZQ4VQYxGKbCHcZaB8T6b45RVc8QHaizSqnT6LsZzGqbv",
    "Qmev3Vjb9EeXAvEYqj6KoAfy77Mwn2eyXpkMBbG7XYk66q",
    "QmQNMRXmzPgJztnk71YnDK7a2RX18qS65mmDCvJqe7VfKt",
  ],
  LAYER3: [
    "QmSyruFkgTnaRGx47sTTN7yh7eiu5TZCB5TJg7kUAxDXAE",
    "QmcZo6uh32NxnTFuVzLwchWyVUo2z9aziDPYNEetj1dwR9",
    "QmdW9EEZKwQho3PJ1yXarhFC4J2jeDwhC84tjJdh62Vfav",
    "QmdfGsxc7zaiZ6pJFz37d9uB2V3k1P73euKLRr9YHRxvFb",
    "QmW49RS77UR52gKAkk5k9dFyPBR5dLGV5P9dn79s7GmFzs",
    "QmetedrJMJaybyBEAAaxRhyWYxH9hDdHEzew3Smz2qH2YB",
    "QmbQBQMmA36m2mqNxCE2hGbhDZsZT7UAQc8gQn7g69FRqH",
    "QmPPQ2TDuA2en4AkQTfyQhiK1u7ynrxR4hVXKv7umCVd8t",
    "QmSN8cABRggUnMEi4TsiER2DuYNymnMACAmPf4pHBQiYed",
    "QmatSYW7bc55BbNd22uA5r6zMKXcpcgCWLtu8MbAtPzqN2",
    "QmRdLwYHk2YLsLoK3ee7twzHMs1SdNitBYqcnFvSdpu3EA",
    "QmYyjGhxGGDVv7t6BKSb4HsK3JANGg3QowWD9SG3GFBCsY",
    "QmaFYsXoqjZm8L6K9m3sRwDbYHTX945ZH5pn6oLox9BmzZ",
    "QmPQM1kkiT8yWhDHsJryboK4iNMh9E9jnk8JpG2ZEeUpF7",
    "QmPXFQ4rWv9nB7LP9zqwLHF9uZd2MkBdFEdL54rk5GRd5X",
    "QmXnF27fWYRdpUU4dVixt81iJC4JjuPaTtuPPCZMGZZb1R",
    "QmcUuFqNWxMz222vcpXNsSSwmo8g4JeUMe75LKeoZrD61B",
    "QmXRmWZqdHVYdTw4vfHmjqyMGRrU5ZwNdybLwuSMGNPJ3U",
    "QmZQ4VQYxGKbCHcZaB8T6b45RVc8QHaizSqnT6LsZzGqbv",
    "Qmev3Vjb9EeXAvEYqj6KoAfy77Mwn2eyXpkMBbG7XYk66q",
    "QmQNMRXmzPgJztnk71YnDK7a2RX18qS65mmDCvJqe7VfKt",
  ],
};

export const ITEM_ACTION_TYPES = {
  LISTED: 0,
  DELISTED: 1,
  SOLD: 2,
  CANCELLED: 3,
  BID: 4,
  MINTED: 5,
  DESTROYED: 6,
  TRANSFERED: 7,
  PENDINGTRANSFER: 8,
};

export const ACTION_PROPS = [
  {
    label: "Listed",
    icon: "/images/item_activities/list.png",
  },
  {
    label: "Delisted",
    icon: "/images/item_activities/delist.png",
  },
  {
    label: "Sold",
    icon: "/images/item_activities/sold.png",
  },
  {
    label: "Canceled",
    icon: "",
  },
  {
    label: "Bid",
    icon: "/images/item_activities/bid.png",
  },
  {
    label: "Minted",
    icon: "/images/item_activities/mint.png",
  },
  {
    label: "Burned",
    icon: "/images/item_activities/burn.png",
  },
  {
    label: "Transferred",
    icon: "/images/item_activities/transfer.png",
  },
  {
    label: "Pendingtransfer",
    icon: "",
  },
];

export const HOMIS_COLLECTION_ID = "645a7501069be7750b397759";

export const ACTIVE_CHAINS =
  devnet === true ? EVM_TESTNETS_LIST : EVM_MAINNETS_LIST;
