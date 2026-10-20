import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImg from './SafeImg.jsx';
import BookCover from './BookCover.jsx';
import ProductPhoto from './ProductPhoto.jsx';
import { formatPKR, fromPrice, stockInfo } from './shopUtils.js';

/**
 * Shop product card — image carousel (prev/next + dots, graceful with
 * 0/1 images), name, category, PKR price (lowest variant, "from"),
 * stock badge and Digital/Physical type badge.
 */
export default function ProductCard({ product }) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const [idx, setIdx] = useState(0);
  const price = fromPrice(product);
  const stock = stockInfo(product.stock);
  const cat = product.category?.name || '';
  const isDigital = product.type === 'digital';

  const prev = (e) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  return (
    <Link to={`/shop/${product.slug}`} className="shp-card" aria-label={product.name}>
      <div className="shp-card-media">
        {images.length > 0 ? (
          <>
            <SafeImg
              key={idx}
              src={images[idx]}
              alt={product.name}
              className="shp-card-img"
              fallbackLabel={product.name}
            />
            {images.length > 1 && (
              <>
                <button type="button" className="shp-carousel-arrow shp-prev" onClick={prev} aria-label="Previous image">‹</button>
                <button type="button" className="shp-carousel-arrow shp-next" onClick={next} aria-label="Next image">›</button>
                <div className="shp-carousel-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Image ${i + 1}`}
                      className={`shp-dot ${i === idx ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <ProductPhoto product={product} />
        )}
        <span className={`shp-type-badge ${isDigital ? 'digital' : 'physical'}`}>
          {isDigital ? 'Digital' : 'Physical'}
        </span>
      </div>

      <div className="shp-card-body">
        {cat && <p className="shp-card-cat">{cat}</p>}
        <h3 className="shp-card-name">{product.name}</h3>
        <div className="shp-card-meta">
          <span className="shp-card-price">
            {Array.isArray(product.variants) && product.variants.length > 0 ? 'from ' : ''}
            {formatPKR(price)}
          </span>
          {stock && <span className={`shp-stock shp-stock-${stock.tone}`}>{stock.label}</span>}
        </div>
      </div>
    </Link>
  );
}
