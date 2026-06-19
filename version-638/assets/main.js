(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            activateSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            activateSlide(activeIndex + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        var textInput = filterForm.querySelector('[name="keyword"]');
        var yearSelect = filterForm.querySelector('[name="year"]');
        var genreSelect = filterForm.querySelector('[name="genre"]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.search-empty');

        function applyFilter(event) {
            if (event) {
                event.preventDefault();
            }
            var keyword = (textInput && textInput.value || '').trim().toLowerCase();
            var year = yearSelect && yearSelect.value || '';
            var genre = genreSelect && genreSelect.value || '';
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && card.dataset.year !== year) {
                    matched = false;
                }
                if (genre && (card.dataset.genre || '').indexOf(genre) === -1) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }

        filterForm.addEventListener('submit', applyFilter);
        [textInput, yearSelect, genreSelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });
    }
})();
