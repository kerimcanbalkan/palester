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
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import Calendar from '@/components/calendar/Calendar'
import { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { getData } from '@/api/api'

export default function Index() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const db = useSQLiteContext()
    const [data, setData] = useState<Awaited<
        ReturnType<typeof getData>
    > | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getData(db)
                console.log('this is data', result)
                setData(result)
            } catch (error) {
                console.error('Failed to fetch app data:', error)
            } finally {
            }
        }
        fetchData()
    }, [db])

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                }}
            >
                <Text style={styles.header}>Activity</Text>
                <Calendar />
            </View>
            <CustomButton
                text="Log Workout"
                onPress={() => {
                    router.navigate('/setup/program')
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
