import CustomButton from '@/components/CustomButton'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import {
    View,
    Text,
    useColorScheme,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native'

interface Props {
    onRetry: () => void
}

export default function ErrorFallback({ onRetry }: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠</Text>
            <Text style={styles.header}>Oops Something Went Wrong!</Text>
            <CustomButton text="retry" size={18} onPress={onRetry} />
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
        } as ViewStyle,

        icon: {
            fontSize: 120,
            textAlign: 'center',
            textOverflow: 'visible',
            color: colors.fg,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            textAlign: 'center',
            textOverflow: 'visible',
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,
    })
}
