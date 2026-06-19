(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var previous = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, offset) {
        slide.classList.toggle("is-active", offset === index);
      });
      dots.forEach(function (dot, offset) {
        dot.classList.toggle("is-active", offset === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, offset) {
      dot.addEventListener("click", function () {
        show(offset);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initFilters() {
    var search = document.getElementById("movie-search");
    var genre = document.getElementById("genre-filter");
    var year = document.getElementById("year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-line"));

    if (!cards.length || (!search && !genre && !year)) {
      return;
    }

    function yearMatches(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }
      var numericYear = parseInt(cardYear, 10);
      var numericSelected = parseInt(selectedYear, 10);
      if (!numericYear) {
        return false;
      }
      if (numericSelected <= 2020) {
        return numericYear >= numericSelected;
      }
      return numericYear === numericSelected;
    }

    function apply() {
      var query = normalize(search ? search.value : "");
      var selectedGenre = normalize(genre ? genre.value : "");
      var selectedYear = year ? year.value : "";

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardYear = card.getAttribute("data-year") || "";
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }

        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          visible = false;
        }

        if (!yearMatches(cardYear, selectedYear)) {
          visible = false;
        }

        card.classList.toggle("is-hidden", !visible);
      });
    }

    [search, genre, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  initHero();
  initFilters();
})();

function initMoviePlayer(videoUrl, playerId) {
  var player = document.getElementById(playerId);

  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var overlay = player.querySelector(".player-overlay");
  var started = false;
  var hls = null;

  function reveal() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
  }

  function attach() {
    if (started) {
      reveal();
      var replay = video.play();
      if (replay && replay.catch) {
        replay.catch(function () {});
      }
      return;
    }

    started = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          player.classList.add("player-error");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else {
      player.classList.add("player-error");
    }

    reveal();

    var play = video.play();
    if (play && play.catch) {
      play.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", attach);
  }

  video.addEventListener("click", function () {
    if (!started || video.paused) {
      attach();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
