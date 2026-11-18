/* =========================================================
   MOMENTA — interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* -------------------------------------------------------
     Preloader
     ------------------------------------------------------- */
  const preloader = $("#preloader");
  const loadStart = performance.now();

  function hidePreloader() {
    if (!preloader || preloader.classList.contains("is-done")) return;
    preloader.classList.add("is-done");
    document.body.classList.remove("no-scroll");
  }

  document.body.classList.add("no-scroll");
  window.addEventListener("load", () => {
    const wait = Math.max(0, 850 - (performance.now() - loadStart));
    window.setTimeout(hidePreloader, wait);
  });
  // Safety net
  window.setTimeout(hidePreloader, 3200);

  /* -------------------------------------------------------
     Year
     ------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------
     Header, progress bar, back to top
     ------------------------------------------------------- */
  const header = $("#siteHeader");
  const scrollBar = $("#scrollBar");
  const toTop = $("#toTop");

  function onScrollUI() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 30);
    if (toTop) toTop.classList.toggle("is-visible", y > 650);

    if (scrollBar) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, (y / docH) * 100) : 0;
      scrollBar.style.width = pct + "%";
    }
  }

  let scrollTick = false;
  window.addEventListener("scroll", () => {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(() => {
      onScrollUI();
      updateActiveNav();
      scrollTick = false;
    });
  }, { passive: true });
  onScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* -------------------------------------------------------
     Active navigation link
     ------------------------------------------------------- */
  const navLinks = $$(".nav-link");
  const navSections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      const section = id && id.startsWith("#") ? $(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    if (!navSections.length) return;
    const marker = (window.scrollY || 0) + window.innerHeight * 0.38;
    let current = null;
    navSections.forEach((entry) => {
      const top = entry.section.offsetTop;
      const bottom = top + entry.section.offsetHeight;
      if (marker >= top && marker < bottom) current = entry;
    });
    navLinks.forEach((link) => link.classList.remove("is-active"));
    if (current) current.link.classList.add("is-active");
  }

  /* -------------------------------------------------------
     Mobile menu
     ------------------------------------------------------- */
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  let menuOpen = false;

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("no-scroll", open);
    if (open) {
      const first = mobileMenu.querySelector("a");
      if (first) window.setTimeout(() => first.focus({ preventScroll: true }), 90);
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => setMenu(!menuOpen));
    $$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenu(false);
        menuToggle.focus({ preventScroll: true });
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024 && menuOpen) setMenu(false);
    });
  }

  /* -------------------------------------------------------
     Reveal on scroll + stagger
     ------------------------------------------------------- */
  const revealEls = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const arr = groups.get(parent) || [];
      arr.push(el);
      groups.set(parent, arr);
    });
    groups.forEach((arr) => {
      arr.forEach((el, i) => {
        if (i > 0) el.style.setProperty("--delay", `${Math.min(i, 5) * 90}ms`);
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* -------------------------------------------------------
     Counters
     ------------------------------------------------------- */
  const counters = $$("[data-count]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1800;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + (p === 1 ? suffix : "");
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* -------------------------------------------------------
     Decorative cursor
     ------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.body.classList.add("has-cursor");
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    function cursorLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      window.requestAnimationFrame(cursorLoop);
    }
    window.requestAnimationFrame(cursorLoop);

    const hoverTargets = "a, button, .g-item, input, select, textarea, .service-link";
    document.addEventListener("mouseover", (e) => {
      const hit = e.target.closest(hoverTargets);
      if (ring) ring.classList.toggle("is-hover", Boolean(hit));
    });
    document.addEventListener("mousedown", () => ring && ring.classList.add("is-down"));
    document.addEventListener("mouseup", () => ring && ring.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => {
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      if (dot) dot.style.opacity = "1";
      if (ring) ring.style.opacity = "1";
    });
  }

  /* -------------------------------------------------------
     Gallery filtering
     ------------------------------------------------------- */
  const galleryGrid = $("#galleryGrid");
  const galleryItems = galleryGrid ? $$(".g-item", galleryGrid) : [];
  const filterButtons = $$(".filter");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      galleryItems.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* -------------------------------------------------------
     Lightbox
     ------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const lbImage = $("#lbImage");
  const lbCat = $("#lbCat");
  const lbTitle = $("#lbTitle");
  const lbCount = $("#lbCount");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbItems = [];
  let lbIndex = 0;
  let lastFocused = null;

  const visibleItems = () => galleryItems.filter((item) => !item.classList.contains("is-hidden"));

  function renderLightbox() {
    const item = lbItems[lbIndex];
    if (!item) return;
    const img = item.querySelector("img");
    lbImage.src = img.getAttribute("src");
    lbImage.alt = img.getAttribute("alt") || "";
    lbCat.textContent = item.querySelector(".g-cat")?.textContent || "";
    lbTitle.textContent = item.dataset.title || "";
    lbCount.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  }

  function openLightbox(item) {
    lbItems = visibleItems();
    lbIndex = Math.max(0, lbItems.indexOf(item));
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    window.setTimeout(() => {
      if (lbClose) lbClose.focus({ preventScroll: true });
    }, 90);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function stepLightbox(dir) {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    renderLightbox();
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });

  if (lightbox) {
    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", () => stepLightbox(-1));
    lbNext.addEventListener("click", () => stepLightbox(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "Tab") {
        const focusables = [lbClose, lbPrev, lbNext].filter(Boolean);
        if (!focusables.length) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && (document.activeElement === firstEl || !lightbox.contains(document.activeElement))) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && (document.activeElement === lastEl || !lightbox.contains(document.activeElement))) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }

  /* -------------------------------------------------------
     Testimonials slider
     ------------------------------------------------------- */
  const testiTrack = $("#testiTrack");
  const testiSlides = testiTrack ? $$(".testi", testiTrack) : [];
  const testiDotsWrap = $("#testiDots");
  let testiIndex = 0;
  let testiTimer = null;

  if (testiTrack && testiSlides.length > 1) {
    const dots = testiSlides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => {
        goTesti(i);
        restartTesti();
      });
      testiDotsWrap.appendChild(dot);
      return dot;
    });

    function goTesti(n) {
      testiIndex = (n + testiSlides.length) % testiSlides.length;
      testiTrack.style.transform = `translateX(-${testiIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === testiIndex);
        dot.setAttribute("aria-current", String(i === testiIndex));
      });
    }

    function restartTesti() {
      window.clearInterval(testiTimer);
      if (!reduceMotion) testiTimer = window.setInterval(() => goTesti(testiIndex + 1), 7500);
    }

    goTesti(0);
    restartTesti();

    $("#testiPrev").addEventListener("click", () => { goTesti(testiIndex - 1); restartTesti(); });
    $("#testiNext").addEventListener("click", () => { goTesti(testiIndex + 1); restartTesti(); });

    const shell = $(".testi-shell");
    if (shell) {
      shell.addEventListener("mouseenter", () => window.clearInterval(testiTimer));
      shell.addEventListener("mouseleave", restartTesti);
      shell.addEventListener("focusin", () => window.clearInterval(testiTimer));
      shell.addEventListener("focusout", restartTesti);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.clearInterval(testiTimer);
      else restartTesti();
    });

    // Touch swipe
    let touchX = null;
    testiTrack.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    testiTrack.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) {
        goTesti(testiIndex + (delta < 0 ? 1 : -1));
        restartTesti();
      }
      touchX = null;
    }, { passive: true });
  }

  /* -------------------------------------------------------
     Toast
     ------------------------------------------------------- */
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(message, duration = 4200) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), duration);
  }

  /* -------------------------------------------------------
     Contact form
     ------------------------------------------------------- */
  const form = $("#contactForm");
  const formFallback = $("#formFallback");
  const formSuccess = $("#formSuccess");
  const successText = $("#successText");
  const resetFormBtn = $("#resetForm");
  const dateInput = $("#eventDate");

  if (dateInput) {
    const today = new Date();
    const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateInput.min = iso;
  }

  if (form) {
    const fields = {
      name: $("#fullName"),
      phone: $("#phone"),
      email: $("#email"),
      event: $("#eventType"),
      date: $("#eventDate"),
      guests: $("#guests"),
      message: $("#message"),
    };

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setError(input, message) {
      const field = input.closest(".field");
      if (!field) return;
      field.classList.toggle("has-error", Boolean(message));
      const err = field.querySelector(".field-error");
      if (err) err.textContent = message || "";
    }

    function validateField(key) {
      const input = fields[key];
      if (!input) return true;
      const value = input.value.trim();
      let message = "";

      switch (key) {
        case "name":
          if (value.length < 2) message = "Please share your full name.";
          break;
        case "phone": {
          const digits = value.replace(/[^\d]/g, "");
          if (digits.length < 8 || digits.length > 15) message = "Enter a valid phone number.";
          break;
        }
        case "email":
          if (!emailRe.test(value)) message = "Enter a valid email address.";
          break;
        case "event":
          if (!value) message = "Choose a celebration type.";
          break;
        case "date": {
          if (!value) {
            message = "Choose a preferred date.";
          } else {
            const chosen = new Date(value + "T00:00:00");
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (chosen < now) message = "Choose a date from today onwards.";
          }
          break;
        }
        case "guests": {
          const n = Number(value);
          if (!value || Number.isNaN(n) || n < 10) message = "Enter at least 10 guests.";
          else if (n > 1000) message = "For 1,000+ guests, please call us directly.";
          break;
        }
        default:
          break;
      }

      setError(input, message);
      return !message;
    }

    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      if (!input) return;
      input.addEventListener("blur", () => validateField(key));
      input.addEventListener("input", () => {
        if (input.closest(".field")?.classList.contains("has-error")) validateField(key);
      });
      input.addEventListener("change", () => {
        if (input.closest(".field")?.classList.contains("has-error")) validateField(key);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;

      Object.keys(fields).forEach((key) => {
        if (key === "message") return;
        const ok = validateField(key);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = fields[key];
        }
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus({ preventScroll: false });
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      if (formFallback) formFallback.hidden = true;

      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        event: fields.event.value,
        date: fields.date.value,
        guests: fields.guests.value,
        message: fields.message.value.trim() || "—",
        _subject: `New Momenta enquiry — ${fields.event.value}`,
        _template: "table",
        _captcha: "false",
      };

      const enquiryText = [
        "New enquiry from the Momenta website",
        "",
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email}`,
        `Celebration: ${payload.event}`,
        `Preferred date: ${payload.date}`,
        `Guests: ${payload.guests}`,
        `Notes: ${payload.message}`,
      ].join("\n");

      const waBtn = $("#waSend");
      const mailBtn = $("#mailSend");
      if (waBtn) waBtn.href = `https://wa.me/201026232426?text=${encodeURIComponent(enquiryText)}`;
      if (mailBtn) {
        mailBtn.href = `mailto:omarashraff8@gmail.com?subject=${encodeURIComponent(
          `New enquiry — ${payload.event}`
        )}&body=${encodeURIComponent(enquiryText)}`;
      }

      const restoreBtn = () => {
        if (!submitBtn) return;
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      };

      const succeed = () => {
        const firstName = payload.name.split(/\s+/)[0];
        if (successText) {
          successText.textContent = `Thank you, ${firstName} — your enquiry has reached the atelier. We'll reply to ${payload.email} within 24 hours.`;
        }
        form.hidden = true;
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.focus?.({ preventScroll: true });
          formSuccess.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
        restoreBtn();
        form.reset();
        $$(".field", form).forEach((f) => f.classList.remove("has-error"));
      };

      const fail = () => {
        restoreBtn();
        if (formFallback) {
          formFallback.hidden = false;
          formFallback.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          waBtn?.focus({ preventScroll: true });
        }
      };

      /* FormSubmit rejects pages browsed straight from disk (file://), so when
         the site is opened by double-clicking index.html we skip the request
         and offer the prefilled WhatsApp / email versions instead. */
      if (window.location.protocol === "file:") {
        fail();
        return;
      }

      /* The site is static, so enquiries are delivered through FormSubmit's
         relay to omarashraff8@gmail.com. If the network or the service is
         unavailable we show the WhatsApp / email fallback instead. */
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);

      fetch("https://formsubmit.co/ajax/omarashraff8@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
          return res.json().catch(() => ({}));
        })
        .then((data) => {
          const ok = data && (data.success === "true" || data.success === true);
          if (!ok) throw new Error("FormSubmit did not confirm delivery");
          succeed();
        })
        .catch(fail)
        .finally(() => window.clearTimeout(timeout));
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener("click", () => {
        if (formSuccess) formSuccess.hidden = true;
        form.hidden = false;
        const first = $("#fullName");
        if (first) first.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      });
    }
  }

  /* -------------------------------------------------------
     Newsletter
     ------------------------------------------------------- */
  const newsletter = $("#newsletterForm");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#newsletterEmail");
      const btn = newsletter.querySelector('button[type="submit"]');
      const address = input ? input.value.trim() : "";

      if (!input || !address || !input.checkValidity()) {
        showToast("Please enter a valid email address.");
        input?.focus();
        return;
      }

      const notSent = () => {
        if (btn) btn.disabled = false;
        showToast(
          "Couldn't add you just now — email omarashraff8@gmail.com to join the list.",
          7000
        );
        input.focus();
      };

      /* The list lands in the same atelier inbox through FormSubmit, which
         only answers pages served over http(s) — see the enquiry form. */
      if (window.location.protocol === "file:") {
        notSent();
        return;
      }

      if (btn) btn.disabled = true;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      fetch("https://formsubmit.co/ajax/omarashraff8@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: address,
          _subject: "Momenta — newsletter signup",
          _template: "table",
          _captcha: "false",
        }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
          return res.json().catch(() => ({}));
        })
        .then((data) => {
          if (!(data && (data.success === "true" || data.success === true))) {
            throw new Error("FormSubmit did not confirm the signup");
          }
          showToast("You're on the list — welcome to the atelier.");
          newsletter.reset();
        })
        .catch(notSent)
        .finally(() => {
          window.clearTimeout(timeout);
          if (btn) btn.disabled = false;
        });
    });
  }

})();
