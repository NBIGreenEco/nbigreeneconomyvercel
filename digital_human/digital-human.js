document.addEventListener("DOMContentLoaded", function () {
  const pulsingIcon = document.getElementById("pulsingIcon");
  const pulsingVideo = pulsingIcon.querySelector("video"); // idle video
  const videoOverlay = document.getElementById("videoOverlay");
  const floatingVideo = document.getElementById("floatingVideo");
  const closeVideo = document.querySelector(".close-video");
  const langButtons = document.querySelectorAll(".lang-btn");

  // Get current page name (without extension)
  const pathParts = window.location.pathname.split("/");
  let pageName = pathParts[pathParts.length - 1].split(".")[0];
  if (!pageName) pageName = "index"; // fallback for homepage

  // Build video sources dynamically
  const videoSources = {
    eng: `/Videos/${pageName}_English.mp4`,
    zulu: `/Videos/${pageName}_Zulu.mp4`,
    tswana: `/Videos/${pageName}_Tswana.mp4`,
  };

  let currentLang = "eng";

  // Handle pulsing icon click → open overlay
  pulsingIcon.addEventListener("click", function (e) {
    e.preventDefault();

    videoOverlay.classList.add("active");
    pulsingIcon.style.display = "none";       // hide pulsing icon
    if (pulsingVideo) pulsingVideo.pause();   // pause idle video

    playCurrentVideo();
  });

  // Close video with × button
  closeVideo.addEventListener("click", function (e) {
    e.stopPropagation();
    closeVideoPlayer();
  });

  // Close when clicking outside video area
  videoOverlay.addEventListener("click", function (e) {
    if (e.target === videoOverlay) {
      closeVideoPlayer();
    }
  });

  // Handle language switching
  langButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const lang = this.getAttribute("data-lang");
      if (lang !== currentLang) {
        langButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        currentLang = lang;
        playCurrentVideo();
      }
    });
  });

  // Loop overlay video indefinitely
  floatingVideo.addEventListener("ended", function () {
    floatingVideo.currentTime = 0;
    floatingVideo.play();
  });

  function playCurrentVideo() {
    const source = videoSources[currentLang];
    if (source) {
      floatingVideo.src = source;
      floatingVideo.load();
      floatingVideo.play().catch((e) => console.log("Video play failed:", e));
    }
  }

  function closeVideoPlayer() {
    videoOverlay.classList.remove("active");
    floatingVideo.pause();
    floatingVideo.currentTime = 0;

    pulsingIcon.style.display = "flex";      // show pulsing icon again
    if (pulsingVideo) pulsingVideo.play();   // resume idle video
  }
});
