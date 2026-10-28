import { colorType, darkColors, lightColors } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
} from 'react-native'
import { AlertType } from '@/context/AlertContext'
import { useTranslation } from '@/localization/useTranslation'

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
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const typeStyles = (() => {
        switch (type) {
            case 'error':
                return {
                    backgroundColor: colors.red,
                    textColor: colors.fg,
                    icon: 'alert-circle' as const,
                }
            case 'warning':
                return {
                    backgroundColor: colors.fg,
                    textColor: colors.bg,
                    icon: 'warning' as const,
                }
            case 'success':
                return {
                    backgroundColor: colors.green,
                    textColor: colors.bg,
                    icon: 'checkmark-circle' as const,
                }
            case 'info':
            default:
                return {
                    backgroundColor: colors.bg2,
                    textColor: colors.fg,
                    icon: 'information-circle' as const,
                }
        }
    })()

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View
                    style={[
                        styles.modal,
                        { backgroundColor: typeStyles.backgroundColor },
                    ]}
                >
                    <View
                        style={[
                            styles.iconCircle,
                            { backgroundColor: typeStyles.textColor },
                        ]}
                    >
                        <Ionicons
                            name={typeStyles.icon}
                            size={32}
                            color={typeStyles.backgroundColor}
                        />
                    </View>

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

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: typeStyles.textColor },
                            pressed && styles.pressed,
                        ]}
                        onPress={onClose}
                    >
                        <Text
                            style={[
                                styles.textStyle,
                                { color: typeStyles.backgroundColor },
                            ]}
                        >
                            {t('common.ok')}
                        </Text>
                    </Pressable>
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
            paddingHorizontal: 24,
            backgroundColor: colors.modalBg,
        },
        modal: {
            width: '100%',
            maxWidth: 360,
            borderRadius: 16,
            paddingTop: 24,
            paddingHorizontal: 20,
            paddingBottom: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 12,
        },
        iconCircle: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
        },
        modalText: {
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            opacity: 0.9,
            marginTop: 8,
            marginBottom: 24,
        },
        button: {
            width: '100%',
            height: 46,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        textStyle: {
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
        },
        pressed: {
            opacity: 0.7,
        },
    })
}
