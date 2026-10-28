import { useTranslation } from '@/localization/useTranslation'
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
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.modal}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name="help-circle-outline"
                            size={30}
                            color={colors.fg}
                        />
                    </View>

                    <Text style={styles.modalText}>{dialog}</Text>

                    <View style={styles.buttonRow}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.buttonCancel,
                                pressed && styles.pressed,
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.textStyle}>
                                {t('common.cancel')}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.buttonConfirm,
                                pressed && styles.pressed,
                            ]}
                            onPress={() => {
                                onConfirm()
                                onClose()
                            }}
                        >
                            <Text style={styles.textStyle}>
                                {t('common.ok')}
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
            paddingHorizontal: 24,
            backgroundColor: colors.modalBg,
        },
        modal: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: colors.bg2,
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
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        modalText: {
            color: colors.fg,
            fontSize: 16,
            lineHeight: 22,
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: 24,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
            width: '100%',
        },
        button: {
            flex: 1,
            height: 46,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonConfirm: {
            backgroundColor: colors.green,
        },
        buttonCancel: {
            backgroundColor: colors.red,
        },
        textStyle: {
            color: colors.fg,
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
        },
        pressed: {
            opacity: 0.7,
        },
    })
}
