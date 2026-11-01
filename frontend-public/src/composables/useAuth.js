import { reactive } from 'vue'
import router from '../router'
import { usePassword } from './usePassword'
import { useToast } from './useToast'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/

const { validatePassword, checkPwd } = usePassword()
const { toast } = useToast()

let resendInterval = null

const state = reactive({
  statsUsers: '247',
  login: {
    email: '',
    pwd: '',
    errors: { email: '', pwd: '' },
    error: '',
    loading: false,
  },
  register: {
    name: '',
    email: '',
    pwd: '',
    confirmPwd: '',
    terms: false,
    errors: { name: '', email: '', pwd: '', confirmPwd: '' },
    error: '',
    loading: false,
    success: false,
    pwdStrength: checkPwd(''),
  },
  forgot: {
    email: '',
    sentEmail: '',
    step: 1,
    newPwd: '',
    confirmPwd: '',
    errors: { email: '', newPwd: '', confirmPwd: '' },
    error: '',
    resendTimer: 60,
    pwdStrength: checkPwd(''),
  },
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function setFieldError(section, field, message) {
  section.errors[field] = message
}

function clearAlerts() {
  state.login.error = ''
  state.register.error = ''
  state.forgot.error = ''
}

function resetRegisterState() {
  state.register.success = false
}

function resetForgotState() {
  clearInterval(resendInterval)
  resendInterval = null
  state.forgot.step = 1
  state.forgot.resendTimer = 60
  state.forgot.error = ''
}

function resetUiState() {
  clearAlerts()
  state.login.loading = false
  state.register.loading = false
  resetRegisterState()
  resetForgotState()
}

function startResendTimer() {
  clearInterval(resendInterval)
  state.forgot.resendTimer = 60

  resendInterval = setInterval(() => {
    state.forgot.resendTimer -= 1
    if (state.forgot.resendTimer <= 0) {
      clearInterval(resendInterval)
      resendInterval = null
    }
  }, 1000)
}

function validateLoginEmail() {
  const value = state.login.email.trim()
  if (!value) {
    setFieldError(state.login, 'email', 'El email es obligatorio.')
    return false
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError(state.login, 'email', 'Introduce un email valido.')
    return false
  }
  setFieldError(state.login, 'email', '')
  return true
}

function validateLoginPwd() {
  const value = state.login.pwd
  if (!value) {
    setFieldError(state.login, 'pwd', 'La contrasena es obligatoria.')
    return false
  }
  if (value.length < 8) {
    setFieldError(state.login, 'pwd', 'Minimo 8 caracteres.')
    return false
  }
  setFieldError(state.login, 'pwd', '')
  return true
}

function validateLoginForm() {
  const emailOk = validateLoginEmail()
  const pwdOk = validateLoginPwd()
  return emailOk && pwdOk
}

async function simulateLogin() {
  state.login.error = ''
  if (!validateLoginForm()) return

  state.login.loading = true
  await sleep(1200)
  state.login.loading = false

  if (state.login.email.trim() === 'test@test.com') {
    state.login.error = 'Email o contrasena incorrectos.'
    return
  }

  toast('✓ Sesion iniciada correctamente', 'success')
  setTimeout(() => toast('→ Redirigiendo al area privada...'), 800)
}

function validateRegName() {
  const value = state.register.name.trim()
  if (!value) {
    setFieldError(state.register, 'name', 'El nombre es obligatorio.')
    return false
  }
  if (!NAME_REGEX.test(value)) {
    setFieldError(state.register, 'name', 'Solo letras, espacios y guiones.')
    return false
  }
  setFieldError(state.register, 'name', '')
  return true
}

function validateRegEmail() {
  const value = state.register.email.trim()
  if (!value) {
    setFieldError(state.register, 'email', 'El email es obligatorio.')
    return false
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError(state.register, 'email', 'Introduce un email valido.')
    return false
  }
  setFieldError(state.register, 'email', '')
  return true
}

function onRegisterPwdInput() {
  state.register.pwdStrength = checkPwd(state.register.pwd)
}

function validateRegPwd() {
  const value = state.register.pwd
  if (!value) {
    setFieldError(state.register, 'pwd', 'La contrasena es obligatoria.')
    return false
  }
  const check = validatePassword(value)
  if (!check.valid) {
    setFieldError(state.register, 'pwd', check.message)
    return false
  }
  setFieldError(state.register, 'pwd', '')
  if (state.register.confirmPwd) validateRegPwdConfirm()
  return true
}

function validateRegPwdConfirm() {
  if (!state.register.confirmPwd) {
    setFieldError(state.register, 'confirmPwd', 'Confirma tu contrasena.')
    return false
  }
  if (state.register.pwd !== state.register.confirmPwd) {
    setFieldError(state.register, 'confirmPwd', 'Las contrasenas no coinciden.')
    return false
  }
  setFieldError(state.register, 'confirmPwd', '')
  return true
}

function validateRegForm() {
  const nameOk = validateRegName()
  const emailOk = validateRegEmail()
  const pwdOk = validateRegPwd()
  const confirmOk = validateRegPwdConfirm()
  return nameOk && emailOk && pwdOk && confirmOk
}

async function simulateRegister() {
  state.register.error = ''
  if (!validateRegForm()) return

  if (!state.register.terms) {
    state.register.error = 'Acepta los terminos de uso para continuar.'
    return
  }

  state.register.loading = true
  await sleep(1400)
  state.register.loading = false

  if (state.register.email.trim() === 'existing@test.com') {
    state.register.error = 'Este email ya esta registrado.'
    return
  }

  state.register.success = true
  state.statsUsers = '248'
}

function goToLoginFromRegisterError() {
  state.register.error = ''
  router.push({ name: 'login' })
}

function validateForgotEmail() {
  const value = state.forgot.email.trim()
  if (!value) {
    setFieldError(state.forgot, 'email', 'El email es obligatorio.')
    return false
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError(state.forgot, 'email', 'Introduce un email valido.')
    return false
  }
  setFieldError(state.forgot, 'email', '')
  return true
}

async function simulateForgotStep1() {
  if (!validateForgotEmail()) return
  await sleep(900)
  state.forgot.sentEmail = state.forgot.email.trim()
  state.forgot.step = 2
  startResendTimer()
}

function simulateForgotStep2() {
  clearInterval(resendInterval)
  resendInterval = null
  state.forgot.step = 3
}

function onResetPwdInput() {
  state.forgot.pwdStrength = checkPwd(state.forgot.newPwd)
}

function validateNewPwd() {
  const value = state.forgot.newPwd
  if (!value) {
    setFieldError(state.forgot, 'newPwd', 'Introduce una contrasena.')
    return false
  }
  const check = validatePassword(value)
  if (!check.valid) {
    setFieldError(state.forgot, 'newPwd', check.message)
    return false
  }
  setFieldError(state.forgot, 'newPwd', '')
  if (state.forgot.confirmPwd) validateConfirmPwd()
  return true
}

function validateConfirmPwd() {
  if (!state.forgot.confirmPwd) {
    setFieldError(state.forgot, 'confirmPwd', 'Confirma tu contrasena.')
    return false
  }
  if (state.forgot.newPwd !== state.forgot.confirmPwd) {
    setFieldError(state.forgot, 'confirmPwd', 'Las contrasenas no coinciden.')
    return false
  }
  setFieldError(state.forgot, 'confirmPwd', '')
  return true
}

function validateResetForm() {
  const pwdOk = validateNewPwd()
  const confirmOk = validateConfirmPwd()
  return pwdOk && confirmOk
}

async function simulateReset() {
  state.forgot.error = ''
  if (!validateResetForm()) return

  const pwdCheck = validatePassword(state.forgot.newPwd)
  if (!pwdCheck.valid) {
    state.forgot.error = pwdCheck.message
    return
  }

  await sleep(1000)
  toast('✓ Contrasena actualizada correctamente', 'success')
  setTimeout(() => {
    router.push({ name: 'login' })
  }, 1000)
}

function simulateGoogle() {
  toast('↗ Redirigiendo a Google OAuth...')
  setTimeout(() => toast('✓ Autenticado con Google', 'success'), 1500)
}

export function useAuth() {
  return {
    state,
    setFieldError,
    resetUiState,
    validateLoginEmail,
    validateLoginPwd,
    simulateLogin,
    validateRegName,
    validateRegEmail,
    validateRegPwd,
    validateRegPwdConfirm,
    onRegisterPwdInput,
    simulateRegister,
    goToLoginFromRegisterError,
    validateForgotEmail,
    simulateForgotStep1,
    simulateForgotStep2,
    onResetPwdInput,
    validateNewPwd,
    validateConfirmPwd,
    simulateReset,
    simulateGoogle,
  }
}
