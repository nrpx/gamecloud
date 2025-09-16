'use client';

import Swal from 'sweetalert2';

// Создаем отдельный инстанс только для модальных диалогов
const Modal = Swal.mixin({
  reverseButtons: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Да',
  cancelButtonText: 'Отмена',
  showClass: {
    popup: 'animate__animated animate__fadeInDown'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp'
  }
});

// Модальные диалоги (блокирующие)
export const showModal = {
  success: (title: string, text?: string) => {
    return Modal.fire({
      icon: 'success',
      title,
      text
    });
  },
  
  error: (title: string, text?: string) => {
    return Modal.fire({
      icon: 'error',
      title,
      text
    });
  },
  
  info: (title: string, text?: string) => {
    return Modal.fire({
      icon: 'info',
      title,
      text
    });
  },
  
  warning: (title: string, text?: string) => {
    return Modal.fire({
      icon: 'warning',
      title,
      text
    });
  }
};

// Диалог подтверждения (Modal)
export const showConfirm = (
  title: string,
  text?: string,
  confirmText: string = 'Да',
  cancelText: string = 'Отмена'
) => {
  return Modal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
};

// Диалог подтверждения удаления (Modal)
export const showDeleteConfirm = (
  itemName?: string,
  itemType: string = 'элемент'
) => {
  const title = itemName 
    ? `Удалить ${itemType} "${itemName}"?`
    : `Удалить ${itemType}?`;
  
  return Modal.fire({
    icon: 'warning',
    title,
    text: 'Это действие нельзя будет отменить!',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Да, удалить!',
    cancelButtonText: 'Отмена'
  });
};

// Диалог с вводом текста (Modal)
export const showInput = (
  title: string,
  placeholder?: string,
  inputValue?: string,
  inputType: 'text' | 'email' | 'password' | 'textarea' = 'text'
) => {
  return Modal.fire({
    title,
    input: inputType,
    inputPlaceholder: placeholder,
    inputValue,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Поле не может быть пустым!';
      }
    }
  });
};

// Диалог загрузки (Modal)
export const showLoading = (title: string = 'Загрузка...') => {
  return Modal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Закрыть модальные диалоги
export const closeModal = () => {
  Swal.close();
};

export default { Modal, Swal };