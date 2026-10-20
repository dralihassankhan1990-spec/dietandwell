import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import Badge from '../components/UI/Badge.jsx';
import { register } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSEO, SEO } from '../hooks/useSEO.js';
import '../styles/auth.css';
import DepthBackdrop from '../components/layout/DepthBackdrop.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirm:'' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  useSEO(SEO.register);

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!formData.email.includes('@')) errs.email  = 'Valid email is required';
    if (formData.password.length < 8)  errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await register({
        firstName: formData.firstName,
        lastName:  formData.lastName,
        email:     formData.email,
        phone:     formData.phone,
        password:  formData.password,
      });
      updateUser(data.user);
      navigate('/profile', { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. That email may already be in use.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero depth-header">
        <DepthBackdrop image="/images/blog-hero.jpg" botanical={false} />
        <div className="auth-hero-content">
          <h1>Start Your Journey</h1>
          <p>Create your free account and access evidence-based health tools</p>
        </div>
      </div>

      <Container>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <Badge variant="primary">Sign Up</Badge>
              <h2>Create Your Account</h2>
              <p>Already have an account?{' '}<Link to="/login" className="auth-link">Sign in</Link></p>
            </div>

            {errors.submit && <div className="error-banner"><span>⚠️</span> {errors.submit}</div>}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <Input label="First Name" name="firstName" type="text"
                    value={formData.firstName} onChange={handleChange}
                    error={errors.firstName} required placeholder="Sarah" />
                </div>
                <div className="form-group">
                  <Input label="Last Name" name="lastName" type="text"
                    value={formData.lastName} onChange={handleChange}
                    error={errors.lastName} required placeholder="Khan" />
                </div>
              </div>
              <div className="form-group">
                <Input label="Email Address" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  error={errors.email} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <Input label="Phone (optional)" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  placeholder="+92 300 000 0000" />
              </div>
              <div className="form-group">
                <Input label="Password" name="password" type="password"
                  value={formData.password} onChange={handleChange}
                  error={errors.password} required placeholder="Min 8 characters" />
              </div>
              <div className="form-group">
                <Input label="Confirm Password" name="confirm" type="password"
                  value={formData.confirm} onChange={handleChange}
                  error={errors.confirm} required placeholder="Repeat password" />
              </div>

              <p className="auth-terms">
                By creating an account you agree to our Privacy Policy.
              </p>

              <Button variant="primary" type="submit" fullWidth disabled={loading}>
                {loading ? 'Creating account…' : 'Create Free Account'}
              </Button>
            </form>
          </div>

          <div className="auth-benefits">
            <h3>Free Account Includes</h3>
            <div className="benefit-list">
              {[
                { icon:'🧮', title:'18 Free Health Calculators', desc:'BMI, TDEE, body fat, macros and more' },
                { icon:'📰', title:'Full Article Library',        desc:'All nutrition & wellness articles' },
                { icon:'📊', title:'Save Your Results',          desc:'Track calculator results over time' },
                { icon:'📬', title:'Weekly Newsletter',           desc:'Expert tips delivered every Thursday' },
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
