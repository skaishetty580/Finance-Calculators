registerCalculator('retirement', {
    name: "Retirement Calculator",
    form: `
        <div class="form-group half">
            <label for="current-age">Current Age</label>
            <input type="number" id="current-age" placeholder="35" min="18" max="100">
        </div>
        <div class="form-group half">
            <label for="retirement-age">Retirement Age</label>
            <input type="number" id="retirement-age" placeholder="65" min="18" max="100">
        </div>
        <div class="form-group">
            <label for="current-savings">Current Retirement Savings ($)</label>
            <input type="number" id="current-savings" placeholder="50,000" min="0">
        </div>
        <div class="form-group">
            <label for="annual-contribution">Annual Contribution ($)</label>
            <input type="number" id="annual-contribution" placeholder="6,000" min="0">
        </div>
        <div class="form-group half">
            <label for="retirement-rate">Annual Return Before Retirement (%)</label>
            <input type="number" id="retirement-rate" step="0.01" placeholder="6" min="0" max="50">
        </div>
        <div class="form-group half">
            <label for="post-retirement-rate">Annual Return After Retirement (%)</label>
            <input type="number" id="post-retirement-rate" step="0.01" placeholder="4" min="0" max="50">
        </div>
        <div class="form-group">
            <button onclick="calculateRetirement()">Calculate Retirement</button>
        </div>
    `,
    calculate: function() {
        const currentAge = parseInt(document.getElementById('current-age').value) || 0;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 0;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
        const annualContribution = parseFloat(document.getElementById('annual-contribution').value) || 0;
        const preRetirementRate = parseFloat(document.getElementById('retirement-rate').value) / 100 || 0;
        const postRetirementRate = parseFloat(document.getElementById('post-retirement-rate').value) / 100 || 0;
        
        const yearsToRetirement = retirementAge - currentAge;
        let retirementSavings = currentSavings;
        let yearlyProjections = [];
        
        // Calculate savings growth until retirement
        for (let i = 1; i <= yearsToRetirement; i++) {
            retirementSavings = retirementSavings * (1 + preRetirementRate) + annualContribution;
            yearlyProjections.push({
                year: currentAge + i,
                value: retirementSavings,
                contributions: currentSavings + (annualContribution * i),
                interest: retirementSavings - (currentSavings + (annualContribution * i))
            });
        }
        
        // Estimate retirement withdrawals
        const annualWithdrawal = annualContribution * 0.8; // 80% of annual contribution
        let remainingFunds = retirementSavings;
        let retirementYears = 0;
        
        while (remainingFunds > 0 && retirementYears < 50) {
            remainingFunds = remainingFunds * (1 + postRetirementRate) - annualWithdrawal;
            if (remainingFunds > 0) {
                retirementYears++;
                yearlyProjections.push({
                    year: retirementAge + retirementYears,
                    value: remainingFunds,
                    withdrawals: annualWithdrawal * retirementYears,
                    remaining: remainingFunds
                });
            }
        }
        
        return {
            summary: `
                <div class="summary-cards">
                    <div class="summary-card">
                        <h4>Retirement Savings</h4>
                        <div class="summary-value">$${retirementSavings.toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Years Funds Will Last</h4>
                        <div class="summary-value">${retirementYears}</div>
                    </div>
                    <div class="summary-card">
                        <h4>Annual Withdrawal</h4>
                        <div class="summary-value">$${annualWithdrawal.toFixed(2)}</div>
                    </div>
                </div>
            `,
            amortization: generateAmortizationTable(yearlyProjections, 
                ['year', 'value', 'contributions', 'interest', 'withdrawals', 'remaining']),
            chartData: {
                labels: yearlyProjections.map(p => p.year),
                value: yearlyProjections.map(p => p.value)
            }
        };
    }
});

window.calculateRetirement = function() { showResults(); };