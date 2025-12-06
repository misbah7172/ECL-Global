import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop component that scrolls to the top of the page on route change
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top whenever the location changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior, // Use instant for immediate scroll
    });
  }, [location]);

  return null;
}
