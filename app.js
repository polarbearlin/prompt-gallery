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
document.getElementById('copyBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('modalPrompt').textContent;
    const btn = document.getElementById('copyBtn');

    try {
        await navigator.clipboard.writeText(promptText);
        btn.classList.add('copied');
        btn.querySelector('.copy-text').textContent = '已复制!';
        btn.querySelector('.copy-icon').textContent = '✓';

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.querySelector('.copy-text').textContent = '复制';
            btn.querySelector('.copy-icon').textContent = '📋';
        }, 2000);
    } catch (err) {
        console.error('Copy failed:', err);
        alert('复制失败，请手动复制');
    }
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
