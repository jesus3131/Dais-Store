export default function WhatsAppFloat({ settings = {} }) {
  const number = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '573000000000';
  return (
    <div className="fixed bottom-8 left-8 flex flex-col items-center z-50 group">
      <div className="absolute bottom-full left-0 mb-4 bg-white rounded-xl shadow-luxury-lg p-4 w-64 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
        <span className="font-headline text-sm font-bold text-[var(--color-near-black)] mb-1 block">Atención Directa</span>
        <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mb-2">¿Necesitas ayuda con tu pedido o asesoría?</p>
        <span className="font-inter text-xs font-bold text-[#25D366]">Hablar con un asesor</span>
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45" />
      </div>
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="bg-[#25D366] text-white rounded-full p-4 shadow-luxury-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
      >
        <span className="material-symbols-outlined text-[28px]">chat</span>
      </a>
    </div>
  );
}
