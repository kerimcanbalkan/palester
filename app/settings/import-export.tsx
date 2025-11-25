import CustomText from '@/components/CustomText'
import {
    defaultDatabaseDirectory,
    SQLiteDatabase,
    useSQLiteContext,
} from 'expo-sqlite'
import {
    Platform,
    View,
    StyleSheet,
    ViewStyle,
    useColorScheme,
    TextStyle,
} from 'react-native'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import { Directory, File, Paths } from 'expo-file-system/next'
import { useMemo, useState } from 'react'
import { useAlert } from '@/context/AlertContext'
import { addWorkout, getData, mergeBackup } from '@/api/api'
import CustomModal from '@/components/CustomModal'

export default function ImportExport() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const [importFile, setImportFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null)
    const [exportDirectory, setExportDirectory] = useState<Directory | null>(
        null
    )
    const [exportModal, setExportModal] = useState(false)
    const [importModal, setImportModal] = useState(false)
    const { showAlert } = useAlert()
    const db = useSQLiteContext()

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
                'File Picker Error',
                'Something went wrong while picking backup file please try again later.',
                'error'
            )
        }
    }

    const importBackup = async () => {
        try {
            if (!importFile) {
                showAlert(
                    'Import File Error',
                    'You should choose import file before trying to import data',
                    'error'
                )
                return
            }
            const file = new File(importFile.uri)
            const backupData = JSON.parse(file.textSync())
            await mergeBackup(db, backupData)
            showAlert('Success', 'Data imported Successfully!', 'success')
        } catch (err) {
            console.error(err)
            showAlert(
                'File Picker Error',
                'Something went wrong while picking backup file please try again later.',
                'error'
            )
        }
    }

    const exportBackup = async () => {
        try {
            const data = await getData(db)
            const jsonString = JSON.stringify(data, null, 2)
            console.log(jsonString)
            if (!exportDirectory) {
                showAlert(
                    'Export Directory Error',
                    'You should choose export directory before exporting the data',
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
            showAlert('Success', 'Data exported Successfully!', 'success')
        } catch (err) {
            console.error(err)
            showAlert(
                'Export Error',
                'Something went wrong while exporting backup file please try again later.',
                'error'
            )
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
                'Export Error',
                'Something went wrong while exporting backup file please try again later.',
                'error'
            )
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.importContainer}>
                <CustomText style={styles.header}>Import App Data</CustomText>
                <View style={styles.pickerContainer}>
                    <CustomButton
                        text="Pick File"
                        size={12}
                        onPress={async () => {
                            await pickFile()
                        }}
                    />
                    <CustomText style={styles.fileName}>
                        {importFile ? importFile.name : ' '}
                    </CustomText>
                </View>
                <CustomButton
                    text="Import"
                    size={20}
                    onPress={() => setImportModal(true)}
                />
            </View>
            <View style={styles.importContainer}>
                <CustomText style={styles.header}>Import App Data</CustomText>
                <View style={styles.pickerContainer}>
                    <CustomButton
                        text="Pick Directory"
                        size={12}
                        onPress={async () => {
                            await pickDirectory()
                        }}
                    />
                    <CustomText style={styles.fileName}>
                        {exportDirectory ? exportDirectory.name : ' '}
                    </CustomText>
                </View>
                <CustomButton
                    text="Export"
                    size={20}
                    onPress={() => setExportModal(true)}
                />
            </View>
            <CustomModal
                dialog="Are you sure you want to export app data?"
                onConfirm={exportBackup}
                visible={exportModal}
                onClose={() => setExportModal(false)}
            />
            <CustomModal
                dialog="Are you sure you want to import app data?"
                onConfirm={importBackup}
                visible={importModal}
                onClose={() => setImportModal(false)}
            />
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-evenly',
            backgroundColor: colors.bg,
        } as ViewStyle,

        importContainer: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
        } as ViewStyle,

        pickerContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            marginBottom: 10,
        } as ViewStyle,

        header: {
            fontSize: 24,
            padding: 10,
        } as TextStyle,

        fileName: {
            fontSize: 10,
            overflow: 'scroll',
        },
    })
}
