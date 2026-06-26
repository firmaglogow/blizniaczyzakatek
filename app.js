(function () {
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 36);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    header?.classList.toggle("menu-visible", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
    mobileMenu?.setAttribute("aria-hidden", String(!open));
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!body.classList.contains("menu-open"));
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
      closeLightbox();
    }
  });

  document.querySelectorAll("[data-segment]").forEach((link) => {
    link.addEventListener("click", () => {
      const segment = link.dataset.segment;
      const select = document.getElementById("segment");
      const message = document.getElementById("message");

      if (select && segment) select.value = segment;
      if (message && segment) {
        message.value = `Dzień dobry, interesuje mnie ${segment} w inwestycji Bliźniaczy Zakątek. Proszę o kontakt.`;
      }
    });
  });

  const planData = {
    ground: {
      title: "Rzut parteru",
      src: "assets/blizniaczy/rzut-3d-transparent.webp",
      alt: "Rzut 3D parteru z garażem",
      width: 969,
      height: 972,
    },
    first: {
      title: "Rzut piętra",
      src: "assets/blizniaczy/rzut-pietro-transparent.webp",
      alt: "Rzut 3D piętra z czterema sypialniami i łazienką",
      width: 1018,
      height: 917,
    },
  };
  const planTitle = document.querySelector("[data-plan-title]");
  const planImage = document.querySelector("[data-plan-img]");
  const planViewer = document.querySelector("[data-plan-viewer]");
  const planTabs = Array.from(document.querySelectorAll("[data-plan-tab]"));
  const planLists = Array.from(document.querySelectorAll("[data-plan-list]"));

  function setPlanView(view) {
    const data = planData[view];
    if (!data) return;

    if (planTitle) planTitle.textContent = data.title;
    if (planImage) {
      planImage.src = data.src;
      planImage.alt = data.alt;
      planImage.width = data.width;
      planImage.height = data.height;
    }
    if (planViewer) planViewer.dataset.lightbox = data.src;

    planTabs.forEach((tab) => {
      const active = tab.dataset.planTab === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    planLists.forEach((list) => {
      const active = list.dataset.planList === view;
      list.classList.toggle("is-active", active);
      list.hidden = !active;
    });
  }

  planTabs.forEach((tab) => {
    tab.addEventListener("click", () => setPlanView(tab.dataset.planTab));
  });

  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px" },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const segment = String(data.get("segment") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = `Zapytanie o Bliźniaczy Zakątek - ${segment || "prezentacja"}`;
    const bodyLines = [
      "Dzień dobry,",
      "",
      message || "Interesuje mnie Bliźniaczy Zakątek. Proszę o kontakt.",
      "",
      `Imię: ${name}`,
      `Telefon: ${phone}`,
      email ? `E-mail: ${email}` : "",
      `Segment: ${segment}`,
      "",
      "Źródło: formularz na blizniaczyzakatek.pl",
    ].filter(Boolean);
    const mailto = `mailto:daria.lukasik@freehome.com.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;

    const note = form.querySelector("[data-form-note]");
    if (note) note.hidden = false;
  });

  const lightbox = document.querySelector("[data-lightbox-modal]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const prevButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  const triggers = Array.from(document.querySelectorAll("[data-lightbox]"));
  let activeIndex = 0;
  let lastFocus = null;
  let touchStartX = 0;

  function showImage(index) {
    const trigger = triggers[index];
    if (!trigger || !lightboxImage) return;

    activeIndex = index;
    lightboxImage.src = trigger.dataset.lightbox || "";
    const sourceImage = trigger.querySelector("img");
    lightboxImage.alt = sourceImage?.alt || "Zdjęcie inwestycji Bliźniaczy Zakątek";
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    showImage(index);
    body.classList.add("lightbox-open");
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    closeButton?.focus();
  }

  function closeLightbox() {
    if (!lightbox?.classList.contains("open")) return;
    body.classList.remove("lightbox-open");
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImage) lightboxImage.src = "";
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  function moveLightbox(direction) {
    if (!triggers.length) return;
    showImage((activeIndex + direction + triggers.length) % triggers.length);
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => openLightbox(index));
  });

  closeButton?.addEventListener("click", closeLightbox);
  prevButton?.addEventListener("click", () => moveLightbox(-1));
  nextButton?.addEventListener("click", () => moveLightbox(1));

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox?.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );

  lightbox?.addEventListener(
    "touchend",
    (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 54) moveLightbox(distance > 0 ? -1 : 1);
    },
    { passive: true },
  );

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
})();
