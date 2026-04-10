// common.js
// Handles localStorage and common UI tasks

const STORAGE_KEY = 'magicpod_quest_progress';

// Manage progress state
const ProgressManager = {
    load: function () {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to parse localStorage', e);
        }
        // Default initial state
        return {
            clearedStages: [],
            currentStage: 1
        };
    },

    save: function (state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    markCleared: function (stageNumber) {
        const state = this.load();
        if (!state.clearedStages.includes(stageNumber)) {
            state.clearedStages.push(stageNumber);
            // Auto-unlock next stage
            if (state.currentStage <= stageNumber) {
                state.currentStage = stageNumber + 1;
            }
            this.save(state);
        }
    },

    isCleared: function (stageNumber) {
        const state = this.load();
        return state.clearedStages.includes(stageNumber);
    },

    isUnlocked: function (stageNumber) {
        const state = this.load();
        // Stage 1 is always unlocked, others are unlocked if currentStage >= stageNumber
        // Or if it was already cleared
        return stageNumber === 1 || state.currentStage >= stageNumber || state.clearedStages.includes(stageNumber);
    },

    reset: function () {
        if (confirm('進捗をリセットしますか？この操作は取り消せません。')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }
};

// Common UI Updater
const UIUpdater = {
    updateHeader: function () {
        const state = ProgressManager.load();
        const count = state.clearedStages.length;
        const total = 8; // Total stages

        // Check if the DOM has a status element
        const statusEl = document.getElementById('header-status');
        if (statusEl) {
            statusEl.innerHTML = `🛰️ 探査完了: ${count}/${total} 惑星`;
        }
    },

    renderIndexGrid: function () {
        const cards = document.querySelectorAll('.stage-card');
        cards.forEach(card => {
            const stageNum = parseInt(card.dataset.stage, 10);
            const isUnlocked = ProgressManager.isUnlocked(stageNum);
            const isCleared = ProgressManager.isCleared(stageNum);

            const actionDiv = card.querySelector('.stage-action');
            const badgeDiv = card.querySelector('.stage-badge');

            if (isCleared) {
                card.classList.remove('locked');
                badgeDiv.innerHTML = '✅';
                actionDiv.innerHTML = `<a href="stage${stageNum}.html" class="btn btn-secondary">リプレイ</a>`;
            } else if (isUnlocked) {
                card.classList.remove('locked');
                badgeDiv.innerHTML = '🚀';
                actionDiv.innerHTML = `<a href="stage${stageNum}.html" class="btn btn-primary">ミッション開始</a>`;
            } else {
                card.classList.add('locked');
                badgeDiv.innerHTML = '🔒';
                actionDiv.innerHTML = `<button class="btn btn-secondary" disabled>ロック中</button>`;
            }
        });

        // Handle Reset Button
        const btnReset = document.getElementById('btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                ProgressManager.reset();
            });
        }
    }
};

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    UIUpdater.updateHeader();

    if (document.querySelector('.stage-grid')) {
        UIUpdater.renderIndexGrid();
    }
});
