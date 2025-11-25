import {
    View,
    StyleSheet,
    useColorScheme,
    ViewStyle,
    TextStyle,
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
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link } from 'expo-router'
import CustomText from '@/components/CustomText'

export default function Home() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [data, setData] = useState<AppData | null>(null)
    const [userLocation, setUserLocation] = useState<LatLng | null>(null)
    const [logOpen, setLogOpen] = useState(false)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const data = await getData(db)
            return data
        } catch (error) {
            throw new Error(`Failed to fetch app data: ${error}`)
        }
    }

    useEffect(() => {
        const getLocationAndData = async () => {
            setLoading(true)
            setError(false)
            try {
                // Get location permissions
                const { status } =
                    await Location.requestForegroundPermissionsAsync()

                if (status !== 'granted') {
                    showAlert(
                        'Location Permission Denied',
                        'We need access to your location to verify that you’re at the gym. Please enable it in Settings and try again.',
                        'error'
                    )
                    throw new Error('Location Permission Denied')
                }

                // Check if location services (GPS) are enabled
                const servicesEnabled = await Location.hasServicesEnabledAsync()
                if (!servicesEnabled) {
                    showAlert(
                        'Location Services Disabled',
                        'Your GPS or location services are turned off. Please enable them and try again.',
                        'error'
                    )
                    throw new Error('Location services disabled')
                }
                const [locationData, appData] = await Promise.all([
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                    }),
                    fetchData(),
                ])

                setUserLocation({
                    lat: locationData.coords.latitude,
                    lng: locationData.coords.longitude,
                })
                setData(appData)
            } catch (error) {
                setError(true)
                console.error('Error getting user data and location:', error)
            } finally {
                setLoading(false)
            }
        }

        getLocationAndData()
    }, [])

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
        console.log('DISTANCE', distance)

        if (distance <= 50) {
            const date = startOfToday().toISOString()
            try {
                await addWorkout(db, date)
                const data = await fetchData()
                setData(data)
            } catch (err) {
                console.error('error while adding workout', err)
                showAlert(
                    'error',
                    'Something went wrong! Could not add workout',
                    'error'
                )
            }
        } else {
            showAlert(
                'Cheater',
                'You should be at the gym do not kid yourself',
                'error'
            )
        }
    }

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <CustomText
                        style={{
                            fontSize: 120,
                            textAlign: 'center',
                            textOverflow: 'visible',
                            color: colors.fg,
                        }}
                    >
                        ⚠︎
                    </CustomText>
                    <CustomText
                        style={{
                            fontSize: 24,
                            textOverflow: 'visible',
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        Opps! Something wen't wrong. Try again later.
                    </CustomText>
                </View>
            </View>
        )
    }

    return (
        <View>
            <Link href="/modal" style={styles.settings}>
                <Ionicons name="settings" size={32} color={colors.fg} />
            </Link>
            <View style={styles.container}>
                <Logo size={46} />
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'visible',
                    }}
                >
                    <CustomText style={styles.header}>Activity</CustomText>
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

        settings: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            marginBottom: 30,
        },
    })
}
