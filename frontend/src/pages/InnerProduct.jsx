import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import HeroSection from '../components/HeroSection';
import api from '../api';
import { FaHeart, FaMinus, FaPlus, FaPaperPlane, FaEye, FaRedo, FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart } from 'react-icons/fa';

const InnerProduct = () => {
  const [mainImage, setMainImage] = useState('/img/img_lg1.webp');
  const [selectedSize, setSelectedSize] = useState('XS');
  const [quantity, setQuantity] = useState(2);
  const [activeTab, setActiveTab] = useState('details');
  const [wishlisted, setWishlisted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    firstName: '',
    lastName: '',
    rating: 0,
    comment: ''
  });
  const [reviews, setReviews] = useState([]);
  const [currentReviewSlide, setCurrentReviewSlide] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const reviewTimerRef = useRef(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // ✅ URL से product ID get करें
      const productId = window.location.pathname.split('/').pop();
      
      // ✅ API से actual product data fetch करें
      const response = await api.getProductDetails(productId);
      const productData = response.data;
      
      setProduct(productData);
      
      // ✅ Product के images set करें
      if (productData.images && productData.images.length > 0) {
        setMainImage(productData.images[0].large);
      }
      
      // ✅ सबसे पहले productDetails से reviews लें
      if (productData.reviews && productData.reviews.length > 0) {
        // Format reviews for UI WITHOUT date
        const formattedReviews = productData.reviews.map(review => ({
          id: review.id,
          name: review.name,
          rating: review.rating,
          text: review.text || review.comment,
          avatar: review.avatar
          // NO date field
        }));
        setReviews(formattedReviews);
      } else {
        // If no reviews in productDetails, check separate reviews endpoint
        try {
          const reviewsResponse = await api.getProductReviews(productId);
          const dbReviews = reviewsResponse.data;
          
          if (dbReviews && dbReviews.length > 0) {
            // Remove date from existing reviews too
            const formattedReviews = dbReviews.map(review => ({
              id: review.id,
              name: review.name,
              rating: review.rating,
              text: review.text || review.comment,
              avatar: review.avatar
            }));
            setReviews(formattedReviews);
          }
        } catch (error) {
          console.log('No separate reviews found');
        }
      }
      
      // ✅ Rest of the code remains same...
      // ✅ Fetch wishlist items
      const wishlistResponse = await api.getWishlistItems();
      setWishlistItems(wishlistResponse.data);
      
      // ✅ Check if current product is in wishlist
      const isInWishlist = wishlistResponse.data.some(item => item.name === productData.name);
      setWishlisted(isInWishlist);
      
      // ✅ Fetch cart items
      const cartResponse = await api.getCartItems();
      setCartItems(cartResponse.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, []);

  // Auto slide reviews
  useEffect(() => {
    reviewTimerRef.current = setInterval(() => {
      setCurrentReviewSlide(prev => (prev + 1) % Math.ceil(reviews.length / 3));
    }, 5000);

    return () => {
      if (reviewTimerRef.current) {
        clearInterval(reviewTimerRef.current);
      }
    };
  }, [reviews.length]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Helper function to get random avatar
  const getRandomAvatar = () => {
    const avatarIds = [
      '1524504388940-b1c1722653e1',
      '1507003211169-0a1dd7228f2d',
      '1438761681033-6461ffad8d80',
      '1500648767791-00dcc994a43e',
      '1544005313-94ddf0286df2',
      '1506794778202-cad84cf45f1d'
    ];
    return `https://images.unsplash.com/photo-${avatarIds[Math.floor(Math.random() * avatarIds.length)]}?w=150&auto=format&fit=crop&q=80`;
  };

  // Helper function to get random color
  const getRandomColor = () => {
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Orange', 'Pink', 'Purple', 'Yellow'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Add to Wishlist Function
  const addToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    try {
      // Check if already in wishlist
      const isAlreadyInWishlist = wishlistItems.some(item => item.name === product.name);

      if (!isAlreadyInWishlist) {
        // Prepare wishlist item data
        const wishlistItem = {
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].thumb : '/img/default.jpg',
          color: getRandomColor(),
          size: selectedSize,
          unitPrice: product.price,
          price: product.price,
          quantity: 1,
          inStock: true
        };

        // Add to wishlist via API
        const response = await api.addToWishlist(wishlistItem);

        // Update local state
        setWishlistItems(prev => [...prev, response.data]);
        setWishlisted(true);

        // Show success message
        alert(`✓ "${product.name}" has been added to your wishlist!`);

      } else {
        alert(`"${product.name}" is already in your wishlist!`);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert(`Failed to add "${product.name}" to wishlist. Please try again.`);
    }
  };

  // Remove from Wishlist Function
  const removeFromWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    try {
      // Find the wishlist item by name
      const wishlistItem = wishlistItems.find(item => item.name === product.name);

      if (wishlistItem) {
        // Remove from wishlist via API
        await api.deleteWishlistItem(wishlistItem.id);

        // Update local state
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistItem.id));
        setWishlisted(false);

        // Show success message
        alert(`✓ "${product.name}" has been removed from your wishlist!`);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert(`Failed to remove "${product.name}" from wishlist. Please try again.`);
    }
  };

  // Toggle Wishlist Function
  const toggleWishlist = async (e) => {
    if (wishlisted) {
      await removeFromWishlist(e);
    } else {
      await addToWishlist(e);
    }
  };

  // Add to Cart Function
  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    try {
      // Check if already in cart
      const isAlreadyInCart = cartItems.some(item => item.name === product.name);

      if (!isAlreadyInCart) {
        // Prepare cart item data
        const cartItem = {
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].thumb : '/img/default.jpg',
          color: getRandomColor(),
          size: selectedSize,
          price: product.price,
          quantity: quantity,
          inStock: true
        };

        // Add to cart via API
        const response = await api.addToCart(cartItem);

        // Update local state
        setCartItems(prev => [...prev, response.data]);

        // Show success message
        alert(`✓ "${product.name}" (Qty: ${quantity}) has been added to your cart!`);

      } else {
        alert(`"${product.name}" is already in your cart!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Failed to add "${product.name}" to cart. Please try again.`);
    }
  };

  const handleRatingClick = (rating) => {
    setUserRating(rating);
    setReviewForm({ ...reviewForm, rating });
  };

  const handleReviewChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value
    });
  };

  // RAZORPAY PAYMENT HANDLER FOR BUY NOW BUTTON
  const handleBuyNow = () => {
    if (!product) return;

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    const totalPrice = product.price * quantity;

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag",
      amount: totalPrice * 100,
      currency: "INR",
      name: "Navrang Hall",
      description: `Product: ${product.name} - Size: ${selectedSize}`,
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
        product: product.name,
        size: selectedSize,
        quantity: quantity,
        totalAmount: totalPrice
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

  // UPDATED: Save review to productDetails array (without date)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.firstName || !reviewForm.lastName || !reviewForm.comment || reviewForm.rating === 0) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    try {
      // Prepare review data WITHOUT date
      const reviewData = {
        productId: product.id,
        name: `${reviewForm.firstName} ${reviewForm.lastName}`,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        avatar: getRandomAvatar()
        // NO date field
      };

      // Save to database
      const response = await api.addProductReview(reviewData);
      const newReview = response.data;

      // Format for UI WITHOUT date
      const formattedReview = {
        id: newReview.id,
        name: newReview.name,
        rating: newReview.rating,
        text: newReview.comment || newReview.text,
        avatar: newReview.avatar
        // NO date field
      };

      // Add new review to the beginning
      setReviews(prev => [formattedReview, ...prev]);

      // Update product rating
      setProduct(prev => {
        const allReviews = [...(prev.reviews || []), formattedReview];
        const newRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        return {
          ...prev,
          rating: parseFloat(newRating.toFixed(1)),
          reviews: allReviews
        };
      });

      // Reset form
      setReviewForm({
        firstName: '',
        lastName: '',
        rating: 0,
        comment: ''
      });
      setUserRating(0);

      alert('Review submitted successfully! It has been saved to the database.');

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar
            key={i}
            color="#FFB800"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={interactive ? () => handleRatingClick(i) : undefined}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            color="#FFB800"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={interactive ? () => handleRatingClick(i) : undefined}
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            color="#ddd"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={interactive ? () => handleRatingClick(i) : undefined}
          />
        );
      }
    }
    return stars;
  };

  const renderReviewStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} color="#FFB800" />
      ) : (
        <FaRegStar key={i} color="#ddd" />
      )
    );
  };

  // Get current reviews for slider
  const getCurrentReviews = () => {
    const start = currentReviewSlide * 3;
    const end = start + 3;
    return reviews.slice(start, end);
  };

  // Handle dot click
  const handleDotClick = (index) => {
    setCurrentReviewSlide(index);
    // Reset timer
    if (reviewTimerRef.current) {
      clearInterval(reviewTimerRef.current);
    }
    reviewTimerRef.current = setInterval(() => {
      setCurrentReviewSlide(prev => (prev + 1) % Math.ceil(reviews.length / 3));
    }, 5000);
  };

  // Calculate total dots needed
  const totalDots = Math.ceil(reviews.length / 3);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#FF7E00' }}>Loading product...</div>;
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#FF7E00' }}>Product not found</div>;
  }

  const totalPrice = product.price * quantity;
  const totalReviews = reviews.length;

  return (
    <>
      <HeroSection pageName="product" />

      {/* Product Detail Section */}
      <section className="product-detail-section" style={{ padding: '80px 0', background: '#fff' }}>
        <Container>
          <Row>
            {/* Product Images */}
            <Col lg={6}>
              <div className="main-product-image" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <img
                  src={mainImage}
                  alt="Dress"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
                {/* Wishlist Button with Orange Stroke and White Background */}
                <button
                  onClick={toggleWishlist}
                  className="wishlist-btn"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    background: 'white',
                    border: wishlisted ? '2px solid #FF7E00' : '2px solid rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: wishlisted
                      ? '0 0 15px rgba(255, 126, 0, 0.4)'
                      : '0 3px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.borderColor = '#FF7E00';
                    e.target.style.boxShadow = '0 5px 15px rgba(255, 126, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.borderColor = wishlisted ? '#FF7E00' : 'rgba(0,0,0,0.1)';
                    e.target.style.boxShadow = wishlisted
                      ? '0 0 15px rgba(255, 126, 0, 0.4)'
                      : '0 3px 10px rgba(0, 0, 0, 0.1)';
                  }}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <FaHeart
                    size={22}
                    color={wishlisted ? '#FF7E00' : '#333'}
                    style={{ transition: 'color 0.3s' }}
                  />
                </button>
              </div>
              <div className="thumbnail-container" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                {product.images && product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImage(img.large)}
                    className="thumbnail"
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      border: mainImage === img.large ? '3px solid #FF7E00' : '2px solid #eee',
                      transition: 'all 0.3s',
                      height: '120px',
                      opacity: mainImage === img.large ? 1 : 0.7
                    }}
                  >
                    <img
                      src={img.thumb}
                      alt={`View ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </Col>

            {/* Product Info */}
            <Col lg={6}>
              <div className="product-info-container" style={{ paddingLeft: '40px', paddingTop: '20px' }}>
                <h1 className="product-name" style={{ fontSize: '32px', fontWeight: '700', color: '#2D2D2D', marginBottom: '20px' }}>
                  {product.name}
                </h1>

                <div className="product-price-box" style={{ background: '#FFF4E6', display: 'inline-block', padding: '10px 25px', borderRadius: '25px', marginBottom: '20px' }}>
                  <div className="product-price" style={{ fontSize: '24px', fontWeight: '700', color: '#2D2D2D', margin: 0 }}>
                    ₹ {product.price}
                  </div>
                </div>

                <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                  <div className="stars" style={{ color: '#FFB800', fontSize: '20px' }}>
                    {renderStars(product.rating)}
                  </div>
                  <span className="rating-text" style={{ color: '#666', fontSize: '16px', marginLeft: '5px' }}>
                    ({product.rating})
                  </span>
                  <span className="reviews-count" style={{ color: '#666', fontSize: '16px' }}>
                    • {totalReviews} Reviews
                  </span>
                </div>

                {/* Size Selection */}
                <div className="size-section" style={{ marginBottom: '30px' }}>
                  <div className="section-label" style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '15px', fontSize: '16px' }}>
                    Size: {selectedSize}
                  </div>
                  <div className="size-options" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.sizes && product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className="size-option"
                        style={{
                          padding: '10px 20px',
                          border: selectedSize === size ? '2px solid #FF7E00' : '2px solid #e0e0e0',
                          background: selectedSize === size ? '#FF7E00' : 'white',
                          color: selectedSize === size ? 'white' : '#2D2D2D',
                          borderRadius: '25px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          minWidth: '50px'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="quantity-section" style={{ marginBottom: '30px' }}>
                  <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="quantity-btn"
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '50%',
                        background: 'white',
                        color: '#2D2D2D',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-value" style={{ fontSize: '20px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="quantity-btn"
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '50%',
                        background: 'white',
                        color: '#2D2D2D',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaPlus />
                    </button>
                    <span className="total-price" style={{ fontSize: '28px', fontWeight: '700', color: '#2D2D2D', marginLeft: '20px' }}>
                      ₹ {totalPrice}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                  <button
                    className="btn-buy-now"
                    style={{
                      flex: 1,
                      background: '#FF7E00',
                      color: 'white',
                      padding: '15px 40px',
                      borderRadius: '30px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                  <button
                    className="btn-add-cart"
                    style={{
                      flex: 1,
                      background: 'white',
                      color: '#2D2D2D',
                      padding: '15px 40px',
                      borderRadius: '30px',
                      border: '2px solid #2D2D2D',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={addToCart}
                  >
                    <FaShoppingCart style={{ marginRight: '8px' }} />
                    Add To Cart
                  </button>
                </div>
              </div>
            </Col>
          </Row>

          {/* Tabs Section */}
          <div className="product-tabs" style={{ marginTop: '60px', borderBottom: '3px solid #f0f0f0' }}>
            <div className="tab-buttons" style={{ display: 'flex', gap: '40px' }}>
              <button
                onClick={() => setActiveTab('details')}
                className="tab-btn"
                style={{
                  padding: '15px 0',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: activeTab === 'details' ? '#2D2D2D' : '#999',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
              >
                Product Details
                {activeTab === 'details' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-3px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#FF7E00'
                  }} />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className="tab-btn"
                style={{
                  padding: '15px 0',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: activeTab === 'reviews' ? '#2D2D2D' : '#999',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
              >
                Reviews
                {activeTab === 'reviews' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-3px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#FF7E00'
                  }} />
                )}
              </button>
            </div>
          </div>

          {/* Product Details Tab */}
          <div className="tab-content" style={{ padding: '40px 0 0' }}>
            {activeTab === 'details' && (
              <div className="tab-pane active">
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>{product.description}</p>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>
                  It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                </p>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>
                  There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
                </p>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-pane active">
                <div className="reviews-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
                  <div className="stars" style={{ color: '#FFB800', fontSize: '24px' }}>
                    {renderStars(product.rating)}
                  </div>
                  <span className="reviews-count" style={{ color: '#666', fontSize: '18px' }}>
                    ({product.rating}) • {totalReviews} Reviews
                  </span>
                </div>

                {/* Reviews Container with Slider */}
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="reviews-container" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '20px',
                      marginBottom: '30px',
                      position: 'relative',
                      minHeight: '300px'
                    }}>
                      
                      {getCurrentReviews().map(review => (
                        <div key={review.id} className="review-card" style={{
                          background: '#f8f9fa',
                          borderRadius: '15px',
                          padding: '30px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.3s ease, opacity 0.3s ease',
                          border: '1px solid #eee'
                        }}>
                          <div className="review-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div
                              className="reviewer-avatar"
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                flexShrink: 0,
                                backgroundImage: `url(${review.avatar})`,
                                border: '2px solid #FF7E00'
                              }}
                              loading="lazy"
                            ></div>
                            <div className="reviewer-info">
                              <h6 style={{ fontWeight: '600', color: '#2D2D2D', margin: 0 }}>{review.name}</h6>
                              <div className="review-rating" style={{ color: '#FFB800', fontSize: '16px', marginTop: '5px' }}>
                                {renderReviewStars(review.rating)}
                              </div>
                              {/* DATE REMOVED FROM HERE */}
                            </div>
                          </div>
                          <p className="review-text" style={{ color: '#666', lineHeight: '1.8', flexGrow: 1 }}>
                            "{review.text}"
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Review Slider Dots */}
                    <div className="review-dots" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', minHeight: '20px' }}>
                      {Array.from({ length: totalDots }).map((_, index) => (
                        <div
                          key={index}
                          className={`review-dot ${index === currentReviewSlide ? 'active' : ''}`}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: index === currentReviewSlide ? '#FF7E00' : '#ddd',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            transform: index === currentReviewSlide ? 'scale(1.2)' : 'scale(1)'
                          }}
                          onClick={() => handleDotClick(index)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    border: '2px dashed #eee',
                    borderRadius: '10px',
                    background: '#fff',
                    margin: '30px 0'
                  }}>
                    <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
                      No reviews yet. Be the first to review this product!
                    </p>
                    <button
                      style={{
                        padding: '10px 25px',
                        background: '#FF7E00',
                        border: 'none',
                        color: 'white',
                        borderRadius: '25px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => {
                        // Scroll to review form
                        document.getElementById('reviewForm')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Write First Review
                    </button>
                  </div>
                )}

                {/* Add Comment Form with Light Gray Background */}
                <div style={{
                  background: '#fff4e6',
                  padding: '60px',
                  borderRadius: '20px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)', marginTop: '60px'
                }} className='form-cl'>
                  <Row className="d-flex justify-content-center align-items-center" id="reviewForm">
                    <Col lg={6} md={6} xs={12}>
                      <div className="add-review-form" style={{ marginTop: '0px' }}>
                        <h3 className="form-title" style={{
                          color: '#2D2D2D',
                          fontSize: '24px',
                          fontWeight: '600',
                          marginBottom: '25px',
                          paddingBottom: '15px',
                          borderBottom: '2px solid #e0e0e0'
                        }}>
                          Add Your Review
                        </h3>
                        <Form onSubmit={handleReviewSubmit}>
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Label htmlFor="firstName" style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '8px', display: 'block' }}>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                id="firstName"
                                name="firstName"
                                placeholder="Enter your first name"
                                value={reviewForm.firstName}
                                onChange={handleReviewChange}
                                required
                                style={{
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  padding: '12px 15px',
                                  fontSize: '16px',
                                  transition: 'all 0.3s',
                                  background: 'white'
                                }}
                              />
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Label htmlFor="lastName" style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '8px', display: 'block' }}>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                id="lastName"
                                name="lastName"
                                placeholder="Enter your last name"
                                value={reviewForm.lastName}
                                onChange={handleReviewChange}
                                required
                                style={{
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  padding: '12px 15px',
                                  fontSize: '16px',
                                  transition: 'all 0.3s',
                                  background: 'white'
                                }}
                              />
                            </Col>
                          </Row>

                          <div className="mb-3">
                            <Form.Label style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '8px', display: 'block' }}>Your Rating</Form.Label>
                            <div style={{ margin: '15px 0' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    onClick={() => handleRatingClick(star)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {star <= userRating ? (
                                      <FaStar size={28} color="#FFB800" />
                                    ) : (
                                      <FaRegStar size={28} color="#ddd" />
                                    )}
                                  </span>
                                ))}
                              </div>

                              <span style={{ color: '#666', fontSize: '16px', minWidth: '150px' }}>
                                {userRating === 0 ? 'Click stars to rate' :
                                  userRating === 1 ? 'Poor - 1 star' :
                                    userRating === 2 ? 'Fair - 2 stars' :
                                      userRating === 3 ? 'Good - 3 stars' :
                                        userRating === 4 ? 'Very Good - 4 stars' :
                                          'Excellent - 5 stars'}
                              </span>
                              <input type="hidden" id="userRating" value={userRating} />
                            </div>
                          </div>

                          <div className="mb-4">
                            <Form.Label htmlFor="comment" style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '8px', display: 'block' }}>Your Review</Form.Label>
                            <Form.Control
                              as="textarea"
                              id="comment"
                              name="comment"
                              rows={4}
                              placeholder="Share your experience with this product..."
                              value={reviewForm.comment}
                              onChange={handleReviewChange}
                              required
                              style={{
                                border: '2px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '12px 15px',
                                fontSize: '16px',
                                transition: 'all 0.3s',
                                background: 'white'
                              }}
                            />
                          </div>

                          <div
                            className="d-flex flex-column align-items-center"
                            style={{ gap: '20px' }}
                          >
                            {/* TOP BUTTON (CENTERED) */}
                            <button
                              type="submit"
                              className="btn-submit-review"
                              style={{
                                width: '100%',
                                padding: '14px 35px',
                                background: '#FF7E00',
                                border: 'none',
                                color: 'white',
                                borderRadius: '30px',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                              }}
                            >
                              <FaPaperPlane /> Post Your Comment
                            </button>

                            {/* BOTTOM BUTTONS (SAME WIDTH AS TOP) */}
                            <div
                              style={{
                                display: 'flex',
                                gap: '15px',
                                width: '100%',
                                maxWidth: '420px'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setShowPreview(true)}
                                style={{
                                  flex: 1,
                                  padding: '10px 20px',
                                  background: 'white',
                                  color: '#2D2D2D',
                                  border: '2px solid #2D2D2D',
                                  borderRadius: '25px',
                                  fontWeight: '600',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                <FaEye /> Preview
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReviewForm({
                                    firstName: '',
                                    lastName: '',
                                    rating: 0,
                                    comment: ''
                                  })
                                  setUserRating(0)
                                }}
                                style={{
                                  flex: 1,
                                  padding: '10px 20px',
                                  background: 'white',
                                  color: '#dc3545',
                                  border: '2px solid #dc3545',
                                  borderRadius: '25px',
                                  fontWeight: '600',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                <FaRedo /> Reset
                              </button>
                            </div>
                          </div>
                        </Form>
                      </div>
                    </Col>
                    <Col lg={6} md={6} xs={12} style={{ textAlign: 'center' }}>
                      <img
                        src="/img/img_comment.webp"
                        alt="Comment"
                        style={{
                          width: '100%',
                          maxWidth: '500px',
                          height: 'auto',
                          margin: '0 auto'
                        }} className='img-review'
                        loading="lazy"
                      />
                    </Col>
                  </Row>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            animation: 'modalSlideIn 0.3s ease'
          }}>
            <div style={{
              padding: '20px 30px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{ margin: 0, fontSize: '22px', color: '#2D2D2D' }}>Review Preview</h5>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#999',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '30px' }}>
              <div className="preview-review-card" style={{
                background: '#f8f9fa',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px'
              }}>
                <div className="preview-review-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div className="preview-reviewer-avatar" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#FF7E00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {reviewForm.firstName?.charAt(0) || ''}{reviewForm.lastName?.charAt(0) || ''}
                  </div>
                  <div className="preview-reviewer-info">
                    <h6 style={{ fontWeight: '600', color: '#2D2D2D', margin: 0 }}>
                      {reviewForm.firstName} {reviewForm.lastName}
                    </h6>
                    <div className="preview-review-rating" style={{ color: '#FFB800', fontSize: '16px', marginTop: '5px' }}>
                      {renderReviewStars(userRating)}
                    </div>
                  </div>
                </div>
                <p className="preview-review-text" style={{ color: '#666', lineHeight: '1.8', padding: '10px 0' }}>
                  "{reviewForm.comment}"
                </p>
                <div className="preview-timestamp" style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                  Preview - Will be posted immediately after submission
                </div>
              </div>
              <p className="text-center text-muted">This is how your review will appear. Click "Submit Review" to post it.</p>
            </div>
            <div style={{
              padding: '20px 30px',
              borderTop: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '12px 30px',
                  background: 'white',
                  color: '#2D2D2D',
                  border: '2px solid #2D2D2D',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleReviewSubmit({ preventDefault: () => { } });
                  setShowPreview(false);
                }}
                style={{
                  padding: '12px 30px',
                  background: '#FF7E00',
                  color: 'white',
                  border: '2px solid #FF7E00',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

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
                <p style={{ color: '#666', marginBottom: '25px' }}>
                  Your order has been placed successfully. Order ID: ORD{Date.now().toString().slice(-6)}
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
                  The payment could not be processed. Please try again.
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
                  Payment was cancelled. You can try again.
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              {paymentStatus === 'success' ? (
                <>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setPaymentStatus(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: '#FF7E00',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Continue Shopping
                  </button>
                </>
              ) : paymentStatus === 'failed' ? (
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setPaymentStatus(null);
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
    </>
  );
};

export default InnerProduct;