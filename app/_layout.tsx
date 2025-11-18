import { StyleSheet, useColorScheme } from 'react-native'
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite'
import { Slot, useRouter } from 'expo-router'
import {
    useFonts,
    OpenSans_400Regular,
    OpenSans_700Bold,
} from '@expo-google-fonts/open-sans'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import Loading from '@/components/Loading'
import { AlertProvider } from '@/context/AlertContext'
import AppErrorBoundary from '@/error-boundary/AppErrorBoundary'
import ErrorFallback from '@/error-boundary/ErrorFallback'

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()

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
        gym_location TEXT,
        programs TEXT,
        workouts TEXT
      );
    `)
    }

    return (
        <AppErrorBoundary
            fallback={
                <ErrorFallback
                    onRetry={() => {
                        router.push('/')
                    }}
                />
            }
        >
            <SQLiteProvider
                databaseName="app_data.db"
                onInit={initializeDatabase}
            >
                <AlertProvider>
                    <SafeAreaView style={styles.container}>
                        <Slot />
                    </SafeAreaView>
                </AlertProvider>
            </SQLiteProvider>
        </AppErrorBoundary>
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
