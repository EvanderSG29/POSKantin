document.addEventListener('DOMContentLoaded', () => {
    // Pastikan user adalah Admin (fungsi ini ada di app.js)
    checkAuthentication(); 
    
    // Setup navigasi dan tombol
    setupNavigation();
    document.getElementById('logoutBtn').addEventListener('click', handleLogout); // handleLogout dari app.js
    
    // Load data awal saat masuk halaman
    fetchItems();
    fetchLogs(); 

    // Setup Modal
    setupModal();
});

// --- FUNGSI MENGAMBIL DATA LOG (READ LOG) ---
async function fetchLogs() {
    const tableBody = document.getElementById('logTableBody');
    tableBody.innerHTML = '<tr><td colspan="4">Memuat Log Aksi...</td></tr>';
    
    // Simulasi respons dari GAS API (seharusnya Anda buat 'get_logs' di Apps Script)
    // Jika Anda sudah update Apps Script, Anda bisa ganti ini dengan panggilan sendApiRequest
    
    // SIMULASI DATA
    const logs = [
        { Timestamp: new Date().toLocaleString(), UserID: 'admin', ActionType: 'Login', Details: 'User admin berhasil login.' },
        { Timestamp: new Date().toLocaleString(), UserID: '1', ActionType: 'CRUD_Create', Details: 'Menambah barang: Nasi Goreng (ID 1)' },
        { Timestamp: new Date().toLocaleString(), UserID: '2', ActionType: 'Input_Transaction', Details: 'Transaksi dari Petugas #T001.' },
    ];

    tableBody.innerHTML = logs.map(log => `
        <tr>
            <td>${log.Timestamp}</td>
            <td>${log.UserID}</td>
            <td>${log.ActionType}</td>
            <td>${log.Details}</td>
        </tr>
    `).join('');
}

// --- FUNGSI MENGAMBIL DATA BARANG (READ) ---
async function fetchItems() {
    const tableBody = document.getElementById('itemTableBody');
    tableBody.innerHTML = '<tr><td colspan="5">Memuat data barang...</td></tr>';
    
    // Panggil API GAS (Anda HARUS menambahkan 'get_items' di doPost() GAS!)
    
    // SIMULASI DATA
    const items = [
        { ID: 1, NamaBarang: 'Kopi Susu', Harga: 5000, Stok: 50 },
        { ID: 2, NamaBarang: 'Teh Dingin', Harga: 3000, Stok: 70 },
        { ID: 3, NamaBarang: 'Nasi Kuning', Harga: 10000, Stok: 15 },
    ];
    
    tableBody.innerHTML = items.map(item => `
        <tr>
            <td>${item.ID}</td>
            <td>${item.NamaBarang}</td>
            <td>Rp${item.Harga.toLocaleString('id-ID')}</td>
            <td>${item.Stok}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editItem(${item.ID})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteItem(${item.ID}, '${item.NamaBarang}')">Hapus</button>
            </td>
        </tr>
    `).join('');
}


// --- FUNGSI CRUD BARANG (CREATE/UPDATE/DELETE) ---
async function saveItem(event) {
    event.preventDefault();
    const itemId = document.getElementById('itemId').value;
    const itemName = document.getElementById('itemName').value;
    // ... data lainnya ...

    const actionType = itemId ? 'CRUD_Update' : 'CRUD_Create';
    const detail = `${actionType} barang: ${itemName} (ID ${itemId || 'baru'})`;

    // 1. Panggil API GAS untuk menyimpan/mengupdate item
    // sendApiRequest({ action: 'save_item', ...data });

    // 2. Catat aksi ke log setelah operasi sukses (atau simulasi sukses)
    await logAction(actionType, detail);
    
    // 3. Notifikasi dan Refresh
    closeModal();
    showAlert(`Item ${itemName} berhasil disimpan. Aksi tercatat!`, 'success');
    fetchItems(); // Refresh tabel
    fetchLogs(); // Refresh log
}

function deleteItem(id, nama) {
    if (confirm(`Yakin ingin menghapus item: ${nama}? Aksi ini akan dicatat.`)) {
        
        // 1. Panggil API GAS untuk menghapus item
        // sendApiRequest({ action: 'delete_item', itemId: id });

        // 2. Catat aksi ke log
        logAction('CRUD_Delete', `Menghapus barang: ${nama} (ID ${id})`);
        
        // 3. Notifikasi dan Refresh
        showAlert(`Item ${nama} berhasil dihapus. Aksi tercatat!`, 'success');
        fetchItems(); // Refresh tabel
        fetchLogs(); // Refresh log
    }
}

// --- FUNGSI UTILITAS UI ---

function setupNavigation() {
    const navButtons = document.querySelectorAll('.menu button');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Logika Navigasi Tab
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.style.display = 'none');

            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
            this.classList.add('active');
        });
    });
}

function setupModal() {
    const modal = document.getElementById('customModal');
    document.getElementById('showAddItemModal').addEventListener('click', () => {
        document.getElementById('itemForm').reset();
        document.getElementById('modalTitle').textContent = 'Tambah Barang Baru';
        modal.style.display = 'flex';
    });
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('itemForm').addEventListener('submit', saveItem);
}

function closeModal() {
    document.getElementById('customModal').style.display = 'none';
}

function editItem(id) {
    // Fungsi untuk memuat data item yang ingin diedit ke modal
    document.getElementById('modalTitle').textContent = 'Edit Barang';
    document.getElementById('itemId').value = id;
    // ... isi field lainnya dari data item yang diambil
    document.getElementById('customModal').style.display = 'flex';
}