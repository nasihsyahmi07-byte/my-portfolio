/* =========================================================
   NASIH'S PORTFOLIO — JavaScript interactions
   No libraries or frameworks are used.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // 1. Automatically display the current year in the footer.
  $("#currentYear").textContent = new Date().getFullYear();

  // 2. Mobile navigation menu with accessible expanded state.
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });
  $$(".nav-link").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // 3. Dark/light theme toggle; the preference is saved in localStorage.
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("nasih-portfolio-theme");
  if (savedTheme === "light") document.body.classList.add("light-theme");
  const updateThemeButton = () => {
    const isLight = document.body.classList.contains("light-theme");
    themeToggle.textContent = isLight ? "☾" : "☼";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  };
  updateThemeButton();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    localStorage.setItem("nasih-portfolio-theme",
      document.body.classList.contains("light-theme") ? "light" : "dark");
    updateThemeButton();
  });

  // 4. Typing animation cycles through areas of interest.
  const typedText = $("#typedText");
  const words = ["networking", "programming", "technology", "problem solving"];
  let wordIndex = 0, letterIndex = 0, deleting = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    typedText.textContent = words[0];
  } else {
    const type = () => {
      const word = words[wordIndex];
      typedText.textContent = word.slice(0, letterIndex);
      let delay = deleting ? 55 : 105;
      if (!deleting && letterIndex === word.length) {
        deleting = true; delay = 1250;
      } else if (deleting && letterIndex === 0) {
        deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 350;
      }
      letterIndex += deleting ? -1 : 1;
      window.setTimeout(type, delay);
    };
    type();
  }

  // 5. Reveal sections as they enter the viewport.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("revealed"));
  }

  // 6. Highlight the navigation link for the section currently in view.
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$(".nav-link").forEach(link => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // 7. Filter project cards by category.
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card");
  const projectCount = $("#projectCount");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach(card => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount++;
      });
      projectCount.textContent = `Showing ${visibleCount} project${visibleCount === 1 ? "" : "s"}`;
    });
  });

  // 8. Project detail modal with keyboard and backdrop closing.
  const projectData = [
    {
      category: "PROGRAMMING / C++",
      title: "Student Group Finder System",
      description: "An academic system concept focused on organising students into study groups. The design explores object-oriented programming and the relationship between people, students and groups.",
      points: ["Practise class design and object-oriented concepts.", "Explore how student and group information can be represented.", "Consider limits and rules for the number of students and groups."]
    },
    {
      category: "DATABASE / SQL",
      title: "Gym Management Database",
      description: "A database design exercise for a gym environment, covering member types, trainer specialisations and fitness programme information.",
      points: ["Identify entities, attributes and relationships.", "Apply normalisation concepts including 1NF, 2NF and 3NF.", "Represent the design using an ER diagram and relational schema."]
    },
    {
      category: "RESEARCH / COMPUTER HARDWARE",
      title: "Generative AI Workstation Design",
      description: "A research assignment comparing hardware options for a two-person research lab workstation under a stated budget.",
      points: ["Compare CPU and GPU capabilities for AI workloads.", "Consider RAM, VRAM, compatibility and expansion.", "Evaluate component choices against performance and budget."]
    },
    {
      category: "NETWORKING / SYSTEM ADMINISTRATION",
      title: "Network Administration & Troubleshooting",
      description: "Practical learning about network monitoring and diagnosing connectivity using command-line tools.",
      points: ["Use netstat to inspect network connections and statistics.", "Compare tracert and pathping for route diagnosis.", "Interpret command output and explain possible network issues."]
    },
    {
      category: "RESEARCH / SUSTAINABILITY",
      title: "Green & Energy-Efficient Data Centre Management",
      description: "A group assessment examining energy use and management challenges in data centres, with a focus on sustainable digital infrastructure.",
      points: ["Discuss why data centres consume significant energy.", "Identify operational and organisational barriers to efficiency.", "Explore management approaches that support sustainability."]
    }
  ];
  const modal = $("#projectModal");
  const modalClose = $("#modalClose");
  let lastFocusedElement = null;
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedElement) lastFocusedElement.focus();
  };
  $$(".project-details").forEach(button => {
    button.addEventListener("click", () => {
      const project = projectData[Number(button.dataset.project)];
      if (!project) return;
      lastFocusedElement = button;
      $("#modalCategory").textContent = project.category;
      $("#modalTitle").textContent = project.title;
      $("#modalDescription").textContent = project.description;
      const pointsList = $("#modalPoints");
      pointsList.replaceChildren();
      project.points.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        pointsList.appendChild(li);
      });
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      modalClose.focus();
    });
  });
  modalClose.addEventListener("click", closeModal);
  $$(".modal [data-close-modal]").forEach(element => element.addEventListener("click", closeModal));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
    // Keep keyboard focus inside the open dialog.
    if (event.key === "Tab" && modal.classList.contains("open")) {
      const focusable = $$("button, a, input, textarea, [tabindex]:not([tabindex='-1'])", modal)
        .filter(element => !element.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });

  // 9. Contact form validation and mailto hand-off (front-end only).
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");
  const fields = {
    name: $("#visitorName"),
    email: $("#visitorEmail"),
    message: $("#visitorMessage")
  };
  const errors = {
    name: $("#nameError"),
    email: $("#emailError"),
    message: $("#messageError")
  };
  const setError = (field, message) => {
    errors[field].textContent = message;
    fields[field].classList.toggle("invalid", Boolean(message));
    fields[field].setAttribute("aria-invalid", String(Boolean(message)));
  };
  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener("input", () => setError(key, ""));
  });
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setError("name", name ? "" : "Please enter your name.");
    setError("email", emailIsValid ? "" : "Please enter a valid email address.");
    setError("message", message.length >= 10 ? "" : "Please enter at least 10 characters.");
    if (!name || !emailIsValid || message.length < 10) {
      formStatus.textContent = "Please correct the highlighted fields.";
      return;
    }
    // IMPORTANT: Replace this address with your own before publishing.
    const destination = "YOUR_EMAIL@example.com";
    if (destination.includes("YOUR_EMAIL")) {
      formStatus.textContent = "Form is valid. Add your real email address in script.js and index.html to enable email sending.";
      return;
    }
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`From: ${name}\nReply to: ${email}\n\n${message}`);
    formStatus.textContent = "Opening your email application...";
    window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;
  });

  // 10. Back-to-top button appears after scrolling.
  const backToTop = $("#backToTop");
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // 11. Reading progress bar and back-to-top visibility share one scroll handler.
  const progress = $("#scrollProgress");
  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    backToTop.classList.toggle("visible", window.scrollY > 450);
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();
});
