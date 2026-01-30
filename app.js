// ================================
// AI Prompt Gallery - App Logic
// ================================

// Sample prompts data (will be loaded from JSON in production)
let promptsData = [];

// Load prompts data
async function loadPrompts() {
    try {
        // Add timestamp to prevent caching
        const response = await fetch(`data/prompts.json?v=${new Date().getTime()}`);
        promptsData = await response.json();
        renderGallery(promptsData);
        updateCount(promptsData.length);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Failed to load prompts:', error);
        document.getElementById('loading').textContent = '加载失败，请刷新重试';
    }
}

// Render gallery cards
function renderGallery(prompts) {
    const gallery = document.getElementById('gallery');
    const noResults = document.getElementById('noResults');

    if (prompts.length === 0) {
        gallery.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    gallery.innerHTML = prompts.map((prompt, index) => `
        <div class="card" data-index="${index}" onclick="openModal(${prompt.id})">
            <img class="card-image" src="${prompt.image}" alt="${prompt.title}" loading="lazy">
            <div class="card-content">
                <h3 class="card-title">${prompt.title}</h3>
                <div class="card-tags">
                    ${prompt.categories.slice(0, 3).map(cat =>
        `<span class="card-tag">${getCategoryEmoji(cat)} ${cat}</span>`
    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Get emoji for category
function getCategoryEmoji(category) {
    const emojis = {
        'photography': '📷',
        'portrait': '👤',
        'nature': '🌿',
        'product': '📦',
        '3d': '🎮',
        'food': '🍔',
        'fashion': '👗',
        'illustration': '🎨',
        'branding': '💼',
        'minimalist': '✨',
        'fantasy': '🦄',
        'retro': '📼',
        'landscape': '🏔️',
        'character': '👾',
        'sci-fi': '🚀'
    };
    return emojis[category] || '🏷️';
}

// Update prompt count
function updateCount(count) {
    document.getElementById('totalCount').textContent = count;
}

// Search functionality
function filterPrompts(searchTerm, category) {
    let filtered = promptsData;

    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.prompt.toLowerCase().includes(term) ||
            p.categories.some(c => c.toLowerCase().includes(term))
        );
    }

    // Filter by category
    if (category && category !== 'all') {
        filtered = filtered.filter(p =>
            p.categories.includes(category)
        );
    }

    renderGallery(filtered);
    updateCount(filtered.length);
}

// Category filter
let activeCategory = 'all';
document.getElementById('categories').addEventListener('click', (e) => {
    if (e.target.classList.contains('category-tag')) {
        // Update active state
        document.querySelectorAll('.category-tag').forEach(tag => tag.classList.remove('active'));
        e.target.classList.add('active');

        activeCategory = e.target.dataset.category;
        const searchTerm = document.getElementById('searchInput').value;
        filterPrompts(searchTerm, activeCategory);
    }
});

// Search input
document.getElementById('searchInput').addEventListener('input', (e) => {
    filterPrompts(e.target.value, activeCategory);
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value;
    filterPrompts(searchTerm, activeCategory);
});

// Modal functionality
function openModal(id) {
    const prompt = promptsData.find(p => p.id === id);
    if (!prompt) return;

    document.getElementById('modalImage').src = prompt.image;
    document.getElementById('modalTitle').textContent = prompt.title;
    document.getElementById('modalPrompt').textContent = prompt.prompt;
    document.getElementById('modalTags').innerHTML = prompt.categories.map(cat =>
        `<span class="modal-tag">${getCategoryEmoji(cat)} ${cat}</span>`
    ).join('');

    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});

// Keyboard close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Copy functionality
// Copy to Clipboard with fallback
async function copyToClipboard(text, btn) {
    try {
        // Try modern API first
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            throw new Error('Clipboard API not available');
        }
        showCopySuccess(btn);
    } catch (err) {
        // Fallback: TextArea method
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;

            // Ensure content is selectable but not visible
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '0';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                showCopySuccess(btn);
            } else {
                showCopyError(btn);
            }
        } catch (fallbackErr) {
            console.error('Copy failed:', fallbackErr);
            showCopyError(btn);
        }
    }
}

function showCopySuccess(btn) {
    const originalText = '复制';
    const originalIcon = '📋';
    const textSpan = btn.querySelector('.copy-text');
    const iconSpan = btn.querySelector('.copy-icon');

    textSpan.textContent = '已复制！';
    iconSpan.textContent = '✅';
    btn.classList.add('success');

    setTimeout(() => {
        textSpan.textContent = originalText;
        iconSpan.textContent = originalIcon;
        btn.classList.remove('success');
    }, 2000);
}

function showCopyError(btn) {
    const textSpan = btn.querySelector('.copy-text');
    textSpan.textContent = '复制失败';
    setTimeout(() => {
        textSpan.textContent = '复制';
    }, 2000);
}

document.getElementById('copyBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('modalPrompt').textContent;
    const btn = document.getElementById('copyBtn');
    await copyToClipboard(promptText, btn);
});

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize
document.addEventListener('DOMContentLoaded', loadPrompts);
