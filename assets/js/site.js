(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.style.opacity = '0';
    }
  }, true);

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-list]').forEach(function (list) {
    var container = list.closest('section') || document;
    var input = container.querySelector('[data-search-input]');
    var select = container.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function applySearch() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
      });
    }

    function applySort() {
      if (!select) {
        return;
      }
      var mode = select.value;
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applySearch);
    }
    if (select) {
      select.addEventListener('change', applySort);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var state = player.querySelector('[data-player-state]');
    var url = player.getAttribute('data-video-url');
    var hlsInstance = null;

    function setState(text, hidden) {
      if (!state) {
        return;
      }
      state.textContent = text || '';
      state.classList.toggle('is-hidden', Boolean(hidden));
    }

    function prepare() {
      if (!video || !url) {
        setState('播放源暂不可用', false);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('', true);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setState('视频加载失败，请稍后重试', false);
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          setState('', true);
        });
        video.addEventListener('error', function () {
          setState('视频加载失败，请稍后重试', false);
        });
        return;
      }

      setState('当前浏览器不支持该视频格式', false);
    }

    function playVideo() {
      if (!video) {
        return;
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          setState('请再次点击播放器开始播放', false);
        });
      }
    }

    prepare();

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setState('', true);
      });
      video.addEventListener('pause', function () {
        if (button && !video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
