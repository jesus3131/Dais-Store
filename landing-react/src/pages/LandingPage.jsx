import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

import Header from '../components/layout/Header.jsx';
import CartDrawer from '../components/layout/CartDrawer.jsx';
import BackToTop from '../components/layout/BackToTop.jsx';
import WhatsAppFloat from '../components/layout/WhatsAppFloat.jsx';

import Hero from '../components/sections/Hero.jsx';
import HowItWorks from '../components/sections/HowItWorks.jsx';
import Categories from '../components/sections/Categories.jsx';
import Catalog from '../components/sections/Catalog.jsx';
import Testimonials from '../components/sections/Testimonials.jsx';
import Branding from '../components/sections/Branding.jsx';
import AboutUs from '../components/sections/AboutUs.jsx';
import FAQ from '../components/sections/FAQ.jsx';
import InstagramFeed from '../components/sections/InstagramFeed.jsx';
import Newsletter from '../components/sections/Newsletter.jsx';
import PreFooter from '../components/sections/PreFooter.jsx';
import Footer from '../components/layout/Footer.jsx';
import FloatingSaleNotification from '../components/ui/FloatingSaleNotification.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';

const SECTION_MAP = {
  'hero': Hero,
  'how-it-works': HowItWorks,
  'categories': Categories,
  'catalog': Catalog,
  'testimonials': Testimonials,
  'branding': Branding,
  'about': AboutUs,
  'faq': FAQ,
  'instagram-feed': InstagramFeed,
  'newsletter': Newsletter,
  'prefooter': PreFooter,
};

function Placeholder({ title }) {
  return (
    <section className="py-20 bg-[var(--color-pastel-white)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] text-center">
        <p className="font-inter text-xs uppercase tracking-[0.15em] text-gray-400">Sección: {title}</p>
        <p className="font-inter text-sm text-gray-400 mt-2">Contenido pendiente de configuración</p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [sections, setSections] = useState([]);
  const [tokens, setTokens] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [ready, setReady] = useState(false);
  const pageRef = useScrollReveal('scroll-reveal', 0.1, [ready]);

  useEffect(() => {
    Promise.all([
      api.getPageSections().catch(() => []),
      api.getDesignTokens().catch(() => ({})),
      api.getSettings().catch(() => ({})),
    ]).then(([s, t, settings]) => {
      setSections(s);
      setTokens(t);
      setSiteSettings(settings);
      if (Object.keys(t).length > 0) {
        const root = document.documentElement;
        for (const [name, value] of Object.entries(t)) {
          const cssName = name.replace(/_/g, '-').replace(/\./g, '-');
          root.style.setProperty(`--${cssName.startsWith('color-') ? '' : 'color-'}${cssName.startsWith('color-') ? cssName : cssName}`, value);
        }
      }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
        </div>
        <CartDrawer />
        <BackToTop />
      </>
    );
  }

  const order = sections.filter(s => s.visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <Header />
      <main ref={pageRef}>
        {order.length === 0 ? (
          <>
            <div className="scroll-reveal"><Hero settings={siteSettings} /></div>
            <div className="scroll-reveal"><HowItWorks /></div>
            <div className="scroll-reveal"><Categories /></div>
            <div className="scroll-reveal"><Catalog /></div>
            <div className="scroll-reveal"><Testimonials /></div>
            <div className="scroll-reveal"><Branding /></div>
            <div className="scroll-reveal"><AboutUs settings={siteSettings} /></div>
            <div className="scroll-reveal"><FAQ /></div>
            <div className="scroll-reveal"><InstagramFeed settings={siteSettings} /></div>
            <div className="scroll-reveal"><Newsletter /></div>
            <div className="scroll-reveal"><PreFooter settings={siteSettings} /></div>
          </>
        ) : (
          order.map(section => {
            const Component = SECTION_MAP[section.type];
            if (!Component) return <div key={section.id} className="scroll-reveal"><Placeholder title={section.title} /></div>;
            const extraProps = ['prefooter', 'about', 'hero', 'instagram-feed'].includes(section.type) ? { settings: siteSettings } : {};
            return <div key={section.id} className="scroll-reveal"><Component sectionData={section.content || {}} {...extraProps} /></div>;
          })
        )}
      </main>
      <FloatingSaleNotification />
      <WhatsAppFloat settings={siteSettings} />
      <CartDrawer />
      <BackToTop />
      <Footer settings={siteSettings} />
    </>
  );
}
