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

  const photoInput = document.getElementById('photo');
  if (photoInput) {
    const dropzone = photoInput.closest('.dropzone');
    const dropInner = dropzone ? dropzone.querySelector('.dropzone-inner') : null;
    const defaultMarkup = dropInner ? dropInner.innerHTML : '';

    const renderPreview = (file) => {
      if (!dropzone || !dropInner) return;
      dropzone.classList.add('has-preview');
      dropInner.innerHTML = '';

      const previewWrap = document.createElement('div');
      previewWrap.className = 'preview-wrap';

      const img = document.createElement('img');
      img.alt = 'Preview foto';
      previewWrap.appendChild(img);

      const name = document.createElement('span');
      name.className = 'preview-name';
      name.textContent = file.name;
      previewWrap.appendChild(name);

      dropInner.appendChild(previewWrap);

      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };

    const resetPreview = () => {
      if (!dropzone || !dropInner) return;
      dropzone.classList.remove('has-preview');
      dropInner.innerHTML = defaultMarkup;
    };

    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      if (file) {
        renderPreview(file);
      }
    });
  }
})();
