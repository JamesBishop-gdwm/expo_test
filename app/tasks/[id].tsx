import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useOperatorStore } from "@/store/useOperatorStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useOperatorStore();

  // Function to handle back navigation with logout
  const handleBackPress = async () => {
    // Log out the user first
    await store.logOut();

    // Then navigate back to the task scanning screen
    router.replace("/(tabs)/taskScanning");
  };

  useEffect(() => {
    // Load user data if needed
    store.loadUserLocalUser();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        showBackButton={true}
        onBackPress={handleBackPress}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Task Scanning</ThemedText>

          <ThemedText type="subtitle" style={styles.title}>
            Task: {store.currentUser.task}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Operator: {store.currentUser.name}
          </ThemedText>

          {/* Add your barcode scanning UI here */}
          <ThemedView style={styles.scanningSection}>
            <ThemedText>
              Barcode scanning functionality will be implemented here.
            </ThemedText>
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
  card: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#4b5563",
    marginBottom: 24,
  },
  scanningSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    alignItems: "center",
  },
});
