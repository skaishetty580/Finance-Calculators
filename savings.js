registerCalculator('savings', {
    name: "Savings Calculator",
    form: `
        <div class="form-group">
            <label for="initial-savings">Initial Amount ($)</label>
            <input type="number" id="initial-savings" placeholder="5,000" min="0">
        </div>
        <div class="form-group">
            <label for="monthly-contribution">Monthly Contribution ($)</label>
            <input type="number" id="monthly-contribution" placeholder="200" min="0">
        </div>
        <div class="form-group half">
            <label for="savings-years">Years to Grow</label>
            <input type="number" id="savings-years" placeholder="10" min="1" max="100">
        </div>
        <div class="form-group half">
            <label for="savings-rate">Annual Interest Rate (%)</label>
            <input type="number" id="savings-rate" step="0.01" placeholder="3.5" min="0" max="50">
        </div>
        <div class="form-group">
            <button onclick="calculateSavings()">Calculate Savings</button>
        </div>
    `,
    calculate: function() {
        const initial = parseFloat(document.getElementById('initial-savings').value) || 0;
        const monthly = parseFloat(document.getElementById('monthly-contribution').value) || 0;
        const years = parseFloat(document.getElementById('savings-years').value) || 0;
        const annualRate = parseFloat(document.getElementById('savings-rate').value) / 100 || 0;
        
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        let futureValue = initial;
        let yearlyProjections = [];
        
        for (let i = 1; i <= months; i++) {
            futureValue = futureValue * (1 + monthlyRate) + monthly;
            
            if (i % 12 === 0 || i === months) {
                yearlyProjections.push({
                    year: Math.ceil(i / 12),
                    value: futureValue,
                    contributions: initial + (monthly * i),
                    interest: futureValue - (initial + (monthly * i))
                });
            }
        }
        
        const totalContributions = initial + (monthly * months);
        const interestEarned = futureValue - totalContributions;
        
        return {
            summary: `
                <div class="summary-cards">
                    <div class="summary-card">
                        <h4>Future Value</h4>
                        <div class="summary-value">$${futureValue.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Total Contributions</h4>
                        <div class="summary-value">$${totalContributions.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Interest Earned</h4>
                        <div class="summary-value">$${interestEarned.toFixed(2)}</div>
                    </div>
                </div>
            `,
            amortization: generateAmortizationTable(yearlyProjections, 
                ['year', 'value', 'contributions', 'interest']),
            chartData: {
                labels: yearlyProjections.map(p => p.year),
                value: yearlyProjections.map(p => p.value),
                contributions: yearlyProjections.map(p => p.contributions)
            }
        };
    }
});

window.calculateSavings = function() { showResults(); };