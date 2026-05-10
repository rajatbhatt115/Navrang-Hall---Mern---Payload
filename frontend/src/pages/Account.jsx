import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import HeroSection from '../components/HeroSection'
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaKey, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'

const Account = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loginAlert, setLoginAlert] = useState({ show: false, type: '', message: '' })
  const [registerAlert, setRegisterAlert] = useState({ show: false, type: '', message: '' })
  
  // नया state: current user और login status
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Navbar के account icon को orange करें
  useEffect(() => {
    const accountLinks = document.querySelectorAll('a[href*="account"], a[href="/account"]');
    
    accountLinks.forEach(link => {
      link.style.color = '#FF7E00';
      const icon = link.querySelector('i, svg');
      if (icon) {
        icon.style.color = '#FF7E00';
      }
    });
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      updateNavbarForLoggedInUser(user);
    }

    return () => {
      accountLinks.forEach(link => {
        link.style.color = '';
        const icon = link.querySelector('i, svg');
        if (icon) {
          icon.style.color = '';
        }
      });
    };
  }, []);

  // Navbar को update करने का function
  const updateNavbarForLoggedInUser = (user) => {
    const accountLinks = document.querySelectorAll('a[href*="account"], a[href="/account"]');
    accountLinks.forEach(link => {
      const icon = link.querySelector('i, svg');
      const text = link.querySelector('span');
      
      if (icon && text) {
        icon.className = '';
        icon.innerHTML = '';
        
        // Logout icon और text set करें
        const logoutIcon = document.createElement('i');
        logoutIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M160 416H96c-17.67 0-32-14.33-32-32V128c0-17.67 14.33-32 32-32h64c17.67 0 32-14.33 32-32S177.7 32 160 32H96C42.98 32 0 74.98 0 128v256c0 53.02 42.98 96 96 96h64c17.67 0 32-14.33 32-32S177.7 416 160 416zM502.6 233.4l-128-128c-12.51-12.51-32.76-12.49-45.25 0c-12.5 12.5-12.5 32.75 0 45.25L402.8 224H192C174.3 224 160 238.3 160 256s14.31 32 32 32h210.8l-73.38 73.38c-12.5 12.5-12.5 32.75 0 45.25s32.75 12.5 45.25 0l128-128C515.1 266.1 515.1 245.9 502.6 233.4z"/></svg>`;
        link.insertBefore(logoutIcon, text);
        
        text.textContent = ' Logout';
      }
    });
  };

  const updateNavbarForLoggedOutUser = () => {
    const accountLinks = document.querySelectorAll('a[href*="account"], a[href="/account"]');
    accountLinks.forEach(link => {
      const icon = link.querySelector('i, svg');
      const text = link.querySelector('span');
      
      if (icon && text) {
        icon.className = '';
        icon.innerHTML = '';
        
        // Login icon और text set करें
        const loginIcon = document.createElement('i');
        loginIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M416 32h-64c-17.67 0-32 14.33-32 32s14.33 32 32 32h64c17.67 0 32 14.33 32 32v256c0 17.67-14.33 32-32 32h-64c-17.67 0-32 14.33-32 32s14.33 32 32 32h64c53.02 0 96-42.98 96-96V128C512 74.98 469 32 416 32zM342.6 233.4l-128-128c-12.51-12.51-32.75-12.49-45.25 0c-12.5 12.5-12.5 32.75 0 45.25L242.8 224H32C14.31 224 0 238.3 0 256s14.31 32 32 32h210.8l-73.38 73.38c-12.5 12.5-12.5 32.75 0 45.25s32.75 12.5 45.25 0l128-128C355.1 266.1 355.1 245.9 342.6 233.4z"/></svg>`;
        link.insertBefore(loginIcon, text);
        
        text.textContent = ' Login';
      }
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    })
    if (loginAlert.show) setLoginAlert({ show: false, type: '', message: '' })
  }

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    })
    if (registerAlert.show) setRegisterAlert({ show: false, type: '', message: '' })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      setLoginAlert({ show: true, type: 'error', message: 'Please fill in all fields.' })
      return
    }

    try {
      // API से users fetch करें
      const response = await fetch('http://localhost:5000/api/users');
      const users = await response.json();
      
      // Check if user exists
      const user = users.find(u => 
        u.email === loginData.email && u.password === loginData.password
      );
      
      if (user) {
        // Login successful
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Navbar update करें
        updateNavbarForLoggedInUser(user);
        
        setLoginAlert({ 
          show: true, 
          type: 'success', 
          message: `Welcome back, ${user.name || user.email}! Redirecting...` 
        });
        
        // Clear form
        setLoginData({ email: '', password: '' });
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setLoginAlert({ 
          show: true, 
          type: 'error', 
          message: 'Invalid email or password. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginAlert({ 
        show: true, 
        type: 'error', 
        message: 'Server error. Please try again later.' 
      });
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    
    if (!registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterAlert({ show: true, type: 'error', message: 'Please fill in all fields.' })
      return
    }
    
    if (registerData.password.length < 6) {
      setRegisterAlert({ show: true, type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterAlert({ show: true, type: 'error', message: 'Passwords do not match.' })
      return
    }

    try {
      // Check if user already exists
      const response = await fetch('http://localhost:5000/api/users');
      const users = await response.json();
      
      const existingUser = users.find(u => u.email === registerData.email);
      
      if (existingUser) {
        setRegisterAlert({ 
          show: true, 
          type: 'error', 
          message: 'User with this email already exists.' 
        });
        return;
      }

      // Create new user object
      const newUser = {
        id: Date.now(), // Generate unique ID
        email: registerData.email,
        password: registerData.password,
        name: registerData.email.split('@')[0], // Use email username as name
        createdAt: new Date().toISOString()
      };

      // POST request to add new user
      const addUserResponse = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (addUserResponse.ok) {
        setRegisterAlert({ 
          show: true, 
          type: 'success', 
          message: 'Registration successful! You can now log in.' 
        });
        
        // Clear form
        setRegisterData({ email: '', password: '', confirmPassword: '' });
        
        setTimeout(() => {
          setRegisterAlert({ show: false, type: '', message: '' });
          // Auto switch to login form
          document.getElementById('loginForm').scrollIntoView({ behavior: 'smooth' });
        }, 3000);
      } else {
        throw new Error('Failed to register user');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterAlert({ 
        show: true, 
        type: 'error', 
        message: 'Registration failed. Please try again.' 
      });
    }
  }

  const handleForgotPassword = () => {
    setLoginAlert({ show: true, type: 'success', message: 'Password reset link has been sent to your email.' })
    setTimeout(() => {
      setLoginAlert({ show: false, type: '', message: '' })
    }, 3000)
  }

  const handleLogout = () => {
    // Clear user data
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    
    // Reset navbar
    updateNavbarForLoggedOutUser();
    
    // Show logout message
    setLoginAlert({ 
      show: true, 
      type: 'success', 
      message: 'You have been logged out successfully.' 
    });
    
    // Clear forms
    setLoginData({ email: '', password: '' });
    setRegisterData({ email: '', password: '', confirmPassword: '' });
    
    setTimeout(() => {
      setLoginAlert({ show: false, type: '', message: '' });
    }, 3000);
  }

  return (
    <>
      <HeroSection pageName="account" />

      {/* Auth Section */}
      <section style={{ 
        padding: '80px 0',
        background: '#fff',
        minHeight: 'calc(100vh - 300px)'
      }}>
        <Container>
          {isLoggedIn ? (
            // Logged In View
            <Row className="justify-content-center">
              <Col lg={6} md={8}>
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
                  border: '2px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '80px',
                    color: '#FF7E00',
                    marginBottom: '20px'
                  }}>
                    <FaUserCircle />
                  </div>
                  
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#2D2D2D',
                    marginBottom: '10px'
                  }}>
                    Welcome, {currentUser?.name || currentUser?.email}!
                  </h3>
                  
                  <p style={{
                    color: '#666',
                    marginBottom: '30px',
                    fontSize: '16px'
                  }}>
                    You are successfully logged in to your account.
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '10px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#2D2D2D' }}>Email:</span>
                      <span style={{ color: '#666' }}>{currentUser?.email}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '10px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#2D2D2D' }}>Account Created:</span>
                      <span style={{ color: '#666' }}>
                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      background: '#FF7E00',
                      color: 'white',
                      padding: '14px',
                      borderRadius: '30px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#E38B50'
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 5px 20px rgba(255, 126, 0, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#FF7E00'
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <FaSignOutAlt />
                    Log Out
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            // Login/Register View
            <Row className="align-items-stretch">
              {/* Login Card */}
              <Col lg={6} md={6} className="mb-4 mb-lg-0">
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
                  border: '2px solid #f0f0f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '3px solid #FF7E00'
                  }}>
                    <div style={{ 
                      fontSize: '40px', 
                      color: '#FF7E00',
                      marginBottom: '15px'
                    }}>
                      <FaSignInAlt />
                    </div>
                    <h3 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#2D2D2D',
                      margin: 0
                    }}>Log In.</h3>
                  </div>

                  {loginAlert.show && (
                    <div style={{
                      display: 'block',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      fontSize: '14px',
                      animation: 'slideDown 0.3s ease',
                      backgroundColor: loginAlert.type === 'success' ? '#d4edda' : '#f8d7da',
                      color: loginAlert.type === 'success' ? '#155724' : '#721c24',
                      border: loginAlert.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                    }}>
                      {loginAlert.message}
                    </div>
                  )}

                  <Form id="loginForm" onSubmit={handleLoginSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <Form.Control
                          type="email"
                          placeholder="Email Address"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          required
                          style={{
                            border: '2px solid #e9ecef',
                            padding: '12px 45px 12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px'
                          }}
                        />
                        <FaEnvelope style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#2D2D2D',
                          fontSize: '18px'
                        }} />
                      </div>

                      <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          required
                          style={{
                            border: '2px solid #e9ecef',
                            padding: '12px 45px 12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px'
                          }}
                        />
                        <FaKey style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#2D2D2D',
                          fontSize: '18px'
                        }} />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px',
                        fontSize: '14px'
                      }}>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handleForgotPassword() }}
                          style={{
                            color: '#2D2D2D',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#FF7E00'}
                          onMouseLeave={(e) => e.target.style.color = '#2D2D2D'}
                        >
                          Forgot Password?
                        </a>
                        <a 
                          href="#registerCard"
                          style={{
                            color: '#2D2D2D',
                            textDecoration: 'none',
                            fontWeight: '500',
                            transition: 'color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#FF7E00'}
                          onMouseLeave={(e) => e.target.style.color = '#2D2D2D'}
                        >
                          Register an account?
                        </a>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                      <Button 
                        type="submit" 
                        style={{
                          width: '100%',
                          background: '#FF7E00',
                          color: 'white',
                          padding: '14px',
                          borderRadius: '30px',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#E38B50'
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 5px 20px rgba(255, 126, 0, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FF7E00'
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        Log In
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>

              {/* Register Card */}
              <Col lg={6} md={6} id="registerCard">
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px',
                  boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
                  border: '2px solid #f0f0f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '3px solid #FF7E00'
                  }}>
                    <div style={{ 
                      fontSize: '40px', 
                      color: '#FF7E00',
                      marginBottom: '15px'
                    }}>
                      <FaUserPlus />
                    </div>
                    <h3 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#2D2D2D',
                      margin: 0
                    }}>Register.</h3>
                  </div>

                  {registerAlert.show && (
                    <div style={{
                      display: 'block',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      marginBottom: '20px',
                      fontSize: '14px',
                      animation: 'slideDown 0.3s ease',
                      backgroundColor: registerAlert.type === 'success' ? '#d4edda' : '#f8d7da',
                      color: registerAlert.type === 'success' ? '#155724' : '#721c24',
                      border: registerAlert.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                    }}>
                      {registerAlert.message}
                    </div>
                  )}

                  <Form id="registerForm" onSubmit={handleRegisterSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <Form.Control
                          type="email"
                          placeholder="Email Address"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          style={{
                            border: '2px solid #e9ecef',
                            padding: '12px 45px 12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px'
                          }}
                        />
                        <FaEnvelope style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#2D2D2D',
                          fontSize: '18px'
                        }} />
                      </div>

                      <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <Form.Control
                          type="password"
                          placeholder="Password (min. 6 characters)"
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                          minLength={6}
                          style={{
                            border: '2px solid #e9ecef',
                            padding: '12px 45px 12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px'
                          }}
                        />
                        <FaKey style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#2D2D2D',
                          fontSize: '18px'
                        }} />
                      </div>

                      <div style={{ marginBottom: '25px', position: 'relative' }}>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                          style={{
                            border: '2px solid #e9ecef',
                            padding: '12px 45px 12px 20px',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '16px'
                          }}
                        />
                        <FaKey style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#2D2D2D',
                          fontSize: '18px'
                        }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                      <Button 
                        type="submit" 
                        style={{
                          width: '100%',
                          background: '#FF7E00',
                          color: 'white',
                          padding: '14px',
                          borderRadius: '30px',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#E38B50'
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 5px 20px rgba(255, 126, 0, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FF7E00'
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        Register
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          )}
        </Container>
        
        <style jsx>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .auth-card {
              padding: 30px 20px;
              margin-bottom: 30px;
            }
          }
          
          @media (max-width: 576px) {
            .auth-header h3 {
              font-size: 24px;
            }
          }
        `}</style>
      </section>
    </>
  )
}

export default Account