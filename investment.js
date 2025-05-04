registerCalculator('investment', {
    name: "Investment Calculator",
    form: `
        <div class="form-group">
            <label for="initial-investment">Initial Investment ($)</label>
            <input type="number" id="initial-investment" placeholder="10,000" min="0">
        </div>
        <div class="form-group">
            <label for="monthly-investment">Monthly Investment ($)</label>
            <input type="number" id="monthly-investment" placeholder="500" min="0">
        </div>
        <div class="form-group half">
            <label for="investment-years">Investment Period (years)</label>
            <input type="number" id="investment-years" placeholder="20" min="1" max="100">
        </div>
        <div class="form-group half">
            <label for="expected-return">Expected Annual Return (%)</label>
            <input type="number" id="expected-return" step="0.01" placeholder="7" min="0" max="50">
        </div>
        <div class="form-group">
            <button onclick="calculateInvestment()">Calculate Investment</button>
        </div>
    `,
    calculate: function() {
        const initial = parseFloat(document.getElementById('initial-investment').value) || 0;
        const monthly = parseFloat(document.getElementById('monthly-investment').value) || 0;
        const years = parseFloat(document.getElementById('investment-years').value) || 0;
        const rate = parseFloat(document.getElementById('expected-return').value) / 100 || 0;
        
        const months = years * 12;
        const monthlyRate = Math.pow(1 + rate, 1/12) - 1;
        let futureValue = initial;
        let yearlyProjections = [];
        
        for (let i = 1; i <= months; i++) {
            futureValue = futureValue * (1 + monthlyRate) + monthly;
            
            if (i % 12 === 0 || i === months) {
                yearlyProjections.push({
                    year: Math.ceil(i / 12),
                    value: futureValue,
                    contributions: initial + (monthly * i),
                    growth: futureValue - (initial + (monthly * i))
                });
            }
        }
        
        const totalContributions = initial + (monthly * months);
        const growth = futureValue - totalContributions;
        
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
                        <h4>Investment Growth</h4>
                        <div class="summary-value">$${growth.toFixed(2)}</div>
                    </div>
                </div>
            `,
            amortization: generateAmortizationTable(yearlyProjections, 
                ['year', 'value', 'contributions', 'growth']),
            chartData: {
                labels: yearlyProjections.map(p => p.year),
                value: yearlyProjections.map(p => p.value),
                contributions: yearlyProjections.map(p => p.contributions)
            }
        };
    }
});

window.calculateInvestment = function() { showResults(); };