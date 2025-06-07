import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Define the data type based on the wireframe
type ItemData = {
  externalImgUrl?: string;
  internalImgUrl?: string;
  system?: string;
  design?: string;
  externalDoorColour?: string;
  externalFrameColour?: string;
  internalColour?: string;
  hardwareFinish?: string;
  doorOpens?: string;
  doorHanding?: string;
  glassTheme?: string;
  backingGlass?: string;
  size?: string;
};

export default function ItemDetailsScreen() {
  const { itemNumber } = useLocalSearchParams<{ itemNumber: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [activeTab, setActiveTab] = useState<"external" | "internal">(
    "external"
  );

  // Fetch item details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Always set mock data first (for development)
        const mockData = {
          externalImgUrl:
            "https://gradydevimages.blob.core.windows.net/framecontainers/framecontainers/25371-external.png?sp=racwd&st=2024-04-10T13:39:32Z&se=2026-08-05T21:39:32Z&spr=https&sv=2022-11-02&sr=c&sig=0UKxKulL7eC%2FY4cPVpeTIGZfLcY9gpDo3agrve35HVo%3D",
          internalImgUrl:
            "https://gradydevimages.blob.core.windows.net/framecontainers/framecontainers/25371-internal.png?sp=racwd&st=2024-04-10T13:39:32Z&se=2026-08-05T21:39:32Z&spr=https&sv=2022-11-02&sr=c&sig=0UKxKulL7eC%2FY4cPVpeTIGZfLcY9gpDo3agrve35HVo%3D",
          system: "70-68mm Rebated Comp Door in Legend Frame",
          design: "Balmoral-Left",
          externalDoorColour: "Red",
          externalFrameColour: "Red",
          internalColour: "Anthracite Grey",
          hardwareFinish: "Gold",
          doorOpens: "In",
          doorHanding: "Left",
          glassTheme: "Glen",
          backingGlass: "Clear",
          size: "880 x 2071",
        };

        // During development, just use the mock data
        const isDevelopment = true; // Set to true for development, false for production

        if (isDevelopment) {
          setItemData(mockData);
          setError(null); // Clear any previous errors
        } else {
          // Only try the real API in production
          try {
            const response = await axios.get(
              `https://api.example.com/items/${itemNumber}`
            );
            setItemData(response.data);
            setError(null);
          } catch (apiError) {
            console.error("Failed to fetch item data:", apiError);
            setError("Could not load item data");
            // Fallback to mock data even in production
            setItemData(mockData);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemNumber]);

  // Show loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
          showBackButton={true}
          backRoute="/(tabs)/itemHistory"
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText>Loading item details...</ThemedText>
          </View>
        </ParallaxScrollView>
      </>
    );
  }

  // Handle missing data or error
  if (!itemData || error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
          showBackButton={true}
          backRoute="/(tabs)/itemHistory"
        >
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="title">Error</ThemedText>
            <ThemedText>
              {error || "No data available for this item"}
            </ThemedText>
          </ThemedView>
        </ParallaxScrollView>
      </>
    );
  }

  // Determine if we should show the internal tab
  const hasInternalImage = !!itemData.internalImgUrl;

  // Get the current image URL based on active tab
  const currentImageUrl =
    activeTab === "external"
      ? itemData.externalImgUrl
      : itemData.internalImgUrl;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        showBackButton={true}
        backRoute="/(tabs)/itemHistory"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Item {itemNumber}</ThemedText>

          {/* Image Display */}
          <View style={styles.imageContainer}>
            {currentImageUrl ? (
              <Image
                source={{ uri: currentImageUrl }}
                style={styles.doorImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <ThemedText>No image available</ThemedText>
              </View>
            )}
          </View>

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "external" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("external")}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "external" && styles.activeTabText,
                ]}
              >
                External
              </ThemedText>
            </TouchableOpacity>

            {hasInternalImage && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "internal" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("internal")}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === "internal" && styles.activeTabText,
                  ]}
                >
                  Internal
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Item Details */}
          <ThemedView style={styles.detailsCard}>
            <ThemedText type="subtitle">Door Specifications</ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Size:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.size || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>System:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.system || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Design:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.design || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                External Door Colour:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.externalDoorColour || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                External Frame Colour:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.externalFrameColour || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                Internal Colour:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.internalColour || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                Hardware Finish:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.hardwareFinish || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Opens:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.doorOpens || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Handing:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.doorHanding || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Glass Theme:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.glassTheme || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Backing Glass:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.backingGlass || "N/A"}
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  imageContainer: {
    height: 300,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  doorImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: "#B1DAE5",
  },
  tabText: {
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "700",
  },
  detailsCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  detailLabel: {
    fontWeight: "600",
    flexShrink: 0, // Prevents shrinking
    width: 160, // Fixed width for consistent alignment
    marginRight: 8, // Add some spacing between label and value
  },
  detailValue: {
    flex: 2,
  },
});
