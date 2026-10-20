import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', inline = false }) {
  const sizeClass = styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.spinnerMd;
  
  if (inline) {
    return <div className={`${styles.spinner} ${sizeClass}`} />;
  }

  return (
    <div className={styles.spinnerContainer}>
      <div className={`${styles.spinner} ${sizeClass}`} />
    </div>
  );
}
