import styles from './Button.module.css';
import { Link } from 'react-router-dom';

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  disabled = false,
  href = null,
  to = null,
  onClick = null,
  className = '',
  ...rest
}) {
  const baseClass = styles.btn;
  const variantClass = styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.btnPrimary;
  const sizeClass = styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.btnMd;
  const widthClass = fullWidth ? styles.btnFullWidth : '';
  
  const combinedClass = `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClass} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClass} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
