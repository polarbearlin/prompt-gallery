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

// Category Master Configuration
const CATEGORIES = [
    { id: 'all', name: '全部', emoji: '' },
    { id: 'photography', name: '摄影', emoji: '📷' },
    { id: 'portrait', name: '人像', emoji: '👤' },
    { id: 'nature', name: '自然', emoji: '🌿' },
    { id: 'landscape', name: '景观', emoji: '🏔️' },
    { id: 'architecture', name: '建筑', emoji: '🏛️' },
    { id: 'interior', name: '室内', emoji: '🏠' },
    { id: '3d', name: '3D', emoji: '🧊' },
    { id: 'illustration', name: '插画', emoji: '🎨' },
    { id: 'character', name: '角色', emoji: '👾' },
    { id: 'anime', name: '动漫', emoji: '🌸' },
    { id: 'fashion', name: '时尚', emoji: '👗' },
    { id: 'product', name: '产品', emoji: '📦' },
    { id: 'food', name: '美食', emoji: '🍔' },
    { id: 'logo', name: 'Logo', emoji: '🔷' },
    { id: 'branding', name: '品牌', emoji: '💼' },
    { id: 'typography', name: '字体', emoji: '🅰️' },
    { id: 'poster', name: '海报', emoji: '📜' },
    { id: 'ui', name: 'UI', emoji: '📱' },
    { id: 'icon', name: '图标', emoji: '🏷️' },
    { id: 'game', name: '游戏', emoji: '🎮' },
    { id: 'sci-fi', name: '科幻', emoji: '🚀' },
    { id: 'fantasy', name: '奇幻', emoji: '🦄' },
    { id: 'retro', name: '复古', emoji: '📼' },
    { id: 'minimalist', name: '极简', emoji: '✨' },
    { id: 'neon', name: '霓虹', emoji: '🎆' },
    { id: 'clay', name: '粘土', emoji: '🧸' },
    { id: 'paper', name: '剪纸', emoji: '✂️' },
    { id: 'texture', name: '材质', emoji: '🧶' },
    { id: 'animal', name: '动物', emoji: '🐾' },
    { id: 'vehicle', name: '车辆', emoji: '🚗' },
];

// Render categories with expand capability
let isCategoriesExpanded = false;
const INITIAL_CATEGORY_COUNT = 10;

function renderCategories() {
    const container = document.getElementById('categories');
    const categoriesToShow = isCategoriesExpanded ? CATEGORIES : CATEGORIES.slice(0, INITIAL_CATEGORY_COUNT);

    // Render tags
    let html = categoriesToShow.map(cat => `
        <button class="category-tag ${activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
            ${cat.emoji} ${cat.name}
        </button>
    `).join('');

    // Add Expand/Collapse button if needed
    if (CATEGORIES.length > INITIAL_CATEGORY_COUNT) {
        html += `
            <button class="category-tag toggle-btn" id="categoryToggle" style="background:transparent; border:1px solid var(--border); color:var(--accent);">
                ${isCategoriesExpanded ? '🔼 收起' : '🔽 更多分类'}
            </button>
        `;
    }

    container.innerHTML = html;
}

// Category filter & Toggle
document.getElementById('categories').addEventListener('click', (e) => {
    // Handle toggle button
    if (e.target.closest('#categoryToggle')) {
        isCategoriesExpanded = !isCategoriesExpanded;
        renderCategories();
        return;
    }

    const btn = e.target.closest('.category-tag');
    if (btn && !btn.classList.contains('toggle-btn')) {
        // Update active state
        activeCategory = btn.dataset.category;
        const searchTerm = document.getElementById('searchInput').value;
        filterPrompts(searchTerm, activeCategory);
        renderCategories(); // Re-render to update active class
    }
});

// Smart Sticky Header (Hide on scroll down)
let lastScrollY = window.scrollY;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Threshold to prevent jitter
    if (Math.abs(currentScrollY - lastScrollY) < 10) return;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll Down -> Hide
        header.classList.add('header-hidden');
    } else {
        // Scroll Up -> Show
        header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
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
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    loadPrompts();
});
