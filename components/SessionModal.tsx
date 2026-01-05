import { colorType, darkColors, lightColors } from '@/theme/colors'
import {
    Modal,
    View,
    Pressable,
    StyleSheet,
    useColorScheme,
    TextInput,
    ScrollView,
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
    day: string
    session?: Session
    onSave: (session: Session) => void
    onDelete: (session: Session) => void
}

export default function SessionModal({
    visible,
    onClose,
    day,
    session: initialSession,
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
            day,
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

    const scrollRef = useRef<ScrollView>(null)
    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 300
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)
    const emptyLift: Lift = {
        id: nextId.current++,
        name: '',
        sets: 1,
        quantity: { type: 'reps', reps: 1 },
    }

    const addLift = () => {
        setSession((prev) => ({
            ...prev,
            lifts: [
                ...prev.lifts,
                {
                    id: nextId.current++,
                    name: '',
                    sets: 1,
                    quantity: { type: 'reps', reps: 1 },
                },
            ],
        }))
    }

    const removeLift = (id: number) => {
        setSession((prev) => ({
            ...prev,
            lifts:
                prev.lifts.length === 1
                    ? [emptyLift]
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
        const isValid = session.lifts.every(
            (lift) =>
                lift.name.trim() !== '' &&
                lift.sets > 0 &&
                (lift.quantity.type === 'reps'
                    ? lift.quantity.reps > 0
                    : lift.quantity.seconds > 0)
        )

        if (!isValid) {
            setVisualValidation(true)
            showAlert(
                t('session.error.invalidSession.title'),
                t('session.error.invalidSession.message'),
                'error'
            )
            return
        }

        onSave(session)
        onClose()
    }

    const handleDelete = () => {
        onDelete(session)
        onClose()
    }

    return (
        <Modal transparent visible={visible} animationType="slide">
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable
                    style={styles.sheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Pressable
                        onPress={handleClose}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        <Ionicons name="close" size={32} color={colors.fg} />
                    </Pressable>

                    <View style={{ height: scrollHeight }}>
                        <ScrollView
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={(_, h) => {
                                setContentHeight(h)
                                scrollRef.current?.scrollToEnd({
                                    animated: true,
                                })
                            }}
                        >
                            {session.lifts.map((lift) => (
                                <View
                                    key={lift.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 10,
                                    }}
                                >
                                    <LiftInput
                                        validate={visualValidation}
                                        lift={lift}
                                        onChange={(updated) =>
                                            updateLift(lift.id, updated)
                                        }
                                    />

                                    <Pressable
                                        onPress={() => removeLift(lift.id)}
                                    >
                                        <Ionicons
                                            name="remove-circle-outline"
                                            size={32}
                                            color={colors.red}
                                            style={{ marginLeft: 12 }}
                                        />
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    <Pressable style={styles.button} onPress={addLift}>
                        <Ionicons name="add" size={24} color={colors.bg} />
                    </Pressable>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: initialSession
                                ? 'space-between'
                                : 'flex-end',
                            width: '80%',
                        }}
                    >
                        {initialSession ? (
                            <Pressable
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <CustomText style={styles.buttonText}>
                                    {t('common.delete')}
                                </CustomText>
                            </Pressable>
                        ) : (
                            ''
                        )}

                        <Pressable
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <CustomText style={styles.buttonText}>
                                {t('common.save')}
                            </CustomText>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

interface LiftInputProps {
    lift: Lift
    onChange: (lift: Partial<Lift>) => void
    validate: boolean
}

function LiftInput({ lift, onChange, validate }: LiftInputProps) {
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
        <View
            style={{
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10,
            }}
        >
            <View style={{ gap: 1 }}>
                <CustomText style={styles.label}>{t('lift.name')}</CustomText>
                <TextInput
                    style={[styles.nameInput, nameInvalid && styles.inputError]}
                    value={lift.name}
                    onChangeText={(name) => onChange({ name })}
                />
            </View>

            <View style={{ gap: 1 }}>
                <CustomText style={styles.label}>{t('lift.sets')}</CustomText>
                <TextInput
                    selectTextOnFocus
                    style={[styles.input, setsInvalid && styles.inputError]}
                    keyboardType="numeric"
                    value={String(lift.sets)}
                    onChangeText={(sets) => onChange({ sets: Number(sets) })}
                />
            </View>

            <Ionicons
                name="close"
                size={18}
                color={colors.fg}
                style={{ alignSelf: 'flex-end' }}
            />

            <View style={{ gap: 1 }}>
                <CustomText style={styles.label}>
                    {lift.quantity.type === 'reps'
                        ? t('lift.reps')
                        : t('common.second')}
                </CustomText>
                <TextInput
                    selectTextOnFocus
                    style={[styles.input, quantityInvalid && styles.inputError]}
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
            <CustomPicker
                style={{ alignSelf: 'flex-end' }}
                value={lift.quantity.type}
                items={[
                    { label: t('lift.reps').toLowerCase(), value: 'reps' },
                    { label: t('common.second').toLowerCase(), value: 'time' },
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
            padding: 15,
            alignItems: 'center',
            shadowColor: colors.bg,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        button: {
            borderRadius: 10,
            paddingVertical: 5,
            paddingHorizontal: 20,
            elevation: 2,
            backgroundColor: colors.fg,
            marginTop: 10,
        },
        saveButton: {
            borderRadius: 10,
            elevation: 2,
            backgroundColor: colors.green,
            padding: 10,
            alignSelf: 'flex-end',
        },
        deleteButton: {
            borderRadius: 10,
            elevation: 2,
            backgroundColor: colors.red,
            padding: 10,
            alignSelf: 'flex-end',
        },
        buttonText: {
            color: colors.fg2,
            fontSize: 16,
        },
        nameInput: {
            borderRadius: 4,
            borderWidth: 1,
            width: 100,
            height: 40,
            fontSize: 12,
            color: colors.fg,
            borderColor: colors.fg,
            padding: 10,
        },
        input: {
            borderWidth: 1,
            width: 40,
            height: 40,
            textAlign: 'center',
            color: colors.fg,
            borderColor: colors.fg,
            padding: 10,
            borderRadius: 5,
        },
        inputError: {
            borderColor: colors.red,
        },
        label: {
            color: colors.fg,
            fontSize: 12,
        },
        picker: {
            flex: 1,
            color: colors.fg,
            borderColor: colors.fg,
            borderWidth: 1,
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
        close: {
            color: colors.fg,
        },
    })
}
