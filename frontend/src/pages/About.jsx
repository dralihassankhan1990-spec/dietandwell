import { useSEO } from '../hooks/useSEO.js';
import React from 'react';
import Hero from '../components/Hero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import StatItem from '../components/StatItem.jsx';
import '../styles/About.css';

export default function About() {
  useSEO({"title":"About DietAndWell","description":"Meet DietAndWell and learn about our approach to nutrition and wellbeing.","noIndex":false});
  return (
    <>
      <Hero title="Our Journey" subtitle="Discover the inspiration behind DietAndWell's mission" />

      <section className="section">
        <div className="container-custom">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="about-title">Passion for Health and Wellness</h2>
              <p className="about-text">
                DietAndWell is dedicated to empowering individuals through personalized nutrition strategies and health resources, achieving remarkable transformations in our clients' lives.
              </p>
              <p className="about-text">
                With over a decade of experience, our team of certified nutritionists and wellness coaches combine science-based approaches with compassionate support to help you achieve your health goals.
              </p>
            </div>
            <div className="about-icon" style={{ overflow: 'hidden', borderRadius: '8px' }}>
              <img src="/images/blog-hero.jpg" alt="Fresh ingredients for balanced everyday nutrition" loading="lazy" style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container-custom">
          <SectionTitle title="Our Impact" subtitle="Proven results and client success stories" />
          <div className="stats-container" style={{ color: 'var(--dark)' }}>
            <StatItem number="98%" label="Client Satisfaction" />
            <StatItem number="10+" label="Years Experience" />
            <StatItem number="500+" label="Happy Clients" />
            <StatItem number="100+" label="Experts" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <SectionTitle title="Our Mission & Values" />
          <div className="grid-3">
            <div className="card-custom card-3d about-value-card">
              <h4 className="about-value-title">✓ Expert Guidance</h4>
              <p>Our team consists of certified nutritionists with years of experience in personalized health coaching.</p>
            </div>
            <div className="card-custom card-3d about-value-card">
              <h4 className="about-value-title">✓ Holistic Approach</h4>
              <p>We address nutrition, fitness, mindfulness, and lifestyle to create sustainable wellness solutions.</p>
            </div>
            <div className="card-custom card-3d about-value-card">
              <h4 className="about-value-title">✓ Client Success</h4>
              <p>Your transformation is our mission. We provide continuous support throughout your wellness journey.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
