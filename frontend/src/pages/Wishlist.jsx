import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import api from '../api'
import { FaTrashAlt, FaShoppingCart, FaMinus, FaPlus, FaCheckCircle, FaTimesCircle, FaHeartBroken, FaRegObjectUngroup } from 'react-icons/fa'
import { HiShoppingCart, HiOutlineShoppingCart } from 'react-icons/hi'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [cartItems, setCartItems] = useState([]) // Track cart items for toggle state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [wishlistRes, cartRes] = await Promise.all([
        api.getWishlistItems(),
        api.getCartItems()
      ])
      setWishlistItems(wishlistRes.data)
      setCartItems(cartRes.data)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if item is already in cart
  const isInCart = (wishlistItem) => {
    return cartItems.some(cartItem => 
      cartItem.name === wishlistItem.name && 
      cartItem.size === wishlistItem.size && 
      cartItem.color === wishlistItem.color
    )
  }

  const toggleCart = async (item) => {
    if (!item.inStock) return;
    
    try {
      const existingCartItem = cartItems.find(cartItem => 
        cartItem.name === item.name && 
        cartItem.size === item.size && 
        cartItem.color === item.color
      );

      if (existingCartItem) {
        // REMOVE FROM CART
        const targetId = existingCartItem._payloadId || existingCartItem.id;
        await api.deleteCartItem(targetId);
        
        // Update local cart state
        setCartItems(prev => prev.filter(i => (i._payloadId || i.id) !== targetId));
        alert(`${item.name} has been removed from your cart.`);
      } else {
        // ADD TO CART
        const cartItemData = {
          name: item.name,
          image: item.image,
          image_id: item.image_id,
          color: item.color,
          size: item.size,
          price: item.unitPrice,
          quantity: item.quantity,
          inStock: item.inStock
        };
        
        const response = await api.addToCart(cartItemData);
        
        // Update local cart state
        setCartItems(prev => [...prev, response.data]);
        alert(`${item.name} has been added to your cart!`);
      }
      
      // Dispatch update event for header/other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (error) {
      console.error('Error toggling cart item:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const updateQuantity = async (id, change) => {
    const item = wishlistItems.find(item => item.id === id)
    if (!item) return
    
    const newQuantity = Math.max(1, item.quantity + change)
    
    try {
      await api.updateWishlistItem(item._payloadId || id, { quantity: newQuantity })
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
    return (item.unitPrice || 0) * (item.quantity || 1)
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
      const item = wishlistItems.find(i => i.id === itemToDelete)
      try {
        await api.deleteWishlistItem(item?._payloadId || itemToDelete)
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemToDelete))
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
    closeDeleteModal()
  }

  useEffect(() => {
    const wishlistLinks = document.querySelectorAll('a[href*="wishlist"], a[href="/wishlist"]');
    
    wishlistLinks.forEach(link => {
      link.style.color = '#FF7E00';
      
      const icon = link.querySelector('i, svg, .heart-icon');
      if (icon) {
        icon.style.color = '#FF7E00';
      }
    });

    return () => {
      wishlistLinks.forEach(link => {
        link.style.color = '';
        const icon = link.querySelector('i, svg, .heart-icon');
        if (icon) {
          icon.style.color = '';
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

      <section className="wishlist-section">
        <Container>
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist show">
              <FaHeartBroken size={80} style={{ color: '#FF7E00', marginBottom: '20px' }} />
              <h3>Your Wishlist is Empty</h3>
              <p>Looks like you haven't added any items to your wishlist yet.</p>
              <a href="/shop" className="btn-shop-now">Start Shopping</a>
            </div>
          ) : (
            <div>
              {wishlistItems.map(item => {
                const itemInCart = isInCart(item);
                return (
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
                          className={`action-btn cart-btn ${itemInCart ? 'active' : ''}`}
                          onClick={() => toggleCart(item)}
                          title={itemInCart ? "Remove from cart" : "Add to cart"}
                          disabled={!item.inStock}
                          style={{
                            ...(!item.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                            backgroundColor: itemInCart ? '#FF7E00' : 'transparent',
                            color: itemInCart ? 'white' : '#FF7E00',
                            border: '1px solid #FF7E00'
                          }}
                        >
                          {itemInCart ? <HiShoppingCart size={20} /> : <HiOutlineShoppingCart size={20} />}
                        </button>
                      </div>
                      <div className="quantity-section">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={!item.inStock}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={!item.inStock}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <div className="price-tag">
                        ₹ {calculatePrice(item)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {showDeleteModal && (
        <div className="confirmation-modal show">
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