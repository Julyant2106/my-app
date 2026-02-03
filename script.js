class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
        this.loadHistory();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    compute() { 
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('Tidak bisa membagi dengan nol!');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Simpan ke history
        this.saveToHistory(`${prev} ${this.operation} ${current} = ${computation}`);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.formatDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    formatDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('id-ID', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    saveToHistory(calculation) {
        let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        history.unshift(calculation);
        if (history.length > 10) history.pop(); // Simpan max 10 item
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        this.loadHistory();
    }

    loadHistory() {
        const historyList = document.getElementById('history-list');
        const history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            historyList.appendChild(li);
        });
    }

    clearHistory() {
        localStorage.removeItem('calculatorHistory');
        this.loadHistory();
    }
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Kalkulator
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // Event Listeners untuk tombol
    document.querySelectorAll('[data-number]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.getAttribute('data-number'));
        });
    });

    document.querySelectorAll('[data-operator]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.getAttribute('data-operator'));
        });
    });

    document.querySelector('[data-action="equals"]').addEventListener('click', () => {
        calculator.compute();
    });

    document.querySelector('[data-action="clear"]').addEventListener('click', () => {
        calculator.clear();
    });

    document.querySelector('[data-action="delete"]').addEventListener('click', () => {
        calculator.delete();
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        calculator.clearHistory();
    });

    // PWA Installation
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'inline-flex';
        
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User installed the app');
                }
                deferredPrompt = null;
            });
        });
    });

    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        console.log('PWA installed successfully');
    });

    // Keyboard Support
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        if ((key >= '0' && key <= '9') || key === '.') {
            calculator.appendNumber(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            let operator;
            switch(key) {
                case '*': operator = '×'; break;
                case '/': operator = '÷'; break;
                default: operator = key;
            }
            calculator.chooseOperation(operator);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calculator.compute();
        } else if (key === 'Escape') {
            calculator.clear();
        } else if (key === 'Backspace') {
            calculator.delete();
        }
    });

    // Vibration feedback untuk mobile
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });

    console.log('Kalkulator berhasil diinisialisasi!');
});