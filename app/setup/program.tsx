import {
    View,
    StyleSheet,
    useColorScheme,
    ScrollView,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Keyboard,
    LayoutChangeEvent,
} from 'react-native'
import { darkColors, lightColors, colorType } from '@/theme/colors'
import Logo from '@/components/Logo'
import CustomButton from '@/components/CustomButton'
import { useRouter } from 'expo-router'
import { useAlert } from '@/context/AlertContext'
import { initData, Session } from '@/api/api'
import CustomText from '@/components/CustomText'
import { useSQLiteContext } from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SessionModal from '@/components/SessionModal'
import { useTranslation } from '@/localization/useTranslation'
import { useEffect, useRef, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'

// Which session (if any) is open in SessionModal
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
    const [editor, setEditor] = useState<EditorState>(null)

    // Inline "ask for session name" step
    const [isNaming, setIsNaming] = useState(false)
    const [newName, setNewName] = useState('')
    const [nameError, setNameError] = useState(false)

    const [saving, setSaving] = useState(false)

    const scrollRef = useRef<ScrollView>(null)
    const contentRef = useRef<View>(null)
    const nameRowRef = useRef<View>(null)
    const viewportHeight = useRef(0)

    const [lockedHeight, setLockedHeight] = useState<number | null>(null)

    const onScrollLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height
        viewportHeight.current = h
        if (lockedHeight === null && !Keyboard.isVisible()) {
            setLockedHeight(h)
        }
    }

    // Scroll just enough to show the name input above the keyboard
    const scrollToNameInput = () => {
        const row = nameRowRef.current
        const content = contentRef.current
        if (!row || !content) return

        row.measureLayout(
            content,
            (_x, y, _w, h) => {
                const target = y + h + 20 - viewportHeight.current
                scrollRef.current?.scrollTo({
                    y: Math.max(0, target),
                    animated: true,
                })
            },
            () => { }
        )
    }

    useEffect(() => {
        if (!isNaming) return
        const sub = Keyboard.addListener('keyboardDidShow', () =>
            setTimeout(scrollToNameInput, 50)
        )
        return () => sub.remove()
    }, [isNaming])

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
        // Open SessionModal to collect lifts for this new session
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

    // ---------- Save whole program ----------
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
            await initData(db, {
                id: Date.now(),
                sessions,
                workouts: [],
            })
            await AsyncStorage.setItem('setup_done', 'true')
            router.replace('/home') // only navigate on success
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

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ScrollView
                ref={scrollRef}
                onLayout={onScrollLayout}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    ref={contentRef}
                    style={[
                        styles.container,
                        lockedHeight != null && { minHeight: lockedHeight },
                    ]}
                >
                    <Logo size={46} />

                    <View style={styles.content}>
                        <CustomText style={styles.header}>
                            {t('sessions.title')}
                        </CustomText>
                        <CustomText style={styles.text}>
                            {t('sessions.question')}
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
                                            name="remove-circle-outline"
                                            size={28}
                                            color={colors.red}
                                            style={{ marginLeft: 12 }}
                                        />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </View>

                        {isNaming ? (
                            <View ref={nameRowRef} style={styles.nameRow}>
                                <View style={{ flex: 1 }}>
                                    <CustomText style={styles.label}>
                                        {t('session.name')}
                                    </CustomText>
                                    <TextInput
                                        autoFocus
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

            {/* Mounted only while open, so its internal state resets each time */}
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
