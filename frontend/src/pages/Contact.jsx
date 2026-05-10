import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import { FaUser, FaEnvelope } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Message sent successfully!')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <>
      <HeroSection pageName="contact" />

      {/* Contact Information Section */}
      <section style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '80px 0'
      }}>
        <Container>
          <Row className="align-items-stretch">
            {/* Map */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <div style={{ 
                borderRadius: '15px', 
                overflow: 'hidden', 
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                height: '100%'
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d472480.84800388815!2d72.85768656768794!3d22.306132334787602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sshrilaxmi%20hall%20location!5e0!3m2!1sen!2sin!4v1764871584984!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shree Laxmi Mall Location"
                ></iframe>
              </div>
            </Col>

            {/* Contact Form */}
            <Col lg={6}>
              <div style={{ 
                background: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ 
                  color: '#333',
                  fontWeight: '700',
                  position: 'relative',
                  paddingBottom: '15px',
                  marginBottom: '30px'
                }}>
                  Drop Us A Line.
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '50px',
                    height: '3px',
                    backgroundColor: '#ff7e00'
                  }}></div>
                </h4>
                
                <Form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div className="mb-3 position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ 
                          paddingLeft: '45px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          height: '50px'
                        }}
                      />
                      <FaUser style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                    <div className="mb-3 position-relative">
                      <Form.Control
                        type="email"
                        placeholder="Your Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ 
                          paddingLeft: '45px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          height: '50px'
                        }}
                      />
                      <FaEnvelope style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                    <div className="mb-4" style={{ flex: 1 }}>
                      <Form.Control
                        as="textarea"
                        placeholder="Message"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        style={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          resize: 'none',
                          padding: '15px',
                          height: '100%',
                          minHeight: '150px'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center mt-auto">
                    <Button 
                      type="submit" 
                      style={{ 
                        backgroundColor: '#ff7e00', 
                        borderColor: '#ff7e00',
                        padding: '12px 40px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e67100'
                        e.target.style.borderColor = '#e67100'
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 5px 15px rgba(255, 126, 0, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ff7e00'
                        e.target.style.borderColor = '#ff7e00'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default Contact