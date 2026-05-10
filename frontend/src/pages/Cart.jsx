import { useState, useEffect } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import api from '../api'
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaExclamationCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    fetchCartItems();

    const handleCartUpdate = () => {
      fetchCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Cart लिंक को highlight करने के लिए useEffect
  useEffect(() => {
    const cartLinks = document.querySelectorAll('a[href*="cart"], a[href="/cart"]');

    cartLinks.forEach(link => {
      link.style.color = '#FF7E00';

      const icon = link.querySelector('i, svg');
      if (icon) {
        icon.style.color = '#FF7E00';
      }
    });

    return () => {
      cartLinks.forEach(link => {
        link.style.color = '';
        const icon = link.querySelector('i, svg');
        if (icon) {
          icon.style.color = '';
        }
      });
    };
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await api.getCartItems()
      setCartItems(response.data)
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id, change) => {
    const item = cartItems.find(item => item.id === id)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + change)

    try {
      await api.updateCartItem(id, { quantity: newQuantity })
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const openDeleteModal = (id) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.deleteCartItem(itemToDelete)
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemToDelete))
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
    closeDeleteModal()
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = cartItems.length > 0 ? 5 : 0
    const tax = subtotal * 0.10
    const total = subtotal + shipping + tax

    return { subtotal, shipping, tax, total }
  }

  // RAZORPAY PAYMENT HANDLER FOR CHECKOUT BUTTON
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to cart before checkout.")
      return
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.")
      return
    }

    const { total } = calculateTotals()
    const productNames = cartItems.map(item => item.name).join(', ')

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Replace with your Razorpay key
      amount: Math.round(total * 100), // Amount in paise
      currency: "INR",
      name: "Navrang Hall",
      description: `Cart Checkout - ${cartItems.length} items`,
      image: "/img/logo.png",
      handler: function (response) {
        console.log("Payment Successful:", response)
        setPaymentStatus('success')
        setShowStatusModal(true)

        // Clear cart after successful payment
        setTimeout(() => {
          setCartItems([])
        }, 1000)
      },
      prefill: {
        name: "Test Customer",
        email: "test@example.com",
        contact: "9999999999"
      },
      notes: {
        cart_items: cartItems.length.toString(),
        items: productNames,
        subtotal: `₹${subtotal.toFixed(2)}`,
        shipping: `₹${shipping.toFixed(2)}`,
        tax: `₹${tax.toFixed(2)}`,
        total: `₹${total.toFixed(2)}`
      },
      theme: {
        color: "#FF7E00"
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed by user")
          setPaymentStatus('cancelled')
          setShowStatusModal(true)
        }
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.open()

      rzp.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error)
        setPaymentStatus('failed')
        setShowStatusModal(true)
      })

    } catch (error) {
      console.error("Error initializing Razorpay:", error)
      alert("Error initializing payment. Please try again.")
    }
  }

  const { subtotal, shipping, tax, total } = calculateTotals()

  if (loading) {
    return null
  }

  return (
    <>
      <HeroSection pageName="cart" />

      {/* Cart Section */}
      <section className="cart-section">
        <Container>
          <Row>
            {/* Cart Items */}
            <Col lg={8}>
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <FaShoppingCart className="empty-cart-icon" />
                  <h3>Your Cart is Empty</h3>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <a href="/shop" className="btn-shop-now">Start Shopping</a>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <button
                        className="cart-item-delete-btn"
                        onClick={() => openDeleteModal(item.id)}
                      >
                        <FaTrash />
                      </button>

                      <div className="cart-item-image">
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      </div>

                      <div className="cart-item-details">
                        <h5>{item.name}</h5>

                        <div className="cart-item-info">
                          <span className="detail-label">Color :</span>
                          <span className="detail-value">{item.color}</span>
                        </div>

                        <div className="cart-item-info">
                          <span className="detail-label">Size :</span>
                          <span className="detail-value">{item.size}</span>
                        </div>

                        <div className={`stock-status ${item.inStock ? 'in-stock' : 'sold-out'}`}>
                          {item.inStock ? <FaCheckCircle /> : <FaTimesCircle />}
                          {item.inStock ? 'In Stock' : 'Sold Out'}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn minus"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={!item.inStock}
                          >
                            <FaMinus />
                          </button>

                          <span className="quantity-value">{item.quantity}</span>

                          <button
                            className="quantity-btn plus"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={!item.inStock}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <div className="cart-item-price">
                          ₹ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <div className="order-summary">
                <h4>Order Summary</h4>

                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">₹ {subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Shipping estimate</span>
                  <span className="summary-value">₹ {shipping.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Tax estimate</span>
                  <span className="summary-value">₹ {tax.toFixed(2)}</span>
                </div>

                <div className="summary-total">
                  <span className="total-label">Order Total</span>
                  <span className="total-value">₹ {total.toFixed(2)}</span>
                </div>

                <button
                  className={`checkout-btn ${cartItems.length === 0 ? 'disabled' : ''}`}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  {cartItems.length === 0 ? 'Cart Empty' : 'Check Out'}
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="confirmation-modal show">
          <div className="modal-content-custom">
            <FaExclamationCircle className="modal-icon" />
            <h4>Remove Item?</h4>
            <p>Are you sure you want to remove this item from your cart?</p>
            <div className="modal-buttons">
              <button
                className="modal-btn cancel"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={confirmDelete}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showStatusModal && (
        <div className="payment-status-modal">
          <div className="status-modal-content">
            {paymentStatus === 'success' ? (
              <>
                <div className="status-icon success">
                  ✓
                </div>
                <h3>Payment Successful!</h3>
                <p>
                  Your order for <strong>{cartItems.length} items</strong> has been placed successfully.
                </p>
                <p className="order-details">
                  Order ID: ORD{Date.now().toString().slice(-6)}<br />
                  Total: ₹{total.toFixed(2)}
                </p>
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <div className="status-icon failed">
                  ✗
                </div>
                <h3>Payment Failed</h3>
                <p>
                  The payment could not be processed. Please try again.
                </p>
              </>
            ) : (
              <>
                <div className="status-icon cancelled">
                  !
                </div>
                <h3>Payment Cancelled</h3>
                <p>
                  Payment was cancelled. You can try again.
                </p>
              </>
            )}

            <div className="status-modal-buttons">
              {paymentStatus === 'success' ? (
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setPaymentStatus(null)
                  }}
                  className="status-btn continue"
                >
                  Continue Shopping
                </button>
              ) : paymentStatus === 'failed' ? (
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setPaymentStatus(null)
                    setTimeout(() => handleCheckout(), 300)
                  }}
                  className="status-btn try-again"
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setPaymentStatus(null)
                  }}
                  className="status-btn ok"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart