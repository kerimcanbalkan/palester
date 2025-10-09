import { Text, TextStyle, StyleSheet, useColorScheme } from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'

interface Props {
    size: Number
}

export default function Logo({ size = 46 }: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors, size)

    return <Text style={styles.logo}>Palester</Text>
}

function themedStyles(colors: colorType, size: Number) {
    return StyleSheet.create({
        logo: {
            color: colors.fg,
            fontSize: size,
            fontFamily: 'OpenSans_700Bold',
            textTransform: 'uppercase',
        } as TextStyle,
    })
}
