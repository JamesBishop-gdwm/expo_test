import { nfcService } from "@/services/nfcService";
import React, { createContext, useContext, useEffect, useState } from "react";

type NfcContextType = {
  isSupported: boolean | null;
  isScanning: boolean;
  nfcContent: string | null;
  nfcError: string | null;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
};

const NfcContext = createContext<NfcContextType>({
  isSupported: null,
  isScanning: false,
  nfcContent: null,
  nfcError: null,
  startScan: async () => {},
  stopScan: async () => {},
});

export function useNfc() {
  return useContext(NfcContext);
}

export function NfcProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const [nfcError, setNfcError] = useState<string | null>(null);

  useEffect(() => {
    async function initNfc() {
      const supported = await nfcService.initialize();
      setIsSupported(supported);
    }

    initNfc();

    return () => {
      nfcService.cleanUp();
    };
  }, []);

  const startScan = async () => {
    setNfcContent(null);
    setNfcError(null);
    setIsScanning(true);

    await nfcService.readTag(
      (content) => {
        setNfcContent(content);
        setIsScanning(false);
      },
      (error) => {
        setNfcError(error);
        setIsScanning(false);
      }
    );
  };

  const stopScan = async () => {
    await nfcService.stopScan();
    setIsScanning(false);
    setNfcError("Scan stopped by user");
  };

  return (
    <NfcContext.Provider
      value={{
        isSupported,
        isScanning,
        nfcContent,
        nfcError,
        startScan,
        stopScan,
      }}
    >
      {children}
    </NfcContext.Provider>
  );
}
