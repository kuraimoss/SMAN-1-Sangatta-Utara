(() => {
  if (window.twemoji) {
    window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
  }

  const categoryInput = document.getElementById('categoryInput');
  const tiles = document.querySelectorAll('.tile');
  if (tiles.length && categoryInput) {
    tiles.forEach((tile) => {
      if (tile.dataset.value === categoryInput.value) {
        tile.classList.add('selected');
      }
      tile.addEventListener('click', () => {
        tiles.forEach((t) => t.classList.remove('selected'));
        tile.classList.add('selected');
        categoryInput.value = tile.dataset.value;
      });
    });
  }

  const desc = document.getElementById('description');
  const countEl = document.getElementById('charCount');
  if (desc && countEl) {
    const updateCount = () => {
      countEl.textContent = `${desc.value.length} karakter`;
    };
    desc.addEventListener('input', updateCount);
    updateCount();
  }

  const anonymous = document.getElementById('anonymous');
  const nameField = document.getElementById('nameField');
  if (anonymous && nameField) {
    const toggleName = () => {
      if (anonymous.checked) {
        nameField.classList.remove('show');
      } else {
        nameField.classList.add('show');
      }
    };
    anonymous.addEventListener('change', toggleName);
    toggleName();
  }
})();
