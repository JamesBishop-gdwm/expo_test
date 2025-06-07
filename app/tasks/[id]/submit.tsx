import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { useOperatorStore } from "@/store/useOperatorStore";

export default function SubmitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useOperatorStore();
  const [comments, setComments] = useState("");
  const date = new Date();

  // Format date for display
  const dateString = (date: Date) => {
    return date.toLocaleString();
  };

  const handleComplete = async () => {
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast message with correct parameters
    Toast.show({
      type: "success",
      text1: `${store.scannedBarcode} Submitted`,
      visibilityTime: 2000,
      position: "bottom",
    });

    // Submit barcode with comments
    await store.postBarcode(comments);

    // Navigate back to scan screen
    router.push(`/tasks/${id}/scan-barcode`);
  };

  const handleBackPress = () => {
    router.push(`/tasks/${id}/scan-barcode`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        showBackButton={true}
        backRoute={`/tasks/${id}/scan-barcode`}
      >
        <ThemedView style={styles.container}>
          <Card>
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={styles.cardTitle}>
                {store.currentUser?.name} | {store.currentUser?.task}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.barcodeText}>
                {store.scannedBarcode}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.formContainer}>
              <View style={styles.formRow}>
                <ThemedView style={styles.formItem}>
                  <ThemedText style={styles.label}>Time</ThemedText>
                  <ThemedText>{dateString(date)}</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.formItem, styles.commentsContainer]}>
                  <ThemedText style={styles.label}>
                    Extras (optional)
                  </ThemedText>
                  <TextInput
                    value={comments}
                    onChangeText={setComments}
                    placeholder=""
                    style={styles.input}
                  />
                </ThemedView>
              </View>

              <Button onPress={handleComplete} style={styles.submitButton}>
                Submit
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  barcodeText: {
    fontSize: 20,
    fontWeight: "700",
    paddingTop: 8,
  },
  formContainer: {
    padding: 16,
  },
  formRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 16,
  },
  formItem: {
    flex: 1,
    minWidth: "45%",
  },
  commentsContainer: {
    flex: 2,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});
