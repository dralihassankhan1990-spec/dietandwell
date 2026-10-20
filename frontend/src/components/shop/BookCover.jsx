import React from 'react';
import './BookCover.css';

/**
 * BookCover — CSS-only 3D book. The cover title is real HTML text
 * (crisp at any size). No AI-generated images are used for covers.
 */
export default function BookCover({ title, subtitle, size = 'md' }) {
  return (
    <div className={`book3d book3d--${size}`} aria-label={`Book cover: ${title}`}>
      <div className="book3d-spine">
        <span>{title}</span>
      </div>
      <div className="book3d-cover">
        <div className="book3d-cover-shine" />
        <p className="book3d-kicker">DietAndWell Digital</p>
        <h3 className="book3d-title">{title}</h3>
        {subtitle && <p className="book3d-subtitle">{subtitle}</p>}
        <div className="book3d-brand">
          <span className="book3d-leaf" aria-hidden="true" />
          DietAndWell
        </div>
      </div>
      <div className="book3d-pages" />
    </div>
  );
}
