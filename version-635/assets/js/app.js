(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
        }

        if (slides.length) {
            showSlide(0);
            var timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
            if (previous) {
                previous.addEventListener("click", function () {
                    window.clearInterval(timer);
                    showSlide(active - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    window.clearInterval(timer);
                    showSlide(active + 1);
                });
            }
        }

        var searchInput = document.querySelector("[data-page-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyTip = document.querySelector("[data-empty-tip]");

        function filterCards(value) {
            var query = String(value || "").trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyTip) {
                emptyTip.style.display = visible ? "none" : "block";
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get("q") || "";
            searchInput.value = keyword;
            filterCards(keyword);
            searchInput.addEventListener("input", function () {
                filterCards(searchInput.value);
            });
        }
    });
})();
