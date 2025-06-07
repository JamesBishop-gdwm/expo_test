import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { useOperatorStore } from "@/store/useOperatorStore";

export default function ScanBarcodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useOperatorStore();

  // Camera states
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  // NFC states
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);

  // Shared states
  const [manualCode, setManualCode] = useState("");

  // Initialize NFC
  useEffect(() => {
    async function initNfc() {
      if (Platform.OS === "web") {
        setNfcSupported(false);
        return;
      }

      try {
        const supported = await NfcManager.isSupported();
        setNfcSupported(supported);

        if (supported) {
          await NfcManager.start();
        }
      } catch (e) {
        console.warn("NFC init failed", e);
        setNfcSupported(false);
      }
    }

    initNfc();

    // Clean up NFC when component unmounts
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      console.log("NFC cleanup complete");
    };
  }, []);

  // Barcode scanning functions
  const startBarcodeScanner = async () => {
    // Stop NFC scanning if it's active
    if (nfcScanning) {
      await stopNfcScan();
    }

    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const { status } = await requestPermission();
      if (status === "granted") {
        setScanning(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "We need your permission to use the camera to scan barcodes."
        );
      }
    } else {
      setScanning(true);
    }
  };

  const stopBarcodeScanner = () => {
    setScanning(false);
  };

  const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
    // Stop scanning immediately to prevent multiple triggers
    stopBarcodeScanner();

    // Access the data directly from the result object
    if (scanningResult.data) {
      // Process the barcode data
      processScannedCode(scanningResult.data);
    } else {
      Alert.alert(
        "Scan Failed",
        "Could not read barcode data. Please try again."
      );
    }
  };

  // NFC scanning functions
  const startNfcScan = useCallback(async () => {
    if (!nfcSupported || nfcScanning) return;

    // Stop barcode scanning if it's active
    if (scanning) {
      stopBarcodeScanner();
    }

    setNfcError(null);
    setNfcScanning(true);

    try {
      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Get the tag message
      const tag = await NfcManager.ndefHandler.getNdefMessage();

      if (tag?.ndefMessage?.length) {
        const record = tag.ndefMessage[0];
        if (record.payload) {
          // Convert payload to text
          const raw = record.payload;
          const payload =
            raw instanceof Uint8Array ? raw : Uint8Array.from(raw as number[]);
          const text = Ndef.text.decodePayload(payload);

          // Process the NFC data like we process barcode data
          processScannedCode(text);
        } else {
          setNfcError("NDEF record found, but no payload to decode.");
        }
      } else {
        setNfcError("No NDEF text content found on tag.");
      }
    } catch (e: any) {
      console.warn("NFC read error", e);
      setNfcError(
        e.message === "user cancelled"
          ? "NFC scan cancelled."
          : "NFC scan failed: " + e.message
      );
    } finally {
      await stopNfcScan();
    }
  }, [nfcSupported, nfcScanning, id]);

  const stopNfcScan = async () => {
    if (!nfcScanning) return;

    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (e) {
      // Ignore errors during cancellation
    } finally {
      setNfcScanning(false);
    }
  };

  // Common function to process scanned codes from either NFC or barcode
  const processScannedCode = (code: string) => {
    // Extract the actual code if needed (e.g., from a URL or formatted string)
    let extractedCode = code;

    // If the code is a URL with itemNumber parameter (like in your NFC example)
    if (code.includes("itemNumber=")) {
      try {
        const url = new URL(code);
        const itemNumber = url.searchParams.get("itemNumber");
        if (itemNumber) {
          extractedCode = itemNumber;
        }
      } catch (e) {
        console.warn("Failed to parse URL from code", e);
      }
    }

    // Or check for batch code format
    const batchRegex = /[dD][bB]-\d{6}-\d+/;
    const batchMatch = code.match(batchRegex);
    if (batchMatch) {
      extractedCode = batchMatch[0];
    }

    // Set the code and navigate to submit
    store.scannedBarcode = extractedCode;
    router.push(`/tasks/${id}/submit`);
  };

  const handleManualEntry = () => {
    store.scannedBarcode = manualCode;
    router.push(`/tasks/${id}/submit`);
  };

  // Render the camera scanner when active
  if (scanning) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "code128"],
            }}
          />
          <View style={styles.scannerOverlay}>
            <Button
              onPress={stopBarcodeScanner}
              variant="secondary"
              style={styles.cancelButton}
            >
              Cancel Scan
            </Button>
          </View>
        </View>
      </>
    );
  }

  // Render the main screen with options
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        showBackButton={true}
        backRoute={`/tasks/${id}`}
      >
        <ThemedView style={styles.container}>
          <Card>
            <ThemedText type="title" style={styles.cardTitle}>
              {store.currentUser?.name} | {store.currentUser?.task}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Scan NFC Tag or Barcode
            </ThemedText>

            <ThemedView style={styles.buttonContainer}>
              <Button onPress={startBarcodeScanner} style={styles.scanButton}>
                Scan Barcode
              </Button>

              {nfcSupported && (
                <Button
                  onPress={startNfcScan}
                  style={styles.scanButton}
                  variant="secondary"
                  disabled={nfcScanning}
                >
                  {nfcScanning ? "Scanning NFC..." : "Scan NFC Tag"}
                </Button>
              )}
            </ThemedView>

            {nfcScanning && (
              <ThemedView style={styles.nfcScanningContainer}>
                <ThemedText style={styles.scanningText}>
                  Hold your device near an NFC tag...
                </ThemedText>
                <Button
                  onPress={stopNfcScan}
                  variant="outline"
                  style={styles.cancelNfcButton}
                >
                  Cancel NFC Scan
                </Button>
              </ThemedView>
            )}

            {nfcError && (
              <ThemedText style={styles.errorText}>{nfcError}</ThemedText>
            )}
          </Card>

          <Card style={styles.manualCard}>
            <ThemedView style={styles.manualEntry}>
              <ThemedText style={styles.label}>Manual Entry</ThemedText>
              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Enter code manually"
                style={styles.input}
              />
              <Button
                onPress={handleManualEntry}
                disabled={!manualCode}
                style={styles.manualButton}
              >
                Enter Manual Code
              </Button>
            </ThemedView>
          </Card>
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: "column",
    gap: 12,
  },
  scanButton: {
    width: "100%",
  },
  nfcScanningContainer: {
    padding: 16,
    alignItems: "center",
  },
  scanningText: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: "center",
  },
  cancelNfcButton: {
    marginTop: 8,
  },
  errorText: {
    color: "#781f19",
    padding: 16,
    textAlign: "center",
  },
  manualCard: {
    marginTop: 20,
  },
  manualEntry: {
    padding: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    marginBottom: 16,
  },
  manualButton: {
    marginTop: 8,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  cancelButton: {
    width: "80%",
  },
});
