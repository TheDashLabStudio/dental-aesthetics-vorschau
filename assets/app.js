/* =============================================================
   Dental Aesthetics · Shared Interactions
   Sticky Header · Mobile Menu · Reveal · FAB · FAQ · Cookie Banner
   ============================================================= */
(function () {
  "use strict";

  /* --- Sticky Header --- */
  const header = document.getElementById("siteHeader");
  if (header) {
    const startTransparent = header.classList.contains("transparent");
    const onScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add("scrolled");
        header.classList.remove("transparent");
      } else {
        header.classList.remove("scrolled");
        if (startTransparent) header.classList.add("transparent");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile Menu --- */
  const mobileToggle = document.getElementById("mobileToggle");
  const primaryNav = document.getElementById("primaryNav");
  if (mobileToggle && primaryNav) {
    mobileToggle.addEventListener("click", () => {
      const open = primaryNav.classList.toggle("open");
      mobileToggle.textContent = open ? "✕" : "☰";
      mobileToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    primaryNav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        primaryNav.classList.remove("open");
        mobileToggle.textContent = "☰";
      }
    });
  }

  /* --- Reveal on Scroll --- */
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => observer.observe(el));

  /* --- FAB --- */
  const fab = document.getElementById("fab");
  const fabMain = document.getElementById("fabMain");
  if (fab && fabMain) {
    fabMain.addEventListener("click", () => fab.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      if (!fab.contains(e.target)) fab.classList.remove("open");
    });
  }

  /* --- FAQ Accordion --- */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen);
    });
  });

  /* --- FAQ → Schema.org JSON-LD (automatisch generiert) ---
     Liest die sichtbaren FAQ-Items aus dem DOM und schreibt ein
     FAQPage-Schema in den <head>. Bleibt automatisch in sync mit
     dem Seiteninhalt — kein manuelles Pflegen nötig. */
  (function generateFAQSchema() {
    const items = document.querySelectorAll(".faq-item");
    if (items.length === 0) return;
    const mainEntity = [];
    items.forEach((item) => {
      const q = item.querySelector(".faq-question");
      const a = item.querySelector(".faq-answer");
      if (!q || !a) return;
      const qClone = q.cloneNode(true);
      const plus = qClone.querySelector(".plus");
      if (plus) plus.remove();
      const questionText = qClone.textContent.trim();
      const answerEl = a.querySelector("p") || a;
      const answerText = answerEl.textContent.trim();
      if (!questionText || !answerText) return;
      mainEntity.push({
        "@type": "Question",
        "name": questionText,
        "acceptedAnswer": { "@type": "Answer", "text": answerText }
      });
    });
    if (mainEntity.length === 0) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  })();

  /* --- Cookie Banner (DSGVO/TTDSG-konform) --- */
  const COOKIE_KEY = "da_cookie_consent_v1";
  const banner = document.getElementById("cookieBanner");
  const settingsBlock = document.getElementById("cookieSettings");
  const toggles = document.querySelectorAll(".toggle[data-cookie]");

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(COOKIE_KEY)); } catch { return null; }
  }
  function saveConsent(obj) {
    obj.timestamp = new Date().toISOString();
    obj.version = 1;
    localStorage.setItem(COOKIE_KEY, JSON.stringify(obj));
    if (banner) banner.classList.remove("show");
    // Hier ggf. Analytics/Marketing-Skripte nachladen
  }
  function showBanner() { if (banner) banner.classList.add("show"); }

  if (banner) {
    const consent = getConsent();
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    if (!consent || (consent.timestamp && (Date.now() - new Date(consent.timestamp).getTime()) > yearMs)) {
      setTimeout(showBanner, 800);
    }

    const acceptAll = document.getElementById("cookieAcceptAll");
    const acceptEss = document.getElementById("cookieAcceptEssential");
    const toggleSet = document.getElementById("cookieToggleSettings");
    const saveSel   = document.getElementById("cookieSaveSelection");
    const reopen    = document.getElementById("cookieReopen");

    acceptAll && acceptAll.addEventListener("click", () => saveConsent({ essential: true, functional: true, analytics: true, marketing: true }));
    acceptEss && acceptEss.addEventListener("click", () => saveConsent({ essential: true, functional: false, analytics: false, marketing: false }));
    toggleSet && toggleSet.addEventListener("click", () => settingsBlock && settingsBlock.classList.toggle("show"));
    saveSel   && saveSel.addEventListener("click", () => {
      const sel = { essential: true };
      toggles.forEach((t) => sel[t.dataset.cookie] = t.classList.contains("on"));
      saveConsent(sel);
    });
    toggles.forEach((t) => {
      const flip = () => {
        t.classList.toggle("on");
        t.setAttribute("aria-checked", t.classList.contains("on"));
      };
      t.addEventListener("click", flip);
      t.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } });
    });
    reopen && reopen.addEventListener("click", (e) => {
      e.preventDefault();
      const c = getConsent() || {};
      toggles.forEach((t) => {
        t.classList.toggle("on", !!c[t.dataset.cookie]);
        t.setAttribute("aria-checked", t.classList.contains("on"));
      });
      settingsBlock && settingsBlock.classList.add("show");
      showBanner();
    });
  }
})();
