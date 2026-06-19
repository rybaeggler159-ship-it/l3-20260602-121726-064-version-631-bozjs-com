import { H as Hls } from "./hls-vendor-dru42stk.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !mobileNav) {
    return;
  }

  toggle.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  function activate(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => activate(dotIndex));
  });

  if (slides.length > 1) {
    window.setInterval(() => activate(current + 1), 5200);
  }
}

function setupPlayers() {
  const players = document.querySelectorAll("[data-player]");

  players.forEach((player) => {
    const video = player.querySelector("video[data-src]");
    const button = player.querySelector("[data-play-button]");
    let initialized = false;

    if (!video || !button) {
      return;
    }

    function initializePlayer() {
      if (initialized) {
        return;
      }

      const source = video.dataset.src;

      if (!source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      initialized = true;
    }

    function playVideo() {
      initializePlayer();
      button.classList.add("is-hidden");
      video.play().catch(() => {
        button.classList.remove("is-hidden");
      });
    }

    button.addEventListener("click", playVideo);

    video.addEventListener("click", () => {
      if (!initialized) {
        playVideo();
      }
    });

    video.addEventListener("play", () => {
      button.classList.add("is-hidden");
    });
  });
}

function setupSearch() {
  const input = document.querySelector("[data-search-input]");
  const clear = document.querySelector("[data-clear-search]");
  const list = document.querySelector("[data-search-list]");

  if (!input || !list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll(".movie-card"));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function filter() {
    const query = normalize(input.value);

    cards.forEach((card) => {
      const text = normalize(card.textContent || "");
      const matched = !query || text.includes(query);
      card.classList.toggle("is-filtered-out", !matched);
    });
  }

  input.value = initialQuery;
  input.addEventListener("input", filter);

  if (clear) {
    clear.addEventListener("click", () => {
      input.value = "";
      filter();
      input.focus();
    });
  }

  filter();
}

ready(() => {
  setupNavigation();
  setupHero();
  setupPlayers();
  setupSearch();
});
