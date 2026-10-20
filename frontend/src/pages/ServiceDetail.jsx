import { useSEO } from '../hooks/useSEO.js';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import { getServiceBySlug } from '../services/api.js';
import '../styles/ServiceDetail.css';

export default function ServiceDetail() {
  useSEO({"title":"Nutrition Service Details","description":"Explore DietAndWell nutrition services and contact us for guidance.","noIndex":false});
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setService(null);
    getServiceBySlug(slug).then(setService).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <>
        <Hero title="Service Not Found" />
        <section className="section">
          <div className="container-custom">
            <p>Sorry, that service doesn&apos;t exist.</p>
            <Link to="/services" className="service-back-btn">← Back to Services</Link>
          </div>
        </section>
      </>
    );
  }

  if (!service) return <Hero title="Loading..." />;

  return (
    <>
      <Hero title={service.name} subtitle={service.description} />
      <section className="section">
        <div className="container-custom">
          <button onClick={() => navigate('/services')} className="service-back-btn">← Back to Services</button>
          <div className="card-custom service-detail-card card-3d">
            <h2 className="service-detail-title">{service.name}</h2>
            <p className="service-detail-description">{service.description}</p>
            {/* longDescription is a plain-text column — render as text, never as HTML. */}
            {service.longDescription && (
              <div className="service-long-description">
                {service.longDescription.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
            {service.price && <p className="service-detail-price">Price: PKR {Number(service.price).toLocaleString()}</p>}
            {service.duration && <p className="service-detail-duration"><strong>Duration:</strong> {service.duration}</p>}
            <Link to="/contact" className="btn-primary-custom service-enroll-btn">Contact Us to Enroll</Link>
          </div>
        </div>
      </section>
    </>
  );
}
