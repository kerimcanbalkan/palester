import { SQLiteDatabase } from 'expo-sqlite'

export type AppDataSQL = {
    id: number
    sessions: string
    workouts: string
}

export type LiftQuantity =
    | { type: 'reps'; reps: number }
    | { type: 'time'; seconds: number } // s

export type Weight = {
    weight: number
    unit: 'kg' | 'lbs'
}

export type Lift = {
    id: number
    name: string
    sets: number
    quantity: LiftQuantity
    weight?: Weight
}

export type Session = {
    name: string
    lifts: Lift[]
}

export type Workout = {
    date: string
    sessionName?: string
    lifts: Lift[]
}

export type AppData = {
    id: number
    sessions: Session[]
    workouts: Workout[]
}

const ROW_ID = 1

export async function initData(db: SQLiteDatabase, data: AppData) {
    await db.runAsync(
        `INSERT INTO app_data (id, sessions, workouts) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            sessions = excluded.sessions,
            workouts = excluded.workouts`,
        ROW_ID,
        JSON.stringify(data.sessions),
        JSON.stringify(data.workouts)
    )
}

export async function updateSessions(db: SQLiteDatabase, sessions: Session[]) {
    await db.runAsync(
        `INSERT INTO app_data (id, sessions, workouts) VALUES (?, ?, '[]')
         ON CONFLICT(id) DO UPDATE SET sessions = excluded.sessions`,
        ROW_ID,
        JSON.stringify(sessions)
    )
}

export async function getData(db: SQLiteDatabase): Promise<AppData | null> {
    const row = await db.getFirstAsync<AppDataSQL>(
        'SELECT * FROM app_data WHERE id = ?',
        ROW_ID
    )
    if (!row) return null

    return {
        id: row.id,
        sessions: JSON.parse(row.sessions || '[]'),
        workouts: JSON.parse(row.workouts || '[]'),
    }
}

export async function addWorkout(db: SQLiteDatabase, workout: Workout) {
    const data = await getData(db)
    const workouts: Workout[] = data?.workouts ?? []

    const index = workouts.findIndex((w) => w.date === workout.date)

    if (index !== -1) {
        workouts[index] = workout // update existing workout
    } else {
        workouts.push(workout) // add new workout
    }

    await db.runAsync(
        'UPDATE app_data SET workouts = ? WHERE id = ?',
        JSON.stringify(workouts),
        ROW_ID
    )
}

export async function mergeBackup(db: SQLiteDatabase, backup: AppData) {
    // initData already inserts-or-replaces row 1
    await initData(db, {
        id: ROW_ID,
        sessions: backup.sessions ?? [],
        workouts: backup.workouts ?? [],
    })
}
