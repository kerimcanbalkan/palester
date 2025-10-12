import {
    View,
    ViewStyle,
    Text,
    TextStyle,
    StyleSheet,
    useColorScheme,
} from 'react-native'
import { darkColors, colorType, lightColors } from '@/theme/colors'

export default function Location() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View>
            <Text>This is the Location Page</Text>
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

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,
    })
}
