const HLS_VENDOR_PATH = './assets/hls-vendor-dru42stk.js';

function qs(selector, root = document) {
    return root.querySelector(selector);
}

function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
}

function initMobileMenu() {
    const button = qs('[data-mobile-menu-button]');
    const menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const root = qs('[data-hero-carousel]');

    if (!root) {
        return;
    }

    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    let current = 0;
    let timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, position) => {
            slide.classList.toggle('is-active', position === current);
        });
        dots.forEach((dot, position) => {
            dot.classList.toggle('is-active', position === current);
        });
    }

    function startAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => {
            showSlide(current + 1);
        }, 6000);
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = Number(dot.dataset.heroDot || 0);
            showSlide(index);
            startAutoPlay();
        });
    });

    if (slides.length > 1) {
        startAutoPlay();
    }
}

function initHeaderSearch() {
    qsa('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = qs('input[name="q"]', form);
            const query = input ? input.value.trim() : '';

            if (!query) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });
}

function initPageFilters() {
    const grid = qs('[data-card-grid]');

    if (!grid) {
        return;
    }

    const cards = qsa('[data-movie-card]', grid);
    const input = qs('[data-page-filter]');
    const yearSelect = qs('[data-filter-year]');
    const sortSelect = qs('[data-sort-cards]');
    const count = qs('[data-filter-count]');

    function applyFilters() {
        const keyword = normalizeText(input ? input.value : '');
        const year = yearSelect ? yearSelect.value : '';
        let visible = 0;

        cards.forEach((card) => {
            const text = normalizeText(card.dataset.search);
            const matchesKeyword = !keyword || text.includes(keyword);
            const matchesYear = !year || card.dataset.year === year;
            const shouldShow = matchesKeyword && matchesYear;
            card.classList.toggle('is-hidden-card', !shouldShow);

            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `共 ${visible} 部`;
        }
    }

    function applySort() {
        const value = sortSelect ? sortSelect.value : 'default';
        const sorted = [...cards];

        if (value === 'score') {
            sorted.sort((a, b) => Number(b.dataset.score || 0) - Number(a.dataset.score || 0));
        }

        if (value === 'year') {
            sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        }

        if (value === 'default') {
            sorted.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
        }

        sorted.forEach((card) => grid.appendChild(card));
        applyFilters();
    }

    if (input) {
        input.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }
}

async function prepareHls(video, source) {
    if (!video || !source || video.dataset.hlsReady === 'true') {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.hlsReady = 'true';
        return;
    }

    const module = await import(HLS_VENDOR_PATH);
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        video.dataset.hlsReady = 'true';
        return;
    }

    video.src = source;
    video.dataset.hlsReady = 'true';
}

function initVideoPlayers() {
    qsa('.player-card').forEach((card) => {
        const video = qs('video[data-hls-url]', card);
        const button = qs('[data-play-button]', card);

        if (!video) {
            return;
        }

        const source = video.dataset.hlsUrl;

        async function startPlayback() {
            try {
                await prepareHls(video, source);
                if (button) {
                    button.classList.add('is-hidden');
                }
                await video.play();
            } catch (error) {
                console.warn('播放器初始化失败，已保留原生控件以便重试。', error);
                if (button) {
                    button.classList.add('is-hidden');
                }
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('play', async () => {
            if (video.dataset.hlsReady !== 'true') {
                await prepareHls(video, source);
            }
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    });
}

function createMovieCard(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
        <article class="movie-card movie-card-compact" data-movie-card>
            <a class="movie-poster" href="./${movie.detail}" aria-label="观看${escapeHtml(movie.title)}">
                <img src="./${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="score-badge">${movie.score}</span>
                <span class="duration-badge">${escapeHtml(movie.duration)}</span>
            </a>
            <div class="movie-card-body">
                <a class="movie-title" href="./${movie.detail}">${escapeHtml(movie.title)}</a>
                <p class="movie-line">${escapeHtml(movie.one_line)}</p>
                <div class="movie-meta-line">
                    <span>${escapeHtml(movie.year)}</span>
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.type)}</span>
                </div>
                <div class="tag-row">${tags}</div>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function initSearchPage() {
    const root = qs('[data-search-app]');
    const movies = window.MOVIE_INDEX || [];

    if (!root || movies.length === 0) {
        return;
    }

    const input = qs('[data-search-input]', root);
    const category = qs('[data-search-category]', root);
    const year = qs('[data-search-year]', root);
    const region = qs('[data-search-region]', root);
    const reset = qs('[data-search-reset]', root);
    const results = qs('[data-search-results]', root);
    const count = qs('[data-search-result-count]', root);
    const initialQuery = getQueryParam('q');

    if (input && initialQuery) {
        input.value = initialQuery;
    }

    function applySearch() {
        const keyword = normalizeText(input ? input.value : '');
        const categoryValue = category ? category.value : '';
        const yearValue = year ? year.value : '';
        const regionValue = region ? region.value : '';

        const filtered = movies.filter((movie) => {
            const matchesKeyword = !keyword || normalizeText(movie.search).includes(keyword);
            const matchesCategory = !categoryValue || movie.category_name === categoryValue;
            const matchesYear = !yearValue || movie.year === yearValue;
            const matchesRegion = !regionValue || movie.region === regionValue;
            return matchesKeyword && matchesCategory && matchesYear && matchesRegion;
        }).slice(0, 120);

        if (results) {
            results.innerHTML = filtered.map(createMovieCard).join('');
        }

        if (count) {
            count.textContent = `找到 ${filtered.length} 部；搜索覆盖 ${movies.length} 部影片。`;
        }
    }

    [input, category, year, region].forEach((control) => {
        if (control) {
            control.addEventListener('input', applySearch);
            control.addEventListener('change', applySearch);
        }
    });

    if (reset) {
        reset.addEventListener('click', () => {
            if (input) input.value = '';
            if (category) category.value = '';
            if (year) year.value = '';
            if (region) region.value = '';
            applySearch();
        });
    }

    applySearch();
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroCarousel();
    initHeaderSearch();
    initPageFilters();
    initVideoPlayers();
    initSearchPage();
});
