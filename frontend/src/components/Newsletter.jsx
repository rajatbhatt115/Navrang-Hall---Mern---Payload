import { useState } from 'react'
import { Container } from 'react-bootstrap'

const Newsletter = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Thank you for subscribing with email: ${email}`)
    setEmail('')
  }

  return (
    <section className="newsletter-section">
      <Container>
        <h2 className="newsletter-heading">Our Newsletter.</h2>
        <div className="newsletter-form-container">
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </Container>
    </section>
  )
}

export default Newsletter