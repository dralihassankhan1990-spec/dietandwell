import { useSEO } from '../hooks/useSEO.js';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import { getCart, updateCartItem, removeCartItem, createOrder } from '../services/api.js';
import '../styles/Cart.css';

export default function Cart() {
  useSEO({"title":"My Cart","description":"Review your DietAndWell cart.","noIndex":true});
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      setCart(await getCart());
    } catch (e) {
      setError(e.message || 'Could not load your cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQty = async (itemId, qty) => {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    try {
      await updateCartItem(itemId, q);
      fetchCart();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
      fetchCart();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) { setError('Please enter a shipping address.'); return; }
    setPlacing(true);
    setError(null);
    try {
      const order = await createOrder({ shippingAddress: shippingAddress.trim(), notes: notes.trim() || undefined });
      setOrderDone(order);
      setCheckoutOpen(false);
      setCart(null);
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;

  if (loading) return <Hero title="Loading..." />;

  if (orderDone) {
    return (
      <>
        <Hero title="Order Placed 🎉" />
        <section className="section">
          <div className="container-custom">
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>Thank you for your order!</h3>
              <p>Order total: <strong>PKR {Number(orderDone.total).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> · Status: {orderDone.status}</p>
              <button onClick={() => navigate('/shop')} className="btn-primary-custom cart-continue-btn">Continue Shopping</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Hero title="Shopping Cart" />
      <section className="section">
        <div className="container-custom">
          {error && <div className="alert-custom alert-error">{error}</div>}
          {!cart?.items?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p>Your cart is empty</p>
              <button onClick={() => navigate('/shop')} className="btn-primary-custom cart-continue-btn">Continue Shopping</button>
            </div>
          ) : (
            <>
              <div className="cart-table-wrapper">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.product?.name || 'Product'}
                          {item.variantLabel && <div className="cart-variant">{item.variantLabel}</div>}
                        </td>
                        <td className="cart-price">PKR {Number(item.price).toLocaleString('en-PK')}</td>
                        <td className="cart-quantity">
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >+</button>
                        </td>
                        <td className="cart-subtotal">PKR {(Number(item.price) * item.quantity).toLocaleString('en-PK')}</td>
                        <td>
                          <button onClick={() => handleRemove(item.id)} className="cart-remove-btn">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cart-summary">
                <div>
                  <h3 className="cart-total">Total: PKR {total.toLocaleString('en-PK')}</h3>
                  {!checkoutOpen ? (
                    <button className="btn-primary-custom cart-checkout-btn" onClick={() => setCheckoutOpen(true)}>
                      Proceed to Checkout
                    </button>
                  ) : (
                    <form className="cart-checkout-form" onSubmit={handleCheckout}>
                      <label className="form-label-custom" htmlFor="ship-addr">Shipping Address</label>
                      <textarea
                        id="ship-addr"
                        className="form-control-custom"
                        rows={3}
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street, city, postal code"
                      />
                      <label className="form-label-custom" htmlFor="order-notes">Order Notes (optional)</label>
                      <input
                        id="order-notes"
                        className="form-control-custom"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Leave at door, etc."
                      />
                      <button type="submit" className="btn-primary-custom cart-checkout-btn" disabled={placing}>
                        {placing ? 'Placing Order…' : 'Place Order'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
