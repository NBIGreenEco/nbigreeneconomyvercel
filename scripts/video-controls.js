function initVideoControls() {
    const video = document.querySelector('.hero-video');
    const playPauseButton = document.querySelector('.play-pause-button');

    if (!video || !playPauseButton) {
        console.warn('Video or play/pause button not found');
        return;
    }

    // Make sure the button is visible initially
    playPauseButton.style.opacity = '0.9';
    playPauseButton.style.visibility = 'visible';

    // Toggle play/pause when button is clicked
    playPauseButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (video.paused) {
            video.play().catch(error => {
                console.error('Error playing video:', error);
            });
            playPauseButton.classList.add('playing');
            playPauseButton.setAttribute('aria-label', 'Pause video');
        } else {
            video.pause();
            playPauseButton.classList.remove('playing');
            playPauseButton.setAttribute('aria-label', 'Play video');
        }
    });

    // Toggle play/pause when clicking the video
    video.addEventListener('click', function() {
        if (video.paused) {
            video.play().catch(error => {
                console.error('Error playing video:', error);
            });
            playPauseButton.classList.add('playing');
            playPauseButton.setAttribute('aria-label', 'Pause video');
        } else {
            video.pause();
            playPauseButton.classList.remove('playing');
            playPauseButton.setAttribute('aria-label', 'Play video');
        }
    });

    // Show/hide controls when hovering the video container
    const videoContainer = video.closest('.hero-image');
    if (videoContainer) {
        videoContainer.addEventListener('mouseenter', function() {
            playPauseButton.style.opacity = '0.9';
            playPauseButton.style.visibility = 'visible';
        });

        videoContainer.addEventListener('mouseleave', function() {
            if (!video.paused) {
                playPauseButton.style.opacity = '0';
                playPauseButton.style.visibility = 'hidden';
            }
        });
    }

    // Update button state when video ends
    video.addEventListener('ended', function() {
        playPauseButton.classList.remove('playing');
        playPauseButton.setAttribute('aria-label', 'Play video');
    });
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoControls);
} else {
    initVideoControls();
}
