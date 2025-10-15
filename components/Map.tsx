import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
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

type MapProps = {
    onLocationSelect?: (coords: LatLng) => void
}

export default function Map({ onLocationSelect }: MapProps) {
    const [webViewContent, setWebViewContent] = useState<string | null>(null)
    const [userLocation, setUserLocation] = useState<LatLng | null>(null)
    const [locationMarker, setlocationMarker] = useState<MapMarker | null>(null)

    const handleMessage = (event: any) => {
        const { event: eventType, payload } = event

        if (
            eventType === WebViewLeafletEvents.ON_MAP_TOUCHED &&
            payload?.touchLatLng
        ) {
            setlocationMarker({
                position: {
                    lat: payload.touchLatLng.lat,
                    lng: payload.touchLatLng.lng,
                },
                size: [32, 32],
                icon: '📍',
            })

            // send coordinates to parent
            onLocationSelect?.(locationMarker?.position)
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
            }
        }

        const getCurrentLocation = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'Cannot access location')
                    return
                }

                const location = await Location.getCurrentPositionAsync({})
                if (isMounted) {
                    setUserLocation({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude,
                    })
                }
            } catch (error) {
                Alert.alert('Error getting location', JSON.stringify(error))
                console.error('Error getting location:', error)
            }
        }

        loadHtml()
        getCurrentLocation()

        return () => {
            isMounted = false
        }
    }, [])

    if (!webViewContent || !userLocation) {
        return <Loading />
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
