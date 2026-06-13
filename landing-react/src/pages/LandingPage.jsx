import Header from '../components/layout/Header.jsx';
import CartDrawer from '../components/layout/CartDrawer.jsx';
import Hero from '../components/sections/Hero.jsx';
import AboutUs from '../components/sections/AboutUs.jsx';
import HowItWorks from '../components/sections/HowItWorks.jsx';
import Catalog from '../components/sections/Catalog.jsx';
import FAQ from '../components/sections/FAQ.jsx';
import InstagramFeed from '../components/sections/InstagramFeed.jsx';
import Testimonials from '../components/sections/Testimonials.jsx';
import PreFooter from '../components/sections/PreFooter.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutUs />
        <HowItWorks />
        <Catalog />
        <FAQ />
        <InstagramFeed />
        <Testimonials />
        <PreFooter />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
