(() => {
  if (window.twemoji) {
    window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
  }

  const statusSelects = document.querySelectorAll('.report-status-select');
  if (statusSelects.length) {
    const updateStats = (stats) => {
      if (!stats) return;
      Object.entries(stats).forEach(([key, value]) => {
        const el = document.querySelector(`[data-stat="${key}"]`);
        if (el) el.textContent = value;
      });
    };

    statusSelects.forEach((select) => {
      select.addEventListener('change', async () => {
        const form = select.closest('form');
        const reportId = select.dataset.reportId;
        const status = select.value;

        try {
          const res = await fetch(`/admin/reports/${reportId}/status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({ status })
          });

          if (!res.ok) throw new Error('Gagal memperbarui status');
          const data = await res.json();
          updateStats(data.stats);

          const card = select.closest('.report-card');
          if (card) {
            const badge = card.querySelector('.badge.status');
            if (badge) {
              badge.classList.remove('menunggu', 'diproses', 'selesai');
              const lower = status.toLowerCase();
              badge.classList.add(lower);
              badge.textContent = status;
            }
          }
        } catch (err) {
          if (form) {
            form.submit();
          }
        }
      });
    });
  }
})();
