import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import { FaShoppingBag, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col md={5}>
            <div className="navbar-brand text-white mb-3">
              <div className="logo-circle" style={{ backgroundColor: '#fff' }}>
                <FaShoppingBag style={{ color: '#FF7E00' }} />
              </div>
              <div>
                <strong>NAVRANG</strong><br />
                <small>HALL</small>
              </div>
            </div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </Col>
          
          <Col md={2}>
            <h5>Shop</h5>
            <ul>
              <li><Link to="/account">Account</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </Col>
          
          <Col md={2}>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </Col>
          
          <Col md={3}>
            <h5>Contact</h5>
            <p><FaMapMarkerAlt /> 123 Street Name, City, Country</p>
            <p><FaPhone /> +123 456 789</p>
            <p><FaEnvelope /> info@example.com</p>
          </Col>
        </Row>
        
        <hr style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
        <div className="text-center">
          <p style={{ marginBottom: '0rem !important' }}>&copy; 2023 Navrang Hall. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer