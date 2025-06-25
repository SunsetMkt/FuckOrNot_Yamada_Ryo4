import { getRatingLabel } from './config.js';
import * as store from './store.js';

// --- DOM Element Cache ---
const elements = {
    uploadArea: document.getElementById('upload-area'),
    previewContainer: document.getElementById('preview-container'),
    previewImage: document.getElementById('preview-image'),
    resultContainer: document.getElementById('result-container'),
    imagePreview: document.getElementById('image-preview'),
    loading: document.getElementById('loading'),
    result: document.getElementById('result'),
    verdict: document.getElementById('verdict'),
    verdictIcon: document.getElementById('verdict-icon'),
    explanation: document.getElementById('explanation'),
    resultActions: document.querySelector('.result-actions'),
    tryAgainBtn: document.getElementById('try-again'),
    themeToggle: document.getElementById('theme-toggle'),
    disclaimer: document.getElementById('disclaimer'),
    imagePreviewContainerResult: document.getElementById('image-preview-container-result')
};

let popupOverlay = null;

// --- Initialization ---
function createPopup() {
    if (document.getElementById('popup-overlay')) return;
    
    popupOverlay = document.createElement('div');
    popupOverlay.id = 'popup-overlay';
    popupOverlay.innerHTML = `
        <div class="popup-card">
            <button class="close-popup">×</button>
            <img id="popup-img" src="" alt="预览图片">
            <h3 id="popup-verdict"></h3>
            <p id="popup-explanation"></p>
        </div>
    `;
    popupOverlay.style.display = ''; // Remove inline style
    document.body.appendChild(popupOverlay);

    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            hidePopup();
        }
    });
    popupOverlay.querySelector('.close-popup').addEventListener('click', hidePopup);
}
createPopup(); // Create on script load

// --- UI State Changers ---
export function showPreview(imageDataUrl) {
    elements.previewImage.src = imageDataUrl;
    elements.uploadArea.classList.add('hidden');
    elements.previewContainer.classList.remove('hidden');
    elements.resultContainer.classList.add('hidden');
}

export function showLoading(imageDataUrl) {
    elements.imagePreview.src = imageDataUrl;
    elements.uploadArea.classList.add('hidden');
    elements.previewContainer.classList.add('hidden');
    elements.resultContainer.classList.remove('hidden');
    elements.loading.classList.remove('hidden');
    elements.result.classList.add('hidden');

    // Clear previous action buttons
    const existingBtns = elements.resultActions.querySelectorAll('.save-btn, .share-btn');
    existingBtns.forEach(btn => btn.remove());
}

export function displayResult({ rating, verdict: verdictText, explanation: explanationText }) {
    elements.loading.classList.add('hidden');
    elements.result.classList.remove('hidden');
    
    const isSmash = verdictText === 'SMASH';
    const isPass = verdictText === 'PASS';

    elements.verdict.textContent = `${getRatingLabel(rating)} (${rating}/10)`;
    elements.verdictIcon.textContent = isSmash ? 'SMASH!!' : isPass ? 'PASS' : '...';
    elements.explanation.textContent = explanationText;

    let resultClass = 'result';
    if(isSmash) resultClass += ' smash';
    if(isPass) resultClass += ' pass';
    elements.result.className = resultClass;
}

export function displayError(errorMessage) {
    elements.loading.classList.add('hidden');
    elements.result.classList.remove('hidden');
    elements.verdict.textContent = '错误!';
    elements.verdictIcon.textContent = 'ERROR';
    elements.explanation.textContent = errorMessage;
    elements.result.className = 'result';
}

export function resetToUpload() {
    elements.previewContainer.classList.add('hidden');
    elements.resultContainer.classList.add('hidden');
    elements.uploadArea.classList.remove('hidden');
    document.getElementById('file-input').value = '';
    const existingBtns = elements.resultActions.querySelectorAll('.save-btn, .share-btn');
    existingBtns.forEach(btn => btn.remove());
}

export function hideDisclaimer() {
    elements.disclaimer.style.display = 'none';
}

// --- Theme Management ---
export function toggleTheme() {
    // This function is no longer needed as there is only one theme.
}

export function initializeTheme() {
    // This function is no longer needed.
}

// --- Dynamic Element Creation ---
export function createSaveButton(onClick) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn save-btn';
    saveBtn.textContent = '💾 保存结果';
    saveBtn.addEventListener('click', () => {
        onClick();
        saveBtn.textContent = '✓ 已保存';
        saveBtn.disabled = true;
    });
    elements.resultActions.appendChild(saveBtn);
}

export function createShareButton(onClick) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn share-btn';
    shareBtn.textContent = '🔗 分享评分';
    shareBtn.addEventListener('click', () => {
        onClick();
        shareBtn.textContent = '✓ 已复制!';
        setTimeout(() => {
            shareBtn.textContent = '🔗 分享评分';
        }, 2000);
    });
    elements.resultActions.appendChild(shareBtn);
}

export function createSavedResultsContainer(results, eventHandlers) {
    const container = document.createElement('div');
    container.className = 'saved-results';

    if (results.length === 0) {
        container.innerHTML = `
            <h2>保存的结果</h2>
            <p style="text-align: center; color: var(--subtitle-color);">暂无保存的结果</p>
        `;
    } else {
        const grid = results.map((result, index) => `
            <div class="saved-result-card" data-index="${index}">
                <img src="${result.image}" alt="Saved result ${index + 1}">
                <div class="saved-result-info">
                    <p class="date">${new Date(result.timestamp).toLocaleDateString()}</p>
                    <p class="ai-type">模式: ${
                        result.aiType === 'brief' ? '简短' :
                        result.aiType === 'descriptive' ? '详细' : '小说'
                    }</p>
                     <div class="saved-result-actions">
                        <button class="view-btn" data-index="${index}">👀 查看</button>
                        <button class="delete-btn" data-index="${index}">🗑️ 删除</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<h2>保存的结果</h2><div class="saved-results-grid">${grid}</div>`;
        
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                eventHandlers.onDelete(parseInt(e.target.dataset.index));
            });
        });
        
        container.querySelectorAll('.saved-result-card').forEach(card => {
            card.addEventListener('click', (e) => {
                 if (e.target.classList.contains('delete-btn')) return;
                eventHandlers.onView(parseInt(card.dataset.index));
            });
        });
    }
    return container;
}

// --- Popup Management ---
export function showPopup(result) {
    if (!popupOverlay) return;
    document.getElementById('popup-img').src = result.image;
    document.getElementById('popup-verdict').textContent = `${getRatingLabel(result.rating)} (${result.rating}/10)`;
    document.getElementById('popup-explanation').textContent = result.explanation;
    document.getElementById('popup-explanation').style.whiteSpace = 'pre-wrap';
    popupOverlay.classList.add('visible');
}

export function hidePopup() {
    if (popupOverlay) popupOverlay.classList.remove('visible');
}