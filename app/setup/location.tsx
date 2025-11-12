import {
    useColorScheme,
    View,
    StyleSheet,
    ViewStyle,
    Text,
    TextStyle,
} from 'react-native'
import Map from '@/components/Map'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import Logo from '@/components/Logo'
import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initData, AppData } from '@/api/api'
import { useAlert } from '@/context/AlertContext'

export default function Location() {
    const colorScheme = useColorScheme()
    const params = useLocalSearchParams()
    const router = useRouter()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const handleLocationSelect = (coords: { lat: number; lng: number }) => {
        setLocation(coords)
    }

    const handleConfirm = async () => {
        if (location === null || location === undefined) {
            showAlert(
                'Error',
                'You should choose gym location to app to work correctly.',
                'error'
            )
            return
        }

        const programs = JSON.parse((params.programs as string) || '[]')
        const workouts: string[] = []
        const data: AppData = {
            id: 1,
            gymLocation: location,
            programs: programs,
            workouts: workouts,
        }

        try {
            console.log('trying to initialize data', data)
            await initData(db, data)
            await AsyncStorage.setItem('setup_done', 'true')

            router.replace('/')
        } catch (err) {
            console.error(err)
            showAlert(
                'Error',
                'Something went wrong! Could not save user data, try again later',
                'error'
            )
        }
    }

    const styles = themedStyles(colors)

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.header}>GYM Location</Text>
                <View style={styles.mapContainer}>
                    <Map onLocationSelect={handleLocationSelect} />
                </View>
            </View>
            <CustomButton text="confirm" size={24} onPress={handleConfirm} />
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
        } as ViewStyle,

        mapContainer: {
            borderRadius: 16,
            overflow: 'hidden',
            margin: 10,
            backgroundColor: colors.bg2,
            width: 300,
            height: 250,
            alignContent: 'center',
            justifyContent: 'center',
            // optional extras
            shadowColor: colors.bg2,
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
        } as ViewStyle,

        header: {
            textAlign: 'center',
            color: colors.fg,
            marginBottom: 20,
            overflow: 'visible',
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,
    })
}
