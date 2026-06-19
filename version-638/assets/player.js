(function () {
    function startPlayer(video, cover) {
        var url = video.getAttribute('data-url');

        if (!url) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');

        if (!video) {
            return;
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayer(video, cover);
            }
        });

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(video, cover);
            });
        }
    });
})();
