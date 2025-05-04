document.addEventListener('DOMContentLoaded', function() {
    const calculatorType = document.getElementById('calculator-type');
    const calculatorForms = document.getElementById('calculator-forms');
    const results = document.getElementById('results');
    const resultContent = document.getElementById('result-content');
    const amortizationContent = document.getElementById('amortization-content');
    const chartContent = document.getElementById('chart-content');
    const tabs = document.querySelectorAll('.tab');
    
    // Calculator templates with enhanced features
    const calculators = {
        mortgage: {
            name: "Advanced Mortgage Calculator",
            form: `
                <div class="form-group half">
                    <label for="home-price">Home Price ($)</label>
                    <input type="number" id="home-price" placeholder="300,000" min="0">
                    <div class="error-message" id="home-price-error">Please enter a valid home price</div>
                </div>
                <div class="form-group half">
                    <label for="down-payment">Down Payment ($)</label>
                    <input type="number" id="down-payment" placeholder="60,000" min="0">
                    <div class="error-message" id="down-payment-error">Please enter a valid down payment</div>
                </div>
                <div class="form-group half">
                    <label for="down-payment-percent">Down Payment (%)</label>
                    <input type="number" id="down-payment-percent" step="0.1" placeholder="20" min="0" max="100">
                    <div class="error-message" id="down-payment-percent-error">Please enter a valid percentage (0-100)</div>
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
                    <input type="number" id="interest-rate" step="0.001" placeholder="3.5" min="0" max="25">
                    <div class="error-message" id="interest-rate-error">Please enter a valid interest rate (0-25%)</div>
                </div>
                <div class="form-group half">
                    <label for="property-tax">Annual Property Tax ($)</label>
                    <input type="number" id="property-tax" placeholder="3,600" min="0">
                </div>
                <div class="form-group half">
                    <label for="home-insurance">Annual Home Insurance ($)</label>
                    <input type="number" id="home-insurance" placeholder="1,200" min="0">
                </div>
                <div class="form-group half">
                    <label for="pmi">PMI (%)</label>
                    <input type="number" id="pmi" step="0.01" placeholder="0.5" value="0.5" min="0" max="2">
                    <div class="error-message" id="pmi-error">PMI must be between 0-2%</div>
                </div>
                <div class="form-group half">
                    <label for="hoa">Monthly HOA Fees ($)</label>
                    <input type="number" id="hoa" placeholder="100" min="0">
                </div>
                <div class="form-group half">
                    <label for="start-date">Loan Start Date</label>
                    <input type="month" id="start-date">
                </div>
                <div class="additional-options">
                    <h4>Additional Options</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="extra-payments"> Include Extra Payments
                        </label>
                    </div>
                    <div id="extra-payment-options" style="display: none;">
                        <div class="form-group half">
                            <label for="extra-amount">Extra Payment Amount ($)</label>
                            <input type="number" id="extra-amount" placeholder="100" min="0">
                        </div>
                        <div class="form-group half">
                            <label for="extra-start">Start After (months)</label>
                            <input type="number" id="extra-start" placeholder="12" min="0">
                        </div>
                        <div class="form-group half">
                            <label for="extra-frequency">Payment Frequency</label>
                            <select id="extra-frequency">
                                <option value="1">Monthly</option>
                                <option value="3">Quarterly</option>
                                <option value="12">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <button onclick="validateMortgage()">Calculate Mortgage</button>
                </div>
                <div class="calculator-description">
                    <p>This advanced mortgage calculator provides a comprehensive analysis of your home loan. It calculates your monthly payment including principal, interest, taxes, insurance, and PMI (if applicable). You can compare different loan terms, see the impact of extra payments, and view a detailed amortization schedule showing how each payment affects your loan balance over time.</p>
                </div>
            `,
            calculate: function() {
                const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
                let downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
                const downPaymentPercent = parseFloat(document.getElementById('down-payment-percent').value) || 0;
                const loanTerm = parseInt(document.getElementById('loan-term').value);
                const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0;
                const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
                const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 0;
                const pmiRate = parseFloat(document.getElementById('pmi').value) / 100 || 0;
                const hoa = parseFloat(document.getElementById('hoa').value) || 0;
                const startDate = document.getElementById('start-date').value;
                const extraPayments = document.getElementById('extra-payments').checked;
                const extraAmount = parseFloat(document.getElementById('extra-amount').value) || 0;
                const extraStart = parseInt(document.getElementById('extra-start').value) || 0;
                const extraFrequency = parseInt(document.getElementById('extra-frequency').value) || 1;
                
                // Calculate down payment if percentage is provided
                if (downPaymentPercent > 0 && downPaymentPercent <= 100) {
                    downPayment = homePrice * (downPaymentPercent / 100);
                    document.getElementById('down-payment').value = downPayment.toFixed(2);
                }
                
                const loanAmount = homePrice - downPayment;
                const monthlyRate = interestRate / 12;
                const numberOfPayments = loanTerm * 12;
                
                // Calculate base monthly payment (P&I)
                let monthlyPayment = loanAmount * 
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
                
                // Calculate PMI (if down payment < 20%)
                let pmi = 0;
                if (downPayment / homePrice < 0.2) {
                    pmi = (loanAmount * pmiRate) / 12;
                }
                
                // Calculate total monthly payment
                const totalMonthlyPayment = monthlyPayment + 
                    (propertyTax / 12) + 
                    (homeInsurance / 12) + 
                    pmi + 
                    hoa;
                
                const totalPayment = monthlyPayment * numberOfPayments;
                const totalInterest = totalPayment - loanAmount;
                
                // Generate amortization schedule
                let amortizationSchedule = [];
                let balance = loanAmount;
                let totalExtraPayments = 0;
                let interestPaid = 0;
                let principalPaid = 0;
                let payoffDate = new Date(startDate);
                let earlyPayoff = false;
                
                for (let i = 1; i <= numberOfPayments; i++) {
                    if (balance <= 0) {
                        earlyPayoff = true;
                        break;
                    }
        
                    const interest = balance * monthlyRate;
                    let principal = monthlyPayment - interest;
                    let extraPayment = 0;
                    
                    // Apply extra payments if enabled
                    if (extraPayments && i >= extraStart && (i - extraStart) % extraFrequency === 0) {
                        extraPayment = Math.min(extraAmount, balance);
                        totalExtraPayments += extraPayment;
                    }
                    
                    principal += extraPayment;
                    principal = Math.min(principal, balance);
                    
                    balance -= principal;
                    interestPaid += interest;
                    principalPaid += principal;
                    
                    // Format date for display
                    const paymentDate = new Date(payoffDate);
                    paymentDate.setMonth(payoffDate.getMonth() + i);
                    const formattedDate = paymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    
                    amortizationSchedule.push({
                        paymentNumber: i,
                        date: formattedDate,
                        payment: monthlyPayment + extraPayment,
                        principal: principal,
                        interest: interest,
                        extraPayment: extraPayment,
                        balance: balance > 0 ? balance : 0
                    });
                }
                
                // Calculate actual payoff period
                const actualPayments = earlyPayoff ? amortizationSchedule.length : numberOfPayments;
                const actualPayoffDate = new Date(startDate);
                actualPayoffDate.setMonth(actualPayoffDate.getMonth() + actualPayments);
                
                // Generate summary
                const summary = `
                    <div class="summary-cards">
                        <div class="summary-card">
                            <h4>Monthly Payment</h4>
                            <div class="summary-value">$${totalMonthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div class="summary-label">Principal & Interest: $${monthlyPayment.toFixed(2)}</div>
                            ${pmi > 0 ? `<div class="summary-label">PMI: $${pmi.toFixed(2)}</div>` : ''}
                            <div class="summary-label">Taxes & Insurance: $${((propertyTax / 12) + (homeInsurance / 12) + hoa).toFixed(2)}</div>
                        </div>
                        <div class="summary-card">
                            <h4>Total Cost</h4>
                            <div class="summary-value">$${(homePrice + totalInterest + (propertyTax * loanTerm) + (homeInsurance * loanTerm) + (hoa * numberOfPayments) + (pmi * (numberOfPayments - (pmi > 0 ? 60 : 0)))).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div class="summary-label">Home Price: $${homePrice.toLocaleString('en-US')}</div>
                            <div class="summary-label">Interest & Fees: $${(totalInterest + (propertyTax * loanTerm) + (homeInsurance * loanTerm) + (hoa * numberOfPayments) + (pmi * (numberOfPayments - (pmi > 0 ? 60 : 0))).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                        <div class="summary-card">
                            <h4>Payoff Date</h4>
                            <div class="summary-value">${actualPayoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
                            <div class="summary-label">${earlyPayoff ? 'Early payoff with extra payments' : 'Standard payoff'}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(downPayment / homePrice * 100)}%"></div>
                            </div>
                            <div class="summary-label">${downPaymentPercent.toFixed(1)}% down payment</div>
                        </div>
                    </div>
                    <div class="result-item">
                        <span>Loan Amount:</span>
                        <span>$${loanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="result-item">
                        <span>Total Interest:</span>
                        <span>$${totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    ${totalExtraPayments > 0 ? `
                    <div class="result-item">
                        <span>Total Extra Payments:</span>
                        <span>$${totalExtraPayments.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="result-item">
                        <span>Interest Saved:</span>
                        <span>$${(totalInterest - interestPaid).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="result-item">
                        <span>Time Saved:</span>
                        <span>${numberOfPayments - actualPayments} months (${Math.floor((numberOfPayments - actualPayments)/12)} years)</span>
                    </div>
                    ` : ''}
                `;
                
                // Generate amortization table
                let amortizationTable = `
                    <div style="overflow-x: auto;">
                        <table class="amortization-table">
                            <thead>
                                <tr>
                                    <th>Payment #</th>
                                    <th>Date</th>
                                    <th>Payment</th>
                                    <th>Principal</th>
                                    <th>Interest</th>
                                    <th>Extra</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                // Only show first 12 months and last 12 months in full, with gaps in between
                for (let i = 0; i < Math.min(12, amortizationSchedule.length); i++) {
                    const payment = amortizationSchedule[i];
                    amortizationTable += `
                        <tr>
                            <td>${payment.paymentNumber}</td>
                            <td>${payment.date}</td>
                            <td>$${payment.payment.toFixed(2)}</td>
                            <td>$${payment.principal.toFixed(2)}</td>
                            <td>$${payment.interest.toFixed(2)}</td>
                            <td>$${payment.extraPayment.toFixed(2)}</td>
                            <td>$${payment.balance.toFixed(2)}</td>
                        </tr>
                    `;
                }
                
                if (amortizationSchedule.length > 24) {
                    amortizationTable += `
                        <tr>
                            <td colspan="7" style="text-align: center;">...</td>
                        </tr>
                    `;
                    
                    for (let i = Math.max(12, amortizationSchedule.length - 12); i < amortizationSchedule.length; i++) {
                        const payment = amortizationSchedule[i];
                        amortizationTable += `
                            <tr>
                                <td>${payment.paymentNumber}</td>
                                <td>${payment.date}</td>
                                <td>$${payment.payment.toFixed(2)}</td>
                                <td>$${payment.principal.toFixed(2)}</td>
                                <td>$${payment.interest.toFixed(2)}</td>
                                <td>$${payment.extraPayment.toFixed(2)}</td>
                                <td>$${payment.balance.toFixed(2)}</td>
                            </tr>
                        `;
                    }
                }
                
                amortizationTable += `
                            </tbody>
                        </table>
                    </div>
                    <div class="form-group" style="margin-top: 1rem;">
                        <button onclick="exportToCSV('mortgage-schedule.csv', ${JSON.stringify(amortizationSchedule)})" class="button-secondary">Export Full Schedule to CSV</button>
                    </div>
                `;
                
                // Generate chart data
                const chartData = {
                    labels: amortizationSchedule.map(p => p.paymentNumber),
                    principal: amortizationSchedule.map(p => p.principal),
                    interest: amortizationSchedule.map(p => p.interest),
                    balance: amortizationSchedule.map(p => p.balance)
                };
                
                return {
                    summary,
                    amortization: amortizationTable,
                    chartData
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
                    <button onclick="validateLoan()">Calculate Loan</button>
                </div>
                <div class="calculator-description">
                    <p>This loan calculator helps you determine your monthly payment, total interest, and total cost for any type of fixed-rate loan. Use it for personal loans, auto loans, or any other installment loan to understand your repayment obligations.</p>
                </div>
            `,
            calculate: function() {
                const loanAmount = parseFloat(document.getElementById('loan-amount').value);
                const loanTerm = parseFloat(document.getElementById('loan-term-months').value);
                const interestRate = parseFloat(document.getElementById('loan-interest-rate').value) / 100;
                
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
                    if (balance <= 0) break;
                    
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
                        <div class="result-item">
                            <span>Loan Term:</span>
                            <span>${loanTerm} months (${Math.floor(loanTerm/12)} years ${loanTerm%12} months)</span>
                        </div>
                    `,
                    amortization: `
                        <div style="overflow-x: auto;">
                            <table class="amortization-table">
                                <thead>
                                    <tr>
                                        <th>Payment #</th>
                                        <th>Payment</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${amortizationSchedule.slice(0, 12).map(payment => `
                                        <tr>
                                            <td>${payment.paymentNumber}</td>
                                            <td>$${payment.payment.toFixed(2)}</td>
                                            <td>$${payment.principal.toFixed(2)}</td>
                                            <td>$${payment.interest.toFixed(2)}</td>
                                            <td>$${payment.balance.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                    ${loanTerm > 24 ? `
                                        <tr>
                                            <td colspan="5" style="text-align: center;">...</td>
                                        </tr>
                                        ${amortizationSchedule.slice(-12).map(payment => `
                                            <tr>
                                                <td>${payment.paymentNumber}</td>
                                                <td>$${payment.payment.toFixed(2)}</td>
                                                <td>$${payment.principal.toFixed(2)}</td>
                                                <td>$${payment.interest.toFixed(2)}</td>
                                                <td>$${payment.balance.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                        <div class="form-group" style="margin-top: 1rem;">
                            <button onclick="exportToCSV('loan-schedule.csv', ${JSON.stringify(amortizationSchedule)})" class="button-secondary">Export Full Schedule to CSV</button>
                        </div>
                    `,
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
                    <label for="compounding-frequency">Compounding Frequency</label>
                    <select id="compounding-frequency">
                        <option value="12">Monthly</option>
                        <option value="4">Quarterly</option>
                        <option value="2">Semi-annually</option>
                        <option value="1">Annually</option>
                        <option value="365">Daily</option>
                    </select>
                </div>
                <div class="form-group">
                    <button onclick="validateSavings()">Calculate Savings</button>
                </div>
                <div class="calculator-description">
                    <p>This savings calculator projects the future value of your savings based on your initial deposit, regular contributions, and expected interest rate. It helps you plan for short-term and long-term savings goals by showing how compound interest works in your favor.</p>
                </div>
            `,
            calculate: function() {
                const initial = parseFloat(document.getElementById('initial-savings').value) || 0;
                const monthly = parseFloat(document.getElementById('monthly-contribution').value) || 0;
                const years = parseFloat(document.getElementById('savings-years').value);
                const annualRate = parseFloat(document.getElementById('savings-rate').value) / 100;
                const compoundingFrequency = parseInt(document.getElementById('compounding-frequency').value);
                
                // Convert annual rate to periodic rate
                const periodicRate = annualRate / compoundingFrequency;
                const periodsPerYear = compoundingFrequency;
                const totalPeriods = years * periodsPerYear;
                
                let futureValue = initial;
                let yearlyProjections = [];
                let totalContributions = initial;
                
                // Calculate future value with compound interest
                if (compoundingFrequency === 12) { // Monthly compounding matches monthly contributions
                    for (let i = 0; i < totalPeriods; i++) {
                        futureValue = futureValue * (1 + periodicRate) + monthly;
                        totalContributions += monthly;
                        
                        // Record yearly values
                        if ((i + 1) % periodsPerYear === 0 || i === totalPeriods - 1) {
                            yearlyProjections.push({
                                year: Math.ceil((i + 1) / periodsPerYear),
                                value: futureValue,
                                contributions: totalContributions,
                                interest: futureValue - totalContributions
                            });
                        }
                    }
                } else {
                    // For other compounding frequencies, we need to adjust the calculation
                    futureValue = initial * Math.pow(1 + periodicRate, totalPeriods);
                    
                    // Future value of annuity (monthly contributions)
                    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
                    const fvAnnuity = monthly * ((Math.pow(1 + monthlyRate, totalPeriods) - 1) / monthlyRate);
                    
                    futureValue += fvAnnuity;
                    totalContributions += monthly * totalPeriods;
                    
                    // Create yearly projections
                    for (let y = 1; y <= years; y++) {
                        const periods = y * periodsPerYear;
                        const fvPrincipal = initial * Math.pow(1 + periodicRate, periods);
                        const fvAnnuity = monthly * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
                        const yearlyValue = fvPrincipal + fvAnnuity;
                        const yearlyContributions = initial + (monthly * periods);
                        
                        yearlyProjections.push({
                            year: y,
                            value: yearlyValue,
                            contributions: yearlyContributions,
                            interest: yearlyValue - yearlyContributions
                        });
                    }
                }
                
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
                        <div class="result-item">
                            <span>Initial Amount:</span>
                            <span>$${initial.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div class="result-item">
                            <span>Monthly Contributions:</span>
                            <span>$${monthly.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div class="result-item">
                            <span>Compounding Frequency:</span>
                            <span>${document.getElementById('compounding-frequency').options[document.getElementById('compounding-frequency').selectedIndex].text}</span>
                        </div>
                    `,
                    amortization: `
                        <div style="overflow-x: auto;">
                            <table class="amortization-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Account Value</th>
                                        <th>Total Contributions</th>
                                        <th>Interest Earned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${yearlyProjections.map(projection => `
                                        <tr>
                                            <td>${projection.year}</td>
                                            <td>$${projection.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td>$${projection.contributions.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td>$${projection.interest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="form-group" style="margin-top: 1rem;">
                            <button onclick="exportToCSV('savings-projections.csv', ${JSON.stringify(yearlyProjections)})" class="button-secondary">Export Projections to CSV</button>
                        </div>
                    `,
                    chartData: {
                        labels: yearlyProjections.map(p => p.year),
                        value: yearlyProjections.map(p => p.value),
                        contributions: yearlyProjections.map(p => p.contributions),
                        interest: yearlyProjections.map(p => p.interest)
                    }
                };
            }
        }
    };
    
    // Set current date as default for start date fields
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();
    
    // Input validation for mortgage calculator
    function validateMortgage() {
        let isValid = true;
        
        // Home price validation
        const homePrice = document.getElementById('home-price');
        const homePriceError = document.getElementById('home-price-error');
        if (!homePrice.value || parseFloat(homePrice.value) <= 0) {
            homePrice.classList.add('error');
            homePriceError.style.display = 'block';
            isValid = false;
        } else {
            homePrice.classList.remove('error');
            homePriceError.style.display = 'none';
        }
        
        // Down payment validation
        const downPayment = document.getElementById('down-payment');
        const downPaymentError = document.getElementById('down-payment-error');
        if (!downPayment.value || parseFloat(downPayment.value) < 0) {
            downPayment.classList.add('error');
            downPaymentError.style.display = 'block';
            isValid = false;
        } else {
            downPayment.classList.remove('error');
            downPaymentError.style.display = 'none';
        }
        
        // Down payment percent validation
        const downPaymentPercent = document.getElementById('down-payment-percent');
        const downPaymentPercentError = document.getElementById('down-payment-percent-error');
        if (downPaymentPercent.value && (parseFloat(downPaymentPercent.value) < 0 || parseFloat(downPaymentPercent.value) > 100)) {
            downPaymentPercent.classList.add('error');
            downPaymentPercentError.style.display = 'block';
            isValid = false;
        } else {
            downPaymentPercent.classList.remove('error');
            downPaymentPercentError.style.display = 'none';
        }
        
        // Interest rate validation
        const interestRate = document.getElementById('interest-rate');
        const interestRateError = document.getElementById('interest-rate-error');
        if (!interestRate.value || parseFloat(interestRate.value) < 0 || parseFloat(interestRate.value) > 25) {
            interestRate.classList.add('error');
            interestRateError.style.display = 'block';
            isValid = false;
        } else {
            interestRate.classList.remove('error');
            interestRateError.style.display = 'none';
        }
        
        // PMI validation
        const pmi = document.getElementById('pmi');
        const pmiError = document.getElementById('pmi-error');
        if (pmi.value && (parseFloat(pmi.value) < 0 || parseFloat(pmi.value) > 2)) {
            pmi.classList.add('error');
            pmiError.style.display = 'block';
            isValid = false;
        } else {
            pmi.classList.remove('error');
            pmiError.style.display = 'none';
        }
        
        if (isValid) {
            showResults('mortgage');
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    function validateLoan() {
        let isValid = true;
        
        // Loan amount validation
        const loanAmount = document.getElementById('loan-amount');
        const loanAmountError = document.getElementById('loan-amount-error');
        if (!loanAmount.value || parseFloat(loanAmount.value) <= 0) {
            loanAmount.classList.add('error');
            loanAmountError.style.display = 'block';
            isValid = false;
        } else {
            loanAmount.classList.remove('error');
            loanAmountError.style.display = 'none';
        }
        
        // Loan term validation
        const loanTerm = document.getElementById('loan-term-months');
        const loanTermError = document.getElementById('loan-term-error');
        if (!loanTerm.value || parseFloat(loanTerm.value) <= 0) {
            loanTerm.classList.add('error');
            loanTermError.style.display = 'block';
            isValid = false;
        } else {
            loanTerm.classList.remove('error');
            loanTermError.style.display = 'none';
        }
        
        // Interest rate validation
        const interestRate = document.getElementById('loan-interest-rate');
        const interestRateError = document.getElementById('loan-rate-error');
        if (!interestRate.value || parseFloat(interestRate.value) < 0 || parseFloat(interestRate.value) > 50) {
            interestRate.classList.add('error');
            interestRateError.style.display = 'block';
            isValid = false;
        } else {
            interestRate.classList.remove('error');
            interestRateError.style.display = 'none';
        }
        
        if (isValid) {
            showResults('loan');
        } else {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function validateSavings() {
        let isValid = true;
        
        // Initial savings validation
        const initialSavings = document.getElementById('initial-savings');
        const initialSavingsError = document.getElementById('initial-savings-error');
        if (initialSavings.value === '' || parseFloat(initialSavings.value) < 0) {
            initialSavings.classList.add('error');
            initialSavingsError.style.display = 'block';
            isValid = false;
        } else {
            initialSavings.classList.remove('error');
            initialSavingsError.style.display = 'none';
        }
        
        // Monthly contribution validation
        const monthlyContribution = document.getElementById('monthly-contribution');
        const monthlyContributionError = document.getElementById('monthly-contribution-error');
        if (monthlyContribution.value === '' || parseFloat(monthlyContribution.value) < 0) {
            monthlyContribution.classList.add('error');
            monthlyContributionError.style.display = 'block';
            isValid = false;
        } else {
            monthlyContribution.classList.remove('error');
            monthlyContributionError.style.display = 'none';
        }
        
        // Years validation
        const savingsYears = document.getElementById('savings-years');
        const savingsYearsError = document.getElementById('savings-years-error');
        if (!savingsYears.value || parseFloat(savingsYears.value) < 1 || parseFloat(savingsYears.value) > 100) {
            savingsYears.classList.add('error');
            savingsYearsError.style.display = 'block';
            isValid = false;
        } else {
            savingsYears.classList.remove('error');
            savingsYearsError.style.display = 'none';
        }
        
        // Rate validation
        const savingsRate = document.getElementById('savings-rate');
        const savingsRateError = document.getElementById('savings-rate-error');
        if (!savingsRate.value || parseFloat(savingsRate.value) < 0 || parseFloat(savingsRate.value) > 50) {
            savingsRate.classList.add('error');
            savingsRateError.style.display = 'block';
            isValid = false;
        } else {
            savingsRate.classList.remove('error');
            savingsRateError.style.display = 'none';
        }
        
        if (isValid) {
            showResults('savings');
        } else {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
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
    
    // Global calculate functions for each calculator
    window.calculateMortgage = function() { showResults('mortgage'); };
    window.validateMortgage = validateMortgage;
    window.calculateLoan = function() { showResults('loan'); };
    window.validateLoan = validateLoan;
    window.calculateSavings = function() { showResults('savings'); };
    window.validateSavings = validateSavings;
    
    // When calculator type changes
    calculatorType.addEventListener('change', function() {
        const selectedCalculator = this.value;
        
        if (selectedCalculator && calculators[selectedCalculator]) {
            calculatorForms.innerHTML = `
                <h3>${calculators[selectedCalculator].name}</h3>
                ${calculators[selectedCalculator].form}
            `;
            results.style.display = 'none';
            
            // Set default date for date inputs
            if (selectedCalculator === 'mortgage') {
                document.getElementById('start-date').value = `${currentYear}-${currentMonth}`;
                document.getElementById('extra-payments').addEventListener('change', function() {
                    document.getElementById('extra-payment-options').style.display = 
                        this.checked ? 'block' : 'none';
                });
                
                // Sync down payment fields
                document.getElementById('down-payment-percent').addEventListener('input', function() {
                    const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
                    const percent = parseFloat(this.value) || 0;
                    if (percent >= 0 && percent <= 100) {
                        const downPayment = homePrice * (percent / 100);
                        document.getElementById('down-payment').value = downPayment.toFixed(2);
                    }
                });
                
                document.getElementById('down-payment').addEventListener('input', function() {
                    const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
                    const downPayment = parseFloat(this.value) || 0;
                    if (homePrice > 0 && downPayment >= 0) {
                        const percent = (downPayment / homePrice) * 100;
                        document.getElementById('down-payment-percent').value = percent.toFixed(1);
                    }
                });
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
            amortizationContent.innerHTML = resultsData.amortization || '<p>No amortization data available for this calculator.</p>';
            
            // Generate chart (simplified for this example)
            if (resultsData.chartData) {
                chartContent.innerHTML = `
                    <div class="chart-container">
                        <canvas id="results-chart"></canvas>
                    </div>
                    <p>Chart showing payment breakdown over time. In a full implementation, this would use Chart.js or similar library to visualize the data.</p>
                `;
            } else {
                chartContent.innerHTML = '<p>No chart data available for this calculator.</p>';
            }
            
            results.style.display = 'block';
            
            // Scroll to results
            results.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
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

    // Download ZIP function
    window.downloadZip = function() {
        alert('In a live website, this would download the calculators package. For now, please download the files from GitHub.');
    };
});