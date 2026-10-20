import styles from './PageHero.module.css';
import DepthBackdrop from './DepthBackdrop.jsx';

export default function PageHero({
  title = '',
  subtitle = '',
  children = null,
  actions = null,
  image = null,
  overlay = 'rgba(0,0,0,0.35)',
}) {
  return (
    <section className={styles.hero}>
      <DepthBackdrop image={image || '/images/blog-hero.jpg'} overlay={overlay} />
      <div className={styles.heroContent}>
        {title && <h1 className={styles.heroTitle}>{title}</h1>}
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
        {actions && <div className={styles.heroActions}>{actions}</div>}
        {children}
      </div>
    </section>
  );
}
