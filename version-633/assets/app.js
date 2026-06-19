(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    var panel = document.querySelector("[data-filter-panel]");
    if (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var query = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var yearValue = year && year.value ? parseInt(year.value, 10) : 0;
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(" "));
          var cardYear = parseInt(card.dataset.year || "0", 10);
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            ok = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            ok = false;
          }
          if (yearValue && cardYear < yearValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
