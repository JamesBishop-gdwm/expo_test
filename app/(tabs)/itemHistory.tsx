import { Button } from "@/components/ui/Button";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/ui/Card";

export default function TabTwoScreen() {
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualItemNumber, setManualItemNumber] = useState<string>("");
  const navigation = useNavigation();
  // Fix: Change type from NodeJS.Timeout to number
  const errorTimeoutRef = useRef<number | null>(null);

  // Clear error after timeout
  useEffect(() => {
    // Clear any existing timeout
    if (errorTimeoutRef.current !== null) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    // Set a new timeout if there's an error
    if (nfcError) {
      errorTimeoutRef.current = setTimeout(() => {
        setNfcError(null);
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (errorTimeoutRef.current !== null) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [nfcError]);

  // Function to start NFC scanning
  const readNfcTag = useCallback(async () => {
    if (!isSupported || isScanning) return;

    setNfcContent(null);
    setNfcError(null);
    setIsScanning(true);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.ndefHandler.getNdefMessage();

      if (tag?.ndefMessage?.length) {
        const record = tag.ndefMessage[0];
        if (record.payload) {
          const raw = record.payload;
          const payload =
            raw instanceof Uint8Array ? raw : Uint8Array.from(raw as number[]);
          const text = Ndef.text.decodePayload(payload);
          setNfcContent(text);

          // Parse the URL to extract itemNumber
          try {
            // Check if text contains a URL with itemNumber parameter
            if (text.includes("itemNumber=")) {
              const url = new URL(text);
              const itemNumber = url.searchParams.get("itemNumber");

              if (itemNumber) {
                console.log(`Found item number: ${itemNumber}`);
                // Navigate to item details screen with the extracted item number
                router.push({
                  pathname: "/itemDetails",
                  params: { itemNumber },
                });
                return;
              }
            }
            setNfcError("No valid item number found in NFC tag.");
          } catch (parseError) {
            console.error("URL parsing error:", parseError);
            setNfcError("Invalid URL format in NFC tag.");
          }
        } else {
          setNfcContent("NDEF record found, but no payload to decode.");
        }
      } else {
        setNfcContent("No NDEF text content found on tag.");
      }
    } catch (e: any) {
      console.warn("NFC read error", e);
      setNfcError(
        e.message === "user cancelled"
          ? "NFC scan cancelled."
          : "NFC scan failed: " + e.message
      );
    } finally {
      await NfcManager.cancelTechnologyRequest();
      setIsScanning(false);
    }
  }, [isSupported, isScanning, navigation]);

  // Function to handle manual item number submission
  const handleManualSubmit = () => {
    if (!manualItemNumber.trim()) {
      setNfcError("Please enter an item number");
      return;
    }

    // Navigate to item details with the manually entered item number
    router.push({
      pathname: "/itemDetails",
      params: { itemNumber: manualItemNumber.trim() },
    });
  };

  // Initialize NFC Manager and check support - but don't auto-start scanning
  useEffect(() => {
    async function init() {
      if (Platform.OS === "web") {
        setIsSupported(false);
        setNfcError("NFC scanning is not supported on web browsers.");
        return;
      }
      try {
        const supported = await NfcManager.isSupported();
        setIsSupported(supported);
        if (supported) {
          await NfcManager.start();
          // Removed auto-start scanning
        } else {
          setNfcError("NFC is not supported on this device.");
        }
      } catch (e: any) {
        console.warn("NFC init failed", e);
        setIsSupported(false);
        setNfcError("Error checking NFC support: " + e.message);
      }
    }
    init();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      console.log("NFC cleanup complete");
    };
  }, []);

  // Stop an ongoing scan
  const stopNfcScan = useCallback(async () => {
    if (!isScanning) return;
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      /* ignore */
    }
    setIsScanning(false);
    setNfcError("NFC scan stopped by user.");
  }, [isScanning]);

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title">Item History</ThemedText>
      </ThemedView>

      {/* Manual entry section */}

      <ThemedView style={styles.manualEntryContainer}>
        <ThemedText type="defaultSemiBold" style={styles.manualEntryLabel}>
          Manual Entry
        </ThemedText>
        <View style={styles.inputColumn}>
          <TextInput
            style={styles.input}
            placeholder="Enter item number (e.g. DB-002801-1)"
            value={manualItemNumber}
            onChangeText={setManualItemNumber}
            placeholderTextColor="#888"
          />
          <Button style={styles.submitButton} onPress={handleManualSubmit}>
            Search
          </Button>
        </View>
      </ThemedView>

      <Card style={styles.nfcCard}>
        <ThemedText style={[styles.statusText, styles.scannerHeader]}>
          NFC Scanner
        </ThemedText>

        <ThemedText style={styles.statusText}>
          NFC Support:{" "}
          <ThemedText type="defaultSemiBold">
            {isSupported === true
              ? "Supported"
              : isSupported === false
              ? "Not Supported"
              : "Checking..."}
          </ThemedText>
        </ThemedText>

        {isScanning ? (
          <>
            <ThemedText>Hold your device near an NFC tag...</ThemedText>
            <Button onPress={stopNfcScan}>Cancel</Button>
          </>
        ) : (
          <>
            {nfcError && (
              <ThemedText type="defaultSemiBold" style={styles.errorText}>
                Error: {nfcError}
              </ThemedText>
            )}

            {isSupported && (
              <>
                <ThemedText style={styles.inactiveText}>
                  Tap the button below to scan an NFC tag
                </ThemedText>
                <Button onPress={readNfcTag}>Start NFC Scan</Button>
              </>
            )}
          </>
        )}

        {nfcContent && (
          <ThemedView style={styles.contentContainer}>
            <ThemedText type="defaultSemiBold">Scanned Content:</ThemedText>
            <ThemedText style={styles.scannedContentText}>
              {nfcContent}
            </ThemedText>
          </ThemedView>
        )}

        {!isSupported && Platform.OS !== "web" && !nfcError && (
          <ThemedText style={styles.instructionText}>
            Please ensure NFC is enabled in your device settings.
          </ThemedText>
        )}
      </Card>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  nfcCard: {
    marginTop: 16,
  },
  statusText: {
    marginBottom: 8,
  },
  scanningText: {
    marginVertical: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#224f4a",
  },
  errorText: {
    color: "#781f19",
    marginBottom: 16,
  },
  inactiveText: {
    marginVertical: 16,
    fontWeight: "500",
  },
  contentContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  scannedContentText: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 24,
  },
  instructionText: {
    marginTop: 15,
    fontStyle: "italic",
    textAlign: "center",
  },
  manualEntryContainer: {
    padding: 16,
  },
  manualEntryLabel: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputColumn: {
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    marginTop: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: "#224f4a",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  scannerHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});
