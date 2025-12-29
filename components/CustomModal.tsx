import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
} from 'react-native'

interface ModalProps {
    dialog: string
    onConfirm: () => void
    visible: boolean
    onClose: () => void
    loading?: boolean
}

export default function CustomModal({
    dialog,
    onConfirm,
    visible,
    onClose,
}: ModalProps) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>{dialog}</Text>
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onClose}
                        >
                            <Text style={styles.textStyle}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonConfirm]}
                            onPress={() => {
                                onConfirm()
                                onClose()
                            }}
                        >
                            <Text style={styles.textStyle}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.modalBg,
        },
        modal: {
            backgroundColor: colors.bg2,
            borderRadius: 10,
            padding: 30,
            alignItems: 'center',
            shadowColor: colors.bg,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 10,
        },
        button: {
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
            elevation: 2,
        },
        buttonConfirm: {
            backgroundColor: colors.green,
        },
        buttonCancel: {
            backgroundColor: colors.red,
        },
        textStyle: {
            color: colors.fg,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        modalText: {
            marginBottom: 15,
            textAlign: 'center',
            color: colors.fg,
        },
    })
}
