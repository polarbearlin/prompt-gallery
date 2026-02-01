document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('sidebarNav');
    const iframe = document.getElementById('contentFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Function to render navigation tree
    function renderNav() {
        if (!typeof wikiData === 'undefined' || !wikiData) {
            console.error('Wiki data not found!');
            return;
        }

        wikiData.forEach((item, index) => {
            const link = document.createElement('a');
            link.className = `nav-item level-${item.level}`;
            link.textContent = item.text;
            link.href = item.url;
            link.dataset.index = index;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                handleNavClick(link, item.url);
            });

            navContainer.appendChild(link);
        });

        // Load the first item by default
        if (wikiData.length > 0) {
            const firstLink = navContainer.querySelector('.nav-item');
            if (firstLink) {
                handleNavClick(firstLink, wikiData[0].url);
            }
        }
    }

    // Handle navigation click
    function handleNavClick(clickedElement, url) {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        clickedElement.classList.add('active');

        // Show loading state
        showLoading();
        iframe.classList.add('loading');

        // Check if we are just changing the hash on the same page
        const currentSrc = iframe.src.split('#')[0].split('?')[0];
        const newSrc = url.split('#')[0].split('?')[0];

        if (currentSrc === newSrc && url.includes('#')) {
            // Force reload by adding/updating a timestamp query param
            // Insert param before the hash
            const [baseUrl, hash] = url.split('#');
            // Check if base has query params already
            const separator = baseUrl.includes('?') ? '&' : '?';
            const forcedUrl = `${baseUrl}${separator}v=${Date.now()}#${hash}`;

            iframe.src = forcedUrl;
        } else {
            iframe.src = url;
        }

        // Hide loading after a short delay (iframe load event is tricky cross-origin)
        iframe.onload = hideLoadingState;
        setTimeout(hideLoadingState, 1500);
    }

    function showLoading() {
        loadingOverlay.classList.add('visible');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('visible');
    }

    // Initialize
    renderNav();
});
