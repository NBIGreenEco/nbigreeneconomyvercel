// EnhancedSearch.js - Standalone search functionality for Green Economy Toolkit

// Check if Fuse.js is available, load dynamically if needed
if (typeof Fuse === 'undefined') {
    console.log('Loading Fuse.js dynamically...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2';
    script.onload = () => {
        console.log('Fuse.js loaded dynamically');
        // Re-initialize search if needed
        if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
            window.greenEconomySearch.init();
        }
    };
    document.head.appendChild(script);
  }
  
  // Search functionality class with synonym support
  class GreenEconomySearch {
    constructor() {
        this.index = null;
        this.fuse = null;
        this.initialized = false;
        this.synonymMap = this.createSynonymMap();
        this.keywordWeights = this.createKeywordWeights();
        this.stopWords = this.createStopWords();
    }
  
    createStopWords() {
        return new Set([
            // Pronouns
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
            'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
            'theirs', 'themselves',
            
            // Common verbs
            'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
            'doing', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
            
            // Prepositions
            'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at', 'before', 'behind', 'below',
            'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'during', 'for', 'from', 'in', 'into', 'near', 'of',
            'off', 'on', 'onto', 'out', 'over', 'through', 'to', 'toward', 'under', 'up', 'upon', 'with', 'within',
            
            // Articles and determiners
            'a', 'an', 'the', 'this', 'that', 'these', 'those', 'some', 'any', 'all', 'both', 'each', 'every', 'either',
            'neither', 'no', 'another', 'such',
            
            // Conjunctions
            'and', 'but', 'or', 'nor', 'so', 'yet', 'for', 'although', 'because', 'since', 'unless', 'until', 'when',
            'where', 'while',
            
            // Common adverbs and question words
            'how', 'what', 'when', 'where', 'why', 'who', 'whom', 'which', 'whose', 'very', 'just', 'really', 'quite',
            'too', 'also', 'even', 'only', 'not', 'now', 'then', 'here', 'there',
            
            // Other meaningless words
            'get', 'got', 'like', 'want', 'need', 'see', 'look', 'go', 'come', 'make', 'take', 'give', 'use', 'know',
            'think', 'feel', 'try', 'ask', 'seem', 'become', 'leave', 'put', 'mean', 'let', 'begin', 'start', 'help',
            'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide',
            'sit', 'stand', 'lose', 'add', 'change', 'explain', 'raise', 'learn', 'understand'
        ]);
    }
  
    createSynonymMap() {
        return {
            'money': ['funding', 'finance', 'capital', 'grants', 'investment', 'funds', 'cash', 'financial'],
            'funding': ['money', 'finance', 'grants', 'investment', 'capital', 'support', 'financial'],
            'finance': ['money', 'funding', 'capital', 'investment', 'economics', 'financial'],
            'grant': ['funding', 'money', 'award', 'subsidy', 'contribution', 'donation'],
            'investment': ['funding', 'capital', 'finance', 'money', 'backing', 'support'],
            'job': ['employment', 'work', 'career', 'position', 'opportunity', 'occupation'],
            'career': ['job', 'employment', 'profession', 'occupation', 'work'],
            'training': ['education', 'learning', 'skills', 'development', 'workshop', 'course'],
            'education': ['training', 'learning', 'knowledge', 'schooling', 'instruction'],
            'business': ['enterprise', 'company', 'firm', 'venture', 'organization', 'startup'],
            'enterprise': ['business', 'company', 'firm', 'venture', 'organization'],
            'green': ['sustainable', 'eco-friendly', 'environmental', 'ecological', 'clean'],
            'sustainable': ['green', 'eco-friendly', 'environmental', 'ecological', 'renewable'],
            'eco': ['ecological', 'environmental', 'green', 'sustainable', 'natural'],
            'economy': ['economic', 'financial', 'monetary', 'fiscal'],
            'opportunity': ['chance', 'prospect', 'opening', 'possibility'],
            'support': ['help', 'assistance', 'aid', 'backing', 'funding'],
            'development': ['growth', 'expansion', 'progress', 'advancement'],
            'environmental': ['ecological', 'green', 'natural', 'eco-friendly'],
            'renewable': ['sustainable', 'green', 'eco-friendly', 'alternative'],
            'energy': ['power', 'electricity', 'renewable', 'sustainable'],
            'solar': ['photovoltaic', 'sun', 'renewable'],
            'wind': ['turbine', 'renewable', 'energy'],
            'recycle': ['reuse', 'repurpose', 'waste management'],
            'waste': ['trash', 'garbage', 'recycling', 'disposal']
        };
    }
  
    createKeywordWeights() {
        return {
            'funding': 2.0, 'money': 2.0, 'finance': 2.0, 'grant': 2.0, 'investment': 2.0,
            'opportunity': 1.8, 'job': 1.8, 'career': 1.8, 'employment': 1.8,
            'training': 1.5, 'education': 1.5, 'learning': 1.5,
            'green': 1.7, 'sustainable': 1.7, 'eco': 1.7, 'environmental': 1.7,
            'renewable': 1.6, 'energy': 1.6, 'solar': 1.6, 'wind': 1.6,
            'recycle': 1.4, 'waste': 1.4, 'business': 1.3, 'enterprise': 1.3
        };
    }
  
    getSynonyms(word) {
        const wordLower = word.toLowerCase();
        return this.synonymMap[wordLower] || [word];
    }
  
    // Enhanced keyword extraction that ignores meaningless words
    extractKeywords(query) {
        return query
            .toLowerCase()
            .split(/\s+/)
            .map(word => word.replace(/[^a-z0-9]/g, '')) // Remove punctuation
            .filter(word => 
                word.length > 2 && 
                !this.stopWords.has(word) &&
                !this.isCommonVerb(word)
            )
            .filter((word, index, array) => array.indexOf(word) === index); // Remove duplicates
    }
  
    // Check if word is a common verb form
    isCommonVerb(word) {
        const commonVerbs = new Set([
            'ing', 'ed', 'es', 's', 'able', 'ful', 'less', 'ly', 'ment', 'ness', 'tion', 'sion', 'ive', 'ize', 'ise'
        ]);
        return commonVerbs.has(word) || word.endsWith('ing') || word.endsWith('ed');
    }
  
    // Get the original keyword that a synonym maps to
    getOriginalKeyword(synonym) {
        const synonymLower = synonym.toLowerCase();
        for (const [original, synonyms] of Object.entries(this.synonymMap)) {
            if (synonyms.includes(synonymLower)) {
                return original;
            }
        }
        return synonym; // Return itself if not a synonym
    }
  
    // Enhanced search with strict synonym handling and partial match support
    strictSearch(query) {
        if (!this.fuse || query.length < 2) return [];
        
        const keywords = this.extractKeywords(query);
        let allResults = [];
        const usedSynonyms = new Map();
        
        // If no keywords extracted (e.g., all stop words), search with the original query
        if (keywords.length === 0) {
            const results = this.fuse.search(query);
            return results.map(result => {
                return {...result, keyword: query, originalKeyword: query, isSynonym: false};
            });
        }
  
        // Search for each meaningful keyword and its synonyms
        for (const keyword of keywords) {
            const searchTerms = [keyword];
            const synonyms = this.getSynonyms(keyword);
            
            // Add synonyms to search terms
            synonyms.forEach(synonym => {
                if (synonym !== keyword) {
                    searchTerms.push(synonym);
                    usedSynonyms.set(synonym, keyword);
                }
            });
  
            // Search for each term
            for (const term of searchTerms) {
                const results = this.fuse.search(term);
                
                // Enhance results with keyword information
                const enhancedResults = results.map(result => {
                    const enhanced = {...result};
                    enhanced.keyword = term;
                    enhanced.originalKeyword = usedSynonyms.get(term) || term;
                    enhanced.isSynonym = usedSynonyms.has(term);
                    
                    // Apply keyword weighting
                    const weight = this.keywordWeights[enhanced.originalKeyword] || 1.0;
                    enhanced.score = enhanced.score * weight;
                    
                    return enhanced;
                });
                
                allResults = [...allResults, ...enhancedResults];
            }
        }
  
        // Remove duplicates and sort by enhanced score
        const uniqueResults = [];
        const seenUrls = new Set();
        
        allResults
            .sort((a, b) => a.score - b.score)
            .forEach(result => {
                if (!seenUrls.has(result.item.url)) {
                    seenUrls.add(result.item.url);
                    uniqueResults.push(result);
                }
            });
  
        return uniqueResults;
    }
  
    // Direct term matching for cases like "Fundin" -> "Funding"
    directTermMatch(query) {
        if (!this.fuse) return [];
        
        // Try to find similar terms in our synonym map
        const possibleMatches = [];
        const queryLower = query.toLowerCase();
        
        // Check if query is similar to any known terms
        for (const [term, synonyms] of Object.entries(this.synonymMap)) {
            if (term.includes(queryLower) || queryLower.includes(term)) {
                possibleMatches.push(term);
            }
            
            for (const synonym of synonyms) {
                if (synonym.includes(queryLower) || queryLower.includes(synonym)) {
                    possibleMatches.push(synonym);
                }
            }
        }
        
        // Search for possible matches
        let results = [];
        for (const term of possibleMatches) {
            const termResults = this.fuse.search(term);
            results = [...results, ...termResults.map(r => ({
                ...r,
                keyword: term,
                originalKeyword: term,
                isSynonym: false
            }))];
        }
        
        return results;
    }
  
    async init() {
        if (this.initialized) return;
        
        // Check if Fuse.js is available
        if (typeof Fuse === 'undefined') {
            console.error('Fuse.js is not loaded');
            this.showError('Search library not loaded. Please refresh the page.');
            return;
        }
  
        try {
            // Show loading state
            const resultsDiv = document.getElementById('search-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '<div class="p-4 text-gray-600"><i class="fas fa-spinner fa-spin"></i> Loading search...</div>';
            }
  
            // Load search index from root directory
            const response = await fetch('/search-index.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.index = await response.json();
            
            // Initialize Fuse.js with lenient settings
            this.fuse = new Fuse(this.index, {
                keys: [
                    { name: 'title', weight: 0.5 },
                    { name: 'description', weight: 0.3 },
                    { name: 'content.headings', weight: 0.1 },
                    { name: 'content.paragraphs', weight: 0.1 },
                    { name: 'tags', weight: 0.2 } // Add this if your index has tags
                ],
                includeScore: true,
                threshold: 0.4, // Lower threshold for more lenient matching
                minMatchCharLength: 2,
                ignoreLocation: true,
                shouldSort: true,
                findAllMatches: true,
                useExtendedSearch: true, // Enable extended search for better partial matching
                ignoreFieldNorm: true,
                fieldNormWeight: 0.1,
                distance: 1000,
                location: 0,
                isCaseSensitive: false
            });
  
            this.initialized = true;
            console.log('Search initialized with', this.index.length, 'pages');
  
            // Setup search input listener
            this.setupSearchListener();
  
        } catch (error) {
            console.error('Failed to load search index:', error);
            this.showError('Search temporarily unavailable');
        }
    }
  
    showError(message) {
        const resultsDiv = document.getElementById('search-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `<div class="p-4 text-gray-600">${message}</div>`;
            
            setTimeout(() => {
                if (resultsDiv.innerHTML.includes(message)) {
                    resultsDiv.innerHTML = '<div class="p-4 text-gray-600">Start typing to search...</div>';
                }
            }, 5000);
        }
    }
  
    setupSearchListener() {
        const smartSearch = document.getElementById('smartSearch');
        const resultsDiv = document.getElementById('search-results');
        const searchPopup = document.getElementById('search-popup');
  
        if (!smartSearch || !resultsDiv) return;
  
        // Function to clean up URL for display
        const cleanUrlForDisplay = (url) => {
            if (!url) return '';
            
            let cleaned = url.replace(/^\//, '')
                             .replace(/\.html$/, '')
                             .replace(/\//g, ' › ');
            
            cleaned = cleaned.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
            return cleaned;
        };
  
        // Debounce function
        const debounce = (func, delay) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };
  
        smartSearch.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            resultsDiv.innerHTML = '';
            
            if (!query) {
                resultsDiv.innerHTML = '<div class="p-4 text-gray-600">Start typing to search...</div>';
                return;
            }
  
            if (!this.fuse) {
                resultsDiv.innerHTML = '<div class="p-4 text-gray-600">Search not ready yet...</div>';
                return;
            }
  
            // Use strict search with keyword extraction and synonym handling
            let results = this.strictSearch(query);
            
            // If no results, try direct term matching
            if (results.length === 0) {
                results = this.directTermMatch(query);
            }
  
            if (results.length === 0) {
                const suggestions = this.getSearchSuggestions(query);
                resultsDiv.innerHTML = `
                    <div class="p-4 text-gray-600">
                        <p>No results found for "${query}".</p>
                        ${suggestions.length > 0 ? `
                            <p class="mt-2">Try searching for:</p>
                            <ul class="list-disc list-inside mt-1">
                                ${suggestions.map(suggestion => 
                                    `<li class="cursor-pointer text-blue-600 hover:underline" onclick="document.getElementById('smartSearch').value='${suggestion}'; this.closest('.search-container').querySelector('input').dispatchEvent(new Event('input'));">${suggestion}</li>`
                                ).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `;
                return;
            }
  
            this.displayEnhancedResults(results, query, cleanUrlForDisplay, resultsDiv, searchPopup);
        }, 300));
    }
  
    getSearchSuggestions(query) {
        const words = query.split(/\s+/).filter(word => word.length > 2);
        const suggestions = new Set();
        
        words.forEach(word => {
            const synonyms = this.getSynonyms(word);
            synonyms.forEach(synonym => {
                if (synonym !== word) {
                    suggestions.add(query.replace(new RegExp(`\\b${word}\\b`, 'gi'), synonym));
                    suggestions.add(`${query} ${synonym}`);
                }
            });
        });
        
        return Array.from(suggestions).slice(0, 5);
    }
  
    // Enhanced display that highlights all found keywords
    displayEnhancedResults(results, query, cleanUrlForDisplay, resultsDiv, searchPopup) {
        const highlightText = (text, keywords) => {
            if (!text || !keywords.length) return text;
            
            let highlighted = text;
            keywords.forEach(keyword => {
                const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedKeyword})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
            });
            
            return highlighted;
        };
  
        // Extract all unique keywords from results for highlighting
        const allKeywords = new Set();
        results.forEach(result => {
            allKeywords.add(result.keyword.toLowerCase());
        });
  
        results.forEach(result => {
            const item = result.item;
            let bestSnippet = '';
            
            // Find the best content snippet that contains any keyword
            if (item.content) {
                const allContent = [...(item.content.headings || []), ...(item.content.paragraphs || [])];
                
                // Score each content snippet by keyword matches
                let bestScore = 0;
                allContent.forEach(content => {
                    if (content) {
                        let score = 0;
                        allKeywords.forEach(keyword => {
                            if (content.toLowerCase().includes(keyword)) {
                                score += 1;
                            }
                        });
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestSnippet = content.length > 120 ? content.substring(0, 120) + '...' : content;
                        }
                    }
                });
                
                // Fallback to first paragraph if no keyword matches found
                if (!bestSnippet && item.content.paragraphs && item.content.paragraphs.length > 0) {
                    bestSnippet = item.content.paragraphs[0].length > 120 
                        ? item.content.paragraphs[0].substring(0, 120) + '...' 
                        : item.content.paragraphs[0];
                }
            }
  
            // Highlight all keywords in title, description, and snippet
            const highlightedTitle = highlightText(item.title || 'Untitled Page', Array.from(allKeywords));
            const highlightedDescription = item.description ? highlightText(item.description, Array.from(allKeywords)) : '';
            const highlightedSnippet = bestSnippet ? highlightText(bestSnippet, Array.from(allKeywords)) : '';
  
            const div = document.createElement('div');
            div.classList.add('p-4', 'border-b', 'border-gray-200', 'hover:bg-gray-50', 'cursor-pointer');
            div.innerHTML = `
                <a href="${item.url}" class="text-blue-600 font-semibold block mb-1">${highlightedTitle}</a>
                ${highlightedDescription ? `<p class="text-sm text-gray-600 mb-1">${highlightedDescription}</p>` : ''}
                ${highlightedSnippet ? `<p class="text-sm text-gray-500">${highlightedSnippet}</p>` : ''}
                <div class="text-xs text-gray-400 mt-1">${cleanUrlForDisplay(item.url)}</div>
            `;
            div.addEventListener('click', () => {
                window.location.href = item.url;
                if (searchPopup) searchPopup.style.display = 'none';
            });
            resultsDiv.appendChild(div);
        });
    }
  
    // Fallback method for compatibility
    search(query) {
        return this.strictSearch(query);
    }
  
    // Fallback method for compatibility
    superLenientSearch(query) {
        if (!this.index || query.length < 2) return [];
        
        const queryLower = query.toLowerCase();
        const results = [];
        
        this.index.forEach((item, index) => {
            let score = 0;
            let foundMatch = false;
            
            if (item.title && item.title.toLowerCase().includes(queryLower)) {
                score += 20;
                foundMatch = true;
            }
            
            if (item.description && item.description.toLowerCase().includes(queryLower)) {
                score += 15;
                foundMatch = true;
            }
            
            if (item.content) {
                if (item.content.headings) {
                    item.content.headings.forEach(heading => {
                        if (heading && heading.toLowerCase().includes(queryLower)) {
                            score += 10;
                            foundMatch = true;
                        }
                    });
                }
                
                if (item.content.paragraphs) {
                    item.content.paragraphs.forEach(paragraph => {
                        if (paragraph && paragraph.toLowerCase().includes(queryLower)) {
                            score += 5;
                            foundMatch = true;
                        }
                    });
                }
            }
            
            if (foundMatch) {
                results.push({ item, score: 1 / (score + 1), ref: index.toString() });
            }
        });
        
        return results.sort((a, b) => a.score - b.score);
    }
  }
  
  // Initialize search when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.greenEconomySearch = new GreenEconomySearch();
    
    // Setup search toggle functionality
    const searchToggle = document.getElementById('search-toggle');
    const searchPopup = document.getElementById('search-popup');
    const searchClose = document.getElementById('search-close');
    
    if (searchToggle && searchPopup && searchClose) {
        searchToggle.addEventListener('click', () => {
            const isHidden = searchPopup.style.display === 'none';
            searchPopup.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                searchPopup.classList.add('animate-in');
                searchPopup.classList.remove('animate-out');
                // Initialize search when popup is opened
                if (window.greenEconomySearch && !window.greenEconomySearch.initialized) {
                    window.greenEconomySearch.init();
                }
            } else {
                searchPopup.classList.add('animate-out');
                searchPopup.classList.remove('animate-in');
                setTimeout(() => {
                    searchPopup.style.display = 'none';
                }, 300);
            }
        });
  
        searchClose.addEventListener('click', () => {
            searchPopup.classList.add('animate-out');
            searchPopup.classList.remove('animate-in');
            setTimeout(() => {
                searchPopup.style.display = 'none';
            }, 300);
        });
    }
  });