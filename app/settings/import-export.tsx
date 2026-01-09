import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import {
    View,
    StyleSheet,
    ViewStyle,
    useColorScheme,
    TextStyle,
} from 'react-native'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import CustomButton from '@/components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import { Directory, File } from 'expo-file-system/next'
import { useState } from 'react'
import { useAlert } from '@/context/AlertContext'
import { getData, mergeBackup } from '@/api/api'
import CustomModal from '@/components/CustomModal'
import Loading from '@/components/Loading'
import { useTranslation } from '@/localization/useTranslation'
import { useRouter } from 'expo-router'

export default function ImportExport() {
    const { t } = useTranslation()
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
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    if (loading) {
        return <Loading />
    }

    return (
        <View style={styles.container}>
            <View style={styles.importContainer}>
                <CustomText style={styles.header}>
                    {t('importExport.importTitle')}
                </CustomText>
                <View style={styles.pickerContainer}>
                    <CustomButton
                        text={t('importExport.pickFile')}
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
                    text={t('importExport.importButton')}
                    size={20}
                    onPress={() => setImportModal(true)}
                />
            </View>
            <View style={styles.importContainer}>
                <CustomText style={styles.header}>
                    {t('importExport.exportTitle')}
                </CustomText>
                <View style={styles.pickerContainer}>
                    <CustomButton
                        text={t('importExport.pickDirectory')}
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
                    text={t('importExport.exportButton')}
                    size={20}
                    onPress={() => setExportModal(true)}
                />
            </View>
            <CustomModal
                dialog={t('importExport.exportDialog')}
                onConfirm={exportBackup}
                visible={exportModal}
                onClose={() => setExportModal(false)}
            />
            <CustomModal
                dialog={t('importExport.importDialog')}
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
            gap: 6,
        } as ViewStyle,

        pickerContainer: {
            alignItems: 'center',
            justifyContent: 'center',
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
