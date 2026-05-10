import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../api'

const BlogSection = () => {
  const [blogData, setBlogData] = useState(null)
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  const fetchBlogData = async () => {
    try {
      const response = await api.getBlogHome();
      setBlogData(response.data);  // response.data use karein
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchBlogData();
}, []);

  if (loading) {
    return null
  }

  if (!blogData) {
    return null
  }

  const { mainBlog, smallBlogs } = blogData

  return (
    <section className="blog-section">
      <Container>
        <h2><span>The latest news.</span> <strong>From Our Blog</strong></h2>
        
        <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px' }}>
          {/* Left Column - Main Blog Post */}
          <Col lg={6}>
            <Link to={`/blog/${mainBlog.id}`} className="blog-post-link">
              <div className="blog-post-card">
                <div 
                  className="blog-post-image" 
                  style={{ backgroundImage: `url(${mainBlog.image})` }}
                  loading="lazy"
                ></div>
                <div className="blog-post-content">
                  <h3>{mainBlog.title}</h3>
                  <div className="blog-post-meta">
                    <div 
                      className="author-avatar" 
                      style={{ backgroundImage: `url(${mainBlog.authorImage})` }}
                      loading="lazy"
                    ></div>
                    <div className="author-info">
                      <span className="author-name">{mainBlog.author}</span>
                      <span className="post-date">{mainBlog.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Col>

          {/* Right Column - Small Blog Posts */}
          <Col lg={6} style={{ height: '100%' }}>
            {smallBlogs.map(blog => (
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
      </Container>
    </section>
  )
}

export default BlogSection