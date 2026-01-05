import {
    View,
    ViewStyle,
    StyleSheet,
    useColorScheme,
    TextStyle,
    Pressable,
} from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import CustomText from '@/components/CustomText'
import { File } from 'expo-file-system/next'
import * as DocumentPicker from 'expo-document-picker'
import { useSQLiteContext } from 'expo-sqlite'
import { mergeBackup } from '@/api/api'
import CustomModal from '@/components/CustomModal'
import Loading from '@/components/Loading'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from '@/localization/useTranslation'

export default function Import() {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const { showAlert } = useAlert()
    const [importFile, setImportFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null)
    const [importModal, setImportModal] = useState(false)
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
                t('setupImport.error.filePicker.title'),
                t('setupImport.error.filePicker.message'),
                'error'
            )
        }
    }

    const importBackup = async () => {
        try {
            setLoading(true)

            if (!importFile) {
                showAlert(
                    t('setupImport.error.importFile.title'),
                    t('setupImport.error.importFile.message'),
                    'error'
                )
                return
            }
            const file = new File(importFile.uri)
            const backupData = JSON.parse(file.textSync())
            await mergeBackup(db, backupData)
            await AsyncStorage.setItem('setup_done', 'true')
            router.replace('/home')
        } catch (err) {
            console.error(err)
            showAlert(
                t('setupImport.error.filePicker.title'),
                t('setupImport.error.filePicker.message'),
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <View style={styles.container}>
            <Logo size={46} />
            <View style={{ alignItems: 'center' }}>
                <CustomText style={styles.header}>
                    {t('setupImport.title')}
                </CustomText>
                <CustomText style={styles.text}>
                    {t('setupImport.question')}
                </CustomText>
                <View style={styles.pickerContainer}>
                    <CustomButton
                        text={t('setupImport.pickFile')}
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
                    text={t('setupImport.import')}
                    size={20}
                    onPress={() => setImportModal(true)}
                />
            </View>
            <CustomModal
                visible={importModal}
                dialog={t('setupImport.dialog')}
                onConfirm={importBackup}
                onClose={() => setImportModal(false)}
            />
            <Pressable
                onPress={() => router.replace('/setup/program')}
                style={styles.skip}
            >
                <CustomText style={styles.skipText}>
                    {t('common.skip') + ' >'}
                </CustomText>
            </Pressable>
        </View>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
        } as ViewStyle,

        buttonContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: 30,
            flexWrap: 'wrap',
            gap: 10,
            width: '100%',
        } as ViewStyle,

        text: {
            color: colors.fg,
            fontSize: 24,
            textAlign: 'center',
            padding: 15,
        } as TextStyle,

        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        } as TextStyle,

        pickerContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            marginBottom: 12,
        } as ViewStyle,

        fileName: {
            fontSize: 10,
            overflow: 'scroll',
        } as TextStyle,

        skip: {
            alignSelf: 'flex-end',
        },

        skipText: {
            fontSize: 18,
            textDecorationStyle: 'solid',
            textDecorationLine: 'underline',
            textDecorationColor: colors.fg,
        } as TextStyle,
    })
}
