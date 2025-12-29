import { SQLiteDatabase } from 'expo-sqlite'

export type AppDataSQL = {
    id: number
    programs: string
    workouts: string
}

export type LiftQuantity =
    | { type: 'reps'; reps: number }
    | { type: 'time'; seconds: number } // s

export type Weight = {
    weight: number
    unit: "kg" | "lbs"
}

export type Lift = {
    id: number
    name: string
    sets: number
    quantity: LiftQuantity
    weight?: Weight
}

export type Session = {
    day: string
    lifts: Lift[]
}

export type TrainingProgram = {
    date: string
    sessions: Session[]
}

export type Workout = {
    date: string
    lifts: Lift[]
}

export type AppData = {
    id: number
    programs: TrainingProgram[]
    workouts: Workout[]
}

export async function initData(db: SQLiteDatabase, data: AppData) {
    await db.runAsync(
        'INSERT INTO app_data (programs, workouts) VALUES (?, ?)',
        JSON.stringify(data.programs),
        JSON.stringify(data.workouts)
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

export async function addWorkout(db: SQLiteDatabase, workout: Workout) {
    const data = await getData(db)
    const workouts: Workout[] = data?.workouts ?? []

    const index = workouts.findIndex((w) => w.date === workout.date)

    if (index !== -1) {
        // update existing workout
        workouts[index] = workout
    } else {
        // add new workout
        workouts.push(workout)
    }

    await db.runAsync(
        'UPDATE app_data SET workouts = ? WHERE id = 1',
        JSON.stringify(workouts)
    )
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
         SET programs = ?, workouts = ?
         WHERE id = 1`,
        JSON.stringify(mergedPrograms),
        JSON.stringify(mergedWorkouts)
    )
}
