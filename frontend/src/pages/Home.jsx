import { Container } from 'react-bootstrap';
import HeroSection from '../components/HeroSection';
import DiscoverSection from '../components/DiscoverSection';
import AboutSection from '../components/AboutSection';
import RatingSection from '../components/RatingSection';
import ExploringSection from '../components/ExploringSection';
import TestimonialsSection from '../components/TestimonialsSection';
import BlogSection from '../components/BlogSection';
import Newsletter from '../components/Newsletter';

const Home = () => {
  return (
    <>
      <HeroSection pageName="home" />
      <DiscoverSection />
      <AboutSection />
      <RatingSection />
      <ExploringSection />
      <TestimonialsSection />
      <BlogSection />
      <Newsletter />
    </>
  );
};

export default Home;