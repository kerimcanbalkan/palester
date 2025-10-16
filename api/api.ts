import { SQLiteDatabase } from 'expo-sqlite'

export type GymLocation = {
    lat: number
    lng: number
} | null

export type AppData = {
    id: number
    app_start_date: string
    workout_days: string
    workouts: string
    gym_location: string | null
}
export async function initData(
    db: SQLiteDatabase,
    appStartDate: string,
    workoutDays: string[],
    workouts: string[],
    gymLocation: GymLocation
) {
    await db.runAsync(
        'INSERT INTO app_data (app_start_date, workout_days, workouts, gym_location) VALUES (?, ?, ?, ?)',
        appStartDate,
        JSON.stringify(workoutDays),
        JSON.stringify(workouts),
        JSON.stringify(gymLocation)
    )
}

export async function getData(db: SQLiteDatabase): Promise<{
    id: number
    appStartDate: string
    workoutDays: string[]
    workouts: string[]
    gymLocation: GymLocation
} | null> {
    const result = await db.getAllAsync<AppData>(
        'SELECT * FROM app_data LIMIT 1'
    )
    if (!result.length) return null

    const row = result[0]
    return {
        id: row.id,
        appStartDate: row.app_start_date,
        workoutDays: JSON.parse(row.workout_days || '[]'),
        workouts: JSON.parse(row.workouts || '[]'),
        gymLocation: row.gym_location ? JSON.parse(row.gym_location) : null,
    }
}

export async function addWorkout(db: SQLiteDatabase, date: string) {
    const data = await getData(db)
    const workouts: string[] = data ? data.workouts : []

    if (!workouts.includes(date)) {
        workouts.push(date)
        await db.runAsync(
            'UPDATE app_data SET workouts = ? WHERE id = 1',
            JSON.stringify(workouts)
        )
    }
}

export async function getGymLocation(db: SQLiteDatabase): Promise<GymLocation> {
    const data = await getData(db)
    return data?.gymLocation ?? null
}
