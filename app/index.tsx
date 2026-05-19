import CustomText from '@/components/CustomText'
import Loading from '@/components/Loading'
import { useSetup } from '@/lib/hooks/use-setup'
import { darkColors, lightColors } from '@/theme/colors'
import { View, useColorScheme } from 'react-native'

export default function Index() {
    const colorScheme = useColorScheme()
    const colors = colorScheme === 'light' ? lightColors : darkColors
    const { error } = useSetup()

    if (error) {
        return (
            <View
                style={{
                    paddingHorizontal: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <CustomText
                        style={{
                            fontSize: 120,
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        ⚠︎
                    </CustomText>
                    <CustomText
                        style={{
                            fontSize: 24,
                            textAlign: 'center',
                            color: colors.fg,
                        }}
                    >
                        Opps! Something wen&apos;t wrong. Try again later.
                    </CustomText>
                </View>
            </View>
        )
    }

    return <Loading />
}
