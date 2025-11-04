let currentRegime = 'old';

const taxSlabs = {
    old: [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.2 },
        { limit: Infinity, rate: 0.3 }
    ],
    new: [
        { limit: 300000, rate: 0 },
        { limit: 600000, rate: 0.05 },
        { limit: 900000, rate: 0.1 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.2 },
        { limit: Infinity, rate: 0.3 }
    ]
};

function resetAllFields() {
    document.getElementById('basicSalary').value = '';
    document.getElementById('hra').value = '';
    document.getElementById('otherIncome').value = '';
    document.getElementById('section80C').value = '';
    document.getElementById('section80D').value = '';
    document.getElementById('hraExemption').value = '';
    
    document.getElementById('grossIncome').textContent = '₹0';
    document.getElementById('totalDeductions').textContent = '₹0';
    document.getElementById('taxableIncome').textContent = '₹0';
    document.getElementById('incomeTax').textContent = '₹0';
    document.getElementById('cess').textContent = '₹0';
    document.getElementById('netTax').textContent = '₹0';
    
    document.getElementById('resultsGrid').classList.remove('animated');
}

function switchRegime(regime) {
    currentRegime = regime;
    document.getElementById('oldRegimeBtn').classList.toggle('active', regime === 'old');
    document.getElementById('newRegimeBtn').classList.toggle('active', regime === 'new');
    document.getElementById('deductionsSection').style.display = regime === 'old' ? 'block' : 'none';

    resetAllFields();

    updateTaxSlabs();
}

function updateTaxSlabs() {
    const slabsGrid = document.getElementById('slabsGrid');
    slabsGrid.innerHTML = '';
    const displaySlabs = currentRegime === 'old' ? [
        { range: 'Up to ₹2,50,000', rate: '0%' },
        { range: '₹2,50,001 - ₹5,00,000', rate: '5%' },
        { range: '₹5,00,001 - ₹10,00,000', rate: '20%' },
        { range: 'Above ₹10,00,000', rate: '30%' }
    ] : [
        { range: 'Up to ₹3,00,000', rate: '0%' },
        { range: '₹3,00,001 - ₹6,00,000', rate: '5%' },
        { range: '₹6,00,001 - ₹9,00,000', rate: '10%' },
        { range: '₹9,00,001 - ₹12,00,000', rate: '15%' },
        { range: '₹12,00,001 - ₹15,00,000', rate: '20%' },
        { range: 'Above ₹15,00,000', rate: '30%' }
    ];

    displaySlabs.forEach(slab => {
        const card = document.createElement('div');
        card.className = 'slab-card';
        card.innerHTML = `<div class="slab-range">${slab.range}</div><div class="slab-rate">${slab.rate}</div>`;
        slabsGrid.appendChild(card);
    });
}

function calculateTax() {
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;

    const grossIncome = basicSalary + otherIncome;

    let totalDeductions = 0;
    if (currentRegime === 'old') {
        const section80C = Math.min(parseFloat(document.getElementById('section80C').value) || 0, 150000);
        const section80D = parseFloat(document.getElementById('section80D').value) || 0;
        const hraExemption = parseFloat(document.getElementById('hraExemption').value) || 0;
        totalDeductions = section80C + section80D + hraExemption;
    } else {
        totalDeductions = 50000; 
    }

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    let incomeTax = calculateIncomeTax(taxableIncome);

    if (currentRegime === 'new' && taxableIncome <= 700000) {
        incomeTax = 0; 
    }

    const cess = incomeTax * 0.04;
    const netTax = incomeTax + cess;

    document.getElementById('grossIncome').textContent = `₹${grossIncome.toLocaleString('en-IN')}`;
    document.getElementById('totalDeductions').textContent = `₹${totalDeductions.toLocaleString('en-IN')}`;
    document.getElementById('taxableIncome').textContent = `₹${taxableIncome.toLocaleString('en-IN')}`;
    document.getElementById('incomeTax').textContent = `₹${incomeTax.toLocaleString('en-IN')}`;
    document.getElementById('cess').textContent = `₹${cess.toLocaleString('en-IN')}`;
    document.getElementById('netTax').textContent = `₹${netTax.toLocaleString('en-IN')}`;
    document.getElementById('resultsGrid').classList.add('animated');
}

function calculateIncomeTax(income) {
    let tax = 0;
    let slabs = taxSlabs[currentRegime];
    let lastLimit = 0;
    for (let i = 0; i < slabs.length; i++) {
        const { limit, rate } = slabs[i];
        if (income > lastLimit) {
            const taxableAmount = Math.min(income, limit) - lastLimit;
            tax += taxableAmount * rate;
            lastLimit = limit;
        } else {
            break;
        }
    }
    return Math.round(tax);
}

['basicSalary', 'hra', 'otherIncome', 'section80C', 'section80D', 'hraExemption'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        if (document.getElementById('basicSalary').value) {
            calculateTax();
        }
    });
});

document.getElementById('oldRegimeBtn').addEventListener('click', () => switchRegime('old'));
document.getElementById('newRegimeBtn').addEventListener('click', () => switchRegime('new'));

updateTaxSlabs();
