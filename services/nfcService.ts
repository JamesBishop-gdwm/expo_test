import { router } from "expo-router";
import { Platform } from "react-native";
import { Ndef, NfcTech } from "react-native-nfc-manager";

class NfcService {
  private isInitialized = false;
  private isScanning = false;

  // Initialize the NFC manager once
  async initialize() {
    if (this.isInitialized || Platform.OS === "web") return false;

    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Failed to initialize NFC", e);
      return false;
    }
  }

  // Read an NFC tag and handle navigation
  async readTag(
    onTagRead?: (content: string) => void,
    onError?: (error: string) => void
  ) {
    // Prevent multiple concurrent scans
    if (this.isScanning || !this.isInitialized) return;

    this.isScanning = true;

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

          if (onTagRead) onTagRead(text);

          // Parse the URL to extract itemNumber
          try {
            if (text.includes("itemNumber=")) {
              const url = new URL(text);
              const itemNumber = url.searchParams.get("itemNumber");

              if (itemNumber) {
                console.log(`Found item number: ${itemNumber}`);
                // Navigate to item details
                router.push({
                  pathname: "/itemDetails",
                  params: { itemNumber },
                });
                return;
              }
            }
            if (onError) onError("No valid item number found in NFC tag.");
          } catch (parseError) {
            if (onError) onError("Invalid URL format in NFC tag.");
          }
        } else {
          if (onError) onError("NDEF record found, but no payload to decode.");
        }
      } else {
        if (onError) onError("No NDEF text content found on tag.");
      }
    } catch (e: any) {
      console.warn("NFC read error", e);
      if (onError) {
        onError(
          e.message === "user cancelled"
            ? "NFC scan cancelled."
            : `NFC scan failed: ${e.message}`
        );
      }
    } finally {
      this.stopScan();
    }
  }

  // Stop an ongoing scan
  async stopScan() {
    if (!this.isScanning) return;

    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (e) {
      // Ignore errors during cancellation
    } finally {
      this.isScanning = false;
    }
  }

  // Clean up resources when app is closing
  async cleanUp() {
    try {
      await this.stopScan();
      if (this.isInitialized) {
        NfcManager.setEventListener(NfcTech.Ndef, null);
        this.isInitialized = false;
      }
    } catch (e) {
      console.warn("NFC cleanup error", e);
    }
  }

  // Check if NFC is scanning
  isCurrentlyScanning() {
    return this.isScanning;
  }
}

// Create and export a singleton instance
export const nfcService = new NfcService();
