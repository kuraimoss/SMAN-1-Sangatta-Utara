const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_PATH = path.join(__dirname, 'data', 'reports.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const STATUS_ALIASES = {
  Wait: 'Menunggu',
  Waiting: 'Menunggu',
  Processed: 'Diproses',
  Processing: 'Diproses',
  Finished: 'Selesai',
  Completed: 'Selesai',
  Done: 'Selesai'
};

function normalizeStatus(status) {
  return STATUS_ALIASES[status] || status;
}

function readReports() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeReports(reports) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(reports, null, 2));
}

function formatDateId(dateString) {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  return formatter.format(date);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.redirect('/admin/login');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExt = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (allowedMime.includes(file.mimetype) || allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung.'));
    }
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'sman1-sangattautara-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/report', (req, res) => {
  res.render('report-form', { error: null, form: {}, showName: false });
});

app.post('/report', (req, res) => {
  upload.single('photo')(req, res, (err) => {
    const form = req.body;
    const showName = form.isAnonymous !== 'on';
    if (err) {
      return res.render('report-form', {
        error: err.message,
        form,
        showName
      });
    }

    const category = form.category;
    const description = (form.description || '').trim();

    if (!category || description.length < 10) {
      return res.render('report-form', {
        error: 'Mohon lengkapi kategori dan deskripsi minimal 10 karakter.',
        form,
        showName
      });
    }

    const isAnonymous = form.isAnonymous === 'on';
    let reporterName = 'Anonim';
    if (!isAnonymous) {
      reporterName = (form.reporterName || '').trim() || 'Siswa';
    }

    const reports = readReports();
    const id = `R${Date.now()}`;

    const newReport = {
      id,
      category,
      description,
      photoPath: req.file ? `/uploads/${req.file.filename}` : null,
      isAnonymous,
      reporterName,
      status: 'Menunggu',
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    writeReports(reports);

    return res.redirect('/report/success');
  });
});

app.get('/report/success', (req, res) => {
  res.render('report-success');
});

app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.isAuthenticated = true;
    return res.redirect('/admin');
  }
  return res.render('admin-login', {
    error: 'Username atau password salah.'
  });
});

app.get('/admin', requireAuth, (req, res) => {
  const reports = readReports();
  let normalized = false;
  reports.forEach((report) => {
    const fixed = normalizeStatus(report.status);
    if (fixed !== report.status) {
      report.status = fixed;
      normalized = true;
    }
  });
  if (normalized) {
    writeReports(reports);
  }
  const search = (req.query.search || '').toLowerCase();
  const status = req.query.status || 'Semua Status';

  const filtered = reports.filter((report) => {
    const matchesSearch =
      report.category.toLowerCase().includes(search) ||
      report.description.toLowerCase().includes(search) ||
      report.reporterName.toLowerCase().includes(search);

    const matchesStatus =
      status === 'Semua Status' || report.status === status;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reports.length,
    menunggu: reports.filter((r) => r.status === 'Menunggu').length,
    diproses: reports.filter((r) => r.status === 'Diproses').length,
    selesai: reports.filter((r) => r.status === 'Selesai').length
  };

  res.render('admin-dashboard', {
    reports: filtered,
    stats,
    search: req.query.search || '',
    status,
    formatDateId
  });
});

app.post('/admin/reports/:id/status', requireAuth, (req, res) => {
  const reports = readReports();
  const report = reports.find((item) => item.id === req.params.id);
  if (report) {
    report.status = normalizeStatus(req.body.status);
    writeReports(reports);
  }
  const wantsJson =
    req.headers.accept && req.headers.accept.includes('application/json');
  if (wantsJson) {
    const stats = {
      total: reports.length,
      menunggu: reports.filter((r) => r.status === 'Menunggu').length,
      diproses: reports.filter((r) => r.status === 'Diproses').length,
      selesai: reports.filter((r) => r.status === 'Selesai').length
    };
    return res.json({ ok: true, stats, status: report ? report.status : null });
  }
  return res.redirect('back');
});

app.get('/admin/reports/:id', requireAuth, (req, res) => {
  const reports = readReports();
  const report = reports.find((item) => item.id === req.params.id);
  if (!report) {
    return res.redirect('/admin');
  }
  const fixed = normalizeStatus(report.status);
  if (fixed !== report.status) {
    report.status = fixed;
    writeReports(reports);
  }
  return res.render('admin-detail', { report, formatDateId });
});

app.get('/admin/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
