import React from 'react';
import { Link } from 'react-router-dom';
import Card from './UI/Card';
import Button from './UI/Button';
import { imageUrl } from '../services/api.js';
import './ProductCard.css';

/* ProductCard — fields match the backend Product entity:
   featuredImage, salePrice, price, slug. Legacy fields
   (imageUrl, originalPrice) still honoured as fallbacks. */
const ProductCard = ({ product, onAddToCart }) => {
    const image = imageUrl(product.featuredImage) || product.imageUrl || null;
    const price = product.salePrice ?? product.price;
    return (
        <Card hover className="product-card card-3d">
            {image && (
                <div className="product-image">
                    <img src={image} alt={product.name} loading="lazy" />
                </div>
            )}
            <div className="product-body">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                    <div className="product-pricing">
                        <span className="product-price">${Number(price).toFixed(2)}</span>
                        {product.salePrice && product.price && (
                            <span className="product-original-price">${Number(product.price).toFixed(2)}</span>
                        )}
                    </div>
                    <div className="product-actions">
                        <Link to={`/shop/${product.slug}`}>
                            <Button variant="outline" size="sm">Details</Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAddToCart && onAddToCart(product)}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;
