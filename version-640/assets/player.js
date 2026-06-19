(function () {
  function attachPlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button || !overlay || !config.source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(config.source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = config.source;
      }

      ready = true;
    }

    function start() {
      prepare();
      overlay.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    overlay.addEventListener('click', start);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.CinemaPlayer = {
    attach: attachPlayer
  };
})();
