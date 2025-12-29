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
    ScrollView,
} from 'react-native'
import CustomText from './CustomText'
import { format } from 'date-fns'

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
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet}>
                    <Pressable onPress={handleClose} style={styles.close}>
                        <Ionicons name="close" size={32} color={colors.fg} />
                    </Pressable>

                    <CustomText style={styles.date}>
                        {format(workout.date, 'dd LLLL yyyy')}
                    </CustomText>
                    <ScrollView
                        style={{
                            maxHeight: scrollHeight,
                            width: '100%',
                            borderWidth: 1,
                            borderColor: colors.fg,
                        }}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                        onContentSizeChange={(_, h) => {
                            setContentHeight(h)
                        }}
                    >
                        {workout.lifts.map((l, key) => {
                            const quantity =
                                l.quantity.type === 'reps'
                                    ? l.quantity.reps.toString()
                                    : l.quantity.seconds.toString() + 's'
                            return (
                                <View style={styles.container} key={key}>
                                    <CustomText style={styles.lift}>
                                        {l.name}
                                    </CustomText>
                                    <CustomText style={styles.lift}>
                                        {l.sets}x{quantity}
                                    </CustomText>
                                    <CustomText style={styles.lift}>
                                        {l.weight?.weight} {l.weight?.unit}
                                    </CustomText>
                                </View>
                            )
                        })}
                    </ScrollView>
                </Pressable>
            </Pressable>
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
        },
        lift: {
            fontSize: 18,
            marginVertical: 5,
            width: '33.3%',
            paddingHorizontal: 10,
        },
    })
}
