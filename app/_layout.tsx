import {
    View,
    StyleSheet,
    useColorScheme,
    Animated,
    Easing,
} from 'react-native'
import { useEffect, useRef } from 'react'
import { Slot } from 'expo-router'
import {
    useFonts,
    OpenSans_400Regular,
    OpenSans_700Bold,
} from '@expo-google-fonts/open-sans'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [fontsLoaded] = useFonts({
        OpenSans_400Regular,
        OpenSans_700Bold,
    })

    if (!fontsLoaded) {
        return <AppLoadingScreen colors={colors} />
    }

    return (
        <SafeAreaView style={styles.container}>
            <Slot />
        </SafeAreaView>
    )
}

interface loadProps {
    colors: colorType
}

function AppLoadingScreen({ colors }: loadProps) {
    const fadeAnim = useRef(new Animated.Value(1)).current
    const styles = themedStyles(colors)

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        )
        loop.start()

        return () => loop.stop()
    }, [])

    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Logo size={20} />
            </Animated.View>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingVertical: 20,
            backgroundColor: colors.bg,
            overflow: 'visible',
            fontFamily: 'OpenSans_400Regular',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    })
}
