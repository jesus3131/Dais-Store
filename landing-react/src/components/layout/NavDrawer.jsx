const links = [
  { icon: 'face_5', label: 'Skincare', href: '#catalog' },
  { icon: 'brush', label: 'Cosméticos', href: '#catalog' },
  { icon: 'star', label: 'Favoritos', href: '#catalog' },
  { icon: 'auto_awesome', label: 'Novedades', href: '#new-arrivals' },
  { icon: 'chat', label: 'Contacto', href: '#footer' },
];

export default function NavDrawer() {
  const closeDrawer = () => {
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('opacity-0');
    overlay.classList.add('pointer-events-none');
  };

  const handleNav = (href) => {
    closeDrawer();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div
        id="drawer-overlay"
        className="fixed inset-0 bg-on-surface/30 backdrop-blur-md z-[60] opacity-0 pointer-events-none transition-opacity duration-500"
        onClick={closeDrawer}
      />
      <aside
        id="nav-drawer"
        className="fixed inset-y-0 left-0 z-[70] w-80 bg-surface/95 backdrop-blur-xl border-r border-white/40 rounded-r-3xl shadow-2xl -translate-x-full transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] flex flex-col"
      >
        <div className="p-10 border-b border-outline-variant/20">
          <h2 className="font-headline-md text-2xl text-primary tracking-wide">Dais Store</h2>
        </div>
        <nav className="flex-1 py-8 space-y-2">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="flex items-center gap-4 text-on-surface-variant hover:bg-surface-variant/50 rounded-2xl px-8 py-4 mx-6 transition-all magnetic-btn w-full text-left"
            >
              <span className="material-symbols-outlined font-light">{link.icon}</span>
              <span className="font-body-lg text-body-lg">{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-10 text-on-surface-variant text-sm border-t border-outline-variant/20">
          <p className="font-body-md font-light tracking-wide">&copy; {new Date().getFullYear()} Dais Store.</p>
        </div>
      </aside>
    </>
  );
}
