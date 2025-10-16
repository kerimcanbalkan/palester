import { StyleSheet, useColorScheme } from 'react-native'
import AsyncStorage, {
    useAsyncStorage,
} from '@react-native-async-storage/async-storage'
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { Slot, usePathname, useRouter } from 'expo-router'
import {
    useFonts,
    OpenSans_400Regular,
    OpenSans_700Bold,
} from '@expo-google-fonts/open-sans'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import Loading from '@/components/Loading'
import { useState, useEffect } from 'react'

type QueryResultRow = Record<string, any>
type QueryResult = {
    rows: QueryResultRow[]
}

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)

    // // Redirect if setup is not done
    useEffect(() => {
        const checkSetup = async () => {
            const setupDone = await AsyncStorage.getItem('setup_done')
            if (!setupDone && pathname === '/') {
                router.replace('/setup/program')
            }
        }
        checkSetup()
    }, [])

    const [fontsLoaded] = useFonts({
        OpenSans_400Regular,
        OpenSans_700Bold,
    })

    if (!fontsLoaded) {
        return <Loading />
    }

    const initializeDatabase = async (db: SQLiteDatabase) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        app_start_date TEXT,
        gym_location TEXT,
        workout_days TEXT,
        workouts TEXT
      );
    `)
    }

    return (
        <SQLiteProvider databaseName="app_data.db" onInit={initializeDatabase}>
            <SafeAreaView style={styles.container}>
                <Slot />
            </SafeAreaView>
        </SQLiteProvider>
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
