const userInput = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const btnVoice = document.getElementById('btnVoice');
const chatBox = document.getElementById('chatBox');
const statusText = document.getElementById('status-text');
const statusIndicator = document.querySelector('.status-indicator');

// Reconocimiento de voz nativo de JS
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        updateStatus('Listening...', 'listening');
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        handleUserMessage(text);
    };

    recognition.onerror = () => {
        updateStatus('Local Engine Ready', 'online');
    };

    recognition.onend = () => {
        if (statusIndicator.classList.contains('listening')) {
            updateStatus('Local Engine Ready', 'online');
        }
    };

    btnVoice.addEventListener('click', () => {
        recognition.start();
    });
} else {
    btnVoice.style.display = 'none';
}

btnSend.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text !== '') {
        handleUserMessage(text);
        userInput.value = '';
    }
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const text = userInput.value.trim();
        if (text !== '') {
            handleUserMessage(text);
            userInput.value = '';
        }
    }
});

function updateStatus(text, className) {
    statusText.innerText = text;
    statusIndicator.className = 'status-indicator ' + className;
}

function appendMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerText = text;
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleUserMessage(text) {
    appendMessage(text, true);
    updateStatus('Processing...', 'processing');

    setTimeout(() => {
        let botResponse = "";
        const lowerText = text.toLowerCase();

        // 1. COMPROBACIÓN ESTRICTA DE IMÁGENES/FOTOS
        if (lowerText.includes('photo') || lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('camera') || lowerText.includes('draw')) {
            botResponse = "Access Denied. System limitations strictly prohibit image and photo processing. I am only authorized to handle text and mathematics.";
        } 
        // 2. DETECCIÓN Y PROCESAMIENTO MATEMÁTICO REAL
        else if (hasMathExpression(lowerText)) {
            const mathResult = evaluateMathExpression(lowerText);
            if (mathResult !== null) {
                botResponse = `Calculation successfully executed. The mathematical result is: ${mathResult}`;
            } else {
                botResponse = "I detected a mathematical request, but the expression format is invalid. Please use standard numbers and operators (+, -, *, /).";
            }
        } 
        // 3. BASE DE CONOCIMIENTO LOCAL (CONVERSACIÓN)
        else {
            botResponse = processLocalNLP(lowerText);
        }

        appendMessage(botResponse, false);
        updateStatus('Local Engine Ready', 'online');
        speakText(botResponse);

    }, 500);
}

function hasMathExpression(text) {
    const keywords = ['plus', 'minus', 'multiply', 'divided', 'sum', 'calculate'];
    const hasKeywords = keywords.some(word => text.includes(word));
    const hasNumbersAndOperators = /[0-9]/.test(text) && /[+\-*/]/.test(text);
    return hasKeywords || hasNumbersAndOperators;
}

function evaluateMathExpression(text) {
    let cleanText = text
        .replace(/plus/g, '+')
        .replace(/minus/g, '-')
        .replace(/multiply by|multiplied by|times/g, '*')
        .replace(/divided by/g, '/')
        .replace(/x/g, '*');

    cleanText = cleanText.replace(/[^0-9+\-*/().\s]/g, '').trim();
    
    if (cleanText === '') return null;

    try {
        const result = Function(`"use strict"; return (${cleanText})`)();
        if (typeof result === 'number' && !isNaN(result)) {
            return Number(result.toFixed(4));
        }
    } catch (e) {
        return null;
    }
    return null;
}

function processLocalNLP(text) {
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        return "Hello! I am FlowGPT. I am online and ready for text prompts or calculations.";
    }
    if (text.includes('who are you') || text.includes('your name')) {
        return "My name is FlowGPT. I am a strict local assistant designed to execute text orders and mathematical data without cloud processing.";
    }
    if (text.includes('how are you')) {
        return "My systems are running optimally at 100% efficiency. Thank you for checking.";
    }
    if (text.includes('help') || text.includes('what can you do')) {
        return "I can resolve mathematical expressions (e.g., '45 * 12 + 100') and answer text questions. I cannot handle multimedia or photos.";
    }
    if (text.includes('thank')) {
        return "You are welcome. Standing by for further instructions.";
    }
    if (text.includes('clear')) {
        setTimeout(() => { chatBox.innerHTML = ''; }, 300);
        return "Chat history cleared.";
    }

    return "Query processed. As an offline text unit, my response capabilities are limited to specific keywords or structural calculations. Please provide a mathematical formula or a direct question.";
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 0.9; 
        utterance.rate = 1.0;  
        window.speechSynthesis.speak(utterance);
    }
              }
