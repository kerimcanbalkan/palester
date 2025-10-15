import {
    useColorScheme,
    View,
    StyleSheet,
    ViewStyle,
    Text,
    TextStyle,
    Alert,
} from 'react-native'
import Map from '@/components/Map'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import Logo from '@/components/Logo'
import { useState } from 'react'

export default function Location() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)

    const handleLocationSelect = (coords: { lat: number; lng: number }) => {
        setLocation(coords)
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
            <CustomButton
                text="   confirm   "
                size={24}
                onPress={() => {
                    Alert.alert(`${location?.lat}/${location?.lng}`)
                }}
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
