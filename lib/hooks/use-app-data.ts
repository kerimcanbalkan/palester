import { AppData, getData, Session, Workout } from '../../api/api'
import { useSQLiteContext } from 'expo-sqlite'
import { format, isSameDay, startOfToday } from 'date-fns'
import { useEffect, useState } from 'react'

export function useAppData() {
    const db = useSQLiteContext()
    const [data, setData] = useState<AppData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const today = startOfToday()
    const todayName = format(today, 'EEE').toLocaleLowerCase()
    const [sessionToday, setSessionToday] = useState<Session>({
        day: todayName,
        lifts: [],
    })
    const [workoutToday, setWorkoutToday] = useState<Workout | null>(null)

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
                ].sessions.find((s: Session) => s.day === todayName)
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
                const workout = appData.workouts.find((w: Workout) =>
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
    }, [data])

    return {
        data,
        loading,
        error,
        sessionToday,
        workoutToday,
    }
}
