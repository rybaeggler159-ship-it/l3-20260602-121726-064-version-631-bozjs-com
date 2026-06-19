(function () {
  function initPage() {
    const toggle = document.querySelector(".mobile-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        panel.classList.toggle("open");
      });
    }
    initHero();
  }

  function initHero() {
    const slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
    let timer = null;
    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function initCategoryFilter() {
    const input = document.querySelector(".category-search");
    const buttons = Array.from(document.querySelectorAll(".filter-button"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }
    let active = "all";
    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.keywords
        ].join(" ").toLowerCase();
        const typeText = `${card.dataset.type || ""} ${card.dataset.genre || ""}`;
        const typeOk = active === "all" || typeText.includes(active);
        const queryOk = !query || haystack.includes(query);
        card.classList.toggle("hidden", !(typeOk && queryOk));
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        active = button.dataset.filter || "all";
        buttons.forEach((btn) => btn.classList.toggle("active", btn === button));
        apply();
      });
    });
    apply();
  }

  function initSearchPage(movies) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.getElementById("search-input");
    const title = document.getElementById("search-title");
    const subtitle = document.getElementById("search-subtitle");
    const results = document.getElementById("search-results");
    if (input) {
      input.value = query;
    }
    if (!query || !results) {
      return;
    }
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = (movies || []).filter((movie) => {
      const text = [movie.title, movie.type, movie.year, movie.genre, movie.region, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return words.every((word) => text.includes(word));
    }).slice(0, 120);
    if (title) {
      title.textContent = `搜索结果：${query}`;
    }
    if (subtitle) {
      subtitle.textContent = matched.length ? "为你找到以下相关内容。" : "没有匹配内容，可尝试更换关键词。";
    }
    results.innerHTML = matched.length ? matched.map(renderSearchCard).join("") : `<div class="empty-state">未找到相关内容</div>`;
  }

  function renderSearchCard(movie) {
    return `
      <article class="movie-card">
        <a href="./${escapeAttr(movie.file)}" aria-label="${escapeAttr(movie.title)}">
          <div class="poster-frame">
            <img src="${escapeAttr(movie.cover)}" alt="${escapeAttr(movie.title)}" loading="lazy">
            <span class="movie-year">${escapeHtml(movie.year)}</span>
            <span class="movie-score">★ ${escapeHtml(movie.score)}</span>
            <span class="play-hover">▶</span>
          </div>
          <h3>${escapeHtml(movie.title)}</h3>
          <p>${escapeHtml(movie.oneLine)}</p>
        </a>
      </article>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function initMoviePlayer(videoId, buttonId, streamUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    let hls = null;
    const revealButton = () => {
      button.classList.remove("is-hidden");
    };
    const start = () => {
      button.classList.add("is-hidden");
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.currentSrc !== streamUrl) {
          video.src = streamUrl;
        }
        video.play().catch(revealButton);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(revealButton);
          });
          hls.on(window.Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
              hls.destroy();
              hls = null;
              revealButton();
            }
          });
        } else {
          video.play().catch(revealButton);
        }
        return;
      }
      video.src = streamUrl;
      video.play().catch(revealButton);
    };
    button.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
  }

  window.Site = {
    initPage,
    initCategoryFilter,
    initSearchPage,
    initMoviePlayer
  };
})();
