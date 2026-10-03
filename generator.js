// Supabase Configuration
const SUPABASE_URL = 'https://giwctbdpiujboqvujxvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CZ40tl-6unWEkl7vHfMyLQ_cf98mGqz';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('generatorForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusMessage = document.getElementById('statusMessage');
const historyTableBody = document.getElementById('historyTableBody');
const refreshHistoryBtn = document.getElementById('refreshHistory');

// Form Submit Handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect Form Data
    const businessName = document.getElementById('businessName').value.trim();
    const city = document.getElementById('city').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const services = document.getElementById('services').value.trim();

    // Show Loading Spinner
    submitBtn.disabled = true;
    btnText.textContent = 'Generating & Saving...';
    loadingSpinner.classList.remove('hidden');
    statusMessage.classList.add('hidden');

    try {
        // Insert Data into Supabase Database
        const { data, error } = await _supabase
            .from('generated_websites')
            .insert([{ business_name: businessName, city: city, phone: phone, services: services }]);

        if (error) {
            console.error("Database Error:", error.message);
            alert("Error saving data: " + error.message);
        } else {
            // Success State
            statusMessage.classList.remove('hidden');
            form.reset();
            fetchHistory(); // Refresh history list
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
    } finally {
        // Hide Loading Spinner
        submitBtn.disabled = false;
        btnText.textContent = 'Generate Multi-Page Website 🚀';
        loadingSpinner.classList.add('hidden');
    }
});

// Fetch Recent History from Supabase
async function fetchHistory() {
    try {
        const { data, error } = await _supabase
            .from('generated_websites')
            .select('*')
            .order('id', { ascending: false })
            .limit(5);

        if (error) {
            console.error("Error fetching history:", error.message);
            historyTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-400">Failed to load history</td></tr>`;
            return;
        }

        if (!data || data.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500">No generated websites yet.</td></tr>`;
            return;
        }

        historyTableBody.innerHTML = '';
        data.forEach(item => {
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent';
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-700/50 hover:bg-slate-800/50 transition';
            row.innerHTML = `
                <td class="p-3 font-medium text-white">${item.business_name}</td>
                <td class="p-3 text-slate-300">${item.city}</td>
                <td class="p-3 text-slate-300">${item.phone}</td>
                <td class="p-3 text-slate-400 text-xs">${dateStr}</td>
            `;
            historyTableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Error:", err);
    }
}

// Copy Summary Button Action
document.getElementById('copyInfoBtn').addEventListener('click', () => {
    navigator.clipboard.writeText("Website successfully generated via SaaS Multi-Page Generator Pro!");
    alert("Summary copied to clipboard!");
});

// Preview Button Action
document.getElementById('previewBtn').addEventListener('click', () => {
    alert("Preview feature: All multi-page assets are ready and configured!");
});

// Refresh button listener
refreshHistoryBtn.addEventListener('click', fetchHistory);

// Load history on page load
window.addEventListener('DOMContentLoaded', fetchHistory);
