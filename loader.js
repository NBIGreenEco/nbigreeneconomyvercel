document.addEventListener('DOMContentLoaded', () => {
    const loaderHtml = `
        <div class="loader-overlay" id="loader-overlay">
            <div class="loader"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loaderHtml);
    const style = document.createElement('style');
    style.textContent = `
        .loader {
            display: block;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            border: 8px solid #e5e7eb;
            border-top: 8px solid #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            z-index: 1000;
        }
        .loader-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const hideLoader = () => {
        const loaderOverlay = document.getElementById('loader-overlay');
        if (loaderOverlay) {
            loaderOverlay.style.display = 'none';
        }
    };

    if (i18next.isInitialized) {
        hideLoader();
    } else {
        i18next.on('initialized', () => {
            hideLoader();
        });
        // Fallback: hide loader after 5 seconds if initialization fails
        setTimeout(hideLoader, 5000);
    }
});
