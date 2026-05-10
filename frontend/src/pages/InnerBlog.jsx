import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import api from '../api'
import { useParams } from 'react-router-dom'

const InnerBlog = () => {
  const { id } = useParams()
  const [blogData, setBlogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    message: ''
  })
  const [comments, setComments] = useState([])

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true)
        console.log('Fetching blog ID:', id)

        // API से blog data fetch करें
        const response = await api.getInnerBlog(id)
        console.log('API Response:', response.data)

        if (response.data) {
          setBlogData(response.data)
          setComments(response.data.comments || [])
        } else {
          console.error('No data received from API')
          setBlogData(null)
        }
      } catch (error) {
        console.error('Error fetching blog data:', error)
        setBlogData(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBlogData()
    }
  }, [id])

  const handleCommentChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    })
  }


  // InnerBlog.js में handleCommentSubmit फंक्शन को अपडेट करें:

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    try {
      console.log('Submitting comment for blog ID:', id);
      console.log('Comment form data:', commentForm);

      const newCommentData = {
        name: `${commentForm.firstName} ${commentForm.lastName}`,
        text: commentForm.message,
        // केवल name और text भेज रहे हैं
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
      }

      console.log('Data being sent to API:', newCommentData);

      // API call to save comment
      const response = await api.addBlogComment(id, newCommentData);

      console.log('API response:', response);
      console.log('Response data:', response.data);

      if (response.data) {
        // Update comments state with new comment
        setComments([response.data, ...comments]);

        alert('Your comment has been posted successfully!');

        // Reset form
        setCommentForm({
          firstName: '',
          lastName: '',
          contact: '',
          email: '',
          message: ''
        });
      } else {
        console.error('No data in response');
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to post comment. Please try again.');
    }
  };

  if (loading) {
    return null
  }

  if (!blogData) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        color: '#FF7E00',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h3>Blog Post Not Found</h3>
        <p>The blog post you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <>
      <HeroSection pageName="blog" />

      {/* Blog Content Section */}
      <section className="blog-content-section">
        <Container>
          <Row>
            <Col xs={12}>
              {/* Blog Post Image */}
              <div
                className="blog-post-image"
                style={{
                  backgroundImage: `url(${blogData.image || 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?q=80&w=2071'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '400px',
                  borderRadius: '15px',
                  marginBottom: '30px'
                }}
                loading="lazy"
              ></div>

              {/* Blog Post Content */}
              <div className="blog-post-content">
                <h3>{blogData.title}</h3>

                <p>{blogData.content}</p>

                {/* Author Info */}
                <div className="blog-post-meta">
                  <div
                    className="author-avatar"
                    style={{
                      backgroundImage: `url(${blogData.authorImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%'
                    }}
                    loading="lazy"
                  ></div>
                  <div className="author-info">
                    <div className="author-name">{blogData.author}</div>
                    <div className="post-date">{blogData.date}</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Comment Section */}
      <section className="comment-section">
        <Container>
          <Row>
            {/* Leave Comment Form */}
            <Col lg={6} className="mb-4 mb-lg-0 comment-column">
              <h3 className="section-title">Leave A Comment</h3>
              <div className="comment-form-container">
                <div className="comment-form">
                  <Form id="commentForm" onSubmit={handleCommentSubmit}>
                    <Row className="mb-3">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Control
                          type="text"
                          id="firstName"
                          placeholder="First Name"
                          name="firstName"
                          value={commentForm.firstName}
                          onChange={handleCommentChange}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          id="lastName"
                          placeholder="Last Name"
                          name="lastName"
                          value={commentForm.lastName}
                          onChange={handleCommentChange}
                          required
                        />
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Control
                          type="tel"
                          id="contact"
                          placeholder="Contact Number"
                          name="contact"
                          value={commentForm.contact}
                          onChange={handleCommentChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="email"
                          id="email"
                          placeholder="Email"
                          name="email"
                          value={commentForm.email}
                          onChange={handleCommentChange}
                          required
                        />
                      </Col>
                    </Row>
                    <div className="mb-4">
                      <Form.Control
                        as="textarea"
                        style={{ height: '230px' }}
                        id="message"
                        placeholder="Your Comment"
                        rows={4}
                        name="message"
                        value={commentForm.message}
                        onChange={handleCommentChange}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="btn-post-comment w-100"
                      style={{ backgroundColor: '#ff7e00', borderColor: '#ff7e00' }}
                    >
                      Post Comment
                    </Button>
                  </Form>
                </div>
              </div>
            </Col>

            {/* Posted Comments */}
            <Col lg={6} className="comment-column">
              <h3 className="section-title">Comments</h3>
              <div className="comments-container">
                <div className="comments-list-wrapper">
                  <div className="comments-list" id="commentsList">
                    {comments.map(comment => (
                      <div className="comment-item" key={comment.id}>
                        <div className="comment-header">
                          <div
                            className="comment-avatar"
                            style={{
                              backgroundImage: `url(${comment.avatar})`,
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              backgroundSize: 'cover'
                            }}
                            loading="lazy"
                          ></div>
                          <div className="comment-author">
                            <h5>{comment.name}</h5>
                            <span className="comment-date">{comment.date}</span>
                            {/* यहाँ contact और email नहीं दिखाएंगे */}
                          </div>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">Scroll to see more comments</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default InnerBlog