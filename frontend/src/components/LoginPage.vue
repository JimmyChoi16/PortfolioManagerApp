<template>
  <div class="login-container">
    <!-- Left Section - Login Form -->
    <div class="login-form-section">
      <div class="form-content">
        <!-- Logo -->
        <div class="logo">
          <div class="logo-icon">📊</div>
          <span class="logo-text">PortfolioManager</span>
        </div>
        
        <!-- Back Button -->
        <button class="back-btn" @click="goBackToHome">
          {{ t('login.backToHome') }}
        </button>

        <!-- Main Form -->
        <div class="form-main">
          <div class="form-header">
            <p class="form-subtitle">{{ isSignIn ? t('login.welcomeBack') : t('login.startJourney') }}</p>
            <h1 class="form-title">{{ isSignIn ? t('login.signInTitle') : t('login.signUpTitle') }}</h1>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group">
              <label for="email">{{ t('login.email') }}</label>
              <div class="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  v-model="formData.email" 
                  :placeholder="t('login.emailPlaceholder')" 
                  required
                />
                <div class="input-icon">✉️</div>
              </div>
            </div>

            <div class="form-group">
              <label for="password">{{ t('login.password') }}</label>
              <div class="input-wrapper">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="formData.password" 
                  :placeholder="isSignIn ? t('login.passwordSignInPlaceholder') : t('login.passwordSignUpPlaceholder')" 
                  required
                />
                <div class="input-icon password-toggle" @click="togglePassword">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </div>
              </div>
            </div>

            <!-- Remember Me (Sign In only) -->
            <div v-if="isSignIn" class="form-group remember-me">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.rememberMe" />
                <span class="checkmark"></span>
                {{ t('login.rememberMe') }}
              </label>
            </div>

            <button type="submit" class="auth-btn" :disabled="loading">
              <span v-if="loading">{{ t('login.loading') }}</span>
              <span v-else>{{ isSignIn ? t('login.signIn') : t('login.signUp') }}</span>
            </button>
          </form>

          <!-- Social Auth -->
          <div class="social-auth">
            <p class="social-text">{{ isSignIn ? t('login.orSignInWith') : t('login.orSignUpWith') }}</p>
            <div class="social-buttons">
              <button class="social-btn facebook">
                <span class="social-icon">📘</span>
              </button>
              <button class="social-btn google">
                <span class="social-icon">🔍</span>
              </button>
              <button class="social-btn apple">
                <span class="social-icon">🍎</span>
              </button>
            </div>
          </div>

          <!-- Toggle Link -->
          <div class="toggle-link">
            <span>{{ isSignIn ? t('login.dontHaveAccount') : t('login.haveAccount') }}</span>
            <a href="#" @click.prevent="toggleMode">
              {{ isSignIn ? t('login.signUpLink') : t('login.signInLink') }}
            </a>
          </div>

          <!-- Forgot Password (Sign In only) -->
          <div v-if="isSignIn" class="forgot-password">
            <a href="#" @click.prevent="forgotPassword">{{ t('login.forgotPassword') }}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section - Decorative Background -->
    <div class="decorative-section">
      <div class="abstract-background">
        <div class="bubble bubble-1"></div>
        <div class="bubble bubble-2"></div>
        <div class="bubble bubble-3"></div>
        <div class="bubble bubble-4"></div>
        <div class="bubble bubble-5"></div>
        <div class="fluid-pattern"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['goBack', 'loginSuccess'])

const isSignIn = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleMode = () => {
  isSignIn.value = !isSignIn.value
  // Clear form when switching modes
  formData.value = {
    email: '',
    password: '',
    rememberMe: false
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    if (isSignIn.value) {
      await handleSignIn()
    } else {
      await handleSignUp()
    }
  } catch (error) {
    console.error('Auth error:', error)
  } finally {
    loading.value = false
  }
}

const handleSignUp = async () => {
  // Simulate sign up process
  await new Promise(resolve => setTimeout(resolve, 1000))
  // For demo purposes, treat sign up as successful
  console.log('Sign up:', formData.value)
  // Store user email in localStorage
  localStorage.setItem('userName', formData.value.email)
  // Emit login success to go to dashboard
  emit('loginSuccess')
}

const handleSignIn = async () => {
  // Simulate sign in process
  await new Promise(resolve => setTimeout(resolve, 1000))
  // For demo purposes, treat sign in as successful
  console.log('Sign in:', formData.value)
  // Store user email in localStorage
  localStorage.setItem('userName', formData.value.email)
  // Emit login success to go to dashboard
  emit('loginSuccess')
}

const goBackToHome = () => {
  emit('goBack')
}

const forgotPassword = () => {
  // TODO: Implement forgot password logic
  console.log('Forgot password for:', formData.value.email)
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Left Section - Login Form */
.login-form-section {
  flex: 2;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-content {
  width: 100%;
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 60px;
}

.logo-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.back-btn {
  background: none;
  border: 1px solid #e1e8ed;
  color: #7f8c8d;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: #f8f9fa;
  border-color: #6A95CC;
  color: #6A95CC;
}

.form-header {
  margin-bottom: 40px;
}

.form-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.auth-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 48px 16px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #6A95CC;
}

.input-icon {
  position: absolute;
  right: 16px;
  font-size: 1.2rem;
  color: #7f8c8d;
  cursor: pointer;
}

.password-toggle {
  user-select: none;
}

.auth-btn {
  width: 100%;
  background: #6A95CC;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-btn:hover:not(:disabled) {
  background: #53A7D8;
}

.auth-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Social Auth */
.social-auth {
  text-align: center;
  margin-bottom: 30px;
}

.social-text {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-btn:hover {
  border-color: #6A95CC;
}

.social-icon {
  font-size: 1.2rem;
}

/* Toggle Link */
.toggle-link {
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.toggle-link span {
  color: #7f8c8d;
}

.toggle-link a {
  color: #6A95CC;
  text-decoration: none;
  font-weight: 500;
}

.toggle-link a:hover {
  text-decoration: underline;
}

/* Remember Me */
.remember-me {
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2c3e50;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #6A95CC;
}

/* Forgot Password */
.forgot-password {
  text-align: center;
  font-size: 0.9rem;
}

.forgot-password a {
  color: #6A95CC;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password a:hover {
  text-decoration: underline;
}

/* Right Section - Decorative Background */
.decorative-section {
  flex: 1;
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  position: relative;
  overflow: hidden;
}

.abstract-background {
  position: relative;
  width: 100%;
  height: 100%;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.bubble-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  left: 60%;
  animation-delay: 2s;
}

.bubble-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}

.bubble-4 {
  width: 40px;
  height: 40px;
  top: 80%;
  left: 30%;
  animation-delay: 1s;
}

.bubble-5 {
  width: 70px;
  height: 70px;
  top: 10%;
  left: 70%;
  animation-delay: 3s;
}

.fluid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 90% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-form-section {
    flex: none;
    padding: 20px;
  }
  
  .decorative-section {
    flex: none;
    height: 200px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .logo {
    margin-bottom: 40px;
  }
}
</style> 