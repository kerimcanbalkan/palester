import CustomText from '@/components/CustomText'
import Loading from '@/components/Loading'
import { darkColors, lightColors } from '@/theme/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, useColorScheme } from 'react-native'

export default function Index() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const [error, setError] = useState(false)

    // Redirect if setup is not done
    useEffect(() => {
        const checkSetup = async () => {
            try {
                const setupDone = await AsyncStorage.getItem('setup_done')
                if (!setupDone) {
                    router.replace('/setup/program')
                } else {
                    router.replace('/home')
                }
            } catch (err) {
                console.error('error checking setup', err)
                setError(true)
            }
        }
        checkSetup()
    }, [])

    if (error) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <CustomText
                        style={{
                            fontSize: 120,
                            textAlign: 'center',
                            textOverflow: 'visible',
                            color: colors.fg,
                        }}
                    >
                        ⚠︎
                    </CustomText>
                    <CustomText
                        style={{
                            fontSize: 24,
                            textOverflow: 'visible',
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        Opps! Something wen't wrong. Try again later.
                    </CustomText>
                </View>
            </View>
        )
    }

    return <Loading />
}
