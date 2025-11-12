import { StyleSheet, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite'
import { Slot, usePathname, useRouter, Redirect } from 'expo-router'
import { useFonts, OpenSans_400Regular, OpenSans_700Bold } from '@expo-google-fonts/open-sans'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { AlertProvider } from '@/context/AlertContext'
import AppErrorBoundary from '@/error-boundary/AppErrorBoundary'
import ErrorFallback from '@/error-boundary/ErrorFallback'
import * as SplashScreen from 'expo-splash-screen'

// Prevent the splash screen from auto-hiding before we’re ready
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const colors = colorScheme === 'light' ? lightColors : darkColors
  const styles = themedStyles(colors)
  const router = useRouter()
  const pathname = usePathname()

  const [setupDone, setSetupDone] = useState(true)
  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_700Bold,
  })

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Check AsyncStorage setup flag
        const setup = await AsyncStorage.getItem('setup_done')
        if (!setup && pathname === '/') {
          setSetupDone(false)
        }
      } catch (e) {
        console.warn('Error checking setup:', e)
      } finally {
        // Wait for fonts to load before hiding splash
        if (fontsLoaded) {
          setAppIsReady(true)
          await SplashScreen.hideAsync()
        }
      }
    }

    prepareApp()
  }, [fontsLoaded, pathname])

  // Keep splash screen visible until everything is ready
  if (!appIsReady) {
    return null
  }

  if (!setupDone) {
    return <Redirect href="/setup/program" />
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
      <SQLiteProvider databaseName="app_data.db" onInit={initializeDatabase}>
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

