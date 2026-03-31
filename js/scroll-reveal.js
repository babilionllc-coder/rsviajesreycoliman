/* ============================================
   RS VIAJES — Scroll Reveal + Navbar Effects
   Lightweight vanilla JS, no dependencies
   ============================================ */

(function () {
  "use strict";

  // --- Glassmorphism Navbar on Scroll ---
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check
  }

  // --- Scroll Reveal with IntersectionObserver ---
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // only animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: just show everything
    revealElements.forEach((el) => el.classList.add("revealed"));
  }
})();
