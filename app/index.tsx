import {
    Text,
    View,
    StyleSheet,
    useColorScheme,
    ViewStyle,
    TextStyle,
    Alert,
} from 'react-native'
import Logo from '@/components/Logo'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import Calendar from '@/components/calendar/Calendar'
import { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { getData, AppData, addWorkout } from '@/api/api'
import Loading from '@/components/Loading'
import * as Location from 'expo-location'
import { LatLng } from 'react-native-leaflet-view'
import { getDistance } from 'geolib'
import CustomModal from '@/components/CustomModal'
import { useAlert } from '@/context/AlertContext'
import { startOfToday } from 'date-fns'
import { useRouter } from 'expo-router'

export default function Index() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const db = useSQLiteContext()
    const [data, setData] = useState<Awaited<ReturnType<AppData>> | null>(null)
    const [userLocation, setUserLocation] = useState<LatLng | null>(null)
    const [logOpen, setLogOpen] = useState(false)
    const { showAlert } = useAlert()
    const [locationError, setLocationError] = useState(false)
    const [dataError, setDataError] = useState(false)

    const fetchData = async () => {
        try {
            const result = await getData(db)
            setData(result)
        } catch (error) {
            console.error('Failed to fetch app data:', error)
            setDataError(true)
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
                return false
            }

            // Check if location services (GPS) are enabled
            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                showAlert(
                    'Location Services Disabled',
                    'Your GPS or location services are turned off. Please enable them and try again.',
                    'error'
                )
                setLocationError(true)
                return false
            }
            const location = await Location.getCurrentPositionAsync({})
            setUserLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            })
        } catch (error) {
            setLocationError(true)
            console.error('Error getting location:', error)
        }
    }

    useEffect(() => {
        fetchData()
        getCurrentLocation()
    }, [db])

    async function handleWorkoutLog() {
        if (!userLocation) {
            showAlert(
                'Could not get location',
                'There was a problem with location services could not log the workout',
                'error'
            )
            return
        }

        if (!data?.gymLocation) {
            showAlert(
                'Gym location not set',
                'Cannot verify your location.',
                'error'
            )
            return
        }

        const distance = getDistance(userLocation, data.gymLocation)

        if (distance <= 500) {
            const date = startOfToday().toISOString()
            try {
                await addWorkout(db, date)
                await fetchData()
            } catch (err) { }
        } else {
            showAlert(
                'Cheater',
                'You should be at the gym do not kid yourself',
                'info'
            )
        }
    }

    if (locationError) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 120,
                            textAlign: 'center',
                            textOverflow: 'visible',
                            color: colors.fg,
                        }}
                    >
                        ⚠︎
                    </Text>
                    <Text
                        style={{
                            fontSize: 24,
                            textOverflow: 'visible',
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        You should allow location services for app to work
                        correctly.
                    </Text>
                </View>
            </View>
        )
    }

    if (dataError) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 120,
                        textAlign: 'center',
                        textOverflow: 'visible',
                        color: colors.fg,
                    }}
                >
                    ⚠︎
                </Text>
                <Text
                    style={{
                        fontSize: 24,
                        textOverflow: 'visible',
                        textAlign: 'center',
                        color: colors.fg,
                    }}
                >
                    Something went wrong! Could not get user data.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                }}
            >
                <Text style={styles.header}>Activity</Text>
                {data !== null ? <Calendar data={data} /> : <Loading />}
            </View>
            <CustomButton
                text="Log Workout"
                onPress={() => setLogOpen(true)}
                size={24}
            />
            <CustomModal
                dialog="Are you sure you want to log this workout?"
                onConfirm={handleWorkoutLog}
                visible={logOpen}
                onClose={() => setLogOpen(false)}
            />
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bg,
        } as ViewStyle,

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,
    })
}
