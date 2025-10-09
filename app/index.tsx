import {
    Text,
    View,
    StyleSheet,
    useColorScheme,
    ViewStyle,
    TextStyle,
    Alert,
} from 'react-native'
import Logo from '@/components/Logo'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import Calendar from '@/components/calendar/Calendar'

export default function Index() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View style={{ alignItems: 'center', overflow: 'scroll' }}>
                <Text style={styles.header}>Activity</Text>
                <Calendar />
            </View>
            <CustomButton
                text="Log Workout"
                onPress={() => {
                    Alert.alert('button pressed')
                }}
                size={24}
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

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,
    })
}
