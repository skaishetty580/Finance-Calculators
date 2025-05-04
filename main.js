// Shared functionality and calculator registry
const calculators = {};
let currentCalculator = null;

// DOM elements
const calculatorType = document.getElementById('calculator-type');
const calculatorForms = document.getElementById('calculator-forms');
const results = document.getElementById('results');
const resultContent = document.getElementById('result-content');
const amortizationContent = document.getElementById('amortization-content');
const chartContent = document.getElementById('chart-content');
const tabs = document.querySelectorAll('.tab');

// Register a calculator
function registerCalculator(name, config) {
    calculators[name] = config;
}

// Show results for current calculator
function showResults() {
    if (currentCalculator && calculators[currentCalculator]) {
        const resultsData = calculators[currentCalculator].calculate();
        resultContent.innerHTML = resultsData.summary;
        amortizationContent.innerHTML = resultsData.amortization;
        
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
        results.scrollIntoView({ behavior: 'smooth' });
    }
}

// Generate amortization table
function generateAmortizationTable(data, columns) {
    if (!data || data.length === 0) return '<p>No data available</p>';
    
    let table = `
        <div style="overflow-x: auto;">
            <table class="amortization-table">
                <thead><tr>
                    ${columns.map(col => `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`).join('')}
                </tr></thead>
                <tbody>
    `;
    
    const displayData = data.length > 24 ? 
        [...data.slice(0, 12), {divider: true}, ...data.slice(-12)] : 
        data;
    
    displayData.forEach(item => {
        if (item.divider) {
            table += `<tr><td colspan="${columns.length}" style="text-align: center;">...</td></tr>`;
        } else {
            table += `<tr>${
                columns.map(col => {
                    const value = item[col];
                    return `<td>${
                        typeof value === 'number' ? 
                        (col === 'month' || col === 'year' ? value : `$${value.toFixed(2)}`) : 
                        (value || '')
                    }</td>`;
                }).join('')
            }</tr>`;
        }
    });
    
    table += `</tbody></table></div>`;
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

// Calculator type change handler
calculatorType.addEventListener('change', function() {
    currentCalculator = this.value;
    
    if (currentCalculator && calculators[currentCalculator]) {
        calculatorForms.innerHTML = `
            <h3>${calculators[currentCalculator].name}</h3>
            ${calculators[currentCalculator].form}
        `;
        results.style.display = 'none';
    } else {
        calculatorForms.innerHTML = `
            <div class="calculator-placeholder">
                <p>Please select a calculator from the dropdown above to get started.</p>
            </div>
        `;
        results.style.display = 'none';
    }
});

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