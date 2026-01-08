import { Workout } from '@/api/api'
import { colorType, darkColors, lightColors } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import {
    useColorScheme,
    StyleSheet,
    Pressable,
    Modal,
    View,
    FlatList,
} from 'react-native'
import CustomText from './CustomText'
import { format } from 'date-fns'
import { enUS, tr, sq } from 'date-fns/locale'
import i18n from '@/localization/i18n'

interface ModalProps {
    visible: boolean
    workout: Workout
    onClose: () => void
}

export default function WorkoutModal({
    visible,
    workout,
    onClose,
}: ModalProps) {
    const localeMapping = {
        en: enUS,
        tr: tr,
        sq: sq,
    }
    const currentLocale =
        localeMapping[i18n.locale as keyof typeof localeMapping] || enUS
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 300
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)

    const handleClose = () => {
        onClose()
    }

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <Pressable onPress={handleClose} style={styles.close}>
                        <Ionicons name="close" size={32} color={colors.fg} />
                    </Pressable>
                    <CustomText style={styles.date}>
                        {format(workout.date, 'dd LLLL yyyy', {
                            locale: currentLocale,
                        })}
                    </CustomText>
                    <FlatList
                        data={workout.lifts}
                        style={{
                            maxHeight: scrollHeight,
                        }}
                        contentContainerStyle={{
                            borderWidth: 1,
                            borderColor: colors.fg,
                            padding: 10,
                            alignContent: 'center',
                        }}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={(_, h) => {
                            setContentHeight(h)
                        }}
                        renderItem={({ item }) => {
                            const quantity =
                                item.quantity.type === 'reps'
                                    ? item.quantity.reps.toString()
                                    : item.quantity.seconds.toString() + 's'
                            return (
                                <View style={styles.container}>
                                    <CustomText style={styles.lift}>
                                        {item.name}
                                    </CustomText>
                                    <CustomText style={styles.lift}>
                                        {item.sets}x{quantity}
                                    </CustomText>
                                    <CustomText style={styles.lift}>
                                        {item.weight?.weight}{' '}
                                        {item.weight?.unit}
                                    </CustomText>
                                </View>
                            )
                        }}
                    />
                </View>
            </View>
        </Modal>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.modalBg,
        },
        sheet: {
            backgroundColor: colors.bg2,
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.bg,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
        },
        scrollContent: {
            width: '80%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
        },
        close: {
            alignSelf: 'flex-end',
        },
        date: {
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 10,
        },
        container: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        lift: {
            fontSize: 18,
            marginVertical: 5,
            width: '33.3%',
            textAlign: 'center',
        },
    })
}
