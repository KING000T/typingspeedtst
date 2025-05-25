document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quote-display');
    const typingArea = document.getElementById('typing-area');
    const caret = document.getElementById('caret');
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const timeSelect = document.getElementById('time-select');
    // const modeSelect = document.getElementById('mode-select'); // Removed modeSelect
    const difficultySelect = document.getElementById('difficulty-select'); 
    const themeSelect = document.getElementById('theme-select');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const errorsDisplay = document.getElementById('errors');
    // const customQuoteInput = document.getElementById('custom-quote'); // Removed
    // const addQuoteBtn = document.getElementById('add-quote-btn'); // Removed

    let quotes = [];
    let currentQuote = '';
    let timeLeft = parseInt(timeSelect.value);
    let timer = null;
    let errors = 0;
    let typedChars = 0;
    let isTyping = false;

    // Fetch quotes
    fetch('/quotes')
        .then(response => response.json())
        .then(data => {
            quotes = data;
            loadNewQuote();
        });

    // Load new quote or random words
    function loadNewQuote() {
        const selectedTime = parseInt(timeSelect.value);
        const selectedDifficulty = difficultySelect.value;
        let wordCount;

        // Determine word count based on selected time and difficulty
        if (selectedDifficulty === 'easy') {
            if (selectedTime <= 30) wordCount = 15;
            else if (selectedTime <= 60) wordCount = 30;
            else wordCount = 50;
        } else if (selectedDifficulty === 'intermediate') {
            if (selectedTime <= 30) wordCount = 20;
            else if (selectedTime <= 60) wordCount = 40;
            else wordCount = 70;
        } else { // Hard
            if (selectedTime <= 30) wordCount = 25;
            else if (selectedTime <= 60) wordCount = 50;
            else wordCount = 80;
        }

        // Always generate random words as we assume a timed/practice like mode
        // If you want to use fixed quotes from quotes.json, adjust this logic
        currentQuote = generateRandomWords(wordCount, selectedDifficulty); 

        quoteDisplay.innerHTML = currentQuote.split('').map(char => `<span>${char === ' ' ? ' ' : char}</span>`).join('');
        typingArea.value = '';
        errors = 0;
        typedChars = 0;
        caret.style.display = 'none';
        updateStats();
        updateCaretPosition(0);
    }

    // Generate random words for Free Type mode
    function generateRandomWords(count, difficulty) { // Added difficulty parameter
        const baseWords = [
            'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world', 'code', 'test', 'speed', 'type', 'learn', 'data', 'input', 'write', 'fast', 'skill',
            'keyboard', 'practice', 'accuracy', 'challenge', 'develop', 'improve', 'focus', 'progress', 'achieve', 'goal', 'benchmark', 'system', 'interface', 'user', 'experience',
            'application', 'software', 'web', 'internet', 'connection', 'server', 'client', 'response', 'request', 'network', 'protocol', 'security', 'encryption', 'algorithm',
            'function', 'variable', 'constant', 'loop', 'condition', 'statement', 'expression', 'operator', 'operand', 'comment', 'debug', 'compile', 'execute', 'runtime', 'error',
            'architecture', 'asynchronous', 'authentication', 'authorization', 'bioinformatics', 'cryptocurrency', 'cybersecurity', 'decentralized', 'deterministic', 'econometrics',
            'environmental', 'epistemology', 'exacerbate', 'existentialism', 'extraterrestrial', 'heterogeneous', 'hierarchical', 'idiosyncratic', 'implementation', 'infrastructure',
            'interdisciplinary', 'jurisprudence', 'juxtaposition', 'kaleidoscope', 'lexicography', 'longitudinal', 'macroeconomics', 'metamorphosis', 'methodology', 'microcontroller'
        ];
        
        let generatedWords = [];
        const commonSymbols = ['.', ',', '!', '?'];
        const allSymbols = ['.', ',', '!', '?', ';', ':', '"', "'", '(', ')']; // Added more symbols for hard

        for (let i = 0; i < count; i++) {
            let word = baseWords[Math.floor(Math.random() * baseWords.length)];

            if (difficulty === 'intermediate') {
                // 50% chance to capitalize first letter
                if (Math.random() < 0.5) {
                    word = word.charAt(0).toUpperCase() + word.slice(1);
                }
                // 20% chance to add a common symbol at the end
                if (i < count -1 && Math.random() < 0.2) { // Avoid symbol on the very last word for simplicity
                    word += commonSymbols[Math.floor(Math.random() * commonSymbols.length)];
                }
            } else if (difficulty === 'hard') {
                // 30% chance to make word fully uppercase
                if (Math.random() < 0.3) {
                    word = word.toUpperCase();
                } else if (Math.random() < 0.7) { // 70% chance (of remaining) to capitalize first letter
                    word = word.charAt(0).toUpperCase() + word.slice(1);
                }

                // 40% chance to add a symbol (more variety for hard)
                // Ensure not to add too many symbols or make it unreadable
                if (i < count -1 && Math.random() < 0.4) { 
                    // Simple approach: add to end. More complex logic could insert within words.
                    let symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
                    // Basic handling for paired symbols - add only opening for now or simplify
                    if (symbol === '"' || symbol === "'") {
                        word = symbol + word + symbol; // Enclose word
                    } else if (symbol === '(') {
                        word = symbol + word + ')'; // Enclose word with closing pair
                    } else if (symbol !== ')') { // Avoid adding a closing parenthesis alone
                         word += symbol;
                    }
                }
            }
            generatedWords.push(word);
        }
        return generatedWords.join(' ').trim();
    }

    // Update caret position
    function updateCaretPosition(index) {
        const quoteChars = quoteDisplay.querySelectorAll('span');
        if (index < quoteChars.length) {
            const char = quoteChars[index];
            const rect = char.getBoundingClientRect();
            const containerRect = quoteDisplay.getBoundingClientRect();
            caret.style.left = `${rect.left - containerRect.left}px`;
            caret.style.top = `${rect.top - containerRect.top}px`;
            caret.style.height = `${rect.height}px`;
            caret.style.display = 'block';
        } else {
            caret.style.display = 'none';
        }
    }

    // Start test
    startBtn.addEventListener('click', () => {
        if (timer) clearInterval(timer);
        timeLeft = parseInt(timeSelect.value); 
        timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        typingArea.disabled = false;
        typingArea.focus();
        errors = 0;
        typedChars = 0;
        isTyping = false;
        loadNewQuote(); 

        // Timer will always start as we assume a timed mode
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                typingArea.disabled = true;
                startBtn.disabled = false; 
                caret.style.display = 'none';
                saveStats();
                updateStats();
            }
        }, 1000);
    });

    // Typing logic
    typingArea.addEventListener('input', () => {
        if (!isTyping) {
            isTyping = true;
            caret.style.display = 'block';
        }
        typedChars++;
        const typedText = typingArea.value;
        const quoteChars = quoteDisplay.querySelectorAll('span');
        errors = 0;

        quoteChars.forEach((char, i) => {
            if (i < typedText.length) {
                char.className = typedText[i] === currentQuote[i] ? 'correct' : 'incorrect';
                if (typedText[i] !== currentQuote[i]) errors++;
            } else {
                char.className = '';
            }
        });

        updateCaretPosition(typedText.length);

        updateStats();
        // Logic for when the quote is completed
        if (typedText === currentQuote) {
            clearInterval(timer); // Stop the timer
            typingArea.disabled = true;
            startBtn.disabled = false;
            caret.style.display = 'none';
            saveStats();
            loadNewQuote(); // Load a new quote
        }
    });

    // Update stats
    function updateStats() {
        const words = typedChars / 5;
        const elapsed = parseInt(timeSelect.value) - timeLeft;
        const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
        const accuracy = typedChars > 0 ? Math.round(((typedChars - errors) / typedChars) * 100) : 0;
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = `${accuracy}%`;
        errorsDisplay.textContent = errors;
    }

    // Save stats
    function saveStats() {
        const words = typedChars / 5;
        const elapsed = parseInt(timeSelect.value) - timeLeft;
        const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
        const accuracy = typedChars > 0 ? Math.round(((typedChars - errors) / typedChars) * 100) : 0;
        fetch('/save_stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'guest', // Replace with user ID if authentication added
                wpm,
                accuracy,
                errors,
                timestamp: new Date().toISOString()
            })
        });
    }

    // Theme switching
    themeSelect.addEventListener('change', () => {
        document.body.className = `theme-${themeSelect.value}`;
    });

    // Remove custom quote functionality
    // addQuoteBtn.addEventListener('click', () => { ... }); // Entire block removed

    // Handle mode change
    // modeSelect.addEventListener('change', () => { // Entire block can be removed
    //     // timeLeft might need to be reset based on timeSelect if mode change implies new test conditions
    //     timeLeft = parseInt(timeSelect.value); 
    //     loadNewQuote(); // loadNewQuote will use the current timeSelect and new mode
    //     if (modeSelect.value === 'free') {
    //         clearInterval(timer);
    //         timerDisplay.textContent = 'Free';
    //         startBtn.disabled = false;
    //         typingArea.disabled = false;
    //         caret.style.display = 'block'; // Or based on typingArea focus
    //     } else {
    //         // For timed/practice, reset timer display based on selected time
    //         timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
    //         // Optionally, re-enable start button or reset other states if needed when switching to timed/practice
    //     }
    // });

    // Add an event listener for timeSelect as well, to reload the quote if time changes
    timeSelect.addEventListener('change', () => {
        timeLeft = parseInt(timeSelect.value);
        loadNewQuote(); // Reload quote with new time setting
        // Reset timer display
        timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        if(timer) clearInterval(timer); // Stop any ongoing timer
        typingArea.disabled = true; // Disable typing until start is pressed again for new time
        startBtn.disabled = false;
    });

    // Add an event listener for difficultySelect as well
    difficultySelect.addEventListener('change', () => {
        loadNewQuote(); // Reload quote with new difficulty setting
        // Reset timer display
        timeLeft = parseInt(timeSelect.value); // Reset time based on current time selection
        timerDisplay.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        if(timer) clearInterval(timer); // Stop any ongoing timer
        typingArea.disabled = true; // Disable typing until start is pressed again
        startBtn.disabled = false;
    });

});