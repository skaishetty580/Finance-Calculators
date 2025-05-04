registerCalculator('mortgage', {
    name: "Mortgage Calculator",
    form: `
        <div class="form-group half">
            <label for="home-price">Home Price ($)</label>
            <input type="number" id="home-price" placeholder="300,000" min="1">
        </div>
        <div class="form-group half">
            <label for="down-payment">Down Payment ($)</label>
            <input type="number" id="down-payment" placeholder="60,000" min="0">
        </div>
        <div class="form-group half">
            <label for="loan-term">Loan Term (years)</label>
            <select id="loan-term">
                <option value="30">30 years</option>
                <option value="20">20 years</option>
                <option value="15">15 years</option>
                <option value="10">10 years</option>
            </select>
        </div>
        <div class="form-group half">
            <label for="interest-rate">Interest Rate (%)</label>
            <input type="number" id="interest-rate" step="0.01" placeholder="3.5" min="0" max="25">
        </div>
        <div class="form-group">
            <button onclick="calculateMortgage()">Calculate Mortgage</button>
        </div>
    `,
    calculate: function() {
        const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
        const loanTerm = parseInt(document.getElementById('loan-term').value);
        const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0;
        
        const loanAmount = homePrice - downPayment;
        const monthlyRate = interestRate / 12;
        const numberOfPayments = loanTerm * 12;
        
        const monthlyPayment = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;
        
        let amortizationSchedule = [];
        let balance = loanAmount;
        
        for (let i = 1; i <= numberOfPayments; i++) {
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

window.calculateMortgage = function() { showResults(); };