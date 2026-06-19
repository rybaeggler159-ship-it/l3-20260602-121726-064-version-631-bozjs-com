(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showHero(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(active + 1);
      });
    }

    window.setInterval(function () {
      showHero(active + 1);
    }, 5000);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function filterCards() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var genre = (card.getAttribute('data-genre') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchKeyword = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1;
      var matchRegion = !region || cardRegion.indexOf(region) !== -1;
      var matchYear = !year || cardYear === year;

      card.style.display = matchKeyword && matchRegion && matchYear ? '' : 'none';
    });
  }

  [filterInput, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
})();
