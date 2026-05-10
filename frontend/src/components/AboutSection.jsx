import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';

const AboutSection = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await api.getAboutContent();
        setAboutContent(response.data);
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  if (loading) {
    return null;
  }

  if (!aboutContent) {
    return null;
  }

  return (
    <section className="about-section">
      <Container>
        <Row className="align-items-center about-mob">
          {/* LEFT IMAGE */}
          <Col lg={6}>
            <div className="position-relative">
              <img 
                src="img/img_about-Photoroom.webp" 
                alt="About Us" 
                className="img-fluid" 
                style={{ textAlign: 'center' }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </Col>

          {/* RIGHT CONTENT */}
          <Col lg={6}>
            <div className="about-box">
              <h2>About Us.</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
              <Link to="/about">
                <button className="btn-read-more">Read More</button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutSection;