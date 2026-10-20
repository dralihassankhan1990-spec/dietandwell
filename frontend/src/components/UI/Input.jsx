import styles from './Input.module.css';

export default function Input({
  label = null,
  type = 'text',
  placeholder = '',
  value = '',
  onChange = null,
  onBlur = null,
  error = null,
  required = false,
  disabled = false,
  name = '',
  id = '',
  className = '',
  ...rest
}) {
  const idAttr = id || name;
  const showError = error && error.length > 0;

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={idAttr} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={idAttr}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        name={name}
        className={`${styles.input} ${showError ? styles.inputError : ''}`}
        {...rest}
      />
      {showError && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
