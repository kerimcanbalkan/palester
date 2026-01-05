import i18n from './i18n'

export function useTranslation() {
    return {
        t: (key: string, options?: any) => i18n.t(key, options),
        locale: i18n.locale,
    }
}
