import { useState, useEffect } from 'react';
import styles from './Toast.module.css';

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export default function Toast({
  message = '',
  type = 'success',
  title = '',
  duration = 5000,
  onClose = null,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      <span className={styles.toastIcon}>{iconMap[type]}</span>
      <div className={styles.toastContent}>
        {title && <div className={styles.toastTitle}>{title}</div>}
        {message}
      </div>
      <button className={styles.toastClose} onClick={() => setIsVisible(false)}>
        ✕
      </button>
    </div>
  );
}
