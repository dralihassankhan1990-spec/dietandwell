import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <a className={styles.whatsappFloat} href="https://wa.me/923394056390" target="_blank" rel="noopener noreferrer" aria-label="Chat with DietAndWell on WhatsApp" title="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M16 .8a15 15 0 0 0-13 22.5L1 31l7.9-2.1A15 15 0 1 0 16 .8Zm0 27.3a12.2 12.2 0 0 1-6.2-1.7l-.5-.3-4.6 1.2 1.2-4.5-.3-.5A12.3 12.3 0 1 1 16 28.1Zm6.8-9.2c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2l-1.2 1.4c-.2.2-.4.3-.8.1-2.1-1-3.5-2.4-4.5-4.2-.3-.5.3-.5.9-1.7.1-.2 0-.5 0-.7l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-1 1-1.5 2.1-1.1 3.7.6 2.5 3.3 5.7 6.7 7.2 2.2 1 3.8 1.4 5.2 1 .9-.3 2.2-1.1 2.5-2.1.3-1 .3-1.7.2-1.8-.2-.2-.5-.3-1-.5Z"/></svg>
      </a>
      <div className={styles.footerContent}>
        {/* About */}
        <div className={styles.footerColumn}>
          <h3>About DietAndWell</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className={styles.footerColumn}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/calculators">Calculators</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className={styles.footerColumn}>
          <h3>Services</h3>
          <ul>
            <li><Link to="/services">Nutrition Coaching</Link></li>
            <li><Link to="/services">Meal Planning</Link></li>
            <li><Link to="/services">Weight Loss Program</Link></li>
            <li><Link to="/services">Wellness Plans</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.footerColumn}>
          <h3>Contact</h3>
          <ul>
            <li><a href="mailto:contact@dietandwell.com">contact@dietandwell.com</a></li>
            <li><a href="tel:+92-339-4056390">+92-339-4056390</a></li>
            <li><a href="https://wa.me/923394056390" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} DietAndWell. All rights reserved. 💚</p>
        <p className={styles.footerTagline}>
          Made with heart for your wellness journey
        </p>
        <div className={styles.footerSocial}>
          <a href="https://www.facebook.com/dietandwell" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
          <a href="https://www.instagram.com/dietandwell" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
        </div>
      </div>
    </footer>
  );
}
