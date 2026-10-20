import React, { useState } from 'react';
import { imageUrl } from '../../services/api.js';

/**
 * SafeImg — <img> with a brand gradient placeholder behind it.
 * If the file is missing (404), the image hides and the gradient
 * (with a product initial) stays — layout never breaks.
 */
export default function SafeImg({ src, alt, className = '', fallbackLabel = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  const url = src ? imageUrl(src) : null;

  return (
    <div className={`safeimg ${className}`}>
      <div className="safeimg-fallback" aria-hidden="true">
        <span className="safeimg-fallback-initial">{fallbackLabel.charAt(0).toUpperCase() || 'D'}</span>
      </div>
      {!failed && url && (
        <img
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
          className="safeimg-img"
        />
      )}
    </div>
  );
}
