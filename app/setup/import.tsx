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

export default function Import() {
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
                'File Picker Error',
                'Something went wrong while picking backup file please try again later.',
                'error'
            )
        }
    }

    const importBackup = async () => {
        try {
            setLoading(true)

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
            router.replace('/home')
        } catch (err) {
            console.error(err)
            showAlert(
                'File Picker Error',
                'Something went wrong while importing backup file please try again later.',
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
                <CustomText style={styles.header}>Import</CustomText>
                <CustomText style={styles.text}>
                    Do you have a backup data?
                </CustomText>
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
            <CustomModal
                visible={importModal}
                dialog="Are you sure you want to import this backup file?"
                onConfirm={importBackup}
                onClose={() => setImportModal(false)}
            />
            <Pressable
                onPress={() => router.replace('/setup/program')}
                style={styles.skip}
            >
                <CustomText style={styles.skipText}>Skip</CustomText>
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
            marginBottom: 12
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
