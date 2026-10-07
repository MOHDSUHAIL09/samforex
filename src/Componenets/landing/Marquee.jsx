import React, { useEffect, useRef } from 'react';

const Marquee = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
    script.async = true;

    // Create the custom element
    const tickerElement = document.createElement('tv-ticker-tape');
    tickerElement.setAttribute(
      'symbols',
      'FX:EURUSD,FX:USDJPY,FX:GBPUSD,FX:USDCAD,FX:USDCHF,FX:AUDUSD,FX:USDHKD,FX:USDSGD,FX:USDINR'
    );
    tickerElement.setAttribute('direction', 'horizontal');
    tickerElement.setAttribute('show-hover', 'true');
    tickerElement.setAttribute('item-size', 'normal');
    tickerElement.setAttribute('chart-type', 'area');
    tickerElement.setAttribute('transparent', 'false');  // ✅ black background
    tickerElement.setAttribute('color-theme', 'dark');    // ✅ dark theme = white text
    tickerElement.setAttribute('locale', 'en');

    tickerElement.style.width = '100%';
    tickerElement.style.display = 'block';

    // Append to container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(tickerElement);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        const scriptElement = containerRef.current.querySelector('script');
        const tickerEl = containerRef.current.querySelector('tv-ticker-tape');
        if (scriptElement) scriptElement.remove();
        if (tickerEl) tickerEl.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
       
        overflow: 'hidden',
      }}
    />
  );
};

export default Marquee;