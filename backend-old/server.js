const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path');

const router = jsonServer.router(
  path.join(__dirname, 'data', 'db.json')
);
const middlewares = jsonServer.defaults()
const cors = require('cors')

server.use(cors())
server.use(middlewares)
server.use(jsonServer.bodyParser)

// ==================== CUSTOM ROUTES ====================

// 1. Home banner by page name (custom mapping)
server.get('/api/homeBanners/page/:pageName', (req, res) => {
  const { pageName } = req.params
  const db = router.db
  
  const pageMapping = {
    'home': 1,
    'about': 2,
    'shop': 3,
    'blog': 4,
    'contact': 5,
    'account': 6,
    'cart': 7,
    'wishlist': 8,
    'product': 9
  }
  
  const bannerId = pageMapping[pageName]
  if (bannerId) {
    const banner = db.get('homeBanners').find({ id: bannerId }).value()
    if (banner) {
      res.json(banner)
    } else {
      res.status(404).json({ error: 'Banner not found' })
    }
  } else {
    res.status(400).json({ error: 'Invalid page name' })
  }
})

// 2. Get about content (single item from array)
server.get('/api/aboutContent/1', (req, res) => {
  const db = router.db
  const aboutContent = db.get('aboutContent').value()
  
  if (aboutContent && aboutContent.length > 0) {
    res.json(aboutContent[0]) // First item in array
  } else {
    res.status(404).json({ error: 'About content not found' })
  }
})

// 3. Get blog home data
server.get('/api/blogHome', (req, res) => {
  const db = router.db
  const blogs = db.get('blogs').value()
  
  if (blogs && blogs.homeBlogs) {
    res.json(blogs.homeBlogs)
  } else {
    res.status(404).json({ error: 'Blog home data not found' })
  }
})

// 4. Get top rating products by category
server.get('/api/topRatingProducts/:category', (req, res) => {
  const { category } = req.params
  const db = router.db
  
  const topRatingProducts = db.get('topRatingProducts').value()
  
  if (topRatingProducts && topRatingProducts[category]) {
    res.json(topRatingProducts[category])
  } else {
    res.status(404).json({ error: `Category '${category}' not found` })
  }
})

// 5. Get blog pages
server.get('/api/blogPages', (req, res) => {
  const db = router.db
  const blogs = db.get('blogs').value()
  
  if (blogs && blogs.blogPages) {
    // Transform object to array
    const blogPagesArray = Object.keys(blogs.blogPages).map(page => ({
      page: parseInt(page),
      ...blogs.blogPages[page]
    }))
    res.json(blogPagesArray)
  } else {
    res.status(404).json({ error: 'Blog pages not found' })
  }
})

// 6. Get specific blog page
server.get('/api/blogPages/:page', (req, res) => {
  const { page } = req.params
  const db = router.db
  const blogs = db.get('blogs').value()
  
  if (blogs && blogs.blogPages && blogs.blogPages[page]) {
    res.json({
      page: parseInt(page),
      ...blogs.blogPages[page]
    })
  } else {
    res.status(404).json({ error: `Blog page ${page} not found` })
  }
})

// 7. Get inner blog (अपडेटेड वर्जन)
server.get('/api/innerBlog/:id', (req, res) => {
  const { id } = req.params
  const db = router.db
  
  // Try to find in innerBlog array
  const innerBlogs = db.get('innerBlog').value()
  
  if (innerBlogs) {
    const blog = Array.isArray(innerBlogs) 
      ? innerBlogs.find(b => b.id === parseInt(id))
      : null
    
    if (blog) {
      res.json(blog)
    } else {
      res.status(404).json({ error: 'Inner blog not found' })
    }
  } else {
    res.status(404).json({ error: 'No blogs found' })
  }
})

// 8. Add blog comment to innerBlog (डीबग वर्जन)
server.post('/api/innerBlog/:id/comments', (req, res) => {
  try {
    console.log('=== POST /api/innerBlog/:id/comments called ===');
    const { id } = req.params;
    const newComment = req.body;
    
    console.log('Blog ID:', id);
    console.log('Received comment data:', newComment);
    
    const db = router.db;
    
    // Find the blog
    const innerBlogs = db.get('innerBlog').value();
    console.log('All blogs:', innerBlogs);
    
    const blogIndex = innerBlogs.findIndex(b => b.id === parseInt(id));
    console.log('Blog index found:', blogIndex);
    
    if (blogIndex === -1) {
      console.log('Blog not found');
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    
    const blog = innerBlogs[blogIndex];
    console.log('Found blog:', blog);
    
    // Generate comment ID
    const existingComments = blog.comments || [];
    console.log('Existing comments:', existingComments);
    
    const newCommentId = existingComments.length > 0 
      ? Math.max(...existingComments.map(c => c.id)) + 1 
      : 1;
    
    console.log('New comment ID:', newCommentId);
    
    // Prepare comment object WITHOUT contact and email
    const commentToAdd = {
      id: newCommentId,
      name: newComment.name,
      date: new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      text: newComment.text,
      avatar: newComment.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
    };
    
    console.log('Comment to add:', commentToAdd);
    
    // Add comment to blog's comments array
    if (!blog.comments) {
      blog.comments = [];
    }
    blog.comments.push(commentToAdd);
    console.log('Updated blog comments:', blog.comments);
    
    // Save changes
    db.get('innerBlog').write();
    console.log('Data saved successfully');
    
    res.status(201).json(commentToAdd);
  } catch (error) {
    console.error('Error in POST /api/innerBlog/:id/comments:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Add to Wishlist endpoint
server.post('/api/wishlistItems', (req, res) => {
  const db = router.db;
  const newItem = req.body;
  
  // Generate ID if not provided
  if (!newItem.id) {
    const wishlistItems = db.get('wishlistItems').value();
    newItem.id = wishlistItems.length > 0 
      ? Math.max(...wishlistItems.map(item => item.id)) + 1 
      : 1;
  }
  
  // Add to wishlist
  db.get('wishlistItems').push(newItem).write();
  res.status(201).json(newItem);
});

// Add to Cart endpoint
server.post('/api/cartItems', (req, res) => {
  const db = router.db;
  const newItem = req.body;
  
  // Generate ID if not provided
  if (!newItem.id) {
    const cartItems = db.get('cartItems').value();
    newItem.id = cartItems.length > 0 
      ? Math.max(...cartItems.map(item => item.id)) + 1 
      : 1;
  }
  
  // Add to cart
  db.get('cartItems').push(newItem).write();
  res.status(201).json(newItem);
});

// server.js में ये changes करें:

// 8. Add product review to productDetails
server.post('/api/productReviews', (req, res) => {
  const db = router.db;
  const newReview = req.body;
  
  // Find the product
  const productDetails = db.get('productDetails').value();
  const productIndex = productDetails.findIndex(p => p.id === parseInt(newReview.productId));
  
  if (productIndex === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  const product = productDetails[productIndex];
  
  // Generate review ID
  const existingReviews = product.reviews || [];
  const newReviewId = existingReviews.length > 0 
    ? Math.max(...existingReviews.map(r => r.id)) + 1 
    : 1;
  
  // Prepare review object WITHOUT date
  const reviewToAdd = {
    id: newReviewId,
    name: newReview.name,
    rating: newReview.rating,
    text: newReview.comment, // Save comment as text
    avatar: newReview.avatar
    // NO date field
  };
  
  // Add review to product's reviews array
  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(reviewToAdd);
  
  // Update product rating
  const allReviews = product.reviews;
  const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  product.rating = parseFloat(averageRating.toFixed(1));
  
  // Save changes
  db.get('productDetails').write();
  
  res.status(201).json(reviewToAdd);
});

// 9. Get product reviews from productDetails
server.get('/api/productReviews', (req, res) => {
  const { productId } = req.query;
  const db = router.db;
  
  const productDetails = db.get('productDetails').value();
  const product = productDetails.find(p => p.id === parseInt(productId));
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  const reviews = product.reviews || [];
  res.json(reviews);
});

// 10. Users endpoints
server.get('/api/users', (req, res) => {
  const db = router.db;
  const users = db.get('users').value();
  res.json(users);
});

server.post('/api/users', (req, res) => {
  const db = router.db;
  const newUser = req.body;
  
  // Generate ID if not provided
  if (!newUser.id) {
    const users = db.get('users').value();
    newUser.id = users.length > 0 
      ? Math.max(...users.map(user => user.id)) + 1 
      : 1;
  }
  
  // Add created date if not provided
  if (!newUser.createdAt) {
    newUser.createdAt = new Date().toISOString();
  }
  
  // Add to users
  db.get('users').push(newUser).write();
  res.status(201).json(newUser);
});

// Check user credentials
server.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  
  const users = db.get('users').value();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Don't send password back
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Use the router for all other endpoints
server.use('/api', router)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
  console.log('\nAvailable custom endpoints:')
  console.log('GET /api/homeBanners/page/:pageName')
  console.log('GET /api/aboutContent/1')
  console.log('GET /api/blogHome')
  console.log('GET /api/topRatingProducts/:category')
  console.log('GET /api/blogPages')
  console.log('GET /api/blogPages/:page')
  console.log('GET /api/innerBlog/:id')
})