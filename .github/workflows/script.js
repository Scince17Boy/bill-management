// script.js (This is a new file for all your JavaScript code)

// Note: jspdf library is no longer strictly needed if PDF generation is removed.
// If you completely removed the <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// from your index.html, then this GOOGLE_SCRIPT_URL might not be used either if you only relied on PDF generation for it.
// If you plan to send data to Google Sheets via Google Apps Script, keep this URL.
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_WEB_APP_URL';

let bills = JSON.parse(localStorage.getItem("bills")) || [];

// Function to save bills to localStorage
function saveBills() {
  localStorage.setItem("bills", JSON.stringify(bills));
}

// Function to format date for display
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  // Check if dateStr is valid before converting
  if (!dateStr || isNaN(new Date(dateStr))) {
    return 'Invalid Date';
  }
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Function to render/re-render bills in the table and update summary
function renderBills() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const table = document.getElementById("billTable");
  table.innerHTML = ""; // Clear existing table rows
  let totalPaid = 0, totalUnpaid = 0;
  let visibleBillsCount = 0;

  // Filter bills based on search input (name, formatted date, or course)
  const filteredBills = bills.filter(bill =>
    bill.name.toLowerCase().includes(search) || 
    formatDate(bill.month).toLowerCase().includes(search) || // Search by formatted date too
    bill.course.toLowerCase().includes(search) // Search by course
  );

  // Iterate over filtered bills to populate the table
  filteredBills.forEach((bill) => {
    // Calculate totals for currently visible bills
    if (bill.status === "Paid") {
      totalPaid += parseFloat(bill.amount);
    } else {
      totalUnpaid += parseFloat(bill.amount);
    }
    
    // Find the original index of the bill in the 'bills' array.
    // This is crucial for deleteBill function to target the correct item.
    const originalIndexInBillsArray = bills.findIndex(b => b === bill);

    // Append table row for each bill
    table.innerHTML += `
      <tr>
        <td>${bill.name}</td>
        <td>${bill.course}</td>
        <td>${formatDate(bill.month)}</td>
        <td>₹${parseFloat(bill.amount).toFixed(2)}</td>
        <td><span class="${bill.status.toLowerCase()}">${bill.status}</span></td>
        <td>
          <button onclick="deleteBill(${originalIndexInBillsArray})"><i class="fas fa-trash-alt"></i> Delete</button>
        </td>
      </tr>
    `;
    visibleBillsCount++; // Increment count for visible bills
  });

  // Update summary section
  document.getElementById("totalBills").textContent = visibleBillsCount;
  document.getElementById("totalPaid").textContent = totalPaid.toFixed(2);
  document.getElementById("totalUnpaid").textContent = totalUnpaid.toFixed(2);
}

// Function to add a new bill
function addBill() {
  const name = document.getElementById("studentName").value.trim(); // .trim() to remove whitespace
  const course = document.getElementById("course").value;
  const month = document.getElementById("month").value;
  const amount = document.getElementById("amount").value;
  const status = document.getElementById("status").value;

  // Input validation
  if (!name || !course || !month || !amount || parseFloat(amount) <= 0) {
    alert("Please fill all fields correctly. Amount must be a positive number.");
    return;
  }
  // Check if "Select Course" is chosen
  if (course === "") {
      alert("Please select a course.");
      return;
  }

  const bill = { name, course, month, amount, status };
  bills.push(bill); // Add new bill to the array
  saveBills(); // Save the updated array to localStorage
  renderBills(); // Re-render the table

  // Clear form fields after successful addition
  document.getElementById("studentName").value = "";
  document.getElementById("course").value = ""; // Reset course dropdown
  document.getElementById("month").value = new Date().toISOString().split("T")[0]; // Reset date to today
  document.getElementById("amount").value = "";
}

// Function to delete a bill
function deleteBill(index) {
    // Confirm before deleting
    if (confirm("Are you sure you want to delete this bill record?")) {
        bills.splice(index, 1); // Remove bill from array
        saveBills(); // Save updated array
        renderBills(); // Re-render table
    }
}

// Function for admin login
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === "admin" && p === "1234") {
    localStorage.setItem("loggedIn", "true"); // Set login status in localStorage
    document.getElementById("loginPage").style.display = "none"; // Hide login page
    document.getElementById("mainPage").style.display = "flex"; // Show main app page (using flex for initial layout)
    renderBills(); // Render bills after successful login
  } else {
    alert("Incorrect username or password"); // Alert for wrong credentials
  }
}

// Function to log out
function logout() {
  localStorage.removeItem("loggedIn"); // Clear login status
  document.getElementById("mainPage").style.display = "none"; // Hide main app page
  document.getElementById("loginPage").style.display = "flex"; // Show login page (using flex)
  document.getElementById("username").value = ""; // Clear username input
  document.getElementById("password").value = ""; // Clear password input
}

// Event listener to run code when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("month").value = today; // Set default date to today

  // Check login status on page load to decide which page to show
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainPage").style.display = "flex"; // Set to flex when main page is shown
    renderBills(); // Load and display bills
  } else {
    document.getElementById("loginPage").style.display = "flex"; // Set to flex for login page
    document.getElementById("mainPage").style.display = "none";
  }
});

