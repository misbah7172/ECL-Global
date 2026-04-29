// Facebook Pixel initialization and tracking
export const initializeFacebookPixel = (pixelId: string) => {
  if (!pixelId) return;

  // Facebook Pixel script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  document.head.appendChild(script);

  // Facebook Pixel code
  (window as any).fbq = function() {
    ((window as any).fbq.callMethod
      ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
      : ((window as any).fbq.queue = (window as any).fbq.queue || []).push(
          arguments
        ));
  };

  (window as any).fbq("init", pixelId);
  
  // Track page view
  trackPageView();
};

export const trackPageView = () => {
  (window as any).fbq?.("track", "PageView");
};

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  (window as any).fbq?.("track", eventName, data);
};

// Standard events
export const trackViewContent = (contentId: string, contentType: string = "product") => {
  trackEvent("ViewContent", {
    content_id: contentId,
    content_type: contentType,
  });
};

export const trackAddToCart = (contentId: string, value: number, currency: string = "USD") => {
  trackEvent("AddToCart", {
    content_id: contentId,
    value,
    currency,
  });
};

export const trackInitiateCheckout = (value: number, currency: string = "USD") => {
  trackEvent("InitiateCheckout", {
    value,
    currency,
  });
};

export const trackPurchase = (value: number, currency: string = "USD", orderId?: string) => {
  trackEvent("Purchase", {
    value,
    currency,
    transaction_id: orderId,
  });
};

export const trackLead = (userEmail?: string, userPhone?: string) => {
  trackEvent("Lead", {
    em: userEmail ? hashEmail(userEmail) : undefined,
    ph: userPhone ? hashPhone(userPhone) : undefined,
  });
};

export const trackCompleteRegistration = (userEmail?: string) => {
  trackEvent("CompleteRegistration", {
    em: userEmail ? hashEmail(userEmail) : undefined,
  });
};

export const trackContact = () => {
  trackEvent("Contact");
};

// Helper functions to hash PII data
const hashEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const hashPhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, "");
};
