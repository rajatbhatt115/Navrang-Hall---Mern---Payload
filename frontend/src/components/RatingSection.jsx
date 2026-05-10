import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import api from '../api'

const RatingSection = () => {
  const [activeCategory, setActiveCategory] = useState('kids')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getTopRatingProducts(activeCategory);
        setProducts(response.data);  // response.data use karein
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Jab category change ho tab products fetch karo
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await api.getTopRatingProducts(activeCategory)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProductsByCategory()
  }, [activeCategory])

  // RAZORPAY PAYMENT HANDLER FOR PRODUCT CARDS
  const handleBuyNow = (product) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setSelectedProduct(product);

    const totalPrice = parseInt(product.price.replace('₹', '').replace(',', '')) || 1000;

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Replace with your Razorpay key
      amount: totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "Navrang Hall",
      description: `Product: ${product.title}`,
      image: "/img/logo.png",
      handler: function (response) {
        console.log("Payment Successful:", response);
        setPaymentStatus('success');
        setShowStatusModal(true);
      },
      prefill: {
        name: "Test Customer",
        email: "test@example.com",
        contact: "9999999999"
      },
      notes: {
        product: product.title,
        category: activeCategory,
        amount: totalPrice
      },
      theme: {
        color: "#FF7E00"
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed by user");
          setPaymentStatus('cancelled');
          setShowStatusModal(true);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error);
        setPaymentStatus('failed');
        setShowStatusModal(true);
      });

    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      alert("Error initializing payment. Please try again.");
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) {
    return null
  }

  const categories = [
    { id: 'kids', name: 'Kids' },
    { id: 'women', name: 'Women' },
    { id: 'jewellery', name: 'Jewellery' }
  ]

  return (
    <section className="rating-section">
      <Container>
        <h2>Top Rating Cloths.</h2>
        
        {/* Category Tabs */}
        <div className="rating-tabs">
          {categories.map(category => (
            <div
              key={category.id}
              className={`rating-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>

        {/* Products based on active category */}
        {products.length > 0 && (
          <Row className="product-category active">
            {products.map(product => (
              <Col md={4} key={product.id}>
                <div className="rating-card">
                  <div className="rating-image rating-image-kids1 rating-image-women1 rating-image-jewellery1" style={{ backgroundImage: `url(${product.image})` }}></div>
                  <div className="rating-top-row">
                    <div className="left-group">
                      <h5 className="item-title">{product.title}</h5>
                      <div className="stars">{renderStars(product.rating)}</div>
                    </div>
                    <div className="price">{product.price}</div>
                  </div>
                  
                  {/* Buy Now Button */}
                  <div className="rating-action-buttons" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <button
                      className="btn-buy-now"
                      style={{
                        width: '100%',
                        background: '#FF7E00',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '25px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-4">
            <p>No products found for this category.</p>
          </div>
        )}
      </Container>

      {/* Payment Status Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '400px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {paymentStatus === 'success' ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#4CAF50',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white'
                }}>
                  ✓
                </div>
                <h3 style={{ color: '#2D2D2D', marginBottom: '10px' }}>Payment Successful!</h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                  Your order for <strong>{selectedProduct?.title}</strong> has been placed successfully.
                </p>
                <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>
                  Order ID: ORD{Date.now().toString().slice(-6)}
                </p>
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#f44336',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white'
                }}>
                  ✗
                </div>
                <h3 style={{ color: '#2D2D2D', marginBottom: '10px' }}>Payment Failed</h3>
                <p style={{ color: '#666', marginBottom: '25px' }}>
                  The payment for <strong>{selectedProduct?.title}</strong> could not be processed. Please try again.
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#FF7E00',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white'
                }}>
                  !
                </div>
                <h3 style={{ color: '#2D2D2D', marginBottom: '10px' }}>Payment Cancelled</h3>
                <p style={{ color: '#666', marginBottom: '25px' }}>
                  Payment for <strong>{selectedProduct?.title}</strong> was cancelled. You can try again.
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              {paymentStatus === 'success' ? (
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setPaymentStatus(null);
                    setSelectedProduct(null);
                  }}
                  style={{
                    padding: '12px 30px',
                    background: '#FF7E00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%'
                  }}
                >
                  Continue Shopping
                </button>
              ) : paymentStatus === 'failed' ? (
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setPaymentStatus(null);
                    if (selectedProduct) {
                      setTimeout(() => handleBuyNow(selectedProduct), 300);
                    }
                  }}
                  style={{
                    padding: '12px 30px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%'
                  }}
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setPaymentStatus(null);
                    setSelectedProduct(null);
                  }}
                  style={{
                    padding: '12px 30px',
                    background: '#FF7E00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%'
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default RatingSection