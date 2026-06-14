import { useState, useRef } from 'react';

export default function LazyImage({ src, alt, className = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef(null);

  return (
    <div ref={wrapperRef} className={`blur-load ${loaded ? 'loaded' : ''} ${className}`} {...props}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover ${loaded ? 'loaded' : ''}`}
      />
    </div>
  );
}
