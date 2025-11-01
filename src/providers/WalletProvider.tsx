import React, { FC, ReactNode } from "react";
import {
  AptosWalletAdapterProvider,
} from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Network } from "@aptos-labs/ts-sdk";

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider Component
 * Wraps the app with Aptos wallet adapter
 */
export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const wallets = [
    new PetraWallet(),
  ];

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error: any) => {
        console.error("Wallet adapter error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export default WalletProvider;
