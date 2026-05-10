import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_LOCAL ||
  import.meta.env.VITE_API_LIVE ||
  'http://localhost:3000/api';

function flattenMediaUrls(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(flattenMediaUrls);
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object' && obj[key].url && typeof obj[key].url === 'string') {
        obj[key] = obj[key].url;
      } else {
        flattenMediaUrls(obj[key]);
      }
    }
  }
}

// Recursive function to map oldId to id for frontend compatibility
function mapOldIdToId(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(mapOldIdToId);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.oldId !== undefined && obj.id === undefined) {
      obj.id = obj.oldId;
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        mapOldIdToId(obj[key]);
      }
    }
  }
}

// Add a response interceptor to handle Payload CMS data format
axios.interceptors.response.use(
  (response) => {
    // Payload CMS returns collections inside a 'docs' array for GET lists
    if (response.data && response.data.docs) {
      response.data = response.data.docs;
    }
    // Payload CMS returns created/updated docs inside 'doc' for POST/PATCH
    else if (response.data && response.data.doc) {
      response.data = response.data.doc;
    }
    
    // Map oldId to id for frontend compatibility
    mapOldIdToId(response.data);
    
    // Flatten Payload media objects back to simple string URLs for the frontend
    flattenMediaUrls(response.data);
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // ==================== COMMON ====================
  getHomeBanner: async (pageName) => {
    const pageMapping = {
      'home': 1, 'about': 2, 'shop': 3, 'blog': 4,
      'contact': 5, 'account': 6, 'cart': 7, 'wishlist': 8, 'product': 9
    };
    const oldId = pageMapping[pageName];
    if (!oldId) return { data: null };
    const res = await axios.get(`${API_BASE_URL}/homeBanners?where[oldId][equals]=${oldId}`);
    return { data: res.data[0] || null };
  },

  // ==================== HOME PAGE COMPONENTS ====================
  getDiscoverProducts: () => axios.get(`${API_BASE_URL}/discoverProducts`),
  getCategories: () => axios.get(`${API_BASE_URL}/categories`),
  getTopRatingProducts: async (category = 'kids') => {
    const res = await axios.get(`${API_BASE_URL}/globals/topRatingProducts`);
    return { data: res.data[category] || [] };
  },
  getTestimonials: () => axios.get(`${API_BASE_URL}/testimonials`),
  getBlogHome: async () => {
    const res = await axios.get(`${API_BASE_URL}/globals/blogs`);
    return { data: res.data.homeBlogs || [] };
  },
  getAboutContent: async () => {
    const res = await axios.get(`${API_BASE_URL}/aboutContent?limit=1`);
    return { data: res.data[0] || null };
  },

  // ==================== ABOUT PAGE ====================
  getAboutData: async () => {
    const res = await axios.get(`${API_BASE_URL}/aboutContent?limit=1`);
    return { data: res.data[0] || null };
  },
  getTeam: () => axios.get(`${API_BASE_URL}/team`),

  // ==================== BLOG PAGE ====================
  getBlogPages: async () => {
    const res = await axios.get(`${API_BASE_URL}/globals/blogs`);
    const blogPages = res.data.blogPages || {};
    const array = Object.keys(blogPages).map(page => ({ page: parseInt(page), ...blogPages[page] }));
    return { data: array };
  },
  getBlogPage: async (page) => {
    const res = await axios.get(`${API_BASE_URL}/globals/blogs`);
    const blogPage = res.data.blogPages ? res.data.blogPages[page] : null;
    if (!blogPage) return { data: null };
    return { data: { page: parseInt(page), ...blogPage } };
  },

  // ==================== INNER BLOG PAGE ====================
  getInnerBlog: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/innerBlog?where[oldId][equals]=${id}`);
    return { data: res.data[0] || null };
  },

  // ==================== BLOG COMMENTS ====================
  addBlogComment: async (blogId, commentData) => {
    const blogRes = await axios.get(`${API_BASE_URL}/innerBlog?where[oldId][equals]=${blogId}`);
    const blog = blogRes.data[0];
    if (!blog) throw new Error('Blog not found');
    
    const existingComments = blog.comments || [];
    const newCommentId = existingComments.length > 0 ? Math.max(...existingComments.map(c => c.id || 0)) + 1 : 1;
    
    const commentToAdd = {
      id: newCommentId,
      name: commentData.name,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      text: commentData.text,
      avatar: commentData.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
    };
    
    existingComments.push(commentToAdd);
    
    await axios.patch(`${API_BASE_URL}/innerBlog/${blog.id}`, { comments: existingComments });
    return { data: commentToAdd };
  },

  // ==================== SHOP PAGE ====================
  getProducts: () => axios.get(`${API_BASE_URL}/products?limit=100`), // Increase limit so shop page shows all
  searchProducts: (filters) => {
    const params = new URLSearchParams();
    params.append('limit', '100'); // Ensure we get results
    // Advanced filtering could be mapped to payload REST syntax here
    // But since the frontend does client-side filtering currently, we just return all
    return axios.get(`${API_BASE_URL}/products?${params.toString()}`);
  },

  // ==================== CART PAGE ====================
  getCartItems: () => axios.get(`${API_BASE_URL}/cartItems?limit=100`),
  updateCartItem: async (id, data) => {
    // Old id or Payload id? The frontend uses the object id from getCartItems
    return axios.patch(`${API_BASE_URL}/cartItems/${id}`, data);
  },
  deleteCartItem: (id) => axios.delete(`${API_BASE_URL}/cartItems/${id}`),
  addToCart: (data) => axios.post(`${API_BASE_URL}/cartItems`, data),

  // ==================== WISHLIST PAGE ====================
  getWishlistItems: () => axios.get(`${API_BASE_URL}/wishlistItems?limit=100`),
  addToWishlist: (data) => axios.post(`${API_BASE_URL}/wishlistItems`, data),
  updateWishlistItem: (id, data) => axios.patch(`${API_BASE_URL}/wishlistItems/${id}`, data),
  deleteWishlistItem: (id) => axios.delete(`${API_BASE_URL}/wishlistItems/${id}`),

  // ==================== PRODUCT DETAILS ====================
  getProductDetails: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/productDetails?where[oldId][equals]=${id}`);
    return { data: res.data[0] || null };
  },

  // ==================== REVIEWS ====================
  getProductReviews: async (productId) => {
    const res = await axios.get(`${API_BASE_URL}/productDetails?where[oldId][equals]=${productId}`);
    const product = res.data[0];
    return { data: product ? (product.reviews || []) : [] };
  },
  addProductReview: async (reviewData) => {
    const res = await axios.get(`${API_BASE_URL}/productDetails?where[oldId][equals]=${reviewData.productId}`);
    const product = res.data[0];
    if (!product) throw new Error('Product not found');
    
    const existingReviews = product.reviews || [];
    const newReviewId = existingReviews.length > 0 ? Math.max(...existingReviews.map(r => r.id || 0)) + 1 : 1;
    
    const reviewToAdd = {
      id: newReviewId,
      name: reviewData.name,
      rating: reviewData.rating,
      text: reviewData.comment,
      avatar: reviewData.avatar
    };
    
    existingReviews.push(reviewToAdd);
    const averageRating = existingReviews.reduce((sum, r) => sum + r.rating, 0) / existingReviews.length;
    
    await axios.patch(`${API_BASE_URL}/productDetails/${product.id}`, {
      reviews: existingReviews,
      rating: parseFloat(averageRating.toFixed(1))
    });
    
    return { data: reviewToAdd };
  },

  // ==================== USERS ====================
  getUsers: () => axios.get(`${API_BASE_URL}/users`),
  registerUser: (userData) => axios.post(`${API_BASE_URL}/users`, userData),
  loginUser: async (credentials) => {
    // Payload uses /api/users/login natively!
    const res = await axios.post(`${API_BASE_URL}/users/login`, credentials);
    // Payload returns { message, user, token }
    // Frontend expects { success: true, user }
    return { data: { success: true, user: res.data.user || res.data } };
  },
};

export default api;
