document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('contentFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // The "Mirror Proxy" URL (Serveo Tunnel)
    // This points to our local python server which handles the sidebar and cropping
    const MIRROR_URL = "https://0208edfe59e5d860-168-158-54-39.serveousercontent.com/";

    function initWiki() {
        showLoading();
        iframe.classList.add('loading');

        // Load the full mirror app
        iframe.src = MIRROR_URL;

        // Hide loading when done
        iframe.onload = hideLoadingState;

        // Safety timeout
        setTimeout(hideLoadingState, 3000);
    }

    function hideLoadingState() {
        loadingOverlay.classList.remove('visible');
        iframe.classList.remove('loading');
    }

    function showLoading() {
        loadingOverlay.classList.add('visible');
    }

    // Initialize
    initWiki();
});
