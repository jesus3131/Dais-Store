import Header from '../components/layout/Header.jsx';
import CartDrawer from '../components/layout/CartDrawer.jsx';
import BackToTop from '../components/layout/BackToTop.jsx';
import Hero from '../components/sections/Hero.jsx';
import Branding from '../components/sections/Branding.jsx';
import HowItWorks from '../components/sections/HowItWorks.jsx';
import Categories from '../components/sections/Categories.jsx';
import Catalog from '../components/sections/Catalog.jsx';
import AboutUs from '../components/sections/AboutUs.jsx';
import Testimonials from '../components/sections/Testimonials.jsx';
import InstagramFeed from '../components/sections/InstagramFeed.jsx';
import FAQ from '../components/sections/FAQ.jsx';
import Newsletter from '../components/sections/Newsletter.jsx';
import PreFooter from '../components/sections/PreFooter.jsx';
import Footer from '../components/layout/Footer.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';

export default function LandingPage() {
  const pageRef = useScrollReveal();

  return (
    <>
      <Header />
      <main ref={pageRef}>
        <Hero />
        <div className="scroll-reveal"><Branding /></div>
        <div className="scroll-reveal"><HowItWorks /></div>
        <div className="scroll-reveal"><Categories /></div>
        <div className="scroll-reveal"><Catalog /></div>
        <div className="scroll-reveal"><AboutUs /></div>
        <div className="scroll-reveal"><Testimonials /></div>
        <div className="scroll-reveal"><InstagramFeed /></div>
        <div className="scroll-reveal"><FAQ /></div>
        <div className="scroll-reveal"><Newsletter /></div>
        <div className="scroll-reveal"><PreFooter /></div>
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
    </>
  );
}
