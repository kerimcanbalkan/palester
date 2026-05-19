import { AppData, getData, Session, Workout } from '../../api/api'
import { useSQLiteContext } from 'expo-sqlite'
import { format, isSameDay, startOfToday } from 'date-fns'
import { useEffect, useState, useCallback } from 'react' // Added useCallback

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

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(false)
        try {
            const appData: AppData | null = await getData(db)

            if (!appData) {
                throw new Error('App data is null')
            }

            setData(appData)

            // Logic to find today's session
            const currentProgram = appData.programs[appData.programs.length - 1]
            const session = currentProgram?.sessions.find(
                (s: Session) => s.day === todayName
            )

            if (!session) {
                setSessionToday({ day: todayName, lifts: [] })
            } else {
                setSessionToday(session)
            }

            // Logic to find today's logged workout
            const workout = appData.workouts.find((w: Workout) =>
                isSameDay(today, w.date)
            )
            setWorkoutToday(workout || null)
        } catch (err) {
            setError(true)
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }, [db, todayName])

    // Run on mount
    useEffect(() => {
        refetch()
    }, [refetch])

    return {
        data,
        loading,
        error,
        sessionToday,
        workoutToday,
        refetch,
    }
}
