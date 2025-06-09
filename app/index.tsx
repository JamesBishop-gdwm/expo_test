import { Button } from '@/components/ui/Button'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Card } from '@/components/ui/Card'

export default function TabTwoScreen() {
  const [nfcContent, setNfcContent] = useState<string | null>(null)
  const [nfcError, setNfcError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const navigation = useNavigation()

  const errorTimeoutRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  // Clear error after timeout
  useEffect(() => {
    // Clear any existing timeout
    if (errorTimeoutRef.current !== null) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }

    // Set a new timeout if there's an error
    if (nfcError) {
      errorTimeoutRef.current = setTimeout(() => {
        setNfcError(null)
      }, 5000)
    }

    // Cleanup on unmount
    return () => {
      if (errorTimeoutRef.current !== null) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [nfcError])

  // Setup NFC - simplified without auto-start
  useEffect(() => {
    isMountedRef.current = true

    const setupNfc = async () => {
      if (Platform.OS === 'web') {
        setIsSupported(false)
        setNfcError('NFC scanning is not supported on web browsers.')
        return
      }

      try {
        // Check if NFC is supported
        const supported = await NfcManager.isSupported()
        if (!isMountedRef.current) return

        setIsSupported(supported)
        if (supported) {
          // Start the NFC manager
          await NfcManager.start()
          console.log('NFC manager started successfully')
        } else {
          setNfcError('NFC is not supported on this device.')
        }
      } catch (e: any) {
        if (!isMountedRef.current) return
        setIsSupported(false)
        setNfcError('Error checking NFC support: ' + e.message)
        console.error('NFC init error:', e)
      }
    }

    setupNfc()

    // Cleanup function
    return () => {
      console.log('Cleaning up NFC')
      isMountedRef.current = false

      if (errorTimeoutRef.current !== null) {
        clearTimeout(errorTimeoutRef.current)
      }

      // Cancel any ongoing NFC operations
      NfcManager.cancelTechnologyRequest().catch(() => {})
      setIsScanning(false)
    }
  }, [])

  // Manual NFC scanning function
  const readNfcTag = useCallback(async () => {
    if (!isSupported || isScanning) return

    setNfcContent(null)
    setNfcError(null)
    setIsScanning(true)

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef)
      const tag = await NfcManager.ndefHandler.getNdefMessage()

      if (tag?.ndefMessage?.length) {
        const record = tag.ndefMessage[0]
        if (record.payload) {
          const raw = record.payload
          const payload =
            raw instanceof Uint8Array ? raw : Uint8Array.from(raw as number[])
          const text = Ndef.text.decodePayload(payload)
          setNfcContent(text)

          // More robust item number extraction
          try {
            // Try to extract itemNumber regardless of URL validity
            if (text.includes('itemNumber=')) {
              // Extract itemNumber using regex instead of URL parsing
              const itemNumberMatch = text.match(/itemNumber=([^&\s]+)/)
              if (itemNumberMatch && itemNumberMatch[1]) {
                const itemNumber = itemNumberMatch[1]
                console.log('Extracted itemNumber from text:', itemNumber)

                router.push({
                  pathname: '/itemDetails',
                  params: { itemNumber },
                })
                return
              }

              // Fallback to URL parsing with error handling
              try {
                // Fix common URL problems - replace spaces in domain with dashes
                const fixedText = text.replace(
                  /(https?:\/\/[^\/\s]+)\s+([^\/\s]+)/g,
                  '$1-$2'
                )
                const url = new URL(fixedText)
                const itemNumber = url.searchParams.get('itemNumber')

                if (itemNumber) {
                  console.log(
                    'Extracted itemNumber from fixed URL:',
                    itemNumber
                  )
                  router.push({
                    pathname: '/itemDetails',
                    params: { itemNumber },
                  })
                  return
                }
              } catch (urlError) {
                console.log('Error parsing URL from NFC content:', urlError)
              }
            }

            // If not a URL, check if it's a direct item number format (e.g., DB-123456-1)
            else if (/^[A-Z]{2}-\d+-\d+$/.test(text.trim())) {
              const itemNumber = text.trim()
              console.log('Direct item number format found:', itemNumber)
              router.push({
                pathname: '/itemDetails',
                params: { itemNumber },
              })
              return
            }
            // Check if it's just a numeric ID
            else if (/^\d+$/.test(text.trim())) {
              const itemNumber = text.trim()
              console.log('Numeric item ID found:', itemNumber)
              router.push({
                pathname: '/itemDetails',
                params: { itemNumber },
              })
              return
            }

            // Last resort: Look for anything that looks like "DB-XXXXXX-X" pattern anywhere in the text
            const directItemFormat = text.match(/([A-Z]{2}-\d+-\d+)/)
            if (directItemFormat) {
              const itemNumber = directItemFormat[1]
              console.log('Item number pattern found in text:', itemNumber)
              router.push({
                pathname: '/itemDetails',
                params: { itemNumber },
              })
              return
            }

            setNfcError('No valid item number found in NFC tag.')
          } catch (parseError) {
            console.error('Error parsing NFC content:', parseError)
            setNfcError('Invalid format in NFC tag.')
          }
        } else {
          setNfcContent('NDEF record found, but no payload to decode.')
        }
      } else {
        setNfcContent('No NDEF text content found on tag.')
      }
    } catch (e: any) {
      if (isMountedRef.current) {
        setNfcError(
          e.message === 'user cancelled'
            ? 'NFC scan cancelled.'
            : 'NFC scan failed: ' + e.message
        )
      }
    } finally {
      if (isMountedRef.current) {
        await NfcManager.cancelTechnologyRequest()
        setIsScanning(false)
      }
    }
  }, [isSupported, isScanning, navigation])

  // Stop an ongoing scan
  const stopNfcScan = useCallback(async () => {
    if (!isScanning) return
    try {
      await NfcManager.cancelTechnologyRequest()
    } catch {
      /* ignore */
    }
    setIsScanning(false)
    setNfcError('NFC scan stopped by user.')
  }, [isScanning])

  return (
    <ParallaxScrollView>
      <ThemedView>
        <ThemedText type="title">Item History</ThemedText>
      </ThemedView>

      <Card>
        <ThemedText style={styles.statusText}>
          NFC Support:{' '}
          <ThemedText type="defaultSemiBold">
            {isSupported === true
              ? 'Supported'
              : isSupported === false
                ? 'Not Supported'
                : 'Checking...'}
          </ThemedText>
        </ThemedText>

        {isScanning ? (
          <>
            <ThemedText style={styles.scanningText}>
              Hold your device near an NFC tag...
            </ThemedText>
            <Button onPress={stopNfcScan}>Stop Scanning</Button>
          </>
        ) : (
          <>
            {nfcError && (
              <ThemedText type="defaultSemiBold" style={styles.errorText}>
                Error: {nfcError}
              </ThemedText>
            )}

            {isSupported && (
              <>
                <ThemedText style={styles.inactiveText}>
                  Tap the button below to scan an NFC tag
                </ThemedText>
                <Button onPress={readNfcTag}>Start NFC Scan</Button>
              </>
            )}
          </>
        )}

        {nfcContent && (
          <ThemedView style={styles.contentContainer}>
            <ThemedText type="defaultSemiBold">Scanned Content:</ThemedText>
            <ThemedText style={styles.scannedContentText}>
              {nfcContent}
            </ThemedText>
          </ThemedView>
        )}

        {!isSupported && Platform.OS !== 'web' && !nfcError && (
          <ThemedText style={styles.instructionText}>
            Please ensure NFC is enabled in your device settings.
          </ThemedText>
        )}
      </Card>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  nfcCard: {
    marginTop: 16,
  },
  statusText: {
    marginBottom: 8,
  },
  scanningText: {
    marginVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#224f4a',
  },
  errorText: {
    color: '#781f19',
    marginBottom: 16,
  },
  inactiveText: {
    marginVertical: 16,
    fontWeight: '500',
  },
  contentContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scannedContentText: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 24,
  },
  instructionText: {
    marginTop: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  manualEntryContainer: {},
  manualEntryLabel: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    marginTop: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#224f4a',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
})
