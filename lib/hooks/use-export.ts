import { AlertType } from '@/context/AlertContext'
import { SQLiteDatabase } from 'expo-sqlite'
import { useState } from 'react'
import { Directory } from 'expo-file-system/next'
import { getData } from '@/api/api'

interface useExportProps {
    showAlert: (title: string, message: string, type: AlertType) => void
    t: (key: string, options?: any) => string
    db: SQLiteDatabase
}

export function useExport({ showAlert, t, db }: useExportProps) {
    const [exportDirectory, setExportDirectory] = useState<Directory | null>(
        null
    )
    const [loading, setLoading] = useState(false)

    const exportBackup = async () => {
        try {
            setLoading(true)

            const data = await getData(db)
            const jsonString = JSON.stringify(data, null, 2)
            console.log(jsonString)
            if (!exportDirectory) {
                showAlert(
                    t('importExport.error.exportDirectory.title'),
                    t('importExport.error.exportDirectory.message'),
                    'error'
                )
                return
            }

            console.log('creating backup file')
            const file = exportDirectory.createFile(
                `palester_backup_${Date.now()}.json`,
                'application/json'
            )
            console.log('writing to backup file')
            file.write(jsonString)
            console.log('write done')
            showAlert(
                t('common.success'),
                t('importExport.exportSuccessMessage'),
                'success'
            )
        } catch (err) {
            console.error(err)
            showAlert(
                t('importExport.error.export.title'),
                t('importExport.error.export.message'),
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    const pickDirectory = async () => {
        try {
            const dir = await Directory.pickDirectoryAsync()
            if (!dir) return
            if (dir.exists) {
                setExportDirectory(new Directory(dir.uri))
            }
        } catch (err) {
            console.error(err)
            showAlert(
                t('importExport.error.export.title'),
                t('importExport.error.export.message'),
                'error'
            )
        }
    }

    return {
        loading,
        exportDirectory,
        pickDirectory,
        exportBackup,
    }
}
