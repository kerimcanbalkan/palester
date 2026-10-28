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
import { format, parseISO } from 'date-fns'
import { enUS, tr, sq } from 'date-fns/locale'
import i18n from '@/localization/i18n'

interface ModalProps {
    visible: boolean
    workout: Workout
    onClose: () => void
}

const localeMapping = {
    en: enUS,
    tr: tr,
    sq: sq,
}

export default function WorkoutModal({
    visible,
    workout,
    onClose,
}: ModalProps) {
    const currentLocale =
        localeMapping[i18n.locale as keyof typeof localeMapping] || enUS
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [contentHeight, setContentHeight] = useState(0)
    const MAX_SCROLL_HEIGHT = 340
    const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)

    const formattedDate = format(parseISO(workout.date), 'dd LLLL yyyy', {
        locale: currentLocale,
    })

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.headerRow}>
                        <View style={styles.iconSpacer} />

                        <View style={styles.titleBlock}>
                            <CustomText style={styles.title} numberOfLines={2}>
                                {workout.sessionName ?? formattedDate}
                            </CustomText>
                            {workout.sessionName ? (
                                <View style={styles.dateRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={13}
                                        color={colors.fg}
                                    />
                                    <CustomText style={styles.subtitle}>
                                        {formattedDate}
                                    </CustomText>
                                </View>
                            ) : null}
                        </View>

                        <Pressable
                            onPress={onClose}
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

                    <FlatList
                        data={workout.lifts}
                        style={{ maxHeight: scrollHeight }}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 10 }} />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        onContentSizeChange={(_, h) => setContentHeight(h)}
                        renderItem={({ item, index }) => {
                            const quantity =
                                item.quantity.type === 'reps'
                                    ? item.quantity.reps.toString()
                                    : item.quantity.seconds.toString() + 's'

                            const hasWeight =
                                item.weight &&
                                Number.isFinite(item.weight.weight)

                            return (
                                <View style={styles.card}>
                                    <View style={styles.badge}>
                                        <CustomText style={styles.badgeText}>
                                            {index + 1}
                                        </CustomText>
                                    </View>

                                    <View style={styles.liftInfo}>
                                        <CustomText
                                            style={styles.liftName}
                                            numberOfLines={2}
                                        >
                                            {item.name}
                                        </CustomText>
                                        <View style={styles.chip}>
                                            <CustomText style={styles.chipText}>
                                                {item.sets} × {quantity}
                                            </CustomText>
                                        </View>
                                    </View>

                                    <View style={styles.weightBlock}>
                                        {hasWeight ? (
                                            <>
                                                <CustomText
                                                    style={styles.weightValue}
                                                >
                                                    {item.weight!.weight}
                                                </CustomText>
                                                <CustomText
                                                    style={styles.weightUnit}
                                                >
                                                    {item.weight!.unit}
                                                </CustomText>
                                            </>
                                        ) : (
                                            <CustomText
                                                style={styles.weightEmpty}
                                            >
                                                —
                                            </CustomText>
                                        )}
                                    </View>
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
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 4,
            opacity: 0.65,
        },
        subtitle: {
            color: colors.fg,
            fontSize: 13,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.fg,
            opacity: 0.2,
            marginVertical: 18,
        },

        // Lift card
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
        weightBlock: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 3,
            minWidth: 64,
            justifyContent: 'flex-end',
        },
        weightValue: {
            color: colors.fg,
            fontSize: 20,
            fontWeight: '700',
        },
        weightUnit: {
            color: colors.fg,
            fontSize: 13,
            opacity: 0.65,
        },
        weightEmpty: {
            color: colors.fg,
            fontSize: 18,
            opacity: 0.5,
        },
        pressed: {
            opacity: 0.7,
        },
    })
}
