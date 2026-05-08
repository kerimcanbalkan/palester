import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import { AlertType } from '@/context/AlertContext'
import { mergeBackup } from '@/api/api'
import { Router } from 'expo-router'
import { File } from 'expo-file-system/next'
import { SQLiteDatabase } from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface useImportProps {
    showAlert: (title: string, message: string, type: AlertType) => void
    t: (key: string, options?: any) => string
    router: Router
    db: SQLiteDatabase
}

export function useImport({ showAlert, t, router, db }: useImportProps) {
    const [importFile, setImportFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null)
    const [loading, setLoading] = useState(false)

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: 'application/json',
            })
            if (result.canceled) return
            setImportFile(result.assets[0])
        } catch (err) {
            console.error(err)
            showAlert(
                t('importExport.error.filePicker.title'),
                t('importExport.error.filePicker.message'),
                'error'
            )
        }
    }

    const importBackup = async () => {
        try {
            setLoading(true)

            if (!importFile) {
                showAlert(
                    t('importExport.error.importFile.title'),
                    t('importExport.error.importFile.message'),
                    'error'
                )
                return
            }
            const file = new File(importFile.uri)
            const backupData = JSON.parse(file.textSync())
            await mergeBackup(db, backupData)
            const setup = await AsyncStorage.getItem('setup_done')
            if (!setup) {
                await AsyncStorage.setItem('setup_done', 'true')
            }
            showAlert(
                t('common.success'),
                t('importExport.importSuccessMessage'),
                'success'
            )
            router.replace('/home')
        } catch (err) {
            console.error(err)
            showAlert(
                t('importExport.error.filePicker.title'),
                t('importExport.error.filePicker.messsage'),
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        pickFile,
        importBackup,
        importFile,
    }
}
