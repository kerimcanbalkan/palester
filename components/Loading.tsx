import {
    Animated,
    Easing,
    useColorScheme,
    View,
    StyleSheet,
} from 'react-native'
import { useRef, useEffect } from 'react'
import Logo from './Logo'
import { darkColors, lightColors, colorType } from '@/theme/colors'

export default function Loading() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const fadeAnim = useRef(new Animated.Value(1)).current

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
        <View style={styles.loadingContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Logo size={20} />
            </Animated.View>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        loadingContainer: {
            backgroundColor: colors.bg,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    })
}
