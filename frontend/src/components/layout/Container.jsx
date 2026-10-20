import styles from './Container.module.css';

export default function Container({
  children,
  narrow = false,
  className = '',
}) {
  const containerClass = `${styles.container} ${narrow ? styles.containerNarrow : ''} ${className}`;
  return <div className={containerClass}>{children}</div>;
}
