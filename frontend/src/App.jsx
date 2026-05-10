import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

// Lazy load all page components with delay
const Home = lazy(() => Promise.all([
  import('./pages/Home'),
  new Promise(resolve => setTimeout(resolve, 100)) // Minimal delay
]).then(([module]) => module));

const About = lazy(() => import('./pages/About'))
const Shop = lazy(() => import('./pages/Shop'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const Account = lazy(() => import('./pages/Account'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const InnerProduct = lazy(() => import('./pages/InnerProduct'))
const InnerBlog = lazy(() => import('./pages/InnerBlog'))

function App() {
  return (
    <Router>
      <ScrollToTop>
        <div className="app-container">
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>
            {/* Empty fallback - shows nothing */}
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/product/:id" element={<InnerProduct />} />
                <Route path="/blog/:id" element={<InnerBlog />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ScrollToTop>
    </Router>
  )
}

export default App