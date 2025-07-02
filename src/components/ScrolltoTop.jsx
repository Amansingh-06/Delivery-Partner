// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`scroll-${pathname}`);
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
    } else {
      window.scrollTo(0, 0); // default scroll to top
    }

    return () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
