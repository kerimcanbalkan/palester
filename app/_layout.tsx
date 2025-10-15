import { StyleSheet, useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import {
    useFonts,
    OpenSans_400Regular,
    OpenSans_700Bold,
} from '@expo-google-fonts/open-sans'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import Loading from '@/components/Loading'

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [fontsLoaded] = useFonts({
        OpenSans_400Regular,
        OpenSans_700Bold,
    })

    if (!fontsLoaded) {
        return <Loading />
    }

    return (
        <SafeAreaView style={styles.container}>
            <Slot />
        </SafeAreaView>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
            backgroundColor: colors.bg,
            fontFamily: 'OpenSans_400Regular',
            width: '100%',
            maxWidth: 430,
            height: '100%',
            margin: 'auto',
            alignSelf: 'center',
        },
    })
}
