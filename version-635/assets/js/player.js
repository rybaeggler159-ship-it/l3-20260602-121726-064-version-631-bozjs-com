(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var video = document.querySelector("[data-video-player]");
        var button = document.querySelector("[data-play-button]");
        var cover = document.querySelector("[data-video-cover]");
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function attachStream(streamUrl) {
            if (!streamUrl) {
                return;
            }
            hideCover();
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
        }

        button.addEventListener("click", function () {
            attachStream(button.getAttribute("data-stream"));
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });
    });
})();
