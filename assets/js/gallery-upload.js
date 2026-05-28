(() => {
  const GALLERY_UPLOAD_PASSWORD = 'COLGalleryUpload';
  const GALLERY_LOCAL_STORAGE_KEY = 'colGalleryUserUploads';
  const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB per image to stay within localStorage quota

  const readUploads = () => {
    try {
      const raw = localStorage.getItem(GALLERY_LOCAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Unable to read local gallery uploads:', error);
      return [];
    }
  };

  const writeUploads = (items) => {
    try {
      localStorage.setItem(GALLERY_LOCAL_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Unable to save local gallery uploads:', error);
      return false;
    }
  };

  const addUpload = ({ file, dataUrl }) => {
    const current = readUploads();
    current.unshift({ src: dataUrl, alt: file?.name || 'Uploaded gallery image' });
    return writeUploads(current);
  };

  const bindUploadForm = ({
    buttonId = 'gallery-upload-button',
    passwordInputId = 'gallery-upload-password',
    fileInputId = 'gallery-upload-input',
    messageId = 'gallery-upload-message',
    onSuccess,
  } = {}) => {
    const button = document.getElementById(buttonId);
    const passwordInput = document.getElementById(passwordInputId);
    const fileInput = document.getElementById(fileInputId);
    const message = document.getElementById(messageId);

    if (!button || !passwordInput || !fileInput) return false;

    const setMessage = (text, isError = false) => {
      if (!message) return;
      message.textContent = text;
      message.style.color = isError ? '#1a2b5e' : '#b03020';
    };

    button.addEventListener('click', () => {
      const password = String(passwordInput.value || '').trim();
      const file = fileInput.files && fileInput.files[0];

      if (password !== GALLERY_UPLOAD_PASSWORD) {
        setMessage('Incorrect password. Image was not uploaded.', true);
        return;
      }

      if (!file) {
        setMessage('Please choose an image first.', true);
        return;
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setMessage(`Selected file is ${sizeMb}MB. Maximum allowed size is 4MB.`, true);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (!dataUrl) {
          setMessage('Unable to read selected image.', true);
          return;
        }

        const saved = addUpload({ file, dataUrl });
        if (!saved) {
          setMessage('Upload failed: browser storage is full. Remove older uploaded images or choose a smaller image.', true);
          return;
        }

        fileInput.value = '';
        passwordInput.value = '';
        setMessage('Image uploaded successfully.');
        if (typeof onSuccess === 'function') onSuccess();
      };

      reader.onerror = () => setMessage('Unable to read selected image.', true);
      reader.readAsDataURL(file);
    });

    return true;
  };

  window.COLGalleryUpload = {
    key: GALLERY_LOCAL_STORAGE_KEY,
    readUploads,
    bindUploadForm,
  };
})();
