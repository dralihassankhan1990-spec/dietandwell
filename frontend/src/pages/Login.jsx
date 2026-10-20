/* ================================================================
   Login.jsx
   FILE: src/pages/Login.jsx
   ================================================================ */
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import Badge from '../components/UI/Badge.jsx';
import { login } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSEO, SEO } from '../hooks/useSEO.js';
import '../styles/auth.css';
import DepthBackdrop from '../components/layout/DepthBackdrop.jsx';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  useSEO(SEO.login);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      updateUser(data.user);
      const staff = data.user?.role === 'admin' || data.user?.role === 'editor';
      const dest = from || (staff ? '/admin' : '/profile');
      navigate(dest, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || 'Invalid email or password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero depth-header">
        <DepthBackdrop image="/images/calculators-hero.jpg" botanical={false} />
        <div className="auth-hero-content">
          <h1>Welcome Back</h1>
          <p>Sign in to access your personalised health dashboard</p>
        </div>
      </div>

      <Container>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <Badge variant="primary">Login</Badge>
              <h2>Sign In</h2>
              <p>Don't have an account?{' '}<Link to="/register" className="auth-link">Create one free</Link></p>
            </div>

            {errors.submit && (
              <div className="error-banner"><span>⚠️</span> {errors.submit}</div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <Input label="Email Address" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  error={errors.email} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <Input label="Password" name="password" type="password"
                  value={formData.password} onChange={handleChange}
                  error={errors.password} required placeholder="••••••••" />
              </div>

              <Button variant="primary" type="submit" fullWidth disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          <div className="auth-benefits">
            <h3>Why DietAndWell?</h3>
            <div className="benefit-list">
              {[
                { icon:'🧬', title:'Evidence-Based',    desc:'Every recommendation backed by clinical research' },
                { icon:'🎯', title:'Personalised',      desc:'Protocols built around your unique physiology' },
                { icon:'📊', title:'Trackable Results', desc:'Monthly biometric progress reports' },
                { icon:'💬', title:'Ongoing Support',   desc:'WhatsApp access between sessions' },
              ].map(b => (
                <div key={b.title} className="benefit-item">
                  <span className="benefit-icon">{b.icon}</span>
                  <div><h4>{b.title}</h4><p>{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
