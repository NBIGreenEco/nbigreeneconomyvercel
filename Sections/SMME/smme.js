
// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAIlr8Y249Yu_1JPbUjNX7cQtJYlkbV3eY",
    authDomain: "nbi-database.firebaseapp.com",
    projectId: "nbi-database",
    storageBucket: "nbi-database.appspot.com",
    messagingSenderId: "497517200595",
    appId: "1:497517200595:web:c862996d49fba97baf8026",
    measurementId: "G-NHZB2WJF9L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables
let currentFilters = { search: "", certification: "", location: "", program: "", persona: "", language: "en" };
let displayedBusinesses = 4;
let pipeline = null;
let chatMessages = [];

// Translations
const translations = {
    en: {
        "hero-title": "Green Business Directory",
        "hero-subtitle": "Connect with verified businesses that prioritize sustainability and environmental responsibility.",
        "search-title": "AI-Enhanced Business Discovery",
        "search-placeholder": "Search green businesses by name, service, or certification...",
        "categories-title": "Business Categories",
        "businesses-title": "Featured Green Businesses",
        "ai-assistant-title": "AI Business Finder",
        "ai-welcome": "Hello! I can help you find green businesses in your area. What type of sustainable business are you looking for?",
        "ai-input-placeholder": "Ask about green businesses...",
        "ai-suggestions-title": "🤖 AI Recommendations Based on Your Search:",
        "ai-error": "Sorry, I encountered an error. Please try again.",
        "ai-fallback": "What type of green business are you looking for? Try mentioning solar, waste, farm, water, or construction!"
    },
    zu: {
        "hero-title": "Uhlu Lwamabhizinisi Aluhlaza",
        "hero-subtitle": "Xhumana namabhizinisi aqinisekisiwe agxile ekusimameni nasekuzinakekeleni kwemvelo.",
        "search-title": "Ukutholwa Kwamabhizinisi Nge-AI",
        "search-placeholder": "Sesha amabhizinisi aluhlaza ngegama, insizakalo, noma isitifiketi...",
        "categories-title": "Izigaba Zamabhizinisi",
        "businesses-title": "Amabhizinisi Aluhlaza Akhethekile",
        "ai-assistant-title": "Umsizi Wokuthola Amabhizinisi Nge-AI",
        "ai-welcome": "Sawubona! Ngingakusiza ukuthola amabhizinisi aluhlaza endaweni yakho. Ulufuna luluphi uhlobo lwebhizinisi olusimeme?",
        "ai-input-placeholder": "Buza mayelana namabhizinisi aluhlaza...",
        "ai-suggestions-title": "🤖 Izincomo ze-AI Ezisekelwe Ekusesheni Kwakho:",
        "ai-error": "Uxolo, ngihlangabezane nenkinga. Sicela uzame futhi.",
        "ai-fallback": "Ulufuna luluphi uhlobo lwebhizinisi eliluhlaza? Zama ukusho i-solar, waste, farm, water, noma construction!"
    },
    tn: {
        "hero-title": "Lenaane la Dikgwebo tse Tala",
        "hero-subtitle": "Gokagana le dikgwebo tse di netefaditsweng tse di tsepamisitseng maikutlo mo go tsweleng pele le boikarabelo jwa tikologo.",
        "search-title": "Go Tsholwa ga Dikgwebo ka AI",
        "search-placeholder": "Batla dikgwebo tse tala ka leina, tiriso, kgotsa setifikeiti...",
        "categories-title": "Dikgato tsa Dikgwebo",
        "businesses-title": "Dikgwebo tse Tala tse di Tlhophilweng",
        "ai-assistant-title": "Mothusi wa go Tshola Dikgwebo ka AI",
        "ai-welcome": "Dumela! Ke ka go thusa go bona dikgwebo tse tala mo kgaolong ya gago. O batla kgwebo e e tswelang pele ya mofuta ofe?",
        "ai-input-placeholder": "Botsa ka dikgwebo tse tala...",
        "ai-suggestions-title": "🤖 Ditlhagiso tsa AI tse di Theilweng mo go Batsweng ga Gago:",
        "ai-error": "Tshwarelo, ke kopane le phoso. Tsweetswee leka gape.",
        "ai-fallback": "O batla kgwebo ya mofuta ofe e e tala? Leka go bolela solar, waste, farm, water, kgotsa construction!"
    }
};

// Mock business data
const businessesData = [
    {
        id: "green-solar",
        name: "Green Solar Solutions",
        description: {
            en: "Professional solar panel installation and maintenance services for residential and commercial properties. Certified B-BBEE Level 1 contractor with ISO 14001 environmental management certification. Specializes in community-based renewable energy projects.",
            zu: "Izinsizakalo zokufaka kanye nokulungisa amaphaneli elanga kwezindawo zokuhlala nezohwebo. Isikontraka se-B-BBEE Level 1 esiqinisekisiwe nge-ISO 14001 yezokulawulwa kwemvelo. Igxile emaphrojekthini kagesi avuselelekayo asuselwe emphakathini.",
            tn: "Ditirelo tsa go tsenya le go hlokomela diphanele tsa letsatsi tsa magae le tsa kgwebo. Mokonteraka wa B-BBEE Level 1 yo o netefaditsweng ka ISO 14001 ya taolo ya tikologo. E ikgethe ka diporojeke tsa matla a a ka dirisiwang gape a a theilweng mo setšhabeng."
        },
        certifications: ["iso14001", "bbbee", "green-certified"],
        location: "western-cape",
        programCompletion: 92,
        persona: "township-irm",
        category: "solar-energy",
        rating: 4.8,
        reviews: 127,
        tags: ["Solar Energy", "Community Projects", "Skills Development"]
    },
    {
        id: "ecotrails",
        name: "EcoTrails Adventures",
        description: {
            en: "Responsible eco-tourism operator offering sustainable wildlife tours, hiking expeditions, and educational nature experiences while supporting local conservation efforts.",
            zu: "Umlawuli wokuvakasha okunakekela imvelo ohlinzeka ngezokuvakasha zezilwane zasendle ezizinzile, uhambo lokugibela izintaba, kanye nolwazi lwemvelo olufundisayo ngenkathi esekela imizamo yendawo yokulondolozwa.",
            tn: "Motsamaisi wa bojanala jwa tikologo yo o ikarabelang yo o nayang bojanala jwa diphoofolo tse di tswelang pele, maeto a go tsamaea ka dinao, le maitemogelo a tikologo a a rutang fa a ntse a tshegetsa maiteko a selegae a paballo."
        },
        certifications: ["fair-trade", "bbbee"],
        location: "mpumalanga",
        programCompletion: 85,
        persona: "community",
        category: "eco-tourism",
        rating: 4.8,
        reviews: 95,
        tags: ["Eco Tourism", "Fair Trade Tourism", "B-BBEE Level 1"]
    }
];

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, waiting for authentication and custom elements...");
    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.log("No user logged in, redirecting to sign-in...");
            showLoader();
            window.location.href = '../Sign In & Sign Up/SignIn.html';
            return;
        }
        console.log("User authenticated:", user.uid);
        Promise.all([
            customElements.whenDefined("green-economy-header").catch(() => console.warn("Header not defined")),
            customElements.whenDefined("green-economy-footer").catch(() => console.warn("Footer not defined"))
        ]).then(() => {
            console.log("Custom elements loaded, initializing SMME page...");
            initializePage();
        }).catch((error) => {
            console.error("Error with custom elements:", error);
            setTimeout(() => {
                console.log("Fallback initialization triggered");
                initializePage();
            }, 1000);
        });
    });
});

// Initialize Transformers.js pipeline
async function initModel() {
    try {
        console.log("Checking for Transformers.js...");
        let attempts = 0;
        const maxAttempts = 3;
        while (typeof transformers === 'undefined' && attempts < maxAttempts) {
            console.warn(`Transformers.js not available. Waiting for script to load (attempt ${attempts + 1}/${maxAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            attempts++;
        }
        if (typeof transformers === 'undefined') {
            console.warn("Local Transformers.js failed, attempting CDN fallback...");
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
            script.onload = () => console.log("CDN Transformers.js loaded");
            script.onerror = () => console.error("CDN Transformers.js failed to load");
            document.head.appendChild(script);
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (typeof transformers === 'undefined') {
                throw new Error('Transformers.js not available after waiting');
            }
        }

        console.log("Initializing AI pipeline...");
        pipeline = await transformers.pipeline(
            'text-classification',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            {
                progress_callback: (progress) => {
                    console.log(`Model loading progress: ${Math.round(progress * 100)}%`);
                }
            }
        );
        console.log("AI pipeline initialized successfully");
        return true;
    } catch (error) {
        console.error("Error loading AI pipeline:", error);
        pipeline = null;
        displayErrorMessage(translations[currentFilters.language]["ai-error"]);
        return false;
    }
}

// Show/hide loader
function showLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loader && loaderOverlay) {
        loader.style.display = 'block';
        loaderOverlay.style.display = 'block';
    } else {
        console.warn("Loader elements not found in DOM");
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loader && loaderOverlay) {
        loader.style.display = 'none';
        loaderOverlay.style.display = 'none';
    }
}

// Display error message
function displayErrorMessage(message) {
    const businessesGrid = document.getElementById("businessesGrid");
    if (!businessesGrid) {
        console.warn("Cannot display error message: Businesses grid not found");
        return;
    }
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    businessesGrid.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Track user interactions
function trackUserInteraction(category, action, label = "") {
    const user = auth.currentUser;
    if (user) {
        db.collection('interactions').add({
            userId: user.uid,
            category: category,
            action: action,
            label: label,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            filters: currentFilters,
            userLanguage: currentFilters.language,
            userAgent: navigator.userAgent
        }).catch((error) => {
            console.error("Error logging interaction to Firestore:", error);
        });
    } else {
        console.log("No user logged in, interaction tracked locally:", { category, action, label, filters: currentFilters });
    }
}

// Update UI language
function updateLanguageInterface(language) {
    currentFilters.language = language;
    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    const placeholders = document.querySelectorAll("[data-translate-placeholder]");
    placeholders.forEach(element => {
        const key = element.getAttribute("data-translate-placeholder");
        if (translations[language] && translations[language][key]) {
            element.placeholder = translations[language][key];
        }
    });
    renderBusinesses();
    trackUserInteraction("smme_directory", "language_changed", language);
}

// Debounced perform search
let searchTimeout;
function performSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const query = document.getElementById("businessSearch").value;
        currentFilters.search = query;
        if (query.length > 2) {
            await generateAISuggestions(query);
            filterBusinesses();
            trackUserInteraction("smme_search", "query_submitted", query);
        }
    }, 300);
}

// Generate AI suggestions
async function generateAISuggestions(query) {
    const suggestionsContainer = document.querySelector(".suggestion-chips");
    if (!suggestionsContainer) {
        console.warn("Suggestions container not found");
        return;
    }
    const mockSuggestions = {
        solar: ["Solar Installation Services", "Solar Panel Maintenance", "Renewable Energy Consulting"],
        waste: ["Waste Management Solutions", "Recycling Services", "Circular Economy Consultants"],
        farm: ["Organic Farming Co-ops", "Sustainable Agriculture", "Permaculture Training"],
        water: ["Water Conservation Systems", "Rainwater Harvesting", "Greywater Treatment"],
        construction: ["Green Building Materials", "Sustainable Construction", "LEED Certified Builders"]
    };

    suggestionsContainer.innerHTML = "";
    if (!pipeline) {
        const matched = Object.keys(mockSuggestions).find(key => query.toLowerCase().includes(key));
        if (matched) {
            suggestionsContainer.innerHTML = mockSuggestions[matched].map(s =>
                `<span class="suggestion-chip" onclick="applySuggestion('${s.toLowerCase().replace(/\s+/g, '-')}')">${s}</span>`
            ).join("");
        }
        return;
    }

    try {
        const result = await pipeline(query);
        const score = result[0].score;
        const label = result[0].label;
        const keywords = ["solar", "waste", "farm", "water", "construction"];
        const matchedKeyword = keywords.find(k => query.toLowerCase().includes(k));

        if (matchedKeyword && label === "POSITIVE" && score > 0.7) {
            suggestionsContainer.innerHTML = mockSuggestions[matchedKeyword].map(s =>
                `<span class="suggestion-chip" onclick="applySuggestion('${s.toLowerCase().replace(/\s+/g, '-')}')">${s}</span>`
            ).join("");
        }
    } catch (error) {
        console.error("Error generating AI suggestions:", error);
        displayErrorMessage(translations[currentFilters.language]["ai-error"]);
    }
}

// Apply AI suggestion
function applySuggestion(suggestion) {
    const searchInput = document.getElementById("businessSearch");
    if (searchInput) {
        searchInput.value = suggestion.replace(/-/g, " ");
        performSearch();
        trackUserInteraction("smme_search", "ai_suggestion_applied", suggestion);
    }
}

// Filter businesses
function filterBusinesses() {
    renderBusinesses();
}

// Render businesses
function renderBusinesses() {
    const businessesGrid = document.getElementById("businessesGrid");
    if (!businessesGrid) {
        console.warn("Businesses grid not found");
        return;
    }
    const filteredBusinesses = businessesData.filter(business => {
        let visible = true;

        if (currentFilters.search &&
            !business.name.toLowerCase().includes(currentFilters.search.toLowerCase()) &&
            !business.description[currentFilters.language].toLowerCase().includes(currentFilters.search.toLowerCase()) &&
            !business.tags.some(tag => tag.toLowerCase().includes(currentFilters.search.toLowerCase()))) {
            visible = false;
        }

        if (currentFilters.certification && !business.certifications.includes(currentFilters.certification)) {
            visible = false;
        }

        if (currentFilters.location && business.location !== currentFilters.location) {
            visible = false;
        }

        if (currentFilters.program) {
            const completion = business.programCompletion;
            if (currentFilters.program === "beginner" && (completion < 0 || completion > 25)) visible = false;
            if (currentFilters.program === "intermediate" && (completion < 26 || completion > 50)) visible = false;
            if (currentFilters.program === "advanced" && (completion < 51 || completion > 75)) visible = false;
            if (currentFilters.program === "expert" && (completion < 76 || completion > 100)) visible = false;
        }

        if (currentFilters.persona && business.persona !== currentFilters.persona) {
            visible = false;
        }

        return visible;
    }).slice(0, displayedBusinesses);

    businessesGrid.innerHTML = filteredBusinesses.length === 0 ?
        `<p style="text-align: center; color: #666;">No businesses match your filters.</p>` :
        filteredBusinesses.map(business => `
            <div class="business-card" data-persona="${business.persona}" data-certification="${business.certifications.join(',')}">
                <div class="verified-badge">✓ Verified</div>
                <div class="business-header">
                    <div class="business-logo">${business.name.slice(0, 2).toUpperCase()}</div>
                    <div class="business-metrics">
                        <div class="business-rating"><span class="star">★</span><span>${business.rating}</span><span style="margin-left: 0.5rem; color: var(--muted-foreground)">(${business.reviews} reviews)</span></div>
                        <div class="completion-score">Program: ${business.programCompletion}% Complete</div>
                        <div class="program-progress"><div class="progress-bar" style="width: ${business.programCompletion}%"></div></div>
                    </div>
                </div>
                <h3 class="business-title">${business.name}</h3>
                <p class="business-description">${business.description[currentFilters.language]}</p>
                <div class="certifications">${business.certifications.map(cert =>
                    `<span class="cert-badge ${cert}">${
                        cert === "iso14001" ? "🏆 ISO 14001" :
                        cert === "bbbee" ? "🎯 B-BBEE L1" :
                        cert === "green-certified" ? "🌱 Green Certified" : "✓ Fair Trade"
                    }</span>`
                ).join("")}</div>
                <div class="business-location">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>${business.location.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--green-primary)">
                        ${business.persona.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                </div>
                <div class="business-tags">${business.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
                <div class="business-actions">
                    <button class="btn btn-primary" onclick="viewBusinessDetails('${business.id}')">View Profile</button>
                    <button class="btn btn-secondary" onclick="contactBusiness('${business.id}')">Connect</button>
                </div>
            </div>
        `).join("");

    const loadMoreButton = document.getElementById("loadMoreBusinesses");
    if (loadMoreButton) {
        loadMoreButton.style.display = filteredBusinesses.length < businessesData.length ? "inline-block" : "none";
    }
}

// Category filter
function filterByCategory(category) {
    const searchInput = document.getElementById("businessSearch");
    if (searchInput) {
        searchInput.value = category.replace(/-/g, " ");
        currentFilters.search = category;
        performSearch();
        trackUserInteraction("smme_directory", "category_selected", category);
    }
}

// View business details
function viewBusinessDetails(businessId) {
    const business = businessesData.find(b => b.id === businessId);
    if (business) {
        const description = business.description[currentFilters.language];
        alert(`Business Profile:\n\nName: ${business.name}\nProgram Completion: ${business.programCompletion}%\nCertifications: ${business.certifications.join(", ")}\nTarget Persona: ${business.persona}\nCategory: ${business.category}\nLocation: ${business.location}\nDescription: ${description}\n\nIn a real app, this would be a dynamic profile page.`);
        trackUserInteraction("smme_directory", "business_profile_viewed", businessId);
    }
}

// Contact business
function contactBusiness(businessId) {
    trackUserInteraction("smme_directory", "business_contact_initiated", businessId);
    alert(`Connecting with ${businessId}. In a real app, this would open a multilingual contact form.`);
}

// Load more businesses
function loadMoreBusinesses() {
    displayedBusinesses += 4;
    renderBusinesses();
    trackUserInteraction("smme_directory", "load_more_clicked");
}

// AI assistant functions
function openAIAssistant() {
    const modal = document.getElementById("aiModal");
    if (modal) {
        modal.style.display = "flex";
        console.log("AI assistant modal opened");
        trackUserInteraction("ai_assistant", "opened");
    }
}

function closeAIAssistant() {
    const modal = document.getElementById("aiModal");
    if (modal) {
        modal.style.display = "none";
        console.log("AI assistant modal closed");
        trackUserInteraction("ai_assistant", "closed");
    }
}

async function sendMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";
    showLoader();
    trackUserInteraction("ai_chat", "message_sent", message);

    try {
        const aiResponse = await generateBusinessResponse(message);
        addMessage(aiResponse, "ai");
    } catch (error) {
        addMessage(translations[currentFilters.language]["ai-error"], "ai");
    } finally {
        hideLoader();
    }
}

// Generate AI response
async function generateBusinessResponse(userMessage) {
    const mockResponses = {
        en: [
            "I found solar energy businesses like Green Solar Solutions with high ratings.",
            "EcoRecycle Innovations offers waste management solutions.",
            "Organic Fresh Farms provides sustainable produce.",
            "GreenBuild Construction specializes in sustainable building.",
            "AquaWise Systems offers water conservation.",
            "What province are you in? I can suggest businesses there."
        ],
        zu: [
            "Ngithole amabhizinisi kagesi elanga njenge-Green Solar Solutions anezinga eliphezulu.",
            "I-EcoRecycle Innovations inikeza izixazululo zokulawula imfucuza.",
            "I-Organic Fresh Farms inikeza imikhiqizo eluhlaza.",
            "I-GreenBuild Construction igxile ekwakheni okuzinzile.",
            "I-AquaWise Systems inikeza ukulondolozwa kwamanzi.",
            "Yisiphi isifundazwe osesiphi? Ngingakusiza khona."
        ],
        tn: [
            "Ke hweditše dikgwebo tša matla a solar tša kang Green Solar Solutions tše di nang le maemo a godimo.",
            "EcoRecycle Innovations e fana ka ditharollo tša taolo ya matlakala.",
            "Organic Fresh Farms e fana ka dijalo tše di tšwela pele.",
            "GreenBuild Construction e ikanetse mo go ahweng ka tsela e e tšwela pele.",
            "AquaWise Systems e fana ka paballo ya metsí.",
            "O mo profenseng mang? Ke ka go thuša moo."
        ]
    };

    if (!pipeline) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponses[currentFilters.language][Math.floor(Math.random() * mockResponses[currentFilters.language].length)];
    }

    try {
        const result = await pipeline(userMessage);
        const score = result[0].score;
        const label = result[0].label;
        const keywords = ["solar", "waste", "farm", "water", "construction"];
        const matchedKeyword = keywords.find(k => userMessage.toLowerCase().includes(k));

        if (matchedKeyword && label === "POSITIVE" && score > 0.7) {
            const business = businessesData.find(b => b.category.includes(matchedKeyword));
            return business ?
                `I recommend ${business.name} for ${matchedKeyword} services. ${business.description[currentFilters.language]}` :
                `I found businesses for ${matchedKeyword}. Try ${
                    matchedKeyword === 'solar' ? 'Green Solar Solutions' :
                    matchedKeyword === 'waste' ? 'EcoRecycle Innovations' :
                    matchedKeyword === 'farm' ? 'Organic Fresh Farms' :
                    matchedKeyword === 'water' ? 'AquaWise Systems' : 'GreenBuild Construction'
                }.`;
        }
        return translations[currentFilters.language]["ai-fallback"];
    } catch (error) {
        console.error("Error in AI response:", error);
        return translations[currentFilters.language]["ai-error"];
    }
}

// Add message to chat
function addMessage(content, sender) {
    const messagesContainer = document.getElementById("chatMessages");
    if (!messagesContainer) {
        console.warn("Chat messages container not found");
        return;
    }
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    chatMessages.push({ content, sender, timestamp: new Date() });
}

// Rank businesses
function rankBusinesses() {
    const businesses = businessesData.slice().sort((a, b) => {
        const scoreA = a.programCompletion;
        const scoreB = b.programCompletion;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.rating - a.rating;
    });
    businessesData.splice(0, businessesData.length, ...businesses);
    renderBusinesses();
    trackUserInteraction("smme_directory", "businesses_ranked");
}

// Initialize filters
function initializeFilters() {
    const filters = ["certificationFilter", "locationFilter", "programFilter", "personaFilter", "languageFilter"];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.removeEventListener("change", handleFilterChange);
            element.addEventListener("change", handleFilterChange);
            console.log(`Attached change listener to ${id}`);
        } else {
            console.warn(`Filter element ${id} not found`);
        }
    });
}

function handleFilterChange(e) {
    const id = e.target.id.replace("Filter", "");
    currentFilters[id] = e.target.value;
    if (id === "language") updateLanguageInterface(e.target.value);
    filterBusinesses();
    trackUserInteraction("smme_directory", `filter_${id}_changed`, e.target.value);
}

// Initialize category cards
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll(".category-card");
    console.log("Found category cards:", categoryCards.length);
    if (categoryCards.length === 0) {
        console.warn("No category cards found. Check HTML class '.category-card'.");
        setTimeout(initializeCategoryCards, 2000);
        return;
    }
    categoryCards.forEach((card, index) => {
        card.removeEventListener("click", handleCategoryClick);
        card.addEventListener("click", handleCategoryClick);
        console.log(`Attached click listener to category card ${index}: ${card.getAttribute("data-category")}`);
    });
}

function handleCategoryClick() {
    const category = this.getAttribute("data-category");
    filterByCategory(category);
}

// Initialize page
async function initializePage() {
    showLoader();
    try {
        const aiReady = await initModel();
        if (!aiReady) {
            console.warn("Proceeding without AI capabilities");
            const aiSuggestions = document.getElementById('aiSuggestions');
            if (aiSuggestions) aiSuggestions.style.display = 'none';
        }

        initializeFilters();
        initializeCategoryCards();
        rankBusinesses();
        generateAISuggestions("");
        updateLanguageInterface("en");
        setupEventListeners();
        trackUserInteraction("smme_directory", "page_loaded");
    } catch (error) {
        console.error("Initialization error:", error);
        displayErrorMessage("Failed to initialize page. Some features may be unavailable.");
    } finally {
        hideLoader();
    }
}

// Setup event listeners
function setupEventListeners() {
    const businessSearch = document.getElementById("businessSearch");
    if (businessSearch) {
        businessSearch.removeEventListener("keypress", handleSearchKeypress);
        businessSearch.addEventListener("keypress", handleSearchKeypress);
        businessSearch.removeEventListener("input", handleSearchInput);
        businessSearch.addEventListener("input", handleSearchInput);
        console.log("Attached listeners to business search input");
    }

    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.removeEventListener("keypress", handleChatKeypress);
        chatInput.addEventListener("keypress", handleChatKeypress);
        console.log("Attached listener to chat input");
    }

    const aiAssistantBtn = document.getElementById("aiAssistantBtn");
    if (aiAssistantBtn) {
        aiAssistantBtn.removeEventListener("click", openAIAssistant);
        aiAssistantBtn.addEventListener("click", openAIAssistant);
        console.log("Attached listener to AI assistant button");
    }

    const modalClose = document.getElementById("modalClose");
    if (modalClose) {
        modalClose.removeEventListener("click", closeAIAssistant);
        modalClose.addEventListener("click", closeAIAssistant);
        console.log("Attached listener to modal close button");
    }

    const chatSend = document.getElementById("chatSend");
    if (chatSend) {
        chatSend.removeEventListener("click", sendMessage);
        chatSend.addEventListener("click", sendMessage);
        console.log("Attached listener to chat send button");
    }

    const loadMoreButton = document.getElementById("loadMoreBusinesses");
    if (loadMoreButton) {
        loadMoreButton.removeEventListener("click", loadMoreBusinesses);
        loadMoreButton.addEventListener("click", loadMoreBusinesses);
        console.log("Attached listener to load more button");
    }

    window.removeEventListener("click", handleModalClick);
    window.addEventListener("click", handleModalClick);
}

function handleSearchKeypress(e) {
    if (e.key === "Enter") {
        console.log("Search input enter key pressed");
        performSearch();
    }
}

function handleSearchInput() {
    performSearch();
}

function handleChatKeypress(e) {
    if (e.key === "Enter") {
        console.log("Chat input enter key pressed");
        sendMessage();
    }
}

function handleModalClick(e) {
    if (e.target === document.getElementById("aiModal")) {
        console.log("Clicked outside AI modal, closing...");
        closeAIAssistant();
    }
}
