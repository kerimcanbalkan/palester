import { SQLiteDatabase } from 'expo-sqlite'

export type GymLocation = {
    lat: number
    lng: number
} | null

export type AppDataSQL = {
    id: number
    programs: string
    workouts: string
    gym_location: string | null
}

export type TrainingProgram = {
    date: string
    workoutDays: string[]
}

export type AppData = {
    id: number
    programs: TrainingProgram[]
    workouts: string[]
    gymLocation: GymLocation
}

export async function initData(db: SQLiteDatabase, data: AppData) {
    await db.runAsync(
        'INSERT INTO app_data (programs, workouts, gym_location) VALUES (?, ?, ?)',
        JSON.stringify(data.programs),
        JSON.stringify(data.workouts),
        JSON.stringify(data.gymLocation)
    )
}

export async function getData(db: SQLiteDatabase): Promise<AppData | null> {
    const result = await db.getAllAsync<AppDataSQL>(
        'SELECT * FROM app_data LIMIT 1'
    )
    if (!result.length) return null

    const row = result[0]
    return {
        id: row.id,
        programs: JSON.parse(row.programs || '[]'),
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

export async function addProgram(db: SQLiteDatabase, program: TrainingProgram) {
    const data = await getData(db)
    const programs: TrainingProgram[] = data ? data.programs : []

    programs.push(program)
    await db.runAsync(
        'UPDATE app_data SET programs = ? WHERE id = 1',
        JSON.stringify(programs)
    )
}

export async function updateGymLocation(
    db: SQLiteDatabase,
    location: GymLocation
) {
    await db.runAsync(
        'UPDATE app_data SET gym_location = ? WHERE id = 1',
        JSON.stringify(location)
    )
}
