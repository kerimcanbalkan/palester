import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Modal,
    View,
    Pressable,
    StyleSheet,
    useColorScheme,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import CustomPicker from '@/components/CustomPicker'
import { Lift, Session, Workout } from '@/api/api'
import { useAlert } from '@/context/AlertContext'
import CustomText from './CustomText'
import { startOfToday, format } from 'date-fns'
import CustomButton from './CustomButton'
import CustomModal from './CustomModal'
import { useTranslation } from '@/localization/useTranslation'

interface ModalProps {
    visible: boolean
    onClose: () => void
    sessions: Session[]
    // Pass to edit an existing workout
    workout?: Workout
    onSave: (workout: Workout) => void
}

const todayString = () => format(startOfToday(), 'yyyy-MM-dd')

const liftsFromSession = (session: Session): Lift[] =>
    session.lifts.map((lift) => ({
        ...lift,
        quantity: { ...lift.quantity },
        weight: lift.weight ? { ...lift.weight } : { weight: 0, unit: 'kg' },
    }))

const isWeightValid = (lift: Lift) =>
    !!lift.weight &&
    Number.isFinite(lift.weight.weight) &&
    lift.weight.weight >= 0

export default function WorkoutLogModal({
    visible,
    onClose,
    onSave,
    sessions,
    workout: initialWorkout,
}: ModalProps) {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const { showAlert } = useAlert()

    const [workout, setWorkout] = useState<Workout | null>(
        initialWorkout ?? null
    )
    const [visualValidation, setVisualValidation] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)

    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 340
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)

    const reset = () => {
        setWorkout(initialWorkout ?? null)
        setVisualValidation(false)
        setConfirmModal(false)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const selectSession = (session: Session) => {
        setVisualValidation(false)
        setWorkout({
            date: todayString(),
            sessionName: session.name,
            lifts: liftsFromSession(session),
        })
    }

    const backToSessions = () => {
        setWorkout(null)
        setVisualValidation(false)
    }

    const updateLift = (id: number, updated: Lift) => {
        setWorkout((prev) =>
            prev
                ? {
                      ...prev,
                      lifts: prev.lifts.map((l) => (l.id === id ? updated : l)),
                  }
                : prev
        )
    }

    const requestSave = () => {
        if (!workout) return

        if (!workout.lifts.every(isWeightValid)) {
            setVisualValidation(true)
            showAlert(
                t('workoutLog.error.invalidWorkout.title'),
                t('workoutLog.error.invalidWorkout.message'),
                'error'
            )
            return
        }
        setConfirmModal(true)
    }

    const handleSave = () => {
        if (!workout) return
        onSave(workout)
        reset()
        onClose()
    }

    const showBack = !!workout && !initialWorkout

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        {showBack ? (
                            <Pressable
                                onPress={backToSessions}
                                hitSlop={12}
                                style={({ pressed }) => [
                                    styles.iconButton,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={20}
                                    color={colors.fg}
                                />
                            </Pressable>
                        ) : (
                            <View style={styles.iconSpacer} />
                        )}

                        <View style={styles.titleBlock}>
                            <CustomText style={styles.title} numberOfLines={1}>
                                {workout
                                    ? (workout.sessionName ?? workout.date)
                                    : t('workoutLog.selectSession')}
                            </CustomText>
                            {workout?.sessionName ? (
                                <CustomText style={styles.subtitle}>
                                    {workout.date}
                                </CustomText>
                            ) : null}
                        </View>

                        <Pressable
                            onPress={handleClose}
                            hitSlop={12}
                            style={({ pressed }) => [
                                styles.iconButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color={colors.fg}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    {!workout ? (
                        sessions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="barbell-outline"
                                    size={40}
                                    color={colors.fg}
                                    style={{ opacity: 0.5 }}
                                />
                                <CustomText style={styles.emptyText}>
                                    {t('workoutLog.noSessions')}
                                </CustomText>
                            </View>
                        ) : (
                            <FlatList
                                data={sessions}
                                style={{ maxHeight: scrollHeight }}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => (
                                    <View style={{ height: 10 }} />
                                )}
                                keyExtractor={(item, index) =>
                                    `${index}-${item.name}`
                                }
                                onContentSizeChange={(_, h) =>
                                    setContentHeight(h)
                                }
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => selectSession(item)}
                                        style={({ pressed }) => [
                                            styles.sessionCard,
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <View style={styles.sessionIcon}>
                                            <Ionicons
                                                name="barbell-outline"
                                                size={20}
                                                color={colors.bg}
                                            />
                                        </View>
                                        <View style={{ flex: 1, gap: 2 }}>
                                            <CustomText
                                                style={styles.sessionName}
                                                numberOfLines={1}
                                            >
                                                {item.name}
                                            </CustomText>
                                            <View style={styles.sessionMeta}>
                                                <Ionicons
                                                    name="list-outline"
                                                    size={13}
                                                    color={colors.fg}
                                                />
                                                <CustomText
                                                    style={styles.metaText}
                                                >
                                                    {item.lifts.length}
                                                </CustomText>
                                            </View>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={colors.fg}
                                            style={{ opacity: 0.5 }}
                                        />
                                    </Pressable>
                                )}
                            />
                        )
                    ) : (
                        <>
                            <FlatList
                                data={workout.lifts}
                                style={{ maxHeight: scrollHeight }}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => (
                                    <View style={{ height: 10 }} />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                keyboardShouldPersistTaps="handled"
                                onContentSizeChange={(_, h) =>
                                    setContentHeight(h)
                                }
                                renderItem={({ item, index }) => (
                                    <LiftInput
                                        index={index}
                                        lift={item}
                                        validate={visualValidation}
                                        onChange={(updated) =>
                                            updateLift(item.id, updated)
                                        }
                                    />
                                )}
                            />
                            <View style={styles.footer}>
                                <CustomButton
                                    text={
                                        initialWorkout
                                            ? t('common.update')
                                            : t('common.save')
                                    }
                                    size={18}
                                    onPress={requestSave}
                                />
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            <CustomModal
                dialog={t('workoutLog.modalQuestion')}
                onConfirm={handleSave}
                visible={confirmModal}
                onClose={() => setConfirmModal(false)}
            />
        </Modal>
    )
}

interface LiftInputProps {
    index: number
    lift: Lift
    onChange: (lift: Lift) => void
    validate: boolean
}

function LiftInput({ index, lift, onChange, validate }: LiftInputProps) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const weight = lift.weight ?? { weight: 0, unit: 'kg' as const }

    const [text, setText] = useState(
        Number.isFinite(weight.weight) ? String(weight.weight) : ''
    )

    const weightInvalid = validate && !isWeightValid(lift)

    const quantity =
        lift.quantity.type === 'reps'
            ? lift.quantity.reps.toString()
            : lift.quantity.seconds.toString() + 's'

    const handleWeightChange = (value: string) => {
        const normalized = value.replace(',', '.') // allow comma decimals
        setText(normalized)
        onChange({
            ...lift,
            weight: {
                weight: normalized.trim() === '' ? NaN : Number(normalized),
                unit: weight.unit,
            },
        })
    }

    const handleUnitChange = (unit: string) => {
        if (unit !== 'kg' && unit !== 'lbs') return
        onChange({ ...lift, weight: { ...weight, unit } })
    }

    return (
        <View style={styles.card}>
            <View style={styles.badge}>
                <CustomText style={styles.badgeText}>{index + 1}</CustomText>
            </View>

            <View style={styles.liftInfo}>
                <CustomText style={styles.liftName} numberOfLines={2}>
                    {lift.name}
                </CustomText>
                <View style={styles.chip}>
                    <CustomText style={styles.chipText}>
                        {lift.sets} × {quantity}
                    </CustomText>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    selectTextOnFocus
                    style={[styles.input, weightInvalid && styles.inputError]}
                    keyboardType="decimal-pad"
                    value={text}
                    onChangeText={handleWeightChange}
                />
                <CustomPicker
                    style={styles.picker}
                    value={weight.unit}
                    items={[
                        { label: 'kg', value: 'kg' },
                        { label: 'lbs', value: 'lbs' },
                    ]}
                    onChange={handleUnitChange}
                />
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
            paddingHorizontal: 16,
            backgroundColor: colors.modalBg,
        },
        sheet: {
            width: '100%',
            maxWidth: 520,
            backgroundColor: colors.bg2,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 12,
        },

        // Header
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
        },
        iconSpacer: {
            width: 36,
            height: 36,
        },
        titleBlock: {
            flex: 1,
            alignItems: 'center',
        },
        title: {
            color: colors.fg,
            fontSize: 18,
            fontFamily: 'OpenSans_700Bold',
            textAlign: 'center',
        },
        subtitle: {
            color: colors.fg,
            fontSize: 12,
            opacity: 0.6,
            marginTop: 2,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.fg,
            opacity: 0.2,
            marginVertical: 18,
        },

        // Empty state
        emptyState: {
            alignItems: 'center',
            gap: 10,
            paddingVertical: 24,
        },
        emptyText: {
            color: colors.fg,
            opacity: 0.7,
            textAlign: 'center',
            fontSize: 15,
        },

        // Session selection
        sessionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: colors.bg,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
        },
        sessionIcon: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.fg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sessionName: {
            color: colors.fg,
            fontSize: 16,
            fontWeight: '600',
        },
        sessionMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            opacity: 0.6,
        },
        metaText: {
            color: colors.fg,
            fontSize: 12,
        },

        card: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 14,
        },
        badge: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.fg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        badgeText: {
            color: colors.bg,
            fontSize: 13,
            fontWeight: '700',
        },
        liftInfo: {
            flex: 1,
            gap: 6,
            alignItems: 'flex-start',
        },
        liftName: {
            color: colors.fg,
            fontSize: 16,
            fontWeight: '600',
        },
        chip: {
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.fg,
            paddingHorizontal: 8,
            paddingVertical: 2,
            opacity: 0.7,
        },
        chipText: {
            color: colors.fg,
            fontSize: 12,
            fontWeight: '600',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        input: {
            width: 64,
            height: 44,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.fg,
            backgroundColor: colors.bg2,
            textAlign: 'center',
            fontSize: 15,
            fontWeight: '600',
            color: colors.fg,
        },
        inputError: {
            borderColor: colors.red,
            borderWidth: 1.5,
        },
        picker: {
            alignSelf: 'center',
        },

        footer: {
            marginTop: 20,
        },
        pressed: {
            opacity: 0.7,
        },
    })
}
