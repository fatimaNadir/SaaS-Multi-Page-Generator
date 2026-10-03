// Supabase Configuration
const SUPABASE_URL = 'https://giwctbdpiujboqvujxvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CZ40tl-6unWEkl7vHfMyLQ_cf98mGqzc';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('generator-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const loadingSpinner = document.getElementById('loading-spinner');
const previewContainer = document.getElementById('preview-container');
const historyTableBody = document.getElementById('history-table-body');
const downloadZipBtn = document.getElementById('download-zip-btn');

let lastGeneratedData = null;

// Form Submit & Save to Database
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const businessName = document.getElementById('business-name').value;
    const businessCity = document.getElementById('business-city').value;
    const businessPhone = document.getElementById('business-phone').value;
    const templateStyle = document.getElementById('template-style').value;
    const businessServices = document.getElementById('business-services').value;

    // UI Loading State
    btnText.textContent = 'Generating & Saving...';
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    lastGeneratedData = { businessName, businessCity, businessPhone, templateStyle, businessServices };

    // Render Preview
    renderPreview(lastGeneratedData);

    try {
        // Save to Supabase
        const { data, error } = await _supabase
            .from('websites')
            .insert([{ business_name: businessName, city: businessCity, phone: businessPhone, template: templateStyle, services: businessServices }]);

        if (error) throw error;

        alert('Success! Website generated and saved to Supabase cloud.');
        fetchHistory();
    } catch (err) {
        alert('Error saving data: ' + err.message);
    } finally {
        btnText.textContent = 'Generate & Save Site 🚀';
        loadingSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

// Render Preview based on Selected Template
function renderPreview(data) {
    let themeClass = 'border-indigo-500/30 text-indigo-400';
    if(data.templateStyle === 'minimalist') themeClass = 'border-slate-500/30 text-slate-200';
    if(data.templateStyle === 'ecommerce') themeClass = 'border-emerald-500/30 text-emerald-400';

    previewContainer.innerHTML = `
        <div class="space-y-4">
            <div class="border ${themeClass} bg-slate-900 p-4 rounded-xl">
                <span class="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800">${data.templateStyle} Template</span>
                <h4 class="text-xl font-black text-white mt-2">${data.businessName}</h4>
                <p class="text-sm text-slate-300 mt-1">${data.businessServices}</p>
            </div>
            <div class="flex justify-between items-center text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span>📍 ${data.businessCity}</span>
                <span>📞 ${data.businessPhone}</span>
            </div>
        </div>
    `;
}

// Fetch History from Supabase
async function fetchHistory() {
    try {
        const { data, error } = await _supabase
            .from('websites')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        historyTableBody.innerHTML = '';
        data.forEach(row => {
            historyTableBody.innerHTML += `
                <tr class="hover:bg-slate-950/50">
                    <td class="px-4 py-3 font-medium text-white">${row.business_name}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 bg-slate-800 text-xs rounded">${row.template || 'modern-dark'}</span></td>
                    <td class="px-4 py-3">${row.city}</td>
                    <td class="px-4 py-3"><button onclick="alert('Loaded data for ${row.business_name}')" class="text-indigo-400 hover:underline text-xs">View</button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Error fetching history:', err);
    }
}

// One-Click ZIP Download Functionality using JSZip
downloadZipBtn.addEventListener('click', () => {
    if (!lastGeneratedData) {
        alert('Please generate a website first before downloading!');
        return;
    }

    const zip = new JSZip();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${lastGeneratedData.businessName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-10">
    <h1 class="text-4xl font-bold">${lastGeneratedData.businessName}</h1>
    <p class="mt-4 text-lg">${lastGeneratedData.businessServices}</p>
    <div class="mt-6">
        <p>Location: ${lastGeneratedData.businessCity}</p>
        <p>Contact: ${lastGeneratedData.businessPhone}</p>
    </div>
</body>
</html>`;

    zip.file("index.html", htmlContent);
    zip.file("README.md", `# ${lastGeneratedData.businessName}\nGenerated via SiteCraft Pro.`);

    zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, `${lastGeneratedData.businessName.toLowerCase().replace(/\s+/g, '-')}-site.zip`);
    });
});

// Initial Load
fetchHistory();
