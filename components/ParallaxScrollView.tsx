import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { PropsWithChildren } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { COLORS, Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

const HEADER_HEIGHT = 60

type Props = PropsWithChildren<{
  headerBackgroundColor?: { dark: string; light: string }
  showBackButton?: boolean
  backRoute?: any
  onBackPress?: () => void
}>

export default function ParallaxScrollView({
  children,
  headerBackgroundColor = {
    light: Colors.light.header,
    dark: Colors.dark.header,
  },
  showBackButton = false,
  backRoute,
  onBackPress,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light'
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)
  const bottom = useBottomTabOverflow()
  const { top: topInset } = useSafeAreaInsets()
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
    }
  })

  // Handle back navigation with explicit route or callback
  const handleBackNavigation = () => {
    // If a custom callback is provided, use it
    if (onBackPress) {
      onBackPress()
      return
    }

    // Otherwise fall back to route-based navigation
    if (backRoute) {
      try {
        // Try different navigation approaches depending on route type
        router.push(backRoute as any)
      } catch (e) {
        // Fallback to replace if push fails
        try {
          router.replace(backRoute as any)
        } catch (e) {}
      }
    } else {
      // If no back route specified, try normal back navigation
      try {
        router.back()
      } catch (e) {}
    }
  }

  return (
    <ThemedView style={styles.container}>
      {/* Status bar area */}
      <View
        style={[
          styles.statusBar,
          {
            height: topInset,
            backgroundColor: colorScheme === 'dark' ? '#000' : '#224f4a',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor[colorScheme],
            top: topInset, // Position header below the status bar
          },
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

          <View style={styles.headerContent}>
            <ThemedText
              style={styles.headerText}
              lightColor={COLORS.offWhite}
              darkColor={COLORS.gold}
            >
              GDWM{' '}
              <ThemedText lightColor={COLORS.offWhite} darkColor={COLORS.gold}>
                scanning
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: bottom,
          paddingTop: HEADER_HEIGHT + topInset, // Add topInset to padding
          ...styles.contentContainer,
        }}
      >
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
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
    overflow: 'hidden',
  },
})
