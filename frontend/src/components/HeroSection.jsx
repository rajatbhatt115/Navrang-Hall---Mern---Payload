// HeroSection.js - Updated with skeleton/placeholder
import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../api'

const HeroSection = ({ pageName, isShopPage }) => {
  const [bannerData, setBannerData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await api.getHomeBanner(pageName)
        const banner = response.data
        
        // Image URL fix karein
        if (banner.imageUrl) {
          if (banner.imageUrl.startsWith('img/')) {
            banner.imageUrl = '/' + banner.imageUrl
          }
          else if (!banner.imageUrl.startsWith('/') && !banner.imageUrl.startsWith('http')) {
            banner.imageUrl = '/img/' + banner.imageUrl
          }
        }
        
        setBannerData(banner)
      } catch (error) {
        console.error('Error fetching banner data:', error)
        // Fallback data
        const fallbackData = {
          title: pageName === 'home' ? 'New Collection' : 
                 pageName === 'about' ? 'About Us' :
                 pageName === 'shop' ? 'Shop' :
                 pageName === 'blog' ? 'Blog' :
                 pageName === 'contact' ? 'Contact Us' :
                 pageName === 'account' ? 'Login' :
                 pageName === 'cart' ? 'Cart' :
                 pageName === 'wishlist' ? 'Wishlist' :
                 pageName === 'product' ? 'Product Details' : pageName,
          
          subtitle: pageName === 'home' ? 'FIND WHAT BEST OPTIONS FOR YOU' : '',
          
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          
          buttonText: pageName !== 'shop' ? 'Shop Now' : '',
          buttonLink: pageName !== 'shop' ? '/shop' : '',
          
          imageUrl: '/img/img_banner_shop.webp'
        }
        setBannerData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    if (pageName) {
      fetchBannerData()
    }
  }, [pageName])

  // Loading state - SHOW SKELETON (same height as actual content)
  if (loading) {
    return (
      <section className="hero-section hero-section-skeleton">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content-col">
              <div className="hero-content">
                <div className="skeleton skeleton-text-small"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </Col>
            <Col lg={6} className="text-lg-end">
              <div className="hero-image float-lg-end">
                <div className="skeleton skeleton-image"></div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    )
  }

  if (!bannerData) {
    return null
  }

  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="hero-content-col">
            <div className="hero-content">
              <p>VISIT ALL OF OUR PRODUCTS</p>
              <h1>
                <span>{bannerData.title}</span>
              </h1>
              {bannerData.subtitle && <h5>{bannerData.subtitle}</h5>}
              <p>{bannerData.description}</p>
              {!isShopPage && bannerData.buttonText && bannerData.buttonLink && (
                <Link to={bannerData.buttonLink}>
                  <button className="btn-read-more">{bannerData.buttonText}</button>
                </Link>
              )}
            </div>
          </Col>
          <Col lg={6} className="text-lg-end">
            <div className="hero-image float-lg-end">
              <img 
                src={bannerData.imageUrl} 
                className="my-img img-fluid" 
                alt="Hero Banner" 
                onError={(e) => {
                  console.error('Image failed to load:', bannerData.imageUrl)
                  e.target.src = '/img/img_banner_shop.webp'
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default HeroSection