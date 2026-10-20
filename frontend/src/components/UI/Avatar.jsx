import styles from './Avatar.module.css';

export default function Avatar({
  initials = '?',
  image = null,
  size = 'md',
  color = 'primary',
  className = '',
  alt = 'Avatar',
}) {
  const sizeClass = styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.avatarMd;
  const colorClass = styles[`avatar${color.charAt(0).toUpperCase() + color.slice(1)}`] || styles.avatarPrimary;
  const avatarClass = `${styles.avatar} ${sizeClass} ${colorClass} ${className}`;

  if (image) {
    return (
      <div className={avatarClass}>
        <img src={image} alt={alt} className={styles.avatarImage} />
      </div>
    );
  }

  return <div className={avatarClass}>{initials.slice(0, 2).toUpperCase()}</div>;
}
