import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import api from '../api';
import { FaChevronLeft, FaChevronRight, FaBullseye, FaTrophy } from 'react-icons/fa';

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aboutData, setAboutData] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutResponse, teamResponse] = await Promise.all([
          api.getAboutData(),
          api.getTeam()
        ]);
        setAboutData(aboutResponse.data);
        setTeam(teamResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    if (aboutData?.timeline) {
      setCurrentSlide((prev) => (prev + 1) % aboutData.timeline.length);
    }
  };

  const prevSlide = () => {
    if (aboutData?.timeline) {
      setCurrentSlide((prev) => (prev - 1 + aboutData.timeline.length) % aboutData.timeline.length);
    }
  };

  if (loading) {
    return null;
  }

  if (!aboutData) {
    return null;
  }

  return (
    <>
      <HeroSection pageName="about" />

      {/* 15+ Years Experience Section */}
      <section className="experience-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="experience-image-container">
                <img src="img/img_exp.webp" alt="Experience" className="experience-image" loading="lazy" />
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="experience-content">
                <h2 className="experience-title">{aboutData.experienceTitle}</h2>
                
                {aboutData.experienceTexts.map((text, index) => (
                  <p key={index} className="experience-text">{text}</p>
                ))}

                <div className="founder-profile">
                  <img src={aboutData.founder.image} alt="Founder" loading="lazy" />
                  <div className="founder-info">
                    <h6>{aboutData.founder.name}</h6>
                    <p>{aboutData.founder.role}</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission & Awards Section */}
      <section className="mission-awards-section">
        <Container>
          <Row>
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="info-card">
                <div className="info-card-icon">
                  <FaBullseye />
                </div>
                <h4>{aboutData.mission.title}</h4>
                <p>{aboutData.mission.description}</p>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="info-card">
                <div className="info-card-icon">
                  <FaTrophy />
                </div>
                <h4>{aboutData.awards.title}</h4>
                <p>{aboutData.awards.description}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our History Section */}
      <section className="history-section">
        <Container>
          <h2 className="section-title">{aboutData.historyTitle}</h2>
          <p className="section-subtitle">{aboutData.historySubtitle}</p>
          
          <div className="timeline-container">
            <div 
              className="timeline-slider" 
              id="timelineSlider"
              style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
            >
              {aboutData.timeline.map((item, index) => (
                <div className="timeline-slide" key={item.id}>
                  <div className="timeline-year">{item.year}</div>
                  <p className="timeline-text">{item.text}</p>
                  <div className="timeline-year-display">{item.year}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="timeline-nav">
            <button className="timeline-nav-btn" id="prevBtn" onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            
            <div className="timeline-dots" id="timelineDots">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className={`timeline-dot ${Math.floor(currentSlide / 3) === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index * 3)}
                ></div>
              ))}
            </div>
            
            <button className="timeline-nav-btn" id="nextBtn" onClick={nextSlide}>
              <FaChevronRight />
            </button>
          </div>
        </Container>
      </section>

      {/* Our Team Section */}
      <section className="team-section">
        <Container>
          <h2 className="section-title">Our Team.</h2>
          
          <Row className="mt-5">
            {team.map((member, index) => (
              <Col lg={4} md={6} className="mb-4" key={member.id}>
                <div className="team-card">
                  <img src={member.image} alt={member.name} className={`team-image${index + 1}`} loading="lazy" />
                  <div className="team-info">
                    <h5>{member.name}</h5>
                    <p>{member.role}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default About;