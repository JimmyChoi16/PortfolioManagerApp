import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import zh from './locales/zh.js'
import fi from './locales/fi.js'

// Get saved language from localStorage or default to English
const getDefaultLocale = () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['en', 'zh', 'fi'].includes(savedLocale)) {
    return savedLocale
  }
  
  // Auto-detect browser language
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang.startsWith('zh')) {
    return 'zh'
  } else if (browserLang.startsWith('fi')) {
    return 'fi'
  }
  
  return 'en'
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    fi
  },
  globalInjection: true,
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
})

// Language switching utility
export const switchLanguage = (locale) => {
  if (['en', 'zh', 'fi'].includes(locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
    
    // Update document title and lang attribute
    document.documentElement.lang = locale
    
    // Update Element Plus locale if needed
    if (window.ElementPlus) {
      // Element Plus locale switching can be added here if needed
    }
  }
}

// Get current language
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' }
  ]
}

export default i18n 