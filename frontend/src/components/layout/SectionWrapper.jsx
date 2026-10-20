import styles from './SectionWrapper.module.css';

export default function SectionWrapper({
  children,
  bg = 'default',
  padding = 'default',
  id = '',
  className = '',
}) {
  const bgClass = styles[`sectionBg${bg.charAt(0).toUpperCase() + bg.slice(1)}`] || styles.sectionBgDefault;
  const paddingClass = styles[`sectionPadding${padding.charAt(0).toUpperCase() + padding.slice(1)}`] || '';
  
  return (
    <section id={id} className={`${styles.section} ${bgClass} ${paddingClass} ${className}`}>
      {children}
    </section>
  );
}
