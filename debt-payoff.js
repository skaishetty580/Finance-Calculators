registerCalculator('debt-payoff', {
    name: "Debt Payoff Calculator",
    form: `
        <div class="form-group">
            <label for="debt-amount">Debt Amount ($)</label>
            <input type="number" id="debt-amount" placeholder="15,000" min="1">
        </div>
        <div class="form-group half">
            <label for="debt-interest">Interest Rate (%)</label>
            <input type="number" id="debt-interest" step="0.01" placeholder="18.5" min="0" max="50">
        </div>
        <div class="form-group half">
            <label for="debt-payment">Monthly Payment ($)</label>
            <input type="number" id="debt-payment" placeholder="300" min="1">
        </div>
        <div class="form-group">
            <button onclick="calculateDebtPayoff()">Calculate Payoff</button>
        </div>
    `,
    calculate: function() {
        const debtAmount = parseFloat(document.getElementById('debt-amount').value) || 0;
        const interestRate = parseFloat(document.getElementById('debt-interest').value) / 100 || 0;
        const monthlyPayment = parseFloat(document.getElementById('debt-payment').value) || 0;
        
        const monthlyRate = interestRate / 12;
        let balance = debtAmount;
        let months = 0;
        let totalInterest = 0;
        let payoffSchedule = [];
        
        while (balance > 0 && months < 600) { // Cap at 50 years
            const interest = balance * monthlyRate;
            const principal = Math.min(monthlyPayment - interest, balance);
            
            balance -= principal;
            totalInterest += interest;
            months++;
            
            payoffSchedule.push({
                month: months,
                payment: monthlyPayment,
                principal: principal,
                interest: interest,
                balance: balance > 0 ? balance : 0
            });
            
            if (monthlyPayment <= interest) {
                months = Infinity;
                break;
            }
        }
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        return {
            summary: `
                <div class="summary-cards">
                    <div class="summary-card">
                        <h4>Time to Payoff</h4>
                        <div class="summary-value">${months === Infinity ? 'Never' : `${years} years ${remainingMonths} months`}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Total Interest</h4>
                        <div class="summary-value">$${totalInterest.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Total Cost</h4>
                        <div class="summary-value">$${(debtAmount + totalInterest).toFixed(2)}</div>
                    </div>
                </div>
            `,
            amortization: generateAmortizationTable(
                payoffSchedule.slice(0, 12).concat(payoffSchedule.slice(-12)), 
                ['month', 'payment', 'principal', 'interest', 'balance']
            ),
            chartData: {
                labels: payoffSchedule.map(p => p.month),
                principal: payoffSchedule.map(p => p.principal),
                interest: payoffSchedule.map(p => p.interest)
            }
        };
    }
});

window.calculateDebtPayoff = function() { showResults(); };