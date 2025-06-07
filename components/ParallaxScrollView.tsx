import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; // Import router directly
import type { PropsWithChildren } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

const HEADER_HEIGHT = 60;

// Application colors
const COLORS = {
  primary: "#781f19", // Dark red
  secondary: "#224f4a", // Dark teal
  secondaryHover: "#255c56",
  offWhite: "#f6f6f6",
};

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  showBackButton?: boolean;
  backRoute?: any; // For simple route string navigation
  onBackPress?: () => void; // For custom navigation handlers
}>;

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  showBackButton = false,
  backRoute,
  onBackPress,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, 0]
          ),
        },
      ],
    };
  });

  // Handle back navigation with explicit route or callback
  const handleBackNavigation = () => {
    // If a custom callback is provided, use it
    if (onBackPress) {
      onBackPress();
      return;
    }

    // Otherwise fall back to route-based navigation
    if (backRoute) {
      try {
        // Try different navigation approaches depending on route type
        router.push(backRoute as any);
      } catch (e) {
        console.warn("Navigation failed:", e);
        // Fallback to replace if push fails
        try {
          router.replace(backRoute as any);
        } catch (e) {
          console.warn("All navigation attempts failed");
        }
      }
    } else {
      // If no back route specified, try normal back navigation
      try {
        router.back();
      } catch (e) {
        console.warn("No back route specified and back() failed");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}
      >
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackNavigation}
              style={styles.backButton}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.offWhite} />
            </TouchableOpacity>
          )}

          <Text style={styles.headerText}>
            <Text style={styles.greenText}>GDWM</Text>
            <Text> </Text>
            <Text style={styles.redText}>scanning</Text>
          </Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: bottom,
          paddingTop: HEADER_HEIGHT,
          ...styles.contentContainer,
        }}
      >
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 4,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  greenText: {
    color: COLORS.secondary, // Updated to use secondary color
  },
  redText: {
    color: COLORS.primary, // Updated to use primary color
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
