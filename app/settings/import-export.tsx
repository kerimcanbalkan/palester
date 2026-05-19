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
import { useState } from 'react'
import { useAlert } from '@/context/AlertContext'
import CustomModal from '@/components/CustomModal'
import Loading from '@/components/Loading'
import { useTranslation } from '@/localization/useTranslation'
import { useRouter } from 'expo-router'
import { useImport } from '@/lib/hooks/use-import'
import { useExport } from '@/lib/hooks/use-export'

export default function ImportExport() {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [exportModal, setExportModal] = useState(false)
    const [importModal, setImportModal] = useState(false)
    const { showAlert } = useAlert()
    const router = useRouter()
    const db = useSQLiteContext()
    const {
        loading: importLoading,
        pickFile,
        importBackup,
        importFile,
    } = useImport({
        t,
        showAlert,
        router,
        db,
    })
    const {
        loading: exportLoading,
        exportDirectory,
        pickDirectory,
        exportBackup,
    } = useExport({
        t,
        showAlert,
        db,
    })

    if (importLoading || exportLoading) {
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
                    disabled={!importFile}
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
                    disabled={!exportDirectory}
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
