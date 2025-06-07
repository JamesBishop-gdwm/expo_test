import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

  // Navigation handlers
  const handleScanBarcode = () => {
    router.push(`/tasks/${id}/scan-barcode`);
  };

  const handleScanHistory = () => {
    router.push(`/tasks/${id}/scan-history`);
  };

  const handleLogout = async () => {
    await store.logOut();
    router.replace("/(tabs)/taskScanning");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        showBackButton={true}
        onBackPress={handleBackPress}
      >
        <ThemedView style={styles.container}>
          <Card style={styles.card}>
            {store.currentUser && (
              <ThemedText type="title" style={styles.cardTitle}>
                {store.currentUser.name} | {store.currentUser.task}
              </ThemedText>
            )}

            <ThemedView style={styles.buttonContainer}>
              <Button onPress={handleScanBarcode} style={styles.button}>
                Scan Door
              </Button>

              <Button onPress={handleScanHistory} style={styles.button}>
                Scan History
              </Button>

              <Button
                onPress={handleLogout}
                style={[styles.button, styles.logoutButton]}
                variant="outline"
              >
                Change User
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 16,
  },
});
