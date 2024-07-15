var apiUrl = 'http://localhost:3000';

var customerTableBody = document.getElementById('customer-table-body');
var searchNameInput = document.getElementById('search-name');
var searchAmountInput = document.getElementById('search-amount');
var ctx = document.getElementById('transaction-graph').getContext('2d');

let customers = [];
let transactions = [];
let chart;

async function fetchData() {
    var [customersRes, transactionsRes] = await Promise.all([
        fetch(`${apiUrl}/customers`),
        fetch(`${apiUrl}/transactions`)
    ]);

    customers = await customersRes.json();
    transactions = await transactionsRes.json();

    // console.log(customers)
    displayTable();
    console.log("test")
}

function displayTable() {
    customerTableBody.innerHTML = '';
    var filteredTransactions = transactions.filter(transaction =>
        customers.find(customer => customer.id === transaction.customer_id &&
            customer.name.toLowerCase().includes(searchNameInput.value.toLowerCase()) &&
            (!searchAmountInput.value || transaction.amount == searchAmountInput.value))
    );

    filteredTransactions.forEach(transaction => {
        var customer = customers.find(customer => customer.id === transaction.customer_id);
        var row = document.createElement('tr');
        row.addEventListener('click', () => displayGraph(customer));
        row.innerHTML = `<td>${customer.name}</td><td>${transaction.date}</td><td>${transaction.amount}</td>`;
        row.style.opacity = 0;
        customerTableBody.appendChild(row);
        
        setTimeout(() => {
            row.style.transition = 'opacity 0.5s ease-in-out';
            row.style.opacity = 1;
        }, 0);
    });

    console.log()

}

function displayGraph(customer) {
    var customerTransactions = transactions.filter(transaction => transaction.customer_id === customer.id);

    var dates = {};
    customerTransactions.forEach(transaction => {
        if (dates[transaction.date]) {
            dates[transaction.date] += transaction.amount;
        } else {
            dates[transaction.date] = transaction.amount;
        }
    });

    var labels = Object.keys(dates);
    var data = Object.values(dates);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `Total transactions for ${customer.name}`,
                data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutBounce'
            }
        }
    });
}

function filterTable() {
    displayTable();
}

// Initial fetch data
fetchData();

// displayGraph()
// ///////////////////////////////////////////////////////////////////////////////////////////////