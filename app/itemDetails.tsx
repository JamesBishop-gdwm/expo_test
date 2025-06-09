import axios from 'axios'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { ItemData } from '@/types/item'

export default function ItemDetailsScreen() {
  const { itemNumber } = useLocalSearchParams<{ itemNumber: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemData, setItemData] = useState<ItemData | null>(null)
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>(
    'external'
  )

  // Your API's local network address
  const API_BASE_URL = 'http://172.16.45.171:3000' // Use the correct port

  useEffect(() => {
    const fetchData = async () => {
      if (!itemNumber) {
        return
      }

      try {
        setLoading(true)

        // 1. The URL is now a simple REST endpoint.
        const url = `${API_BASE_URL}/expo/item-details/${itemNumber}`

        const response = await axios.get(url)

        // 2. The data is directly in the response, no more nesting!
        setItemData(response.data[0])
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch item data:', err)
        if (axios.isAxiosError(err) && err.response) {
          // The server responded with an error (e.g., 404 Not Found)
          setError(err.response.data.error || 'Could not load item data.')
        } else {
          // A network error occurred (e.g., can't connect to the server)
          setError('Failed to connect to the server. Is it running?')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [itemNumber])

  // Show loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView showBackButton={true} backRoute="/index">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText>Loading item details...</ThemedText>
          </View>
        </ParallaxScrollView>
      </>
    )
  }

  // Handle missing data or error
  if (!itemData || error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView showBackButton={true} backRoute="/">
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="title">Error</ThemedText>
            <ThemedText>
              {error || 'No data available for this item'}
            </ThemedText>
          </ThemedView>
        </ParallaxScrollView>
      </>
    )
  }

  // Determine if we should show the internal tab
  const hasInternalImage = !!itemData.internalImgUrl

  // Get the current image URL based on active tab
  const currentImageUrl =
    activeTab === 'external' ? itemData.externalImgUrl : itemData.internalImgUrl

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView showBackButton={true} backRoute="/">
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
                activeTab === 'external' && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab('external')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'external' && styles.activeTabText,
                ]}
              >
                External
              </ThemedText>
            </TouchableOpacity>

            {hasInternalImage && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'internal' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('internal')}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    activeTab === 'internal' && styles.activeTabText,
                  ]}
                >
                  Internal
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Item Details with Categories */}
          <ThemedView style={styles.detailsCard}>
            <ThemedText type="subtitle">Core Details</ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Item Number:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemNumber || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Order ID:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.OrderId || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Type:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.Type || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Status:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.Status || 'N/A'}
              </ThemedText>
            </View>

            {/* Dimensions Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Dimensions
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Overall Width:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.OverallWidth ||
                  itemData.Width ||
                  itemData.size ||
                  'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                Overall Height:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.OverallHeight || itemData.Height || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Width:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorWidth || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Height:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorHeight || 'N/A'}
              </ThemedText>
            </View>

            {/* Design Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Design & System
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>System:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.System || itemData.system || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Design:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorDesign || itemData.design || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Handing:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorHanding || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Door Opens:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorOpens || 'N/A'}
              </ThemedText>
            </View>

            {/* Colors Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Colors
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>External Door:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.ExternalColour ||
                  itemData.externalDoorColour ||
                  'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                External Frame:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.ExternalFrameColourDescription ||
                  itemData.externalFrameColour ||
                  'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                Internal Color:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.InternalColour || 'N/A'}
              </ThemedText>
            </View>

            {/* Glass Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Glass
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Glass Theme:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorGlassThemeName ||
                  itemData.DoorGlassTheme ||
                  itemData.GlassTheme ||
                  itemData.glassTheme ||
                  'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Backing Glass:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.DoorBackingGlass || itemData.backingGlass || 'N/A'}
              </ThemedText>
            </View>

            {/* Hardware Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Hardware
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                Hardware Suite:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.HardwareSuite || itemData.hardwareFinish || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Handle:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.Handle || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Lock Option:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.LockOption || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Cylinder:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.Cylinder || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Letter Plate:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.LetterPlate || 'N/A'}
              </ThemedText>
            </View>

            {/* Performance Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Performance
            </ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Thermal:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.ThermalPerformance || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Fire Rating:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.IntendedFireRating || 'N/A'}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>
                SBD Certification:
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {itemData.SBD || 'N/A'}
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#B1DAE5',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  detailsCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    fontWeight: '600',
    flexShrink: 0, // Prevents shrinking
    width: 160, // Fixed width for consistent alignment
    marginRight: 8, // Add some spacing between label and value
  },
  detailValue: {
    flex: 2,
  },
})
