import React, { useState, useEffect, useRef } from 'react';
import './Carousel.css';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=400&fit=crop',
      title: 'Fresh Nutrition',
      subtitle: 'Discover the power of natural foods'
    },
    {
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop',
      title: 'Healthy Lifestyle',
      subtitle: 'Transform your wellness journey'
    },
    {
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=400&fit=crop',
      title: 'Superfood Power',
      subtitle: 'Nutrient-dense foods for optimal health'
    },
    {
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=400&fit=crop',
      title: 'Balanced Meals',
      subtitle: 'Delicious and nutritious combinations'
    },
    {
      image: 'https://images.unsplash.com/photo-1505576399279-565b52ce32f0?w=1200&h=400&fit=crop',
      title: 'Fit & Strong',
      subtitle: 'Build your best self today'
    },
    {
      image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=1200&h=400&fit=crop',
      title: 'Organic Goodness',
      subtitle: 'Pure, natural ingredients'
    },
    {
      image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&h=400&fit=crop',
      title: 'Protein Power',
      subtitle: 'Fuel your muscles and recovery'
    },
    {
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
      title: 'Culinary Wellness',
      subtitle: 'Where taste meets nutrition'
    }
  ];

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    startInterval();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startInterval();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startInterval();
  };

  return (
    <div
      className="carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="carousel-wrapper">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="carousel-overlay"></div>
            <div className="carousel-content">
              <h2 className="carousel-title">{slide.title}</h2>
              <p className="carousel-subtitle">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-button prev" onClick={prevSlide} aria-label="Previous slide">❮</button>
      <button className="carousel-button next" onClick={nextSlide} aria-label="Next slide">❯</button>

      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
