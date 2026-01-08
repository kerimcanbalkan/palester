import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Modal,
    View,
    Pressable,
    StyleSheet,
    useColorScheme,
    TextInput,
    FlatList,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import CustomPicker from '@/components/CustomPicker'
import { Lift, Session, Workout } from '@/api/api'
import { useAlert } from '@/context/AlertContext'
import CustomText from './CustomText'
import { startOfToday } from 'date-fns'
import CustomButton from './CustomButton'
import CustomModal from './CustomModal'
import { useTranslation } from '@/localization/useTranslation'

interface ModalProps {
    visible: boolean
    onClose: () => void
    session: Session
    workout?: Workout
    onSave: (workout: Workout) => void
}

export default function WorkoutLogModal({
    visible,
    onClose,
    onSave,
    session,
    workout: initialWorkout,
}: ModalProps) {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const today = startOfToday().toISOString()
    const { showAlert } = useAlert()
    const [workout, setWorkout] = useState<Workout>(
        initialWorkout
            ? initialWorkout
            : {
                date: today,
                lifts: session.lifts,
            }
    )
    const [visualValidation, setVisualValidation] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)

    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 300
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)

    const handleClose = () => {
        onClose()
        setVisualValidation(false)
    }

    const updateWorkout = (id: number, updated: Lift) => {
        setWorkout((prev) => ({
            ...prev,
            lifts: prev.lifts.map((l) => (l.id === id ? updated : l)),
        }))
    }

    const handleSave = (workout: Workout) => {
        const isValid = workout.lifts.every(
            (lift) => lift.weight && lift.weight.weight >= 0
        )

        if (!isValid) {
            setVisualValidation(true)
            showAlert(
                t('workoutLog.error.invalidWorkout.title'),
                t('workoutLog.error.invalidWorkout.message'),
                'error'
            )
            return
        }
        onSave(workout)
        onClose()
    }

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View
                    style={styles.sheet}
                >
                    <Pressable onPress={handleClose} style={styles.close}>
                        <Ionicons name="close" size={32} color={colors.fg} />
                    </Pressable>
                    <FlatList
                        data={workout.lifts}
                        style={{ maxHeight: scrollHeight, marginVertical: 10 }}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={(_, h) => {
                            setContentHeight(h)
                        }}
                        renderItem={({ item }) => (
                            <LiftInput
                                lift={item}
                                validate={visualValidation}
                                onChange={(updated) =>
                                    updateWorkout(item.id, updated)
                                }
                            />
                        )}
                    />
                    <CustomButton
                        text={
                            initialWorkout
                                ? t('common.update')
                                : t('common.save')
                        }
                        size={18}
                        onPress={() => setConfirmModal(true)}
                    />
                </View>
            </View>
            <CustomModal
                dialog={t('workoutLog.modalQuestion')}
                onConfirm={() => handleSave(workout)}
                visible={confirmModal}
                onClose={() => setConfirmModal(false)}
            />
        </Modal>
    )
}

interface LiftInputProps {
    lift: Lift
    onChange: (lift: Lift) => void
    validate: boolean
}

function LiftInput({ lift, onChange, validate }: LiftInputProps) {
    if (!lift.weight) {
        lift.weight = { weight: 0, unit: 'kg' }
    }
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const weightInvalid = validate && lift?.weight.weight <= 0
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(
        lift.weight.unit ? lift.weight.unit : 'kg'
    )
    const quantity =
        lift.quantity.type === 'reps'
            ? lift.quantity.reps.toString()
            : lift.quantity.seconds.toString() + 's'

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={styles.liftContainer}>
                <CustomText style={styles.lift}>{lift.name}</CustomText>
                <CustomText style={styles.textStyle}>
                    {lift.sets}x{quantity}
                </CustomText>
                <View style={styles.inputContainer}>
                    <TextInput
                        selectTextOnFocus
                        style={[
                            styles.input,
                            weightInvalid && styles.inputError,
                        ]}
                        keyboardType="numeric"
                        value={String(lift.weight.weight)}
                        onChangeText={(weight) =>
                            onChange({
                                ...lift,
                                weight: {
                                    weight: Number(weight),
                                    unit: weightUnit,
                                },
                            })
                        }
                    />
                    <CustomPicker
                        style={styles.picker}
                        value={String(weightUnit)}
                        items={[
                            { label: 'kg', value: 'kg' },
                            { label: 'lbs', value: 'lbs' },
                        ]}
                        onChange={(unit) => {
                            if (unit !== 'kg' && unit !== 'lbs') return
                            setWeightUnit(unit)
                        }}
                    />
                </View>
            </View>
        </View>
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
            elevation: 5,
        },
        liftContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '90%',
            marginVertical: 10,
        },
        lift: {
            fontSize: 18,
            width: '25%',
        },
        input: {
            borderWidth: 1,
            width: 40,
            height: 40,
            textAlign: 'center',
            color: colors.fg,
            borderColor: colors.fg,
            borderRadius: 5,
        },
        inputError: {
            borderColor: colors.red,
        },
        textStyle: {
            color: colors.fg,
            textAlign: 'center',
            fontSize: 18,
            width: '25%',
        },
        close: {
            color: colors.fg,
            alignSelf: 'flex-end',
        },
        picker: {
            alignSelf: 'flex-end',
        },
        inputContainer: {
            flexDirection: 'row',
            gap: 5,
        },
    })
}
