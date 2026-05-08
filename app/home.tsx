import {
    View,
    StyleSheet,
    useColorScheme,
    ViewStyle,
    TextStyle,
} from 'react-native'
import Logo from '@/components/Logo'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import Calendar from '@/components/calendar/Calendar'
import { useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { addWorkout, Workout } from '@/api/api'
import Loading from '@/components/Loading'
import { useAlert } from '@/context/AlertContext'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link } from 'expo-router'
import CustomText from '@/components/CustomText'
import WorkoutLogModal from '@/components/WorkoutLogModal'
import { useTranslation } from '@/localization/useTranslation'
import { useAppData } from '@/lib/hooks/use-app-data'

export default function Home() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const { showAlert } = useAlert()
    const [logOpen, setLogOpen] = useState(false)
    const db = useSQLiteContext()
    const { data, loading, error, sessionToday, workoutToday, refetch } =
        useAppData()

    const { t } = useTranslation()

    async function handleWorkoutLog(workout: Workout) {
        try {
            await addWorkout(db, workout)
            showAlert(
                t('common.success'),
                t('workoutLog.successMessage'),
                'success'
            )
            refetch()
        } catch (err) {
            console.error('error while adding workout', err)
            showAlert(
                t('workoutLog.error.couldNotSave.title'),
                t('workoutLog.error.couldNotSave.message'),
                'error'
            )
        }
    }

    if (loading) {
        return <Loading />
    }

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

    return (
        <View>
            <Link href="/modal" style={styles.settings}>
                <Ionicons name="settings" size={32} color={colors.fg} />
            </Link>
            <View style={styles.container}>
                <Logo size={46} />
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'visible',
                    }}
                >
                    <CustomText style={styles.header}>
                        {t('workoutSummary.title')}
                    </CustomText>
                    {data !== null ? <Calendar data={data} /> : <Loading />}
                </View>
                <CustomButton
                    text={
                        workoutToday
                            ? t('workoutSummary.update')
                            : t('workoutSummary.log')
                    }
                    onPress={() => {
                        if (sessionToday.lifts.length !== 0) {
                            setLogOpen(true)
                        }
                    }}
                    size={24}
                />
                <WorkoutLogModal
                    visible={logOpen}
                    onClose={() => {
                        setLogOpen(false)
                    }}
                    onSave={handleWorkoutLog}
                    session={sessionToday}
                    {...(workoutToday && { workout: workoutToday })}
                />
            </View>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bg,
        } as ViewStyle,

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
            textAlign: 'center',
        } as TextStyle,

        settings: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            marginBottom: 30,
        },
    })
}
