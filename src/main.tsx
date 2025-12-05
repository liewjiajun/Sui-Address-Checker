import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { AddressCheckerApp } from "./ui/AddressCheckerApp";
import "./styles.css";

const queryClient = new QueryClient();

// Configure networks without hardcoding raw RPC URLs
const { networkConfig } = createNetworkConfig({
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <AddressCheckerApp />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);




