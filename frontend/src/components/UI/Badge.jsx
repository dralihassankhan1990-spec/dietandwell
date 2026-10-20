import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'primary',
  className = '',
  icon = null,
}) {
  const badgeClass = `${styles.badge} ${styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.badgePrimary} ${className}`;

  return (
    <span className={badgeClass}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
