import React, { useEffect, useState } from 'react'
import { Alert, View, Text } from 'react-native'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import * as Location from 'expo-location'
import {
    LatLng,
    LeafletView,
    MapMarker,
    WebViewLeafletEvents,
} from 'react-native-leaflet-view'
import Loading from '@/components/Loading'
import { useAlert } from '@/context/AlertContext'

type MapProps = {
    onLocationSelect?: (coords: LatLng) => void
}

export default function Map({ onLocationSelect }: MapProps) {
    const [webViewContent, setWebViewContent] = useState<string | null>(null)
    const [userLocation, setUserLocation] = useState<LatLng | null>(null)
    const [locationMarker, setlocationMarker] = useState<MapMarker | null>(null)
    const [locationError, setLocationError] = useState(false)
    const { showAlert } = useAlert()

    const handleMessage = (event: any) => {
        const { event: eventType, payload } = event

        if (
            eventType === WebViewLeafletEvents.ON_MAP_TOUCHED &&
            payload?.touchLatLng
        ) {
            const newPosition = {
                lat: payload.touchLatLng.lat,
                lng: payload.touchLatLng.lng,
            }

            setlocationMarker({
                position: newPosition,
                size: [32, 32],
                icon: '📍',
            })

            // send coordinates to parent
            onLocationSelect?.(newPosition)
        }
    }

    useEffect(() => {
        let isMounted = true

        const loadHtml = async () => {
            try {
                const path = require('../assets/leaflet.html')
                const asset = Asset.fromModule(path)
                await asset.downloadAsync()
                const htmlContent = await FileSystem.readAsStringAsync(
                    asset.localUri!
                )
                if (isMounted) setWebViewContent(htmlContent)
            } catch (error) {
                Alert.alert('Error loading HTML', JSON.stringify(error))
                console.error('Error loading HTML:', error)
                setLocationError(true)
            }
        }

        const getCurrentLocation = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync()
                if (status !== 'granted') {
                    showAlert(
                        'Location Permission Denied',
                        'We need access to your location to verify that you’re at the gym. Please enable it in Settings and try again.',
                        'error'
                    )
                    setLocationError(true)
                    return
                }

                let location = await Location.getLastKnownPositionAsync({})
                if (!location)
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Low,
                        timeInterval: 1000,
                    })
                if (isMounted) {
                    setUserLocation({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude,
                    })
                }
            } catch (error) {
                showAlert(
                    'Location Error',
                    'Something Went Wrong! Could not get your location.',
                    'error'
                )
                console.error('Error getting location:', error)
                setLocationError(true)
            }
        }

        Promise.allSettled([loadHtml(), getCurrentLocation()])

        return () => {
            isMounted = false
        }
    }, [])

    if (!webViewContent || !userLocation) {
        return <Loading />
    }

    if (locationError) {
        return (
            <View
                style={{ flex: 1, alignContent: 'center', paddingVertical: 2 }}
            >
                <Text
                    style={{
                        fontSize: 120,
                        textAlign: 'center',
                        textOverflow: 'visible',
                    }}
                >
                    ⚠︎
                </Text>
                <Text
                    style={{
                        fontSize: 24,
                        textOverflow: 'visible',
                        textAlign: 'center',
                    }}
                >
                    You should allow location services for app to work
                    correctly.
                </Text>
            </View>
        )
    }

    return (
        <LeafletView
            onMessageReceived={handleMessage}
            renderLoading={() => <Loading />}
            source={{ html: webViewContent }}
            mapCenterPosition={userLocation}
            {...(locationMarker ? { mapMarkers: [locationMarker] } : {})}
        />
    )
}
