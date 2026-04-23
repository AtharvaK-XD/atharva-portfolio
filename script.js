const root = document.documentElement;
const modeToggle = document.getElementById("modeToggle");
const revealItems = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");
const projectCards = document.querySelectorAll(".project-card");
const sections = document.querySelectorAll(".section");
const bgGradient = document.querySelector(".bg-gradient");
const bgGrid = document.querySelector(".bg-grid");
const bgNoise = document.querySelector(".bg-noise");
const matrixCanvas = document.getElementById("matrixRain");
const MODE_KEY = "atharva-portfolio-mode";
let matrixCtx = null;
let matrixColumns = [];
let matrixAnimationId = null;
let matrixBoostTimeoutId = null;
let cursorTargetX = window.innerWidth * 0.5;
let cursorTargetY = window.innerHeight * 0.2;
let cursorCurrentX = cursorTargetX;
let cursorCurrentY = cursorTargetY;
let cursorAnimFrameId = null;
let isNavigating = false;
let navTargetSection = null;

function applyMode(mode) {
  root.setAttribute("data-mode", mode);
}

function toggleMode() {
  const current = root.getAttribute("data-mode") || "normal";
  const next = current === "normal" ? "hacker" : "normal";
  runSwitchGlitch();
  applyMode(next);
  localStorage.setItem(MODE_KEY, next);
  runModeFlash();
  runMatrixBoost(next);
}

function initMode() {
  const saved = localStorage.getItem(MODE_KEY);
  if (saved === "normal" || saved === "hacker") {
    applyMode(saved);
  } else {
    applyMode("normal");
  }
}

function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((el) => observer.observe(el));
}

function setupInteractiveSkillHover() {
  const chips = document.querySelectorAll(".skill-chip");
  chips.forEach((chip) => {
    chip.addEventListener("mousemove", (event) => {
      const rect = chip.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      chip.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(79,242,255,0.18), transparent 55%), var(--surface)`;
    });

    chip.addEventListener("mouseleave", () => {
      chip.style.background = "var(--surface)";
    });
  });
}

function setupProjectTilt() {
  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) * 2 - 1) * 4;
      const rotateX = -(((y / rect.height) * 2 - 1) * 4);
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function runModeFlash() {
  if (root.getAttribute("data-mode") !== "hacker") {
    return;
  }
  document.body.classList.add("mode-flash");
  window.setTimeout(() => {
    document.body.classList.remove("mode-flash");
  }, 280);
}

function runSwitchGlitch() {
  document.body.classList.add("switch-glitch");
  window.setTimeout(() => {
    document.body.classList.remove("switch-glitch");
  }, 760);
}

function setupMatrixCanvas() {
  if (!matrixCanvas) {
    return;
  }
  matrixCtx = matrixCanvas.getContext("2d");
  resizeMatrixCanvas();
  window.addEventListener("resize", resizeMatrixCanvas);
  startMatrixRain();
}

function resizeMatrixCanvas() {
  if (!matrixCanvas || !matrixCtx) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  matrixCanvas.width = Math.floor(width * dpr);
  matrixCanvas.height = Math.floor(height * dpr);
  matrixCanvas.style.width = `${width}px`;
  matrixCanvas.style.height = `${height}px`;
  matrixCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const fontSize = 16;
  const columnCount = Math.ceil(width / fontSize);
  matrixColumns = Array.from({ length: columnCount }, () => Math.random() * -height);
}

function drawMatrixFrame() {
  if (!matrixCtx || !matrixCanvas) {
    return;
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const fontSize = 16;
  const chars = "01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*@";

  matrixCtx.fillStyle = "rgba(1, 7, 4, 0.16)";
  matrixCtx.fillRect(0, 0, width, height);
  matrixCtx.font = `${fontSize}px JetBrains Mono, monospace`;

  for (let i = 0; i < matrixColumns.length; i += 1) {
    const x = i * fontSize;
    const y = matrixColumns[i];
    const char = chars[Math.floor(Math.random() * chars.length)];
    matrixCtx.fillStyle = i % 5 === 0 ? "rgba(110,255,180,0.95)" : "rgba(24,255,140,0.72)";
    matrixCtx.fillText(char, x, y);
    matrixColumns[i] += fontSize;

    if (matrixColumns[i] > height + Math.random() * 260) {
      matrixColumns[i] = Math.random() * -240;
    }
  }

  matrixAnimationId = window.requestAnimationFrame(drawMatrixFrame);
}

function startMatrixRain() {
  if (!matrixCanvas || !matrixCtx) {
    return;
  }
  if (matrixAnimationId) {
    return;
  }
  resizeMatrixCanvas();
  drawMatrixFrame();
}

function runMatrixBoost(nextMode) {
  if (nextMode !== "hacker") {
    document.body.classList.remove("matrix-boost");
    if (matrixBoostTimeoutId) {
      window.clearTimeout(matrixBoostTimeoutId);
    }
    return;
  }

  document.body.classList.add("matrix-boost");
  if (matrixBoostTimeoutId) {
    window.clearTimeout(matrixBoostTimeoutId);
  }
  const duration = 2000;
  matrixBoostTimeoutId = window.setTimeout(() => {
    document.body.classList.remove("matrix-boost");
  }, duration);
}

function setupCursorSpotlight() {
  const updateCursorTarget = (x, y) => {
    cursorTargetX = x;
    cursorTargetY = y;
    if (!cursorAnimFrameId) {
      cursorAnimFrameId = window.requestAnimationFrame(animateCursorSpotlight);
    }
  };

  window.addEventListener("mousemove", (event) => {
    updateCursorTarget(event.clientX, event.clientY);
  });

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        updateCursorTarget(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );
}

function animateCursorSpotlight() {
  const smoothing = 0.14;
  cursorCurrentX += (cursorTargetX - cursorCurrentX) * smoothing;
  cursorCurrentY += (cursorTargetY - cursorCurrentY) * smoothing;

  const xPercent = (cursorCurrentX / window.innerWidth) * 100;
  const yPercent = (cursorCurrentY / window.innerHeight) * 100;
  root.style.setProperty("--cursor-x", `${xPercent}%`);
  root.style.setProperty("--cursor-y", `${yPercent}%`);

  const dx = Math.abs(cursorTargetX - cursorCurrentX);
  const dy = Math.abs(cursorTargetY - cursorCurrentY);
  if (dx < 0.2 && dy < 0.2) {
    cursorAnimFrameId = null;
    return;
  }
  cursorAnimFrameId = window.requestAnimationFrame(animateCursorSpotlight);
}

function setupScroll3DAnimation() {
  sections.forEach((section) => section.classList.add("scroll-3d"));
  let ticking = false;

  function updateOnScroll() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    root.style.setProperty("--scroll-progress", `${Math.min(100, Math.max(0, progress))}%`);

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - centerY) / window.innerHeight;
      const shift = Math.max(-14, Math.min(14, offset * 24));
      const tilt = Math.max(-2.2, Math.min(2.2, offset * 3.6));
      section.style.setProperty("--scroll-shift", `${shift}px`);
      section.style.setProperty("--scroll-tilt", `${tilt}deg`);
    });

    if (window.innerWidth > 700) {
      if (isNavigating && navTargetSection) {
        sections.forEach((section) => {
          let isFocused = section === navTargetSection;
          // Unblur both skill blocks together
          if (navTargetSection.id === "skills" || navTargetSection.id === "soft-skills") {
            if (section.id === "skills" || section.id === "soft-skills") {
              isFocused = true;
            }
          }
          section.classList.toggle("is-focused", isFocused);
          section.classList.toggle("is-defocused", !isFocused);
        });
        ticking = false;
        return;
      }

      let focusedSection = null;
      let minDistance = Number.POSITIVE_INFINITY;
      const readLine = window.innerHeight * 0.35; // optimal read line slightly above center

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const relativeCenter = rect.top + (rect.height * 0.4);
        
        let distance = Math.abs(readLine - relativeCenter);

        // bias for the very last section if we hit the bottom
        if (section === sections[sections.length - 1]) {
           const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20;
           if (isAtBottom) distance -= window.innerHeight; // guarantee focus at bottom
        }

        if (distance < minDistance) {
          minDistance = distance;
          focusedSection = section;
        }
      });

      sections.forEach((section) => {
        let isFocused = section === focusedSection;
        // Unblur both skill blocks together
        if (focusedSection && (focusedSection.id === "skills" || focusedSection.id === "soft-skills")) {
          if (section.id === "skills" || section.id === "soft-skills") {
            isFocused = true;
          }
        }
        section.classList.toggle("is-focused", isFocused);
        section.classList.toggle("is-defocused", !isFocused);
      });
    } else {
      sections.forEach((section) => {
        section.classList.remove("is-focused", "is-defocused");
      });
    }

    if (bgGradient) {
      bgGradient.style.transform = `translateY(${scrollTop * -0.03}px)`;
    }
    if (bgGrid) {
      bgGrid.style.transform = `translateY(${scrollTop * -0.018}px)`;
    }
    if (bgNoise) {
      bgNoise.style.transform = `translateY(${scrollTop * -0.012}px)`;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateOnScroll();
}

modeToggle.addEventListener("click", toggleMode);
yearEl.textContent = new Date().getFullYear();

initMode();
setupMatrixCanvas();
setupCursorSpotlight();
setupScrollReveal();
setupInteractiveSkillHover();
setupProjectTilt();
setupScroll3DAnimation();

document.querySelectorAll('.nav a, .cta-row a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetEl = document.querySelector(href);
      if (targetEl && targetEl.classList.contains('section')) {
        isNavigating = true;
        navTargetSection = targetEl;
        
        // Revert to scroll-based focus after smooth scroll roughly completes
        setTimeout(() => {
          isNavigating = false;
          navTargetSection = null;
          updateOnScroll();
        }, 1000);
      }
    }
  });
});
