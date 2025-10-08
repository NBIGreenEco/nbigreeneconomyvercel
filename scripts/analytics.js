// Google Analytics 4 (GA4) Tracking Code
(function() {
  // Only load in production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return; // Skip on localhost
  }

  // Create and append the gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-37VRZ5CGE4';
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', 'G-37VRZ5CGE4');
  
  // Track page views for single page applications
  window.addEventListener('popstate', function() {
    gtag('config', 'G-37VRZ5CGE4', {
      'page_path': window.location.pathname + window.location.search + window.location.hash
    });
  });
})();
