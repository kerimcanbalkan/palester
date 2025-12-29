import { colorType, darkColors, lightColors } from '@/theme/colors'
import React, { useState } from 'react'
import {
    View,
    Text,
    useColorScheme,
    TouchableOpacity,
    Modal,
    FlatList,
    ViewStyle,
    StyleSheet,
    Pressable,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

type PickerItem = {
    label: string
    value: string
}

type Props = {
    value?: string
    items: PickerItem[]
    onChange: (value: string) => void
    placeholder?: string
    style?: ViewStyle
}

export default function CustomPicker({
    value,
    items,
    onChange,
    placeholder = 'Select item',
    style
}: Props) {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const styles = themedStyles(colors)

    const [visible, setVisible] = useState(false)

    const selectedLabel =
        items.find((i) => i.value === value)?.label ?? placeholder

    return (
        <>
            <TouchableOpacity
                style={[styles.input, style ? style : '']}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.text}>{selectedLabel}</Text>
                <Ionicons name="caret-down-outline" size={12} color={colors.fg} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation}>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        onChange(item.value)
                                        setVisible(false)
                                    }}
                                >
                                    <Text style={styles.text}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    )
}

function themedStyles(colors: colorType) {
    return StyleSheet.create({
        input: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 0,
        },
        overlay: {
            flex: 1,
            justifyContent: "center",
            backgroundColor: 'rgba(40, 40, 40, 0.8)',
            alignItems: 'center',
        },
        sheet: {
            borderWidth: 1,
            borderColor: colors.fg,
            borderRadius: 10,
            backgroundColor: colors.bg2,
            maxHeight: "50%",
            width: '50%',
            overflow: 'scroll',
        },
        item: {
            color: colors.fg,
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.fg
        },
        text: {
            color: colors.fg
        }

    })
}
