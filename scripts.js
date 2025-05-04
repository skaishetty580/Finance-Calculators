document.addEventListener('DOMContentLoaded', function() {
    const calculatorType = document.getElementById('calculator-type');
    const calculatorForms = document.getElementById('calculator-forms');
    const results = document.getElementById('results');
    const resultContent = document.getElementById('result-content');
    const amortizationContent = document.getElementById('amortization-content');
    const chartContent = document.getElementById('chart-content');
    const tabs = document.querySelectorAll('.tab');
    
    // Set current date as default for start date fields
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();
    
    // Calculator templates with enhanced features
    const calculators = {
        mortgage: {
            name: "Mortgage Calculator",
            form: `
                <div class="form-group half">
                    <label for="home-price">Home Price ($)</label>
                    <input type="number" id="home-price" placeholder="300,000" min="1">
                    <div class="error-message" id="home-price-error">Please enter a valid home price</div>
                </div>
                <div class="form-group half">
                    <label for="down-payment">Down Payment ($)</label>
                    <input type="number" id="down-payment" placeholder="60,000" min="0">
                    <div class="error-message" id="down-payment-error">Please enter a valid down payment</div>
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
                    <div class="error-message" id="interest-rate-error">Please enter a valid interest rate (0-25%)</div>
                </div>
                <div class="form-group">
                    <button onclick="calculateMortgage()">Calculate Mortgage</button>
                </div>
                <div class="calculator-description">
                    <p>Calculate your monthly mortgage payment based on home price, down payment, loan term, and interest rate.</p>
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
                
                // Calculate monthly payment
                const monthlyPayment = loanAmount * 
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
                
                const totalPayment = monthlyPayment * numberOfPayments;
                const totalInterest = totalPayment - loanAmount;
                
                // Generate amortization schedule
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
                                <div class="summary-value">$${monthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Interest</h4>
                                <div class="summary-value">$${totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Cost</h4>
                                <div class="summary-value">$${totalPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                        <div class="result-item">
                            <span>Loan Amount:</span>
                            <span>$${loanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    `,
                    amortization: generateAmortizationTable(amortizationSchedule, ['paymentNumber', 'payment', 'principal', 'interest', 'balance']),
                    chartData: {
                        labels: amortizationSchedule.map(p => p.paymentNumber),
                        principal: amortizationSchedule.map(p => p.principal),
                        interest: amortizationSchedule.map(p => p.interest),
                        balance: amortizationSchedule.map(p => p.balance)
                    }
                };
            }
        },
        loan: {
            name: "Loan Calculator",
            form: `
                <div class="form-group">
                    <label for="loan-amount">Loan Amount ($)</label>
                    <input type="number" id="loan-amount" placeholder="10,000" min="1">
                    <div class="error-message" id="loan-amount-error">Please enter a valid loan amount</div>
                </div>
                <div class="form-group half">
                    <label for="loan-term-months">Loan Term (months)</label>
                    <input type="number" id="loan-term-months" placeholder="60" min="1">
                    <div class="error-message" id="loan-term-error">Please enter a valid term</div>
                </div>
                <div class="form-group half">
                    <label for="loan-interest-rate">Interest Rate (%)</label>
                    <input type="number" id="loan-interest-rate" step="0.01" placeholder="5.5" min="0" max="50">
                    <div class="error-message" id="loan-rate-error">Please enter a valid rate (0-50%)</div>
                </div>
                <div class="form-group">
                    <button onclick="calculateLoan()">Calculate Loan</button>
                </div>
                <div class="calculator-description">
                    <p>Calculate your loan payments based on loan amount, term, and interest rate.</p>
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
                
                // Generate amortization schedule
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
                                <div class="summary-value">$${monthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Interest</h4>
                                <div class="summary-value">$${totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Cost</h4>
                                <div class="summary-value">$${totalPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                        <div class="result-item">
                            <span>Loan Amount:</span>
                            <span>$${loanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    `,
                    amortization: generateAmortizationTable(amortizationSchedule, ['paymentNumber', 'payment', 'principal', 'interest', 'balance']),
                    chartData: {
                        labels: amortizationSchedule.map(p => p.paymentNumber),
                        principal: amortizationSchedule.map(p => p.principal),
                        interest: amortizationSchedule.map(p => p.interest),
                        balance: amortizationSchedule.map(p => p.balance)
                    }
                };
            }
        },
        savings: {
            name: "Savings Calculator",
            form: `
                <div class="form-group">
                    <label for="initial-savings">Initial Amount ($)</label>
                    <input type="number" id="initial-savings" placeholder="5,000" min="0">
                    <div class="error-message" id="initial-savings-error">Please enter a valid amount</div>
                </div>
                <div class="form-group">
                    <label for="monthly-contribution">Monthly Contribution ($)</label>
                    <input type="number" id="monthly-contribution" placeholder="200" min="0">
                    <div class="error-message" id="monthly-contribution-error">Please enter a valid amount</div>
                </div>
                <div class="form-group half">
                    <label for="savings-years">Years to Grow</label>
                    <input type="number" id="savings-years" placeholder="10" min="1" max="100">
                    <div class="error-message" id="savings-years-error">Please enter a valid number of years (1-100)</div>
                </div>
                <div class="form-group half">
                    <label for="savings-rate">Annual Interest Rate (%)</label>
                    <input type="number" id="savings-rate" step="0.01" placeholder="3.5" min="0" max="50">
                    <div class="error-message" id="savings-rate-error">Please enter a valid rate (0-50%)</div>
                </div>
                <div class="form-group">
                    <button onclick="calculateSavings()">Calculate Savings</button>
                </div>
                <div class="calculator-description">
                    <p>Calculate how your savings will grow over time with compound interest.</p>
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
                    
                    // Record yearly values
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
                                <div class="summary-value">$${futureValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Contributions</h4>
                                <div class="summary-value">$${totalContributions.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Interest Earned</h4>
                                <div class="summary-value">$${interestEarned.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                    `,
                    amortization: generateAmortizationTable(yearlyProjections, ['year', 'value', 'contributions', 'interest']),
                    chartData: {
                        labels: yearlyProjections.map(p => p.year),
                        value: yearlyProjections.map(p => p.value),
                        contributions: yearlyProjections.map(p => p.contributions),
                        interest: yearlyProjections.map(p => p.interest)
                    }
                };
            }
        },
        retirement: {
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
                <div class="calculator-description">
                    <p>Estimate how much you'll have saved by retirement age and how long it will last.</p>
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
                                <div class="summary-value">$${retirementSavings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Years Funds Will Last</h4>
                                <div class="summary-value">${retirementYears}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Annual Withdrawal</h4>
                                <div class="summary-value">$${annualWithdrawal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                    `,
                    amortization: generateAmortizationTable(yearlyProjections, ['year', 'value', 'contributions', 'interest', 'withdrawals', 'remaining']),
                    chartData: {
                        labels: yearlyProjections.map(p => p.year),
                        value: yearlyProjections.map(p => p.value)
                    }
                };
            }
        },
        investment: {
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
                <div class="calculator-description">
                    <p>Project the growth of your investments over time with regular contributions.</p>
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
                                <div class="summary-value">$${futureValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Contributions</h4>
                                <div class="summary-value">$${totalContributions.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Investment Growth</h4>
                                <div class="summary-value">$${growth.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                    `,
                    amortization: generateAmortizationTable(yearlyProjections, ['year', 'value', 'contributions', 'growth']),
                    chartData: {
                        labels: yearlyProjections.map(p => p.year),
                        value: yearlyProjections.map(p => p.value),
                        contributions: yearlyProjections.map(p => p.contributions),
                        growth: yearlyProjections.map(p => p.growth)
                    }
                };
            }
        },
        'debt-payoff': {
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
                <div class="calculator-description">
                    <p>Calculate how long it will take to pay off your debt and how much interest you'll pay.</p>
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
                                <div class="summary-value">$${totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div class="summary-card">
                                <h4>Total Cost</h4>
                                <div class="summary-value">$${(debtAmount + totalInterest).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                    `,
                    amortization: generateAmortizationTable(payoffSchedule.slice(0, 12).concat(payoffSchedule.slice(-12)), ['month', 'payment', 'principal', 'interest', 'balance']),
                    chartData: {
                        labels: payoffSchedule.map(p => p.month),
                        principal: payoffSchedule.map(p => p.principal),
                        interest: payoffSchedule.map(p => p.interest),
                        balance: payoffSchedule.map(p => p.balance)
                    }
                };
            }
        }
    };
    
    // Helper function to generate amortization tables
    function generateAmortizationTable(data, columns) {
        if (!data || data.length === 0) {
            return '<p>No data available for display</p>';
        }
        
        let table = `
            <div style="overflow-x: auto;">
                <table class="amortization-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Show first 12 and last 12 items if more than 24
        const displayData = data.length > 24 ? 
            [...data.slice(0, 12), {divider: true}, ...data.slice(-12)] : 
            data;
        
        displayData.forEach((item, index) => {
            if (item.divider) {
                table += `<tr><td colspan="${columns.length}" style="text-align: center;">...</td></tr>`;
            } else {
                table += `
                    <tr>
                        ${columns.map(col => {
                            const value = item[col];
                            if (typeof value === 'number') {
                                if (col === 'month' || col === 'year' || col === 'paymentNumber') {
                                    return `<td>${value}</td>`;
                                } else {
                                    return `<td>$${value.toFixed(2)}</td>`;
                                }
                            }
                            return `<td>${value || ''}</td>`;
                        }).join('')}
                    </tr>
                `;
            }
        });
        
        table += `
                    </tbody>
                </table>
            </div>
        `;
        
        return table;
    }
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
    
    // When calculator type changes
    calculatorType.addEventListener('change', function() {
        const selectedCalculator = this.value;
        
        if (selectedCalculator && calculators[selectedCalculator]) {
            calculatorForms.innerHTML = `
                <h3>${calculators[selectedCalculator].name}</h3>
                ${calculators[selectedCalculator].form}
            `;
            results.style.display = 'none';
            
            // Set default date for mortgage calculator
            if (selectedCalculator === 'mortgage') {
                document.getElementById('start-date').value = `${currentYear}-${currentMonth}`;
            }
        } else {
            calculatorForms.innerHTML = `
                <div class="calculator-placeholder">
                    <p>Please select a calculator from the dropdown above to get started.</p>
                </div>
            `;
            results.style.display = 'none';
        }
    });
    
    // Show results for a calculator
    function showResults(calculatorType) {
        if (calculators[calculatorType]) {
            const resultsData = calculators[calculatorType].calculate();
            resultContent.innerHTML = resultsData.summary;
            amortizationContent.innerHTML = resultsData.amortization;
            
            // Generate chart (simplified for this example)
            if (resultsData.chartData) {
                chartContent.innerHTML = `
                    <div class="chart-container">
                        <canvas id="results-chart"></canvas>
                    </div>
                    <p>Chart visualization would be implemented with Chart.js in a production environment.</p>
                `;
            } else {
                chartContent.innerHTML = '<p>No chart data available for this calculator.</p>';
            }
            
            results.style.display = 'block';
            
            // Scroll to results
            results.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Global calculate functions
    window.calculateMortgage = function() { showResults('mortgage'); };
    window.calculateLoan = function() { showResults('loan'); };
    window.calculateSavings = function() { showResults('savings'); };
    window.calculateRetirement = function() { showResults('retirement'); };
    window.calculateInvestment = function() { showResults('investment'); };
    window.calculateDebtPayoff = function() { showResults('debt-payoff'); };
    
    // Export to CSV function
    window.exportToCSV = function(filename, data) {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }
        
        try {
            const csvRows = [];
            const headers = Object.keys(data[0]);
            csvRows.push(headers.join(','));
            
            for (const row of data) {
                const values = headers.map(header => {
                    const escaped = ('' + row[header]).replace(/"/g, '\\"');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', filename);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('Error exporting data. Please try again.');
        }
    };
});
