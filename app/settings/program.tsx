import {
    View,
    StyleSheet,
    useColorScheme,
    ScrollView,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import { getData, updateSessions, Session } from '@/api/api'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import SessionModal from '@/components/SessionModal'
import { useTranslation } from '@/localization/useTranslation'
import { useEffect, useRef, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'

type EditorState =
    | { mode: 'create'; name: string }
    | { mode: 'edit'; index: number }
    | null

export default function Program() {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)
    const router = useRouter()
    const db = useSQLiteContext()
    const { showAlert } = useAlert()

    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [editor, setEditor] = useState<EditorState>(null)

    const [isNaming, setIsNaming] = useState(false)
    const [newName, setNewName] = useState('')
    const [nameError, setNameError] = useState(false)

    const [saving, setSaving] = useState(false)

    const scrollRef = useRef<ScrollView>(null)
    // Wait for the keyboard to open, then bring the name input into view
    const scrollToBottom = () =>
        setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            150
        )

    // Load the existing sessions from the database
    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const data = await getData(db)
                if (!cancelled) setSessions(data?.sessions ?? [])
            } catch (err) {
                console.error('could not load sessions', err)
                if (!cancelled) {
                    showAlert(
                        t('program.error.couldNotSave.title'),
                        t('error.somethingWentWrong'),
                        'error'
                    )
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [db])

    // ---------- Naming step ----------
    const startNaming = () => {
        setNewName('')
        setNameError(false)
        setIsNaming(true)
    }

    const cancelNaming = () => {
        setIsNaming(false)
        setNewName('')
        setNameError(false)
    }

    const confirmName = () => {
        const name = newName.trim()

        if (name === '') {
            setNameError(true)
            showAlert(
                t('sessions.error.emptyName.title'),
                t('sessions.error.emptyName.message'),
                'error'
            )
            return
        }

        const exists = sessions.some(
            (s) => s.name.trim().toLowerCase() === name.toLowerCase()
        )
        if (exists) {
            setNameError(true)
            showAlert(
                t('sessions.error.duplicateName.title'),
                t('sessions.error.duplicateName.message'),
                'error'
            )
            return
        }

        setIsNaming(false)
        setNewName('')
        setNameError(false)
        setEditor({ mode: 'create', name })
    }

    // ---------- SessionModal callbacks ----------
    const handleSessionSave = (session: Session) => {
        setSessions((prev) => {
            if (editor?.mode === 'edit') {
                return prev.map((s, i) => (i === editor.index ? session : s))
            }
            return [...prev, session]
        })
    }

    const handleSessionDelete = () => {
        if (editor?.mode !== 'edit') return
        const index = editor.index
        setSessions((prev) => prev.filter((_, i) => i !== index))
    }

    const removeSession = (index: number) => {
        setSessions((prev) => prev.filter((_, i) => i !== index))
    }

    // ---------- Save ----------
    const handleSaveTrainingProgram = async () => {
        if (sessions.length === 0) {
            showAlert(
                t('program.error.invalidTrainingProgram.title'),
                t('program.error.invalidTrainingProgram.message'),
                'error'
            )
            return
        }

        setSaving(true)
        try {
            // Only replaces sessions; logged workouts are kept
            await updateSessions(db, sessions)
            showAlert(
                t('common.success'),
                t('program.successMessage'),
                'success'
            )
            router.back()
        } catch (err) {
            console.error('there has been error while saving program', err)
            showAlert(
                t('program.error.couldNotSave.title'),
                t('program.error.couldNotSave.message'),
                'error'
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.fg} />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, alignSelf: 'stretch' }}
            behavior="padding"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Logo size={46} />

                    <View style={styles.content}>
                        <CustomText style={styles.header}>
                            {t('sessions.title')}
                        </CustomText>

                        {sessions.length === 0 && !isNaming && (
                            <CustomText style={styles.emptyText}>
                                {t('sessions.empty')}
                            </CustomText>
                        )}

                        <View style={{ width: '100%' }}>
                            {sessions.map((item, index) => (
                                <Pressable
                                    key={`${index}-${item.name}`}
                                    style={styles.sessionCard}
                                    onPress={() =>
                                        setEditor({ mode: 'edit', index })
                                    }
                                >
                                    <View style={{ flex: 1 }}>
                                        <CustomText style={styles.sessionName}>
                                            {item.name}
                                        </CustomText>
                                        <CustomText style={styles.sessionMeta}>
                                            {item.lifts.length}{' '}
                                            {t('sessions.lifts')}
                                        </CustomText>
                                    </View>

                                    <Ionicons
                                        name="create-outline"
                                        size={24}
                                        color={colors.fg}
                                    />

                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => removeSession(index)}
                                    >
                                        <Ionicons
                                            name="close-circle-outline"
                                            size={28}
                                            color={colors.red}
                                            style={{ marginLeft: 12 }}
                                        />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </View>

                        {isNaming ? (
                            <View style={styles.nameRow}>
                                <View style={{ flex: 1 }}>
                                    <CustomText style={styles.label}>
                                        {t('session.name')}
                                    </CustomText>
                                    <TextInput
                                        autoFocus
                                        onFocus={scrollToBottom}
                                        style={[
                                            styles.nameInput,
                                            nameError && styles.inputError,
                                        ]}
                                        value={newName}
                                        onChangeText={(text) => {
                                            setNewName(text)
                                            if (nameError) setNameError(false)
                                        }}
                                        placeholder={t(
                                            'sessions.namePlaceholder'
                                        )}
                                        placeholderTextColor={colors.fg + '80'}
                                        returnKeyType="next"
                                        onSubmitEditing={confirmName}
                                    />
                                </View>

                                <Pressable hitSlop={8} onPress={confirmName}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={36}
                                        color={colors.green}
                                    />
                                </Pressable>
                                <Pressable hitSlop={8} onPress={cancelNaming}>
                                    <Ionicons
                                        name="close-circle"
                                        size={36}
                                        color={colors.red}
                                    />
                                </Pressable>
                            </View>
                        ) : (
                            <View style={{ marginTop: 10 }}>
                                <CustomButton
                                    text={t('sessions.add')}
                                    onPress={startNaming}
                                    size={24}
                                />
                            </View>
                        )}
                    </View>

                    <CustomButton
                        text={t('common.save')}
                        onPress={handleSaveTrainingProgram}
                        size={24}
                        disabled={saving}
                    />
                </View>
            </ScrollView>

            {editor && (
                <SessionModal
                    visible
                    session={
                        editor.mode === 'edit'
                            ? sessions[editor.index]
                            : undefined
                    }
                    initialName={
                        editor.mode === 'create' ? editor.name : undefined
                    }
                    onClose={() => setEditor(null)}
                    onSave={handleSessionSave}
                    onDelete={handleSessionDelete}
                />
            )}
        </KeyboardAvoidingView>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 20,
        },
        content: {
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 20,
        },
        text: {
            color: colors.fg,
            fontSize: 24,
            textAlign: 'center',
            padding: 15,
        },
        header: {
            color: colors.fg,
            marginBottom: 20,
            fontSize: 36,
            fontFamily: 'OpenSans_700Bold',
        },
        emptyText: {
            color: colors.fg,
            opacity: 0.6,
            fontSize: 14,
            marginBottom: 10,
        },
        sessionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg2,
            borderRadius: 10,
            padding: 14,
            marginVertical: 5,
        },
        sessionName: {
            color: colors.fg,
            fontSize: 18,
            fontFamily: 'OpenSans_700Bold',
        },
        sessionMeta: {
            color: colors.fg,
            opacity: 0.7,
            fontSize: 13,
        },
        nameRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
            width: '100%',
            marginTop: 10,
        },
        label: {
            color: colors.fg,
            fontSize: 12,
            marginBottom: 2,
        },
        nameInput: {
            borderRadius: 4,
            borderWidth: 1,
            height: 40,
            fontSize: 14,
            color: colors.fg,
            borderColor: colors.fg,
            paddingHorizontal: 10,
        },
        inputError: {
            borderColor: colors.red,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 20,
            elevation: 2,
            backgroundColor: colors.fg,
            marginTop: 10,
        },
        addButtonText: {
            color: colors.bg,
            fontSize: 16,
        },
    })
}
