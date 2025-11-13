/**
 * WalletConnectButton - Beautiful wallet connection button
 * Supports MetaMask, WalletConnect, Coinbase Wallet
 * Follows product-landing.astro design
 */

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import { USDC_ADDRESSES, formatUSDC } from '@/lib/web3/config';

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  variant?: 'default' | 'compact';
}

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  variant = 'default',
}: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESSES.base,
    chainId: base.id,
  });

  // Custom button styling (black/white design)
  if (variant === 'compact' && isConnected && address) {
    return (
      <button
        onClick={() => {
          disconnect();
          onDisconnect?.();
        }}
        className="px-4 py-2 border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors text-xs font-bold tracking-[0.2em] uppercase"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      openConnectModal();
                    }}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:opacity-80 transition-opacity w-full"
                  >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">
                      Connect Wallet
                    </span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-8 py-4 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors w-full"
                  >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">
                      Wrong Network
                    </span>
                  </button>
                );
              }

              return (
                <div className="flex flex-col gap-2">
                  {/* Account Info */}
                  <button
                    onClick={openAccountModal}
                    className="px-6 py-3 border-2 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Wallet icon */}
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span className="text-xs font-bold tracking-wider">
                          {account.displayName}
                        </span>
                      </div>

                      {/* USDC Balance */}
                      {usdcBalance && (
                        <span className="text-xs font-bold tabular-nums">
                          {formatUSDC(usdcBalance.value)} USDC
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Network Switcher */}
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs opacity-60"
                  >
                    {chain.hasIcon && (
                      <div
                        className="inline-block w-3 h-3 rounded-full overflow-hidden mr-2"
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-3 h-3"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
