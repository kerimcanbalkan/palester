import {
    useColorScheme,
    View,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'

export default function Loading() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.fg} size='large' />
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
