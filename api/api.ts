import { SQLiteDatabase } from 'expo-sqlite'

export type AppDataSQL = {
    id: number
    programs: string
    workouts: string
}

export type TrainingProgram = {
    date: string
    workoutDays: string[]
}

export type AppData = {
    id: number
    programs: TrainingProgram[]
    workouts: string[]
}

export async function initData(db: SQLiteDatabase, data: AppData) {
    await db.runAsync(
        'INSERT INTO app_data (programs, workouts) VALUES (?, ?)',
        JSON.stringify(data.programs),
        JSON.stringify(data.workouts),
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

export async function mergeBackup(db: SQLiteDatabase, backup: AppData) {
    const existing = await getData(db)

    if (!existing) {
        await initData(db, backup)
        return
    }

    const existingPrograms = existing.programs ?? []
    const incomingPrograms = backup.programs ?? []

    const mergedPrograms = [...incomingPrograms, ...existingPrograms]

    const existingWorkouts = existing.workouts ?? []
    const incomingWorkouts = backup.workouts ?? []

    const mergedWorkouts = [...incomingWorkouts, ...existingWorkouts]

    await db.runAsync(
        `UPDATE app_data 
         SET programs = ?, workouts = ?, gym_location = ?
         WHERE id = 1`,
        JSON.stringify(mergedPrograms),
        JSON.stringify(mergedWorkouts),
    )
}
