/**
 * RICHLAND PROPERTY PARTNERS — main.js
 *
 * This file powers all interactive behavior on the site:
 *
 *  1. NAV SHRINK ON SCROLL
 *     Adds a CSS class to the header when the user scrolls
 *     down, triggering a background blur + height reduction.
 *
 *  2. SMOOTH SCROLL
 *     Intercepts clicks on anchor links (href="#...") and
 *     scrolls the target section into view smoothly,
 *     accounting for the fixed navigation bar's height.
 *
 *  3. MOBILE HAMBURGER MENU
 *     Toggles the mobile menu open/closed when the
 *     hamburger button is clicked. Also closes the menu
 *     when any nav link inside it is clicked.
 *
 *  4. SCROLL REVEAL ANIMATIONS
 *     Uses IntersectionObserver to watch elements with the
 *     class "reveal". When they enter the viewport, the
 *     class "visible" is added — which triggers the CSS
 *     fade-up transition defined in styles.css.
 *
 *  5. CONTACT FORM HANDLER
 *     Adds basic front-end validation and a submission
 *     handler. (No back-end yet — shows a success message.)
 */

'use strict';

/* ================================================================
   Utility: wait for the DOM to be fully parsed before running.
   This is equivalent to jQuery's $(document).ready().
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Grab key DOM elements once and reuse them ──────────────────
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const contactForm = document.getElementById('contact-form');


  /* ==============================================================
     1. NAV SHRINK ON SCROLL
        When the page is scrolled more than 50px, add the
        "scrolled" class to the nav header. The CSS handles
        the visual change (see .nav-header.scrolled in styles.css).
     ============================================================== */
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run once on load in case the page is already scrolled (e.g. browser back button)
  handleNavScroll();

  // Listen for scroll events — throttled slightly for performance
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleNavScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });


  /* ==============================================================
     2. SMOOTH SCROLL
        We intercept all anchor link clicks site-wide.
        CSS `scroll-behavior: smooth` (set in styles.css) handles
        most cases, but this JS version gives us precise control
        over the scroll offset — important because our nav is fixed
        and would otherwise overlap the section heading.
     ============================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');

      // Ignore if href is just "#" (no target)
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      // Prevent the default browser jump-scroll
      event.preventDefault();

      // Calculate how tall the current nav bar is (it shrinks on scroll)
      const navHeight = navbar.offsetHeight;

      // Get the element's distance from the top of the page
      const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;

      // Scroll so the section appears just below the nav bar (+ a little breathing room)
      window.scrollTo({
        top: elementTop - navHeight - 12,
        behavior: 'smooth',
      });

      // If mobile menu is open, close it after clicking a link
      closeMobileMenu();
    });
  });


  /* ==============================================================
     3. MOBILE HAMBURGER MENU
        Clicking the hamburger button toggles the mobile menu
        open or closed by adding/removing the "open" class.

        The menu is hidden by default via `max-height: 0` in CSS.
        Adding "open" sets `max-height: 400px` — the transition
        creates the smooth slide-down effect.
     ============================================================== */
  function openMobileMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    // Prevent body scrolling while the menu is open
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close the mobile menu when the user presses Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Close menu if user clicks outside of it
  document.addEventListener('click', (event) => {
    const clickedInsideNav = navbar.contains(event.target);
    if (!clickedInsideNav && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });


  /* ==============================================================
     4. SCROLL REVEAL ANIMATIONS (IntersectionObserver)

        IntersectionObserver fires a callback whenever a watched
        element enters or leaves the viewport. We use it to add
        the "visible" class to elements that have "reveal" —
        this triggers the CSS fade-up transition.

        Why not just use CSS animations?
        CSS animations run on page load. Using JS + Observer means
        elements animate only when the user scrolls to them,
        giving a polished, progressive reveal effect.
     ============================================================== */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is visible — add class to start animation
          entry.target.classList.add('visible');

          // Once revealed, stop observing (no need to re-animate)
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      // "rootMargin" offsets the trigger zone.
      // "-80px" means the element must be 80px inside the viewport before triggering.
      // This prevents animations firing too early at the very edge.
      rootMargin: '-80px 0px -40px 0px',
      threshold: 0.1,   // 10% of the element must be visible to trigger
    }
  );

  // Observe every element that has the "reveal" class
  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });


  /* ==============================================================
     5. CONTACT FORM HANDLER
        Front-end validation and a friendly success message.
        To wire up a real back-end, replace the success block
        with a fetch() call to your API or form service endpoint.
     ============================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();  // Don't let the browser do a full-page reload

      // Collect form data
      const data = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName:  document.getElementById('last-name').value.trim(),
        email:     document.getElementById('email').value.trim(),
        phone:     document.getElementById('phone').value.trim(),
        interest:  document.getElementById('interest').value,
        message:   document.getElementById('message').value.trim(),
      };

      // --- Basic validation ---
      if (!data.firstName || !data.lastName) {
        showFormError('Please enter your full name.');
        return;
      }
      if (!isValidEmail(data.email)) {
        showFormError('Please enter a valid email address.');
        return;
      }
      if (!data.interest) {
        showFormError('Please select an area of interest.');
        return;
      }
      if (!data.message) {
        showFormError('Please include a message.');
        return;
      }

      // --- Simulate successful submission ---
      // TODO: Replace this block with a real fetch() to your form endpoint, e.g.:
      //
      //   fetch('/api/contact', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(data),
      //   }).then(res => res.ok ? showFormSuccess() : showFormError('Server error.'));
      //
      showFormSuccess(data.firstName);
    });
  }

  /**
   * Checks whether an email string looks valid.
   * This is a simple check — not RFC 5321 compliant, but good enough for UX.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Displays an error message above the submit button.
   * Removes any existing error/success message first.
   * @param {string} message
   */
  function showFormError(message) {
    removeFormFeedback();

    const errorEl = document.createElement('p');
    errorEl.className = 'form-feedback form-feedback--error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      color: #f87171;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(248,113,113,0.1);
      border: 1px solid rgba(248,113,113,0.3);
      border-radius: 6px;
    `;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.insertBefore(errorEl, submitBtn);

    // Auto-remove after 5 seconds
    setTimeout(removeFormFeedback, 5000);
  }

  /**
   * Replaces the form with a success message after submission.
   * @param {string} firstName
   */
  function showFormSuccess(firstName) {
    const wrapper = contactForm.closest('.contact-form-wrapper');

    wrapper.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 2rem;
        gap: 1rem;
        min-height: 300px;
      ">
        <div style="
          width: 64px;
          height: 64px;
          background: rgba(201,169,110,0.15);
          border: 2px solid #C9A96E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #C9A96E;
          margin-bottom: 0.5rem;
        ">&#10003;</div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fff; font-weight: 700;">
          Message Sent!
        </h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.9375rem; max-width: 320px; line-height: 1.6;">
          Thank you, ${escapeHtml(firstName)}. We'll be in touch shortly.
        </p>
      </div>
    `;
  }

  /** Removes any existing feedback element from the form */
  function removeFormFeedback() {
    const existing = contactForm && contactForm.querySelector('.form-feedback');
    if (existing) existing.remove();
  }

  /**
   * Escapes HTML special characters to prevent XSS.
   * Always escape user-supplied strings before inserting into HTML.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});  // end DOMContentLoaded
