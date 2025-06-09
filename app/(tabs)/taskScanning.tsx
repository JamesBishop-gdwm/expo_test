import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useOperatorStore } from "@/store/useOperatorStore";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

export default function TaskScanningScreen() {
  const router = useRouter();
  const store = useOperatorStore();

  // Load operators and tasks when the screen loads
  useEffect(() => {
    const initScreen = async () => {
      // First load any saved user data
      await store.loadUserLocalUser();

      // Then load all users and tasks
      await store.loadUsersAndTasks();

      // Auto-navigate if a user is already set with a task
      if (store.currentUser?.id && store.currentUser?.task) {
        router.push(`/tasks/${store.currentUser.id}`);
      }
    };

    initScreen();
  }, []);

  // Event handlers
  const handleUserChange = (userId: string) => {
    store.selectUserById(userId);
  };

  const handleTaskChange = (taskName: string) => {
    store.selectTask(taskName);
  };

  const handleSetMode = async () => {
    await store.setUser();
    router.push(`/tasks/${store.currentUser.id}`);
  };

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Task Scanning</ThemedText>
      </ThemedView>
      <Card>
        <ThemedView style={styles.formContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Operator
          </ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={store.currentUser.id}
              onValueChange={handleUserChange}
              style={styles.picker}
            >
              <Picker.Item
                key="select-operator"
                label="Select Operator"
                value=""
              />
              {store.getOperatorsAsOptions().map((option, index) => (
                <Picker.Item
                  key={`operator-${option.value.toString()}-${index}`}
                  label={option.text}
                  value={option.value.toString()}
                />
              ))}
            </Picker>
          </ThemedView>

          <ThemedText
            type="defaultSemiBold"
            style={[styles.label, styles.topSpacing]}
          >
            Tasks
          </ThemedText>
          <ThemedView style={styles.pickerContainer}>
            <Picker
              selectedValue={store.currentUser.task || ""}
              onValueChange={handleTaskChange}
              style={styles.picker}
              enabled={!!store.currentUser.id}
            >
              <Picker.Item key="select-task" label="Select Task" value="" />
              {store.getCurrentUserTasks().map((task, index) => (
                <Picker.Item
                  key={task.taskKey ? `task-${task.taskKey}` : `task-${index}`}
                  label={task.text}
                  value={task.text}
                />
              ))}
            </Picker>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <Button
              onPress={handleSetMode}
              disabled={!store.currentUser.id || !store.currentUser.task}
              style={[
                styles.setModeButton,
                {
                  opacity:
                    !store.currentUser.id || !store.currentUser.task ? 0.7 : 1,
                },
              ]}
            >
              {!store.currentUser.id
                ? "Select an operator first"
                : !store.currentUser.task
                ? "Select a task first"
                : "Set mode"}
            </Button>
          </ThemedView>
        </ThemedView>
      </Card>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  formContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  topSpacing: {
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#6b7280",
    borderRadius: 8,
    marginTop: 4,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    marginTop: 24,
  },
  setModeButton: {
    // Remove reference to store here
  },
});
