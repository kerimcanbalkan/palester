import {
    Text,
    StyleSheet,
    TextProps,
    TextStyle,
    StyleProp,
    useColorScheme,
    Platform,
} from 'react-native'
import { colorType, darkColors, lightColors } from '@/theme/colors'

interface CustomTextProps extends TextProps {
    children?: React.ReactNode
    style?: StyleProp<TextStyle>
}

export default function CustomText({
    style,
    children,
    ...props
}: CustomTextProps) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <Text {...props} style={[styles.text, style]}>
            {children}
        </Text>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        text: {
            fontSize: 12,
            fontFamily: Platform.select({
                android: 'OpenSans_400Regular',
                ios: 'Opens-Sans',
            }),
            color: colors.fg,
        } as TextStyle,
    })
}
