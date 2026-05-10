import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import api from '../api'
import { FaTrashAlt, FaShoppingCart, FaMinus, FaPlus, FaCheckCircle, FaTimesCircle, FaHeartBroken, FaHeart } from 'react-icons/fa'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlistItems()
  }, [])

  const fetchWishlistItems = async () => {
    try {
      const response = await api.getWishlistItems()
      setWishlistItems(response.data)
    } catch (error) {
      console.error('Error fetching wishlist items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id, change) => {
    const item = wishlistItems.find(item => item.id === id)
    if (!item) return
    
    const newQuantity = Math.max(1, item.quantity + change)
    
    try {
      await api.updateWishlistItem(id, { quantity: newQuantity })
      setWishlistItems(prevItems =>
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

  const calculatePrice = (item) => {
    return item.unitPrice * item.quantity
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
        await api.deleteWishlistItem(itemToDelete)
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemToDelete))
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
    closeDeleteModal()
  }

  const moveToCart = async (item) => {
    if (!item.inStock) return;
    
    try {
      // Cart में item add करें
      const cartItemData = {
        name: item.name,
        image: item.image,
        color: item.color,
        size: item.size,
        price: item.unitPrice,
        quantity: item.quantity,
        inStock: item.inStock
      };
      
      await api.addToCart(cartItemData);
      
      // Wishlist से item remove करें
      await api.deleteWishlistItem(item.id);
      
      // Local state update करें
      setWishlistItems(prevItems => prevItems.filter(i => i.id !== item.id));
      
      // Cart update event dispatch करें
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Success message
      alert(`${item.name} (Qty: ${item.quantity}) has been moved to your cart!`);
      
    } catch (error) {
      console.error('Error moving item to cart:', error);
      alert('Failed to move item to cart. Please try again.');
    }
  };

  useEffect(() => {
    const wishlistLinks = document.querySelectorAll('a[href*="wishlist"], a[href="/wishlist"]');
    
    wishlistLinks.forEach(link => {
      link.style.color = '#FF7E00';
      
      const icon = link.querySelector('i, svg, .heart-icon');
      if (icon) {
        icon.style.color = '#FF7E00';
      }
      
      const heartIcon = link.querySelector('.heart-icon');
      if (heartIcon) {
        heartIcon.style.color = '#FF7E00';
      }
    });

    return () => {
      wishlistLinks.forEach(link => {
        link.style.color = '';
        const icon = link.querySelector('i, svg, .heart-icon');
        if (icon) {
          icon.style.color = '';
        }
        
        const heartIcon = link.querySelector('.heart-icon');
        if (heartIcon) {
          heartIcon.style.color = '';
        }
      });
    };
  }, []);

  if (loading) {
    return null
  }

  return (
    <>
      <HeroSection pageName="wishlist" />

      {/* Wishlist Section */}
      <section className="wishlist-section">
        <Container>
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist show" id="emptyWishlist">
              <FaHeartBroken size={80} style={{ color: '#FF7E00', marginBottom: '20px' }} />
              <h3>Your Wishlist is Empty</h3>
              <p>Looks like you haven't added any items to your wishlist yet.</p>
              <a href="/shop" className="btn-shop-now">Start Shopping</a>
            </div>
          ) : (
            <div id="wishlistContainer">
              {wishlistItems.map(item => (
                <div className="wishlist-item d-flex" key={item.id}>
                  <div className="wishlist-image">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="wishlist-details">
                    <h5>{item.name}</h5>
                    <div className="detail-row">
                      <span className="detail-label">Color :</span>
                      <span className="detail-value">{item.color}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Size :</span>
                      <span className="detail-value">{item.size}</span>
                    </div>
                    <div className="stock-status">
                      <span className={`status-badge ${item.inStock ? 'in-stock' : 'sold-out'}`}>
                        {item.inStock ? <FaCheckCircle /> : <FaTimesCircle />}
                        {item.inStock ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                  <div className="wishlist-actions">
                    <div className="action-buttons">
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => openDeleteModal(item.id)}
                        title="Delete item"
                      >
                        <FaTrashAlt />
                      </button>
                      <button
                        className="action-btn cart-btn"
                        onClick={() => moveToCart(item)}
                        title="Move to cart"
                        disabled={!item.inStock}
                        style={!item.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                    <div className="quantity-section">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={!item.inStock}
                        style={!item.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={!item.inStock}
                        style={!item.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="price-tag" data-unit-price={item.unitPrice}>
                      ₹ {calculatePrice(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="confirmation-modal show" id="deleteConfirmationModal">
          <div className="modal-content-custom">
            <FaTrashAlt size={60} style={{ color: '#FF7E00', marginBottom: '20px' }} />
            <h4>Delete Item?</h4>
            <p>Are you sure you want to delete this item from your wishlist? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={closeDeleteModal}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Wishlist