import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';

const DiscoverSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getDiscoverProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching discover products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <section className="discover-section">
      <Container>
        <h2><span>Discover more.</span> <strong>Good things are waiting for you</strong></h2>
        <Row>
          {Array.isArray(products) && products.map((product, index) => (
            <Col md={3} key={product.id}>
              <Link to={`/product/${product.id}`} className="text-decoration-none">
                <div className="product-card" style={{ backgroundColor: product.bgColor, cursor: 'pointer' }}>
                  <span className="badge-new">{product.badge}</span>
                  <div 
                    className="product-image1" 
                    style={{ backgroundImage: `url(${product.image})` }}
                    loading="lazy"
                  ></div>
                  <h5 className="mt-3" style={{ color: '#2D2D2D' }}>{product.title}</h5>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default DiscoverSection;