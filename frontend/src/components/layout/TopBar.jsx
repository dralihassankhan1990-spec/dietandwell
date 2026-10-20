import './TopBar.css';

/* TopBar — spec §3.1. Contact details match the footer / site metadata. */
export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <a href="mailto:contact@dietandwell.com">✉️ contact@dietandwell.com</a>
          <a href="tel:+923394056390">📞 +92-339-4056390</a>
          <a href="https://wa.me/923394056390" target="_blank" rel="noreferrer">💬 WhatsApp</a>
        </div>
        <div className="topbar-right">
          <a href="https://www.facebook.com/dietandwell" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
          <a href="https://www.instagram.com/dietandwell" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
        </div>
      </div>
    </div>
  );
}
