registerCalculator('loan', {
    name: "Loan Calculator",
    form: `
        <div class="form-group">
            <label for="loan-amount">Loan Amount ($)</label>
            <input type="number" id="loan-amount" placeholder="10,000" min="1">
        </div>
        <div class="form-group half">
            <label for="loan-term-months">Loan Term (months)</label>
            <input type="number" id="loan-term-months" placeholder="60" min="1">
        </div>
        <div class="form-group half">
            <label for="loan-interest-rate">Interest Rate (%)</label>
            <input type="number" id="loan-interest-rate" step="0.01" placeholder="5.5" min="0" max="50">
        </div>
        <div class="form-group">
            <button onclick="calculateLoan()">Calculate Loan</button>
        </div>
    `,
    calculate: function() {
        const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
        const loanTerm = parseFloat(document.getElementById('loan-term-months').value) || 0;
        const interestRate = parseFloat(document.getElementById('loan-interest-rate').value) / 100 || 0;
        
        const monthlyRate = interestRate / 12;
        const monthlyPayment = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
            (Math.pow(1 + monthlyRate, loanTerm) - 1);
        
        const totalPayment = monthlyPayment * loanTerm;
        const totalInterest = totalPayment - loanAmount;
        
        let amortizationSchedule = [];
        let balance = loanAmount;
        
        for (let i = 1; i <= loanTerm; i++) {
            const interest = balance * monthlyRate;
            const principal = monthlyPayment - interest;
            balance -= principal;
            
            amortizationSchedule.push({
                paymentNumber: i,
                payment: monthlyPayment,
                principal: principal,
                interest: interest,
                balance: balance > 0 ? balance : 0
            });
        }
        
        return {
            summary: `
                <div class="summary-cards">
                    <div class="summary-card">
                        <h4>Monthly Payment</h4>
                        <div class="summary-value">$${monthlyPayment.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Total Interest</h4>
                        <div class="summary-value">$${totalInterest.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Total Cost</h4>
                        <div class="summary-value">$${totalPayment.toFixed(2)}</div>
                    </div>
                </div>
            `,
            amortization: generateAmortizationTable(amortizationSchedule, 
                ['paymentNumber', 'payment', 'principal', 'interest', 'balance']),
            chartData: {
                labels: amortizationSchedule.map(p => p.paymentNumber),
                principal: amortizationSchedule.map(p => p.principal),
                interest: amortizationSchedule.map(p => p.interest)
            }
        };
    }
});

window.calculateLoan = function() { showResults(); };