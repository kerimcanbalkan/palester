import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
} from 'react-native'
import { AlertType } from '@/context/AlertContext'

interface ModalProps {
    title: string
    message: string
    type: AlertType
    visible: boolean
    onClose: () => void
}

export default function CustomModal({
    title,
    message,
    type,
    visible,
    onClose,
}: ModalProps) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    // Determine modal background and text color based on alert type
    const typeStyles = (() => {
        switch (type) {
            case 'error':
                return {
                    backgroundColor: colors.red,
                    textColor: colors.fg, // text should contrast red
                }
            case 'warning':
                return {
                    backgroundColor: colors.fg, // assuming you have green in your theme
                    textColor: colors.bg,
                }
            case 'success':
                return {
                    backgroundColor: colors.green, // assuming you have green in your theme
                    textColor: colors.bg,
                }
            case 'info':
            default:
                return {
                    backgroundColor: colors.bg2,
                    textColor: colors.fg,
                }
        }
    })()

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View
                    style={[
                        styles.modal,
                        { backgroundColor: typeStyles.backgroundColor },
                    ]}
                >
                    <Text
                        style={[styles.title, { color: typeStyles.textColor }]}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.modalText,
                            { color: typeStyles.textColor },
                        ]}
                    >
                        {message}
                    </Text>
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: typeStyles.textColor },
                            ]}
                            onPress={onClose}
                        >
                            <Text
                                style={[
                                    styles.textStyle,
                                    { color: typeStyles.backgroundColor },
                                ]}
                            >
                                Ok
                            </Text>
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
        },
        modal: {
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
        textStyle: {
            fontWeight: 'bold',
            textAlign: 'center',
        },
        title: {
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 24,
        },
        modalText: {
            marginVertical: 15,
            textAlign: 'center',
        },
    })
}
