import styles from './Textarea.module.css';

export default function Textarea({
  label = null,
  placeholder = '',
  value = '',
  onChange = null,
  onBlur = null,
  error = null,
  required = false,
  disabled = false,
  rows = 4,
  name = '',
  id = '',
  className = '',
  ...rest
}) {
  const idAttr = id || name;
  const showError = error && error.length > 0;

  return (
    <div className={`${styles.textareaGroup} ${className}`}>
      {label && (
        <label htmlFor={idAttr} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={idAttr}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        name={name}
        className={`${styles.textarea} ${showError ? styles.textareaError : ''}`}
        {...rest}
      />
      {showError && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
