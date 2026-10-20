import { useSEO } from '../hooks/useSEO.js';
import { useState } from 'react';
import PageHero from '../components/layout/PageHero.jsx';
import SectionWrapper from '../components/layout/SectionWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import Textarea from '../components/UI/Textarea.jsx';
import Badge from '../components/UI/Badge.jsx';
import { useReveal } from '../hooks/useReveal';
import { submitContact } from '../services/api.js';
import '../styles/contact.css';

export default function Contact() {
  useSEO({"title":"Contact DietAndWell","description":"Ask about nutrition coaching, meal planning and dietitian support.","noIndex":false});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitError, setSubmitError] = useState('');
  useReveal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <PageHero image={"https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&q=80"}>
        <div className="contact-hero-content">
          <Badge variant="primary">Get In Touch</Badge>
          <h1 className="contact-hero-title">Let's Connect</h1>
          <p className="contact-hero-subtitle">
            Have questions about our services? Want to discuss your health goals? We'd love to hear from you. Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>
      </PageHero>

      {/* Contact Info + Form */}
      <SectionWrapper bg="container">
        <Container>
          <div className="contact-container reveal">
            {/* Left: Contact Info */}
            <div className="contact-info">
              <div className="info-card card-3d">
                <div className="info-icon">✉️</div>
                <h4>Email</h4>
                <p>
                  <a href="mailto:contact@dietandwell.com">contact@dietandwell.com</a>
                </p>
              </div>

              <div className="info-card card-3d">
                <div className="info-icon">📞</div>
                <h4>Phone</h4>
                <p>
                  <a href="tel:+923394056390">+92-339-4056390</a>
                </p>
              </div>

              <div className="info-card card-3d">
                <div className="info-icon">💬</div>
                <h4>WhatsApp</h4>
                <p>
                  <a href="https://wa.me/923394056390" target="_blank" rel="noreferrer">Chat with us</a>
                </p>
              </div>

              <div className="info-card card-3d">
                <div className="info-icon">🕐</div>
                <h4>Hours</h4>
                <p>
                  Mon - Fri: 9:00 AM - 6:00 PM<br />
                  Sat - Sun: By Appointment
                </p>
              </div>

              <div className="social-links">
                <a href="https://www.facebook.com/dietandwell" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">f</a>
                <a href="https://www.instagram.com/dietandwell" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">📷</a>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-wrapper reveal reveal-delay-1" id="contact-form">
              <h2 className="form-heading">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  ✓ Thank you! We'll be in touch shortly.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message">
                  ✗ {submitError || 'Something went wrong. Please try again.'}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div className="form-group">
                  <Textarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  fullWidth={true}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      {/* FAQ Section */}
      <SectionWrapper bg="default">
        <Container>
          <div className="reveal">
            <h2 className="section-heading section-heading-centered">
              Quick Responses
            </h2>
          </div>

          <div className="quick-responses reveal reveal-delay-1">
            <ResponseItem
              icon="🤔"
              title="What's the first step?"
              text="Schedule a free 20-minute consultation call. We'll discuss your goals and see if we're a good fit."
            />
            <ResponseItem
              icon="💰"
              title="What's your pricing?"
              text="Services range from $49-$199/month. Check our Services page for detailed pricing and packages."
            />
            <ResponseItem
              icon="🔄"
              title="Can I cancel anytime?"
              text="Yes! No lock-in contracts. You can pause or cancel your membership at any time."
            />
            <ResponseItem
              icon="🌍"
              title="Do you work internationally?"
              text="Currently serving the US and Canada. International clients may inquire about special arrangements."
            />
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper bg="primary">
        <Container>
          <div className="contact-cta reveal">
            <h2 className="section-heading section-heading-on-primary">
              Ready for a Free Consultation?
            </h2>
            <p className="cta-text">
              Let's discuss your health goals and create a custom plan for your wellness journey.
            </p>
            <Button variant="accent" size="lg" href="#contact-form">
              Get Started Today
            </Button>
          </div>
        </Container>
      </SectionWrapper>
    </div>
  );
}

function ResponseItem({ icon, title, text }) {
  return (
    <div className="response-item">
      <div className="response-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
