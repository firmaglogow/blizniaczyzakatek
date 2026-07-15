(function () {
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopMotion = window.matchMedia("(min-width: 960px)");
  const hero = document.querySelector(".hero");
  const scrollProgress = document.querySelector("[data-scroll-progress]");
  const navLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
  const trackedSections = Array.from(document.querySelectorAll("main > section"));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  if (window.location.hash) {
    const anchorTarget = document.querySelector(window.location.hash);
    const fontsReady = document.fonts?.ready || Promise.resolve();
    fontsReady.then(() => {
      window.requestAnimationFrame(() => {
        if (!anchorTarget) return;
        const headerOffset = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) + 18;
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, anchorTarget.offsetTop - headerOffset);
        window.requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });
      });
    });
  }

  function updateScrollUi() {
    header?.classList.toggle("is-scrolled", window.scrollY > 36);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;

    if (hero && desktopMotion.matches && !reduceMotion) {
      hero.style.setProperty("--hero-shift", `${Math.min(54, window.scrollY * 0.075)}px`);
    } else {
      hero?.style.setProperty("--hero-shift", "0px");
    }

    const navMarker = window.innerHeight * 0.46;
    let activeSection = trackedSections[0];
    trackedSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= navMarker) activeSection = section;
    });
    let activeHref = activeSection?.id ? `#${activeSection.id}` : "";
    if (activeSection?.classList.contains("architecture")) activeHref = "#rozklad";
    if (activeSection?.id === "lokalizacja") activeHref = "#galeria";
    if (activeSection?.classList.contains("faq-section")) activeHref = "#kontakt";
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === activeHref;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  let scrollFrame = 0;
  function scheduleScrollUi() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateScrollUi();
      scrollFrame = 0;
    });
  }

  updateScrollUi();
  window.addEventListener("scroll", scheduleScrollUi, { passive: true });
  window.addEventListener("resize", scheduleScrollUi, { passive: true });

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
  const planTitles = Array.from(document.querySelectorAll("[data-plan-title]"));
  const planImage = document.querySelector("[data-plan-img]");
  const planViewer = document.querySelector("[data-plan-viewer]");
  const planTabs = Array.from(document.querySelectorAll("[data-plan-tab]"));
  const planLists = Array.from(document.querySelectorAll("[data-plan-list]"));
  let activePlanView = "ground";
  let planChangeTimer = 0;

  function applyPlanView(view) {
    const data = planData[view];
    if (!data) return;

    activePlanView = view;
    planTitles.forEach((title) => {
      title.textContent = data.title;
    });
    if (planImage) {
      planImage.src = data.src;
      planImage.alt = data.alt;
      planImage.width = data.width;
      planImage.height = data.height;
    }
    if (planViewer) {
      planViewer.dataset.lightbox = data.src;
      planViewer.setAttribute("aria-label", `Powiększ ${data.title.toLowerCase()}`);
    }

    planTabs.forEach((tab) => {
      const active = tab.dataset.planTab === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    planLists.forEach((list) => {
      const active = list.dataset.planList === view;
      list.classList.toggle("is-active", active);
      list.hidden = !active;
    });

    window.requestAnimationFrame(() => planViewer?.classList.remove("is-switching"));
  }

  function setPlanView(view) {
    if (!planData[view] || view === activePlanView) return;
    window.clearTimeout(planChangeTimer);
    planViewer?.classList.add("is-switching");
    planChangeTimer = window.setTimeout(() => applyPlanView(view), reduceMotion ? 0 : 180);
  }

  planTabs.forEach((tab) => {
    tab.addEventListener("click", () => setPlanView(tab.dataset.planTab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const nextView = tab.dataset.planTab === "ground" ? "first" : "ground";
      setPlanView(nextView);
      Array.from(tab.parentElement.querySelectorAll("[data-plan-tab]"))
        .find((item) => item.dataset.planTab === nextView)
        ?.focus();
    });
  });

  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      if (item.classList.contains("reveal")) {
        item.style.setProperty("--reveal-delay", `${index * (window.innerWidth < 700 ? 55 : 90)}ms`);
      }
    });
  });

  document.querySelectorAll("[data-sequence]").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--sequence-delay", `${index * 55}ms`);
    });
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

  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  const numberFormatters = new Map();

  function formatCounter(counter, value) {
    const decimals = Number(counter.dataset.countDecimals || 0);
    const formatterKey = String(decimals);
    if (!numberFormatters.has(formatterKey)) {
      numberFormatters.set(
        formatterKey,
        new Intl.NumberFormat("pl-PL", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      );
    }
    return `${numberFormatters.get(formatterKey).format(value)}${counter.dataset.countSuffix || ""}`;
  }

  function animateCounter(counter) {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";
    const target = Number(counter.dataset.countValue || 0);
    const duration = 1150;
    const start = performance.now();

    function frame(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      counter.textContent = formatCounter(counter, target * eased);
      if (elapsed < 1) window.requestAnimationFrame(frame);
      else counter.textContent = formatCounter(counter, target);
    }

    window.requestAnimationFrame(frame);
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    counters.forEach((counter) => {
      counter.textContent = formatCounter(counter, Number(counter.dataset.countValue || 0));
      counter.dataset.counted = "true";
    });
  } else {
    counters.forEach((counter) => {
      counter.textContent = formatCounter(counter, 0);
    });
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.55 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const contactTargets = [document.querySelector("#kontakt"), document.querySelector(".site-footer")].filter(Boolean);
  if ("IntersectionObserver" in window && contactTargets.length) {
    const visibleContactTargets = new Set();
    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleContactTargets.add(entry.target);
        else visibleContactTargets.delete(entry.target);
      });
      body.classList.toggle("contact-in-view", visibleContactTargets.size > 0);
    });
    contactTargets.forEach((target) => contactObserver.observe(target));
  }

  const faqItems = Array.from(document.querySelectorAll(".faq-list details"));
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

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
    const mailto = `mailto:daria.lukasik@freehome.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;

    const note = form.querySelector("[data-form-note]");
    if (note) note.hidden = false;
  });

  const lightbox = document.querySelector("[data-lightbox-modal]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const prevButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  const lightboxCount = document.querySelector("[data-lightbox-count]");
  const triggers = Array.from(document.querySelectorAll("[data-lightbox]"));
  let activeIndex = 0;
  let lastFocus = null;
  let touchStartX = 0;

  function showImage(index) {
    const trigger = triggers[index];
    if (!trigger || !lightboxImage) return;

    activeIndex = index;
    lightbox?.classList.add("is-changing");
    lightboxImage.src = trigger.dataset.lightbox || "";
    const sourceImage = trigger.querySelector("img");
    lightboxImage.alt = sourceImage?.alt || "Zdjęcie inwestycji Bliźniaczy Zakątek";
    if (lightboxCount) lightboxCount.textContent = `${index + 1} / ${triggers.length}`;
  }

  lightboxImage?.addEventListener("load", () => lightbox?.classList.remove("is-changing"));

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
    lightbox.classList.remove("is-changing");
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
