import { useState, useEffect } from 'react'
import { Router, useRouter } from 'expo-router'
import { initI18n } from '@/localization/i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useSetup() {
    const router = useRouter()
    const [error, setError] = useState(false)
    // Redirect if setup is not done
    useEffect(() => {
        const checkSetup = async () => {
            try {
                const setupDone = await AsyncStorage.getItem('setup_done')
                if (!setupDone) {
                    router.replace('/setup/import')
                } else {
                    router.replace('/home')
                }
            } catch (err) {
                console.error('error checking setup', err)
                setError(true)
            }
        }
        const checkLanguage = async () => {
            await initI18n()
        }
        checkLanguage()
        checkSetup()
    }, [])
    return { error }
}
