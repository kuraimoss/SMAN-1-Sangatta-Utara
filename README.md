# SMAN 1 Sangatta Utara - Sistem Pelaporan Fasilitas

Website pelaporan fasilitas sekolah berbasis Node.js + Express + EJS, dengan penyimpanan data JSON dan upload foto.

## Prasyarat
- Node.js (versi LTS disarankan)
- npm

## Instalasi
1) Clone repo
```
git clone https://github.com/kuraimoss/SMAN-1-Sangatta-Utara.git
```

2) Masuk ke folder project
```
cd SMAN-1-Sangatta-Utara
```

3) Install dependencies
```
npm install
```

## Menjalankan
```
npm start
```
Buka di browser:
```
http://localhost:3000
```

## Demo Login Admin
- Username: admin
- Password: admin123

## Struktur Data
- Data laporan tersimpan di `data/reports.json`.
- Upload foto tersimpan di `public/uploads`.

## Catatan
- Pastikan folder `public/uploads` ada (sudah disediakan).
- Jika port 3000 sedang terpakai, set `PORT`:
```
$env:PORT=3001
npm start
```
