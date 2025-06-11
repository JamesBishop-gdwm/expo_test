import axios from 'axios'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Button } from '@/components/ui/Button'
// Make sure your Colors constants are available
import { COLORS } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { GlassUnit, ItemData } from '@/types/item'

// DetailTable component remains the same...
interface TableProps {
  title: string
  data: Array<{
    label: string
    value: string | React.ReactNode
  }>
}

function DetailTable({ title, data }: TableProps) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  return (
    <ThemedView
      style={[
        styles.tableContainer,
        { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
      ]}
    >
      <ThemedView
        style={[
          styles.tableTitle,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.05)',
          },
        ]}
      >
        <ThemedText type="subtitle">{title}</ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          styles.tableContent,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
          },
        ]}
      >
        {data.map((row, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              {
                borderBottomColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
          >
            <ThemedText style={styles.tableLabel}>{row.label}</ThemedText>
            <ThemedText style={styles.tableValue}>{row.value}</ThemedText>
          </View>
        ))}
      </ThemedView>
    </ThemedView>
  )
}

export default function ItemDetailsScreen() {
  const { itemNumber } = useLocalSearchParams<{ itemNumber: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemData, setItemData] = useState<ItemData | null>(null)
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>(
    'external'
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  // Add new state for glass units
  const [glassUnits, setGlassUnits] = useState<GlassUnit[]>([])

  const API_BASE_URL = 'https://door-builder-production.onrender.com'

  // Add function to fetch glass units
  const fetchGlassUnits = useCallback(async () => {
    if (!itemNumber) return

    try {
      const url = `${API_BASE_URL}/expo/item-glass-units/${itemNumber}`
      const response = await axios.get(url)
      setGlassUnits(response.data)
    } catch (err) {
      // We just log the error but don't fail the whole screen
    }
  }, [itemNumber])

  const fetchData = useCallback(async () => {
    if (!itemNumber) {
      setLoading(false)
      return
    }
    try {
      const url = `${API_BASE_URL}/expo/item-details/${itemNumber}`
      const response = await axios.get(url)
      setItemData(response.data[0])
      setError(null)
      // Fetch glass units after main data loads
      fetchGlassUnits()
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Could not load item data.')
      } else {
        setError('Failed to connect to the server, please try again later.')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [itemNumber, fetchGlassUnits])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchData()
  }, [fetchData])

  // Create a reusable RefreshControl component
  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      progressViewOffset={80} // Increased drag distance
      tintColor={COLORS.gold} // Spinner color on iOS
      colors={[COLORS.gold, '#224f4a']} // Spinner colors on Android
    />
  )

  if (loading) {
    // ... loading JSX is the same
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView showBackButton={true} backRoute="/">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText>Loading item details...</ThemedText>
          </View>
        </ParallaxScrollView>
      </>
    )
  }

  if (!itemData || error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ParallaxScrollView
          showBackButton={true}
          backRoute="/"
          refreshControl={refreshControl} // Use the styled RefreshControl
        >
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="title">Error</ThemedText>
            <ThemedText>
              {error || 'No data available for this item'}
            </ThemedText>
            <ThemedText>Pull down to try again.</ThemedText>
          </ThemedView>
        </ParallaxScrollView>
      </>
    )
  }

  // ... data mapping logic is the same ...
  const hasInternalImage = !!itemData.internalImgUrl
  const currentImageUrl =
    activeTab === 'external' ? itemData.Thumbnail : itemData.internalImgUrl
  const coreDetailsData = [
    { label: 'Item Number', value: itemNumber || 'N/A' },
    { label: 'Type', value: itemData.Type || 'N/A' },
    { label: 'Status', value: itemData.Status || 'N/A' },
  ]
  const dimensionsData = [
    {
      label: 'Overall Width',
      value: itemData.OverallWidth || itemData.Width || itemData.size || 'N/A',
    },
    {
      label: 'Overall Height',
      value: itemData.OverallHeight || itemData.Height || 'N/A',
    },
    { label: 'Door Width', value: itemData.DoorWidth || 'N/A' },
    { label: 'Door Height', value: itemData.DoorHeight || 'N/A' },
  ]
  const designData = [
    { label: 'Design', value: itemData.DoorDesign || itemData.design || 'N/A' },
    { label: 'Door Handing', value: itemData.DoorHanding || 'N/A' },
    { label: 'Door Opens', value: itemData.DoorOpens || 'N/A' },
  ]
  const colorsData = [
    {
      label: 'External Door',
      value: itemData.ExternalColour || itemData.externalDoorColour || 'N/A',
    },
    {
      label: 'External Frame',
      value:
        itemData.ExternalFrameColourDescription ||
        itemData.externalFrameColour ||
        'N/A',
    },
    { label: 'Internal Color', value: itemData.InternalColour || 'N/A' },
  ]

  const hardwareData = [
    {
      label: 'Hardware Suite',
      value: itemData.HardwareSuite || itemData.hardwareFinish || 'N/A',
    },
    { label: 'Handle', value: itemData.Handle || 'N/A' },
    { label: 'Lock Option', value: itemData.LockOption || 'N/A' },
    { label: 'Cylinder', value: itemData.Cylinder || 'N/A' },
    { label: 'Letter Plate', value: itemData.LetterPlate || 'N/A' },
  ]
  const performanceData = [
    { label: 'Thermal', value: itemData.ThermalPerformance || 'N/A' },
    { label: 'Fire Rating', value: itemData.IntendedFireRating || 'N/A' },
    { label: 'SBD Certification', value: itemData.SBD || 'N/A' },
  ]

  // Add GlassUnitTable component
  interface GlassUnitTableProps {
    glassUnits: GlassUnit[]
  }

  function GlassUnitTable({ glassUnits }: GlassUnitTableProps) {
    const colorScheme = useColorScheme() ?? 'light'
    const isDark = colorScheme === 'dark'

    // Group glass units by SubAssembly
    const doorGlassUnits = glassUnits.filter(
      (unit) => unit.SubAssembly?.toLowerCase() === 'door'
    )
    const leftSidelightGlassUnits = glassUnits.filter(
      (unit) => unit.SubAssembly?.toLowerCase() === 'left-sidelight'
    )
    const rightSidelightGlassUnits = glassUnits.filter(
      (unit) => unit.SubAssembly?.toLowerCase() === 'right-sidelight'
    )
    const fanlightGlassUnits = glassUnits.filter(
      (unit) => unit.SubAssembly?.toLowerCase() === 'fanlight'
    )

    // Helper function to render a section for each SubAssembly
    const renderGlassUnitSection = (title: string, units: GlassUnit[]) => {
      if (units.length === 0) return null

      return (
        <View style={styles.glassUnitSection}>
          <ThemedText type="subtitle" style={styles.glassSubtitle}>
            {title}
          </ThemedText>
          <ThemedView
            style={[
              styles.glassTableWrapper,
              {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            {/* Header row */}
            <View
              style={[
                styles.tableRow,
                styles.headerRow,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                  borderBottomColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <View style={[styles.glassColumnContainer, { flex: 2 }]}>
                <ThemedText style={styles.tableHeaderLeft}>
                  Stock Code
                </ThemedText>
              </View>
              <View style={[styles.glassColumnContainer, { flex: 0.8 }]}>
                <ThemedText style={styles.tableHeaderLeft}>Width</ThemedText>
              </View>
              <View style={[styles.glassColumnContainer, { flex: 0.8 }]}>
                <ThemedText style={styles.tableHeaderLeft}>Height</ThemedText>
              </View>
            </View>

            {/* Glass unit rows */}
            <ThemedView
              style={[
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                },
              ]}
            >
              {units.map((unit, index) => (
                <View
                  key={unit.Id || index}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.05)',
                      borderBottomWidth: index < units.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <View style={[styles.glassColumnContainer, { flex: 2 }]}>
                    <ThemedText style={styles.glassTableCellLeft}>
                      {unit.StockCode || 'N/A'}
                    </ThemedText>
                  </View>
                  <View style={[styles.glassColumnContainer, { flex: 0.8 }]}>
                    <ThemedText style={styles.glassTableCellLeft}>
                      {unit.Width || 'N/A'}
                    </ThemedText>
                  </View>
                  <View style={[styles.glassColumnContainer, { flex: 0.8 }]}>
                    <ThemedText style={styles.glassTableCellLeft}>
                      {unit.Height || 'N/A'}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ThemedView>
          </ThemedView>
        </View>
      )
    }

    // Only display the component if there are any glass units
    const hasAnyGlass = glassUnits.length > 0

    if (!hasAnyGlass) {
      return null
    }

    return (
      <ThemedView
        style={[
          styles.tableContainer,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          },
        ]}
      >
        <ThemedView
          style={[
            styles.tableTitle,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <ThemedText type="subtitle">Glass Units</ThemedText>
        </ThemedView>

        <ThemedView style={styles.glassUnitsContainer}>
          {renderGlassUnitSection('Door Glass', doorGlassUnits)}
          {renderGlassUnitSection(
            'Left Sidelight Glass',
            leftSidelightGlassUnits
          )}
          {renderGlassUnitSection(
            'Right Sidelight Glass',
            rightSidelightGlassUnits
          )}
          {renderGlassUnitSection('Fanlight Glass', fanlightGlassUnits)}
        </ThemedView>
      </ThemedView>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ParallaxScrollView
        showBackButton={true}
        backRoute="/"
        refreshControl={refreshControl} // Use the styled RefreshControl
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
              <ThemedView style={styles.placeholderImage}>
                <ThemedText>No image available</ThemedText>
              </ThemedView>
            )}
          </View>

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            {hasInternalImage ? (
              <>
                <Button
                  outline={activeTab !== 'external'}
                  style={styles.tabButton}
                  onPress={() => setActiveTab('external')}
                >
                  External
                </Button>
                <Button
                  outline={activeTab !== 'internal'}
                  style={styles.tabButton}
                  onPress={() => setActiveTab('internal')}
                >
                  Internal
                </Button>
              </>
            ) : null}
          </View>

          {/* Item Details Tables */}
          <DetailTable title="Core Details" data={coreDetailsData} />
          <DetailTable title="Dimensions" data={dimensionsData} />
          <DetailTable title="Design & System" data={designData} />
          <DetailTable title="Colors" data={colorsData} />
          <DetailTable title="Hardware" data={hardwareData} />
          <DetailTable title="Performance" data={performanceData} />
          <GlassUnitTable glassUnits={glassUnits} />
        </ThemedView>
      </ParallaxScrollView>
    </>
  )
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    height: 40,
  },
  // Table styles
  tableContainer: {
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tableTitle: {
    padding: 4,
    paddingHorizontal: 6, // Add padding to title
  },
  tableContent: {
    paddingHorizontal: 2, // Add horizontal padding to content container
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 2, // Add horizontal padding to rows
  },
  tableLabel: {
    fontWeight: '600',
    flexShrink: 0,
    width: 120,
    paddingLeft: 2, // Add left padding
  },
  tableValue: {
    flex: 1,
    paddingRight: 2, // Add right padding
  },

  // Glass table styles
  glassUnitsContainer: {
    padding: 4,
  },
  glassUnitSection: {
    marginBottom: 16,
  },
  glassSubtitle: {
    marginBottom: 8,
    fontWeight: '600',
    paddingHorizontal: 2, // Add horizontal padding
  },
  glassTableWrapper: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  headerRow: {
    borderBottomWidth: 1,
    paddingHorizontal: 2, // Add horizontal padding
  },
  tableHeader: {
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
  },
  glassTableCell: {
    flex: 1,
    textAlign: 'center',
  },
  glassColumnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start', // Changed from 'center' for left alignment
    paddingHorizontal: 2, // Add horizontal padding
  },
  tableHeaderLeft: {
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'left',
    paddingLeft: 10, // Increased left padding for better appearance
  },
  glassTableCellLeft: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10, // Increased left padding for better appearance
  },
})
