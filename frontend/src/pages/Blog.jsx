import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import api from '../api'

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [blogPages, setBlogPages] = useState([])
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  const fetchBlogPages = async () => {
    try {
      const response = await api.getBlogPages();
      setBlogPages(response.data);  // response.data use karein
    } catch (error) {
      console.error('Error fetching blog pages:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchBlogPages();
}, []);

  const currentBlogData = blogPages.find(page => page.page === currentPage)

  if (loading) {
    return null
  }

  if (!currentBlogData) {
    return <div>Blog not found</div>
  }

  return (
    <>
      <HeroSection pageName="blog" />

      {/* Blog Content Section */}
      <section className="blog-content-section">
        <Container>
          {/* Current Page Content */}
          <div className="blog-page">
            <Row>
              {/* Left Column - Main Blog Posts */}
              <Col lg={6} className="mb-4">
                {currentBlogData.mainBlogs.map(blog => (
                  <Link to={`/blog/${blog.id}`} className="blog-post-link" key={blog.id}>
                    <div className="blog-post-card">
                      <div 
                        className="blog-post-image" 
                        style={{ backgroundImage: `url(${blog.image})` }}
                        loading="lazy"
                      ></div>
                      <div className="blog-post-content">
                        <h3>{blog.title}</h3>
                        <div className="blog-post-meta">
                          <div 
                            className="author-avatar" 
                            style={{ backgroundImage: `url(${blog.authorImage})` }}
                            loading="lazy"
                          ></div>
                          <div className="author-info">
                            <span className="author-name">{blog.author}</span>
                            <span className="post-date">{blog.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </Col>

              {/* Right Column - Small Blog Posts */}
              <Col lg={6} style={{ height: '100%' }}>
                {currentBlogData.smallBlogs.map(blog => (
                  <Link to={`/blog/${blog.id}`} className="small-blog-link" key={blog.id}>
                    <div className="small-blog-card">
                      <div 
                        className="small-blog-image" 
                        style={{ backgroundImage: `url(${blog.image})` }}
                        loading="lazy"
                      ></div>
                      <div className="small-blog-content">
                        <h4>{blog.title}</h4>
                        <p>{blog.excerpt}</p>
                        <div className="blog-post-meta">
                          <div 
                            className="author-avatar" 
                            style={{ backgroundImage: `url(${blog.authorImage})` }}
                            loading="lazy"
                          ></div>
                          <div className="author-info">
                            <span className="author-name">{blog.author}</span>
                            <span className="post-date">{blog.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </Col>
            </Row>
          </div>

          {/* Pagination Section */}
          <div className="blog-pagination">
            {blogPages.map(page => (
              <div
                key={page.page}
                className={`page-number ${currentPage === page.page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page.page)}
              >
                {page.page}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

export default Blog