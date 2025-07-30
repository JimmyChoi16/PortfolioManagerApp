<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange" trigger="click">
      <div class="language-trigger">
        <span class="current-flag">{{ currentLanguage.flag }}</span>
        <span class="current-name">{{ currentLanguage.name }}</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="lang in availableLanguages" 
            :key="lang.code"
            :command="lang.code"
            :class="{ active: lang.code === currentLocale }"
          >
            <span class="lang-flag">{{ lang.flag }}</span>
            <span class="lang-name">{{ lang.name }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { switchLanguage, getAvailableLanguages } from '@/i18n'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)
const availableLanguages = getAvailableLanguages()

const currentLanguage = computed(() => {
  return availableLanguages.find(lang => lang.code === currentLocale.value) || availableLanguages[0]
})

const handleLanguageChange = (langCode) => {
  switchLanguage(langCode)
}
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid #e4e7ed;
  background-color: #fff;
}

.language-trigger:hover {
  background-color: #f5f7fa;
}

.current-flag {
  font-size: 16px;
}

.current-name {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.lang-flag {
  font-size: 16px;
  margin-right: 8px;
}

.lang-name {
  font-size: 14px;
  color: #606266;
}

.el-dropdown-item.active {
  background-color: #f0f9ff;
  color: #1890ff;
}

.el-dropdown-item.active .lang-name {
  color: #1890ff;
  font-weight: 500;
}

.el-dropdown-menu {
  min-width: 120px;
}

.el-dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

.el-dropdown-item:hover {
  background-color: #f5f7fa;
}
</style> 