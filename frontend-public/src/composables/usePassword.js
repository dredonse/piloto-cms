function getStrengthData(value) {
  const hasLength = value.length >= 8
  const hasUpper = /[A-Z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const isLong = value.length > 12
  const score = [hasLength, hasUpper, hasNumber, isLong].filter(Boolean).length
  const labels = ['', 'Debil', 'Regular', 'Buena', 'Fuerte']

  return {
    score,
    label: labels[score] || '—',
    hasLength,
    hasUpper,
    hasNumber,
  }
}

function checkPwd(value) {
  return getStrengthData(value)
}

function validatePassword(value) {
  if (value.length < 8) {
    return { valid: false, message: 'La contrasena debe tener al menos 8 caracteres.' }
  }
  return { valid: true, message: '' }
}

export function usePassword() {
  return {
    checkPwd,
    validatePassword,
  }
}
