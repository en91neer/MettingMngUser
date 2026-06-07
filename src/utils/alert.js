import Swal from 'sweetalert2'

// 기본 alert
export const showAlert = async (
  title,
  text = '',
  icon = 'info'
) => {
  return await Swal.fire({
    title,
    text,
    icon,
    showCloseButton: true,
    confirmButtonText: '확인'
  })
}

// 성공
export const showSuccess = async (
  title = '성공',
  text = ''
) => {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    showCloseButton: true,
    confirmButtonText: '확인'
  })
}

// 에러
export const showError = async (
  title = '오류',
  text = ''
) => {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    showCloseButton: true,
    confirmButtonText: '확인'
  })

}

// confirm
export const showConfirm = async (
  title,
  text = ''
) => {
  return await Swal.fire({
    title,
    html: text,
    icon: 'question',
    showCloseButton: true,
    showCancelButton: false,
    confirmButtonText: '확인',
    reverseButtons: true
  })
}

// toast
export const showToast = async (
  title,
  icon = 'success'
) => {
  return await Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  })

}
