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
import { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { getData, AppData, addWorkout, Session, Workout } from '@/api/api'
import Loading from '@/components/Loading'
import { useAlert } from '@/context/AlertContext'
import { format, isSameDay, startOfToday } from 'date-fns'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link } from 'expo-router'
import CustomText from '@/components/CustomText'
import WorkoutLogModal from '@/components/WorkoutLogModal'
import { useTranslation } from '@/localization/useTranslation'

export default function Home() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [data, setData] = useState<AppData | null>(null)
    const [logOpen, setLogOpen] = useState(false)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)

    const today = startOfToday()
    const todayName = format(today, 'EEE').toLocaleLowerCase()
    const [sessionToday, setSessionToday] = useState<Session>({
        day: todayName,
        lifts: [],
    })
    const [workoutToday, setWorkoutToday] = useState<Workout | null>(null)

    const { t } = useTranslation()

    const fetchData = async () => {
        try {
            const data = await getData(db)
            return data
        } catch (error) {
            throw new Error(`Failed to fetch app data: ${error}`)
        }
    }

    useEffect(() => {
        const getUserData = async () => {
            setLoading(true)
            setError(false)
            try {
                // Get app data
                const appData: AppData | null = await fetchData()
                if (!appData) {
                    throw new Error('App data is null')
                }
                setData(appData)

                // Set todays session
                const session = appData.programs[
                    appData.programs.length - 1
                ].sessions.find((s) => s.day === todayName)
                console.log(
                    'programs',
                    appData.programs[appData.programs.length - 1].sessions
                )
                if (!session) {
                    setSessionToday({ day: todayName, lifts: [] })
                    return
                }
                setSessionToday(session)

                // Check if logged workout exists
                const workout = appData.workouts.find((w) =>
                    isSameDay(today, w.date)
                )
                if (!workout) return
                setWorkoutToday(workout)
            } catch (error) {
                setError(true)
                console.error('Error getting user data: ', error)
            } finally {
                console.log(sessionToday)
                setLoading(false)
            }
        }

        getUserData()
    }, [])

    async function handleWorkoutLog(workout: Workout) {
        try {
            await addWorkout(db, workout)
            showAlert(
                t('common.success'),
                t('workoutLog.successMessage'),
                'success'
            )
            const data = await fetchData()
            setData(data)
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
