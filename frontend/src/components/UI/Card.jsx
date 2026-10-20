import styles from './Card.module.css';

export default function Card({
  children,
  hoverable = true,
  className = '',
  onClick = null,
  image = null,
  imageAlt = 'Card image',
}) {
  const cardClass = `${styles.card} ${hoverable ? styles.cardHover : ''} ${className}`;

  return (
    <div className={cardClass} onClick={onClick}>
      {image && <img src={image} alt={imageAlt} className={styles.cardImage} />}
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
}
