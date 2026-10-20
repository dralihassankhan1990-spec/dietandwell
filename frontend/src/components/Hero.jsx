import React from 'react';
import './Hero.css';
import DepthBackdrop from './layout/DepthBackdrop.jsx';

const Hero = ({
    title,
    subtitle,
    backgroundImage,
    children,
    height = 'medium',
    overlay = true
}) => {
    const heroStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : {};

    return (
        <div className={`hero hero-${height}`} style={heroStyle}>
            <DepthBackdrop image={backgroundImage || '/images/blog-hero.jpg'} />
            {overlay && <div className="hero-overlay"></div>}
            <div className="hero-content">
                {title && <h1 className="hero-title">{title}</h1>}
                {subtitle && <p className="hero-subtitle">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
};

export default Hero;
