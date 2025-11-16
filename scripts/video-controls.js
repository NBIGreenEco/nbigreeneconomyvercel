function initVideoControls() {
    const video = document.querySelector('.hero-video');

    if (!video) {
        console.warn('Video element not found');
        return;
    }

    // Simple click-to-play/pause on video element
    video.addEventListener('click', function(e) {
        if (video.paused) {
            video.play().catch(error => {
                console.error('Error playing video:', error);
            });
        } else {
            video.pause();
        }
    });

    // Ensure video has proper error handling
    video.addEventListener('error', function() {
        console.error('Video playback error:', video.error);
    });
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoControls);
} else {
    initVideoControls();
}
