// --- PENTING: GANTI DENGAN URL API GOOGLE APPS SCRIPT ANDA ---
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxBQLYQqY3j914T2E_9xM0CAGAn6lTTh1wXBDXlXuVObYwby36WRB_qFww2h3XmWQrb/exec'; 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Pengecekan pada halaman non-login untuk memastikan pengguna terautentikasi
    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('petugas.html')) {
        checkAuthentication();
    }
});

// --- FUNGSI UTAMA UNTUK MENGIRIM PERMINTAAN API ---
async function sendApiRequest(data) {
    try {
        // Karena menggunakan GAS dengan no-cors, respons tidak dapat dibaca di sisi klien secara normal
        // Namun, permintaan POST tetap dikirim dan dijalankan di sisi server (GAS).
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data),
        });
        
        // Di sini kita hanya bisa mengembalikan response dummy karena no-cors
        return { status: 200, message: 'Request sent.' }; 

    } catch (error) {
        console.error('Fetch Error:', error);
        showAlert('Terjadi kesalahan koneksi ke API.', 'error');
        return { status: 500, message: 'Koneksi gagal.' };
    }
}

// --- FUNGSI UNTUK MENAMPILKAN PESAN (Mengganti alert()) ---
function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    if (alertMessage) {
        alertMessage.textContent = message;
        alertMessage.className = `message ${type}`;
        alertMessage.style.display = 'block';

        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    }
}

// --- FUNGSI LOGIN ---
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // SIMULASI: Karena respons no-cors tidak bisa dibaca, kita simulasikan login berhasil
    // Di produksi, Anda harus menggunakan Netlify Function atau Webhook GAS untuk membaca respons yang sebenarnya.
    const simulatedSuccess = (username === 'admin' && password === 'password_admin') || 
                             (username === 'petugas1' && password === 'password_petugas');
    
    if (simulatedSuccess) {
        const role = (username === 'admin') ? 'Admin' : 'Petugas';
        const userId = (username === 'admin') ? 1 : 2; // Sesuai ID di Sheet Users
        
        // Simpan info user
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        
        // Panggil fungsi log (GAS akan mencatat login berhasil)
        await logAction('Login', `User ${username} berhasil login.`);

        showAlert(`Login Sukses! Mengarahkan sebagai ${role}...`, 'success');
        
        // Arahkan setelah jeda
        setTimeout(() => {
            window.location.href = (role === 'Admin') ? 'admin.html' : 'petugas.html';
        }, 1000);

    } else {
        showAlert('Login gagal. Username atau Password salah.', 'error');
        // Log aksi gagal ditangani di sisi GAS pada fungsi handleLogin
    }
}

// --- FUNGSI LOG ACTION (KUNCI PERSYARATAN LOG ANDA) ---
async function logAction(actionType, details) {
    const userId = localStorage.getItem('userId') || 'GUEST';
    await sendApiRequest({
        action: 'log_action', 
        userId: userId,
        actionType: actionType,
        details: details,
    });
}

// --- FUNGSI PENGAMANAN HALAMAN ---
function checkAuthentication() {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
        alert('Anda harus login terlebih dahulu.');
        window.location.href = 'index.html';
        return;
    }

    const requiredRole = window.location.pathname.includes('admin.html') ? 'Admin' : 'Petugas';
    if (userRole !== requiredRole) {
        alert(`Akses Ditolak. Halaman ini hanya untuk ${requiredRole}.`);
        window.location.href = 'index.html';
    }
}

// --- FUNGSI LOGOUT ---
function handleLogout() {
    const username = localStorage.getItem('username') || 'Unknown';
    logAction('Logout', `User ${username} keluar.`).then(() => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}