import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import api from '../api'

const ExploringSection = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories()
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return null
  }

  return (
    <section className="exploring-section">
      <Container>
        <h2 className="text-center mb-5">Explore Categories</h2>

        <Row>
          {categories.map(category => (
            <Col md={4} key={category.id}>
              <div
                className="category-card"
                style={{ backgroundImage: `url(${category.image})` }}
                loading="lazy"
              >
                <div className="category-overlay">
                  <h4>{category.title}</h4>
                  <p>{category.description}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default ExploringSection