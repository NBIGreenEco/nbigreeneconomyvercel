import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCfa827mvCLf1ETts6B_DmCfb7owTohBxk",
    authDomain: "nbi-green-economy.firebaseapp.com",
    projectId: "nbi-green-economy",
    storageBucket: "nbi-green-economy.firebasestorage.app",
    messagingSenderId: "53732340059",
    appId: "1:53732340059:web:3fb3f086c6662e1e9baa7e",
    measurementId: "G-37VRZ5CGE4"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}
const auth = getAuth(app);
const db = getFirestore(app);

let tempUserId = new URLSearchParams(window.location.search).get('tempUserId');
if (!tempUserId) {
    tempUserId = 'guest_' + Math.random().toString(36).substr(2, 9);
}

async function trackInteraction(category, action, label = "") {
    try {
        await addDoc(collection(db, 'interactions'), {
            tempUserId: tempUserId,
            category: category,
            action: action,
            label: label,
            timestamp: serverTimestamp(),
            language: i18next.language || 'en',
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Error logging interaction:", error);
    }
}

const scenarios = [
    {
        id: 1,
        textKey: 'gamified.scenario_1_text',
        textDefault: 'Your SMME needs funding to install solar panels. What’s the best first step?',
        options: [
            { textKey: 'gamified.scenario_1_option1', textDefault: 'Apply for a green energy grant', correct: true },
            { textKey: 'gamified.scenario_1_option2', textDefault: 'Take a high-interest loan', correct: false },
            { textKey: 'gamified.scenario_1_option3', textDefault: 'Ignore funding and use savings', correct: false },
            { textKey: 'gamified.scenario_1_option4', textDefault: 'Wait for government subsidies', correct: false }
        ],
        feedbackCorrect: 'Great choice! Applying for a green energy grant, like those listed in the Funding Hub, is a cost-effective way to secure funding. Visit the Funding Hub to filter for grants.',
        feedbackIncorrect: 'Not quite. High-interest loans or using savings can strain your finances. Instead, explore grants on the Funding Hub or consult with a green finance advisor.',
        badge: { nameKey: 'gamified.badge_funding_finder', nameDefault: 'Funding Finder', icon: 'fas fa-money-bill', descriptionKey: 'gamified.badge_funding_finder_desc', descriptionDefault: 'Awarded for securing green funding.' }
    },
    {
        id: 2,
        textKey: 'gamified.scenario_2_text',
        textDefault: 'Your SMME’s energy bills are high. How can you reduce costs?',
        options: [
            { textKey: 'gamified.scenario_2_option1', textDefault: 'Switch to energy-efficient lighting', correct: true },
            { textKey: 'gamified.scenario_2_option2', textDefault: 'Increase equipment runtime', correct: false },
            { textKey: 'gamified.scenario_2_option3', textDefault: 'Use outdated appliances', correct: false },
            { textKey: 'gamified.scenario_2_option4', textDefault: 'Ignore energy audits', correct: false }
        ],
        feedbackCorrect: 'Excellent! Energy-efficient lighting, like LEDs, can cut costs significantly. Check the Knowledge Hub for energy-saving tips.',
        feedbackIncorrect: 'Incorrect. Using outdated appliances or ignoring audits increases costs. Conduct an energy audit or consult the Knowledge Hub for efficiency guides.',
        badge: { nameKey: 'gamified.badge_energy_saver', nameDefault: 'Energy Saver', icon: 'fas fa-bolt', descriptionKey: 'gamified.badge_energy_saver_desc', descriptionDefault: 'Awarded for reducing energy costs.' }
    },
    {
        id: 3,
        textKey: 'gamified.scenario_3_text',
        textDefault: 'Your SMME produces excess waste. How can you manage it sustainably?',
        options: [
            { textKey: 'gamified.scenario_3_option1', textDefault: 'Implement a recycling program', correct: true },
            { textKey: 'gamified.scenario_3_option2', textDefault: 'Dispose all waste in landfills', correct: false },
            { textKey: 'gamified.scenario_3_option3', textDefault: 'Use single-use plastics', correct: false },
            { textKey: 'gamified.scenario_3_option4', textDefault: 'Burn waste on-site', correct: false }
        ],
        feedbackCorrect: 'Well done! A recycling program reduces waste and aligns with green practices. Visit the Knowledge Hub for waste management resources.',
        feedbackIncorrect: 'Not the best choice. Landfills and burning harm the environment. Partner with recycling facilities or check the Knowledge Hub for solutions.',
        badge: { nameKey: 'gamified.badge_waste_warrior', nameDefault: 'Waste Warrior', icon: 'fas fa-recycle', descriptionKey: 'gamified.badge_waste_warrior_desc', descriptionDefault: 'Awarded for sustainable waste management.' }
    },
    {
        id: 4,
        textKey: 'gamified.scenario_4_text',
        textDefault: 'Your SMME wants to access new markets. What’s the best approach?',
        options: [
            { textKey: 'gamified.scenario_4_option1', textDefault: 'Join a green economy network', correct: true },
            { textKey: 'gamified.scenario_4_option2', textDefault: 'Focus only on local clients', correct: false },
            { textKey: 'gamified.scenario_4_option3', textDefault: 'Avoid certifications', correct: false },
            { textKey: 'gamified.scenario_4_option4', textDefault: 'Ignore market trends', correct: false }
        ],
        feedbackCorrect: 'Great! Joining a green economy network, like the SAGE Network, connects you to markets and partners. Explore the Opportunities page for details.',
        feedbackIncorrect: 'Incorrect. Limiting to local clients or ignoring trends restricts growth. Join the SAGE Green Economy Network for market access.',
        badge: { nameKey: 'gamified.badge_market_maven', nameDefault: 'Market Maven', icon: 'fas fa-store', descriptionKey: 'gamified.badge_market_maven_desc', descriptionDefault: 'Awarded for accessing new markets.' }
    },
    {
        id: 5,
        textKey: 'gamified.scenario_5_text',
        textDefault: 'Your SMME needs skilled workers. How can you train your team?',
        options: [
            { textKey: 'gamified.scenario_5_option1', textDefault: 'Enroll in TVET green skills programs', correct: true },
            { textKey: 'gamified.scenario_5_option2', textDefault: 'Hire untrained staff', correct: false },
            { textKey: 'gamified.scenario_5_option3', textDefault: 'Skip training programs', correct: false },
            { textKey: 'gamified.scenario_5_option4', textDefault: 'Use outdated manuals', correct: false }
        ],
        feedbackCorrect: 'Nice work! TVET green skills programs provide relevant training. Check the Knowledge Hub for training opportunities.',
        feedbackIncorrect: 'Not ideal. Untrained staff or outdated resources hinder progress. Enroll in TVET programs via the Knowledge Hub.',
        badge: { nameKey: 'gamified.badge_skill_builder', nameDefault: 'Skill Builder', icon: 'fas fa-graduation-cap', descriptionKey: 'gamified.badge_skill_builder_desc', descriptionDefault: 'Awarded for investing in skills.' }
    },
    {
        id: 6,
        textKey: 'gamified.scenario_6_text',
        textDefault: 'Your SMME faces high water usage. How can you conserve water?',
        options: [
            { textKey: 'gamified.scenario_6_option1', textDefault: 'Install water-saving fixtures', correct: true },
            { textKey: 'gamified.scenario_6_option2', textDefault: 'Increase water-intensive processes', correct: false },
            { textKey: 'gamified.scenario_6_option3', textDefault: 'Ignore water audits', correct: false },
            { textKey: 'gamified.scenario_6_option4', textDefault: 'Use non-efficient equipment', correct: false }
        ],
        feedbackCorrect: 'Excellent choice! Water-saving fixtures reduce usage and costs. Explore water management resources on the Knowledge Hub.',
        feedbackIncorrect: 'Incorrect. Inefficient equipment or ignoring audits wastes water. Install water-saving fixtures and check the Knowledge Hub.',
        badge: { nameKey: 'gamified.badge_water_wise', nameDefault: 'Water Wise', icon: 'fas fa-tint', descriptionKey: 'gamified.badge_water_wise_desc', descriptionDefault: 'Awarded for water conservation.' }
    },
    {
        id: 7,
        textKey: 'gamified.scenario_7_text',
        textDefault: 'Your SMME wants to improve its green reputation. What should you do?',
        options: [
            { textKey: 'gamified.scenario_7_option1', textDefault: 'Obtain a green certification', correct: true },
            { textKey: 'gamified.scenario_7_option2', textDefault: 'Ignore sustainability reports', correct: false },
            { textKey: 'gamified.scenario_7_option3', textDefault: 'Avoid eco-friendly practices', correct: false },
            { textKey: 'gamified.scenario_7_option4', textDefault: 'Hide environmental impact', correct: false }
        ],
        feedbackCorrect: 'Well done! Green certifications boost credibility. Visit the Funding Hub for certification programs.',
        feedbackIncorrect: 'Not the best approach. Avoiding green practices harms reputation. Pursue certifications listed on the Funding Hub.',
        badge: { nameKey: 'gamified.badge_eco_champion', nameDefault: 'Eco Champion', icon: 'fas fa-leaf', descriptionKey: 'gamified.badge_eco_champion_desc', descriptionDefault: 'Awarded for building a green reputation.' }
    },
    {
        id: 8,
        textKey: 'gamified.scenario_8_text',
        textDefault: 'Your SMME needs to comply with environmental regulations. What’s the first step?',
        options: [
            { textKey: 'gamified.scenario_8_option1', textDefault: 'Review compliance guidelines', correct: true },
            { textKey: 'gamified.scenario_8_option2', textDefault: 'Ignore regulatory updates', correct: false },
            { textKey: 'gamified.scenario_8_option3', textDefault: 'Operate without permits', correct: false },
            { textKey: 'gamified.scenario_8_option4', textDefault: 'Skip audits', correct: false }
        ],
        feedbackCorrect: 'Great! Reviewing compliance guidelines ensures adherence. Check the Legal & Compliance section for details.',
        feedbackIncorrect: 'Incorrect. Ignoring regulations risks penalties. Review guidelines in the Legal & Compliance section.',
        badge: { nameKey: 'gamified.badge_compliance_pro', nameDefault: 'Compliance Pro', icon: 'fas fa-gavel', descriptionKey: 'gamified.badge_compliance_pro_desc', descriptionDefault: 'Awarded for regulatory compliance.' }
    },
    {
        id: 9,
        textKey: 'gamified.scenario_9_text',
        textDefault: 'Your SMME wants to engage the community. How can you start?',
        options: [
            { textKey: 'gamified.scenario_9_option1', textDefault: 'Host a sustainability workshop', correct: true },
            { textKey: 'gamified.scenario_9_option2', textDefault: 'Limit community involvement', correct: false },
            { textKey: 'gamified.scenario_9_option3', textDefault: 'Avoid local partnerships', correct: false },
            { textKey: 'gamified.scenario_9_option4', textDefault: 'Ignore social impact', correct: false }
        ],
        feedbackCorrect: 'Awesome! Workshops build community ties. Find event ideas on the Opportunities page.',
        feedbackIncorrect: 'Not ideal. Limiting engagement misses opportunities. Host workshops or explore the Opportunities page.',
        badge: { nameKey: 'gamified.badge_community_leader', nameDefault: 'Community Leader', icon: 'fas fa-users', descriptionKey: 'gamified.badge_community_leader_desc', descriptionDefault: 'Awarded for community engagement.' }
    },
    {
        id: 10,
        textKey: 'gamified.scenario_10_text',
        textDefault: 'Your SMME wants to adopt renewable energy. What’s the best option?',
        options: [
            { textKey: 'gamified.scenario_10_option1', textDefault: 'Install solar panels', correct: true },
            { textKey: 'gamified.scenario_10_option2', textDefault: 'Rely on fossil fuels', correct: false },
            { textKey: 'gamified.scenario_10_option3', textDefault: 'Increase energy consumption', correct: false },
            { textKey: 'gamified.scenario_10_option4', textDefault: 'Avoid renewable options', correct: false }
        ],
        feedbackCorrect: 'Excellent! Solar panels reduce costs and emissions. Explore funding for renewables on the Funding Hub.',
        feedbackIncorrect: 'Incorrect. Fossil fuels harm the environment. Install solar panels and check Funding Hub for support.',
        badge: { nameKey: 'gamified.badge_renewable_expert', nameDefault: 'Renewable Expert', icon: 'fas fa-solar-panel', descriptionKey: 'gamified.badge_renewable_expert_desc', descriptionDefault: 'Awarded for adopting renewable energy.' }
    }
];

const rewards = [
    {
        id: 1,
        nameKey: 'gamified.reward_1_name',
        nameDefault: 'Green Funding Guide',
        descriptionKey: 'gamified.reward_1_desc',
        descriptionDefault: 'Downloadable guide on securing green funding.',
        unlockedAtLevel: 2,
        action: () => {
            trackInteraction('reward', 'claim', 'Green Funding Guide');
            alert('Downloading Green Funding Guide (placeholder).');
        }
    },
    {
        id: 2,
        nameKey: 'gamified.reward_2_name',
        nameDefault: 'Advanced Funding Filters',
        descriptionKey: 'gamified.reward_2_desc',
        descriptionDefault: 'Unlock advanced filters in the Funding Hub.',
        unlockedAtLevel: 3,
        action: () => {
            trackInteraction('reward', 'claim', 'Advanced Funding Filters');
            window.location.href = '/funding-hub?filters=advanced';
        }
    },
    {
        id: 3,
        nameKey: 'gamified.reward_3_name',
        nameDefault: 'Sustainability Checklist',
        descriptionKey: 'gamified.reward_3_desc',
        descriptionDefault: 'Downloadable checklist for green compliance.',
        unlockedAtLevel: 3,
        action: () => {
            trackInteraction('reward', 'claim', 'Sustainability Checklist');
            alert('Downloading Sustainability Checklist (placeholder).');
        }
    }
];

async function loadUserProgress(userId) {
    if (!userId) return { level: 1, completedScenarios: [], badges: [] };
    try {
        const userDoc = await getDoc(doc(db, 'game_progress', userId));
        return userDoc.exists() ? userDoc.data() : { level: 1, completedScenarios: [], badges: [] };
    } catch (error) {
        console.error("Error loading user progress:", error);
        await trackInteraction('game', 'error', `Load progress: ${error.message}`);
        return { level: 1, completedScenarios: [], badges: [] };
    }
}

async function saveUserProgress(userId, progress) {
    if (!userId) return;
    try {
        await setDoc(doc(db, 'game_progress', userId), {
            tempUserId: tempUserId,
            userId: userId,
            ...progress,
            updatedAt: serverTimestamp()
        }, { merge: true });
        await trackInteraction('game', 'progress_saved', `Level ${progress.level}`);
    } catch (error) {
        console.error("Error saving user progress:", error);
        await trackInteraction('game', 'error', `Save progress: ${error.message}`);
    }
}

function updateProgressUI(progress) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const percentage = Math.min((progress.completedScenarios.length / 10) * 100, 100);
    progressBar.style.width = `${percentage}%`;
    const level = progress.level === 1 ? 'Beginner' : progress.level === 2 ? 'Intermediate' : 'Expert';
    progressText.textContent = i18next.t('gamified.progress_text', { defaultValue: `Level ${progress.level}: ${level}` });
}

function updateBadgesUI(badges) {
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = badges.length === 0 ? `<p class="text-gray-600" data-i18n="gamified.no_badges">No badges earned yet.</p>` : '';
    badges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'flex items-center p-2 bg-gray-100 rounded-md animate-badge-unlock';
        badgeElement.innerHTML = `
            <i class="${badge.icon} text-2xl text-green-primary mr-2"></i>
            <div>
                <p class="font-semibold">${i18next.t(badge.nameKey, { defaultValue: badge.nameDefault })}</p>
                <p class="text-sm text-gray-600">${i18next.t(badge.descriptionKey, { defaultValue: badge.descriptionDefault })}</p>
            </div>
        `;
        badgesContainer.appendChild(badgeElement);
    });
}

function updateRewardsUI(progress) {
    const rewardsContainer = document.getElementById('rewards-container');
    rewardsContainer.innerHTML = '';
    rewards.forEach(reward => {
        const isUnlocked = progress.level >= reward.unlockedAtLevel;
        const rewardElement = document.createElement('div');
        rewardElement.className = `p-2 bg-gray-100 rounded-md ${isUnlocked ? '' : 'opacity-50'}`;
        rewardElement.innerHTML = `
            <p class="font-semibold">${i18next.t(reward.nameKey, { defaultValue: reward.nameDefault })}</p>
            <p class="text-sm text-gray-600">${i18next.t(reward.descriptionKey, { defaultValue: reward.descriptionDefault })}</p>
            ${isUnlocked ? `<button class="mt-2 text-green-primary hover:underline claim-reward-btn" data-reward-id="${reward.id}" data-i18n="gamified.claim_reward">Claim Reward</button>` : `<p class="text-sm text-gray-600" data-i18n="gamified.locked_reward">Unlock at Level ${reward.unlockedAtLevel}</p>`}
        `;
        rewardsContainer.appendChild(rewardElement);
    });
    document.querySelectorAll('.claim-reward-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const rewardId = parseInt(btn.getAttribute('data-reward-id'));
            const reward = rewards.find(r => r.id === rewardId);
            if (reward) reward.action();
        });
    });
}

function renderScenario(scenario) {
    const challengeText = document.getElementById('challenge-text');
    const challengeOptions = document.getElementById('challenge-options');
    const submitButton = document.getElementById('submit-answer');
    const nextButton = document.getElementById('next-challenge');
    const feedbackMessage = document.getElementById('feedback-message');
    const scenarioFeedback = document.getElementById('scenario-feedback');

    challengeText.textContent = i18next.t(scenario.textKey, { defaultValue: scenario.textDefault });
    challengeOptions.innerHTML = '';
    scenario.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'flex items-center';
        optionElement.innerHTML = `
            <input type="radio" name="scenario-option" id="option-${index}" value="${index}" class="mr-2">
            <label for="option-${index}" class="text-gray-700">${i18next.t(option.textKey, { defaultValue: option.textDefault })}</label>
        `;
        challengeOptions.appendChild(optionElement);
    });
    submitButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    feedbackMessage.classList.add('hidden');
    scenarioFeedback.classList.add('hidden');
}

async function handleAnswerSubmission(scenario, progress, userId) {
    const selectedOption = document.querySelector('input[name="scenario-option"]:checked');
    const feedbackMessage = document.getElementById('feedback-message');
    const scenarioFeedback = document.getElementById('scenario-feedback');
    const submitButton = document.getElementById('submit-answer');
    const nextButton = document.getElementById('next-challenge');

    if (!selectedOption) {
        feedbackMessage.textContent = i18next.t('gamified.no_selection', { defaultValue: 'Please select an option.' });
        feedbackMessage.className = 'text-center text-lg font-medium text-red-600';
        feedbackMessage.classList.remove('hidden');
        return;
    }

    const optionIndex = parseInt(selectedOption.value);
    const isCorrect = scenario.options[optionIndex].correct;
    feedbackMessage.textContent = i18next.t(isCorrect ? 'gamified.correct' : 'gamified.incorrect', {
        defaultValue: isCorrect ? 'Correct!' : 'Incorrect.'
    });
    feedbackMessage.className = `text-center text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`;
    feedbackMessage.classList.remove('hidden');
    scenarioFeedback.textContent = isCorrect ? scenario.feedbackCorrect : scenario.feedbackIncorrect;
    scenarioFeedback.classList.remove('hidden');
    submitButton.classList.add('hidden');
    nextButton.classList.remove('hidden');

    if (isCorrect && !progress.completedScenarios.includes(scenario.id)) {
        progress.completedScenarios.push(scenario.id);
        progress.badges.push(scenario.badge);
        progress.level = progress.completedScenarios.length >= 8 ? 3 : progress.completedScenarios.length >= 4 ? 2 : 1;
        await saveUserProgress(userId, progress);
        updateProgressUI(progress);
        updateBadgesUI(progress.badges);
        updateRewardsUI(progress);
        await trackInteraction('game', 'scenario_completed', `Scenario ${scenario.id}`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    let currentScenarioIndex = 0;
    let progress = { level: 1, completedScenarios: [], badges: [] };
    let userId = null;

    onAuthStateChanged(auth, async (user) => {
        userId = user ? user.uid : tempUserId;
        progress = await loadUserProgress(userId);
        updateProgressUI(progress);
        updateBadgesUI(progress.badges);
        updateRewardsUI(progress);
        renderScenario(scenarios[currentScenarioIndex]);
    });

    document.getElementById('submit-answer').addEventListener('click', () => {
        handleAnswerSubmission(scenarios[currentScenarioIndex], progress, userId);
    });

    document.getElementById('next-challenge').addEventListener('click', () => {
        currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
        renderScenario(scenarios[currentScenarioIndex]);
    });
});