export const isBlank = (value) => {
  return value === null || value === undefined || String(value).trim() === ''
}

export const isValidEmail = (value) => {
  if (isBlank(value)) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export const isValidPhoneNumber = (value) => {
  if (isBlank(value)) {
    return false
  }

  const normalized = String(value).trim().replace(/[\s-]/g, '')
  return /^0\d{8,10}$/.test(normalized)
}

export const getRequiredMessage = (value, label) => {
  return isBlank(value) ? `${label}을(를) 입력해주세요.` : ''
}
