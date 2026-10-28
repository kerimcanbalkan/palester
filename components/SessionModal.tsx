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
import { useRef, useState } from 'react'
import CustomPicker from '@/components/CustomPicker'
import { Lift, Session } from '@/api/api'
import { useAlert } from '@/context/AlertContext'
import CustomText from './CustomText'
import { useTranslation } from '@/localization/useTranslation'

interface ModalProps {
    visible: boolean
    onClose: () => void
    session?: Session
    initialName?: string
    onSave: (session: Session) => void
    onDelete: (session: Session) => void
}

export default function SessionModal({
    visible,
    onClose,
    session: initialSession,
    initialName,
    onSave,
    onDelete,
}: ModalProps) {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const { showAlert } = useAlert()
    const [visualValidation, setVisualValidation] = useState(false)

    const [session, setSession] = useState<Session>(
        initialSession ?? {
            name: initialName ?? '',
            lifts: [
                {
                    id: 1,
                    name: '',
                    sets: 1,
                    quantity: { type: 'reps', reps: 1 },
                },
            ],
        }
    )
    const nextId = useRef(Math.max(0, ...session.lifts.map((l) => l.id)) + 1)

    const scrollRef = useRef<FlatList>(null)
    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 340
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)

    const makeEmptyLift = (): Lift => ({
        id: nextId.current++,
        name: '',
        sets: 1,
        quantity: { type: 'reps', reps: 1 },
    })

    const addLift = () => {
        setSession((prev) => ({
            ...prev,
            lifts: [...prev.lifts, makeEmptyLift()],
        }))
    }

    const removeLift = (id: number) => {
        setSession((prev) => ({
            ...prev,
            lifts:
                prev.lifts.length === 1
                    ? [makeEmptyLift()]
                    : prev.lifts.filter((l) => l.id !== id),
        }))
    }

    const updateLift = (id: number, updated: Partial<Lift>) => {
        setSession((prev) => ({
            ...prev,
            lifts: prev.lifts.map((l) =>
                l.id === id ? { ...l, ...updated } : l
            ),
        }))
    }

    const handleClose = () => {
        onClose()
    }

    const handleSave = () => {
        const nameValid = session.name.trim() !== ''
        const liftsValid = session.lifts.every(
            (lift) =>
                lift.name.trim() !== '' &&
                lift.sets > 0 &&
                (lift.quantity.type === 'reps'
                    ? lift.quantity.reps > 0
                    : lift.quantity.seconds > 0)
        )

        if (!nameValid || !liftsValid) {
            setVisualValidation(true)
            showAlert(
                t('session.error.invalidSession.title'),
                t('session.error.invalidSession.message'),
                'error'
            )
            return
        }

        onSave({ ...session, name: session.name.trim() })
        onClose()
    }

    const handleDelete = () => {
        onDelete(session)
        onClose()
    }

    const nameInvalid = visualValidation && session.name.trim() === ''

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
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerField}>
                            <CustomText style={styles.label}>
                                {t('session.name')}
                            </CustomText>
                            <TextInput
                                style={[
                                    styles.titleInput,
                                    nameInvalid && styles.inputError,
                                ]}
                                value={session.name}
                                placeholderTextColor={colors.fg}
                                onChangeText={(name) =>
                                    setSession((prev) => ({ ...prev, name }))
                                }
                            />
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

                    {/* Lifts */}
                    <View style={{ height: scrollHeight }}>
                        <FlatList
                            data={session.lifts}
                            style={{ maxHeight: scrollHeight }}
                            keyExtractor={(item) => item.id.toString()}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            ref={scrollRef}
                            ItemSeparatorComponent={() => (
                                <View style={{ height: 10 }} />
                            )}
                            onContentSizeChange={(_, h) => {
                                setContentHeight(h)
                                scrollRef.current?.scrollToEnd({
                                    animated: true,
                                })
                            }}
                            renderItem={({ item, index }) => (
                                <LiftInput
                                    index={index}
                                    validate={visualValidation}
                                    lift={item}
                                    onChange={(updated) =>
                                        updateLift(item.id, updated)
                                    }
                                    onRemove={() => removeLift(item.id)}
                                />
                            )}
                        />
                    </View>

                    <Pressable
                        onPress={addLift}
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Ionicons name="add" size={22} color={colors.fg} />
                    </Pressable>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {initialSession ? (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    styles.deleteButton,
                                    pressed && styles.pressed,
                                ]}
                                onPress={handleDelete}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color={colors.fg2}
                                />
                                <CustomText style={styles.buttonText}>
                                    {t('common.delete')}
                                </CustomText>
                            </Pressable>
                        ) : null}

                        <Pressable
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.saveButton,
                                pressed && styles.pressed,
                            ]}
                            onPress={handleSave}
                        >
                            <Ionicons
                                name="checkmark"
                                size={18}
                                color={colors.fg2}
                            />
                            <CustomText style={styles.buttonText}>
                                {t('common.save')}
                            </CustomText>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

interface LiftInputProps {
    index: number
    lift: Lift
    onChange: (lift: Partial<Lift>) => void
    onRemove: () => void
    validate: boolean
}

function LiftInput({
    index,
    lift,
    onChange,
    onRemove,
    validate,
}: LiftInputProps) {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    // Field validation
    const nameInvalid = validate && lift.name.trim() === ''
    const setsInvalid = validate && lift.sets <= 0

    const quantityInvalid =
        validate &&
        (lift.quantity.type === 'reps'
            ? lift.quantity.reps <= 0
            : lift.quantity.seconds <= 0)

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.badge}>
                    <CustomText style={styles.badgeText}>
                        {index + 1}
                    </CustomText>
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                    <CustomText style={styles.label}>
                        {t('lift.name')}
                    </CustomText>
                    <TextInput
                        style={[
                            styles.textInput,
                            nameInvalid && styles.inputError,
                        ]}
                        value={lift.name}
                        onChangeText={(name) => onChange({ name })}
                    />
                </View>

                <Pressable
                    onPress={onRemove}
                    hitSlop={10}
                    style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.red}
                    />
                </Pressable>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.field}>
                    <CustomText style={styles.label}>
                        {t('lift.sets')}
                    </CustomText>
                    <TextInput
                        selectTextOnFocus
                        style={[
                            styles.numberInput,
                            setsInvalid && styles.inputError,
                        ]}
                        keyboardType="numeric"
                        value={String(lift.sets)}
                        onChangeText={(sets) =>
                            onChange({ sets: Number(sets) })
                        }
                    />
                </View>

                <Ionicons
                    name="close"
                    size={16}
                    color={colors.fg}
                    style={styles.times}
                />

                <View style={styles.field}>
                    <CustomText style={styles.label}>
                        {lift.quantity.type === 'reps'
                            ? t('lift.reps')
                            : t('common.second')}
                    </CustomText>
                    <TextInput
                        selectTextOnFocus
                        style={[
                            styles.numberInput,
                            quantityInvalid && styles.inputError,
                        ]}
                        keyboardType="numeric"
                        value={
                            lift.quantity.type === 'reps'
                                ? String(lift.quantity.reps)
                                : String(lift.quantity.seconds)
                        }
                        onChangeText={(value) => {
                            if (lift.quantity.type === 'reps') {
                                onChange({
                                    quantity: {
                                        type: 'reps',
                                        reps: Number(value),
                                    },
                                })
                            } else {
                                onChange({
                                    quantity: {
                                        type: 'time',
                                        seconds: Number(value),
                                    },
                                })
                            }
                        }}
                    />
                </View>

                <View style={{ flex: 1 }} />

                <CustomPicker
                    style={{ alignSelf: 'flex-end' }}
                    value={lift.quantity.type}
                    items={[
                        { label: t('lift.reps').toLowerCase(), value: 'reps' },
                        {
                            label: t('common.second').toLowerCase(),
                            value: 'time',
                        },
                    ]}
                    onChange={(type) =>
                        onChange({
                            quantity:
                                type === 'reps'
                                    ? { type: 'reps', reps: 1 }
                                    : { type: 'time', seconds: 1 },
                        })
                    }
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
        header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
        },
        headerField: {
            flex: 1,
            gap: 6,
        },
        titleInput: {
            height: 46,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.fg,
            backgroundColor: colors.bg,
            paddingHorizontal: 14,
            fontSize: 17,
            fontWeight: '600',
            color: colors.fg,
        },
        iconButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.fg,
            opacity: 0.2,
            marginVertical: 18,
        },

        card: {
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 14,
            gap: 14,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 12,
        },
        badge: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.fg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
        },
        badgeText: {
            color: colors.bg,
            fontSize: 13,
            fontWeight: '700',
        },
        removeButton: {
            width: 40,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardBody: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
            paddingLeft: 40,
        },
        field: {
            gap: 4,
        },
        times: {
            marginBottom: 14,
            opacity: 0.6,
        },

        textInput: {
            height: 44,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.fg,
            backgroundColor: colors.bg2,
            paddingHorizontal: 12,
            fontSize: 15,
            color: colors.fg,
        },
        numberInput: {
            width: 56,
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
        label: {
            color: colors.fg,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            opacity: 0.7,
        },

        // Buttons
        addButton: {
            marginTop: 12,
            height: 44,
            borderRadius: 10,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.fg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        footer: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
        },
        actionButton: {
            flex: 1,
            height: 48,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        saveButton: {
            backgroundColor: colors.green,
        },
        deleteButton: {
            backgroundColor: colors.red,
        },
        buttonText: {
            color: colors.fg2,
            fontSize: 16,
            fontWeight: '600',
        },
        pressed: {
            opacity: 0.7,
        },
    })
}
