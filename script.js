
  const desktop = document.getElementById('desktop');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const startMenuSearch = document.getElementById('start-menu-search');
  const startMenuList = document.getElementById('start-menu-list');
  const taskbarApps = document.getElementById('taskbar-apps');
  const trayClock = document.getElementById('tray-clock');
  const trayDate = document.getElementById('date');
  const contextMenu = document.getElementById('context-menu');
  const contextRefresh = document.getElementById('context-refresh');
  const contextNewFolder = document.getElementById('context-new-folder');
  const iconContextMenu = document.getElementById('icon-context-menu');
  const iconContextDelete = document.getElementById('icon-context-delete');
const iconContextOpen = document.getElementById('icon-context-open');
const iconContextRename = document.getElementById('icon-context-rename');
const iconContextProperties = document.getElementById('icon-context-properties');
const explorerContextMenu = document.getElementById('explorer-context-menu');

const explorerOpenBtn = document.getElementById('explorer-open');

const explorerRenameBtn = document.getElementById('explorer-rename');

const explorerDeleteBtn = document.getElementById('explorer-delete');

const explorerPropertiesBtn = document.getElementById('explorer-properties');

let explorerSelectedItem = null;
let explorerSelectedName = null;
let explorerCurrentFolder = null;

  
  let windowZIndex = 10;
  let windowCount = 0;
  let currentIcon = null;
  let db;

  const fileStorage = {
  music: [],
  video: [],
  photos: []
};

const savedMediaStorage = localStorage.getItem('webos-media-storage');

if (savedMediaStorage) {

  Object.assign(fileStorage, JSON.parse(savedMediaStorage));
}

function saveMediaStorage() {

  localStorage.setItem(
    'webos-media-storage',
    JSON.stringify(fileStorage)
  );
}

  
  // In-memory file storage for media apps
const fileSystem = {
  'C:': {
    type: 'folder',
    children: {
      'Documents': {
        type: 'folder',
        children: {}
      },

      'Music': {
        type: 'folder',
        children: {}
      },

      'Photos': {
        type: 'folder',
        children: {}
      }
    }
  },

  'D:': {
    type: 'folder',
    children: {}
  }
};

// ==========================================
// STORAGE SYSTEM
// ==========================================

// LOAD FILE SYSTEM
const savedFileSystem = localStorage.getItem('webos-file-system');

if (savedFileSystem) {

  Object.assign(fileSystem, JSON.parse(savedFileSystem));
}

// SAVE FILE SYSTEM
function saveFileSystem() {

  localStorage.setItem(
    'webos-file-system',
    JSON.stringify(fileSystem)
  );
}

// INIT INDEXEDDB
function initDB() {

  const request = indexedDB.open('WebOSFiles', 1);

  request.onupgradeneeded = function(event) {

    db = event.target.result;

    if (!db.objectStoreNames.contains('files')) {

      db.createObjectStore('files', {
        keyPath: 'id'
      });
    }
  };

  request.onsuccess = function(event) {

    db = event.target.result;

    console.log('IndexedDB Ready');
  };
}

// SAVE ACTUAL FILE
function saveRealFile(id, file) {

  const transaction = db.transaction(['files'], 'readwrite');

  const store = transaction.objectStore('files');

  store.put({
    id: id,
    file: file
  });
}

// LOAD ACTUAL FILE
function loadRealFile(id, callback) {

  const transaction = db.transaction(['files'], 'readonly');

  const store = transaction.objectStore('files');

  const request = store.get(id);

  request.onsuccess = function() {

    callback(request.result?.file);
  };
}

  // Apps registry
  const apps = {
    'file-explorer': {
      name: 'File Explorer',
      icon: './images/1.png',
      createWindowContent: createFileExplorerContent
    },
    'notepad': {
      name: 'Notepad',
      icon: 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/48/notepad-icon.png',
      createWindowContent: createNotepadContent
    },
    'calculator': {
      name: 'Calculator',
      icon: 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/48/calculator-icon.png',
      createWindowContent: createCalculatorContent
    },
    'music': {
      name: 'Music',
      icon: './images/music.png',
      createWindowContent: createFileAppContent.bind(null, 'music')
    },
    'video': {
      name: 'Video',
      icon: './images/video.png',
      createWindowContent: createFileAppContent.bind(null, 'video')
    },
    'photos': {
      name: 'Photos',
      icon: './images/gallary.png',
      createWindowContent: createFileAppContent.bind(null, 'photos')
    },
    'recycle-bin': {
      name: 'Recycle Bin',
      icon: './images/recycle.png',
      createWindowContent: createControlPanelContent
    }

  };

  // Default desktop icon positions
  const defaultIconPositions = [
    { app: 'file-explorer', x: 20, y: 20 },
    { app: 'notepad', x: 20, y: 500 },
    { app: 'calculator', x: 20, y: 180 },
    { app: 'music', x: 20, y: 260 },
    { app: 'video', x: 20, y: 340 },
    { app: 'photos', x: 20, y: 420 },
    { app: 'recycle-bin', x: 20, y: 100 },
  ];

  // Open windows map: id -> window element
  const openWindows = new Map();

  // Helper: format time for tray clock
 // Helper: format time for tray clock
function formatTime(date) {
  let h = date.getHours();
  let m = date.getMinutes();
  let ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  m = m < 10 ? '0' + m : m;
  return h + ':' + m + ' ' + ampm;
}

// Helper: format date for tray
function formatDate(date) {
  const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
  return date.toLocaleDateString(undefined, options); // e.g., 10/30/2025
}

// Update both clock and date every second
function updateClock() {
  const now = new Date();
  trayClock.textContent = formatTime(now);
  trayDate.textContent = formatDate(now);
}

setInterval(updateClock, 1000);
updateClock();

  // Create desktop icons from default positions
  function createDesktopIcons() {
    desktop.innerHTML = '';
    defaultIconPositions.forEach(pos => {
      const app = apps[pos.app];
      if (!app) return;
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.dataset.app = pos.app;
      icon.style.left = pos.x + 'px';
      icon.style.top = pos.y + 'px';
      icon.tabIndex = 0;
      icon.setAttribute('aria-label', app.name);

      const img = document.createElement('img');
      img.src = app.icon;
      img.alt = app.name;
      icon.appendChild(img);

      const label = document.createElement('div');
      label.textContent = app.name;
      icon.appendChild(label);

      desktop.appendChild(icon);

      makeIconDraggable(icon);

      icon.addEventListener('dblclick', () => {
        openApp(pos.app);
      });
      icon.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          openApp(pos.app);
        }
      });
    });
  }

  // Make desktop icon draggable
  function makeIconDraggable(icon) {
    let offsetX, offsetY;
    let dragging = false;

    icon.addEventListener('mousedown', e => {
      if (e.button !== 0) return; // Only left click
      dragging = true;
      const rect = icon.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
      focusWindow(null); // defocus any window when dragging icon
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Clamp within desktop bounds
      const desktopRect = desktop.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + iconRect.width > desktopRect.width) newLeft = desktopRect.width - iconRect.width;
      if (newTop + iconRect.height > desktopRect.height) newTop = desktopRect.height - iconRect.height;

      icon.style.left = newLeft + 'px';
      icon.style.top = newTop + 'px';
    });
    window.addEventListener('mouseup', e => {
      if (dragging) {
        dragging = false;
      }
    });
  }

  // Create a window DOM element for an app
  function createWindow(appKey) {
    const app = apps[appKey];
    if (!app) return;

    const win = document.createElement('div');
    win.classList.add('window');
    win.style.top = '100px';
    win.style.left = '100px';
    win.style.width = '480px';
    win.style.height = '360px';
    win.tabIndex = 0;
    win.dataset.appKey = appKey;
    win.dataset.windowId = ++windowCount;

    // Window header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.setAttribute('aria-label', app.name + ' window');
    header.setAttribute('role', 'toolbar');

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = app.name;

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const btnMin = document.createElement('button');
    btnMin.innerHTML = '&#8211;'; // minus sign
    btnMin.title = 'Minimize';
    btnMin.setAttribute('aria-label', 'Minimize window');

    const btnMax = document.createElement('button');
    btnMax.innerHTML = '&#9744;'; // square
    btnMax.title = 'Maximize';
    btnMax.setAttribute('aria-label', 'Maximize window');

    const btnClose = document.createElement('button');
    btnClose.innerHTML = '&#10005;'; // x
    btnClose.title = 'Close';
    btnClose.setAttribute('aria-label', 'Close window');

    controls.append(btnMin, btnMax, btnClose);
    header.append(title, controls);
    win.appendChild(header);

    // Window content
    const content = document.createElement('div');
    content.className = 'window-content';
    content.style.display = 'flex';
content.style.flexDirection = 'column';
content.style.height = 'calc(100% - 32px)';
content.style.background = '#fff';
content.style.overflow = 'hidden';
    app.createWindowContent(content);
    win.appendChild(content);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    win.appendChild(resizeHandle);

    // Append to desktop
    desktop.appendChild(win);

    // Focus and z-index
    focusWindow(win);

    // Event listeners
    btnClose.addEventListener('click', () => {
      closeWindow(win);
    });
    btnMin.addEventListener('click', () => {
      minimizeWindow(win);
    });
    btnMax.addEventListener('click', () => {
      toggleMaximizeWindow(win, btnMax);
    });

    makeDraggable(win, header);
    makeResizable(win, resizeHandle);

    win.addEventListener('mousedown', () => {
      focusWindow(win);
    });
    win.addEventListener('focus', () => {
      focusWindow(win);
    });

    // Add to taskbar
    addToTaskbar(win, app);

    // Save open window reference
    openWindows.set(win.dataset.windowId, win);

    return win;
  }


  // Create File Explorer content (simplified)
 function createFileExplorerContent(container) {

  container.innerHTML = '';

  // ===== CURRENT LOCATION =====
  let currentFolder = fileSystem;
  let currentPath = 'This PC';

  // ===== PATH BAR =====
  const pathBar = document.createElement('div');

  pathBar.style.background = '#0078d7';
  pathBar.style.color = 'white';
  pathBar.style.padding = '8px';
  pathBar.style.display = 'flex';
  pathBar.style.alignItems = 'space-between';
  pathBar.style.gap = '15px';
  pathBar.style.flexWrap = 'wrap';

  // Path Text
  const pathText = document.createElement('span');
  pathText.textContent = currentPath;

  // ===== NEW FOLDER BUTTON =====
  const newFolderBtn = document.createElement('button');
  newFolderBtn.textContent = 'New Folder';

  // ===== FILE UPLOAD =====
  const uploadInput = document.createElement('input');

  uploadInput.type = 'file';
  uploadInput.multiple = true;

  // ===== BACK BUTTON =====
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back';

  pathBar.appendChild(backBtn);
  pathBar.appendChild(pathText);
  pathBar.appendChild(newFolderBtn);
  pathBar.appendChild(uploadInput);

  container.appendChild(pathBar);

  // ===== FILE LIST =====
  const list = document.createElement('div');

  list.style.padding = '10px';
  list.style.display = 'flex';
  list.style.flexWrap = 'wrap';
  list.style.gap = '15px';
  list.style.overflow = 'auto';

  container.appendChild(list);

  // ===== PATH STACK =====
  const history = [];

  // ===== RENDER FOLDER =====
  function renderFolder(folderObj) {

    list.innerHTML = '';

    Object.entries(folderObj).forEach(([name, item]) => {

      const itemDiv = document.createElement('div');

      itemDiv.style.width = '90px';
      itemDiv.style.textAlign = 'center';
      itemDiv.style.cursor = 'pointer';
      itemDiv.style.userSelect = 'none';

      // ICON
      const img = document.createElement('img');

      img.style.width = '64px';
      img.style.height = '64px';

      // Folder icon
      if (item.type === 'folder') {

        img.src = './images/folder.png';
      }

      // Image file
      else if (item.fileType?.startsWith('image')) {

        img.src = './images/gallary.png';
      }

      // Audio file
      else if (item.fileType?.startsWith('audio')) {

        img.src = './images/music.png';
      }

      // Video file
      else if (item.fileType?.startsWith('video')) {

        img.src = './images/video.png';
      }

      // Default file
      else {

        img.src = './images/file.png';
      }

      // LABEL
      const label = document.createElement('div');

      label.textContent = name;

      label.style.fontSize = '12px';
      label.style.marginTop = '5px';
      label.style.wordBreak = 'break-word';

      itemDiv.appendChild(img);
      itemDiv.appendChild(label);

      // ===== DOUBLE CLICK =====
// ===== DOUBLE CLICK =====
itemDiv.addEventListener('dblclick', () => {

  // OPEN FOLDER
  if (item.type === 'folder') {

    history.push({
      folder: currentFolder,
      path: currentPath
    });

    currentFolder = item.children;

    currentPath += '/' + name;

    pathText.textContent = currentPath;

    renderFolder(currentFolder);
  }

  // OPEN FILE
  else if (item.type === 'file') {

    loadRealFile(item.fileId, file => {

      if (!file) return;

      const url = URL.createObjectURL(file);

      window.open(url);
    });
  }
});


// ===== RIGHT CLICK =====
itemDiv.addEventListener('contextmenu', e => {

  e.preventDefault();

  explorerSelectedItem = item;

  explorerSelectedName = name;

  explorerCurrentFolder = folderObj;

  explorerContextMenu.style.display = 'block';

  explorerContextMenu.style.left = e.clientX + 'px';

  explorerContextMenu.style.top = e.clientY + 'px';
});

      list.appendChild(itemDiv);
    });
  }

  // ===== CREATE NEW FOLDER =====
  newFolderBtn.addEventListener('click', () => {

    const folderName = prompt('Folder Name');

    if (!folderName || folderName.trim() === '') return;

   currentFolder[folderName] = {
  type: 'folder',
  children: {}
};

saveFileSystem();

renderFolder(currentFolder);
  });






  // ===== FILE UPLOAD =====
uploadInput.addEventListener('change', () => {

  Array.from(uploadInput.files).forEach(file => {

    const fileId = Date.now() + '_' + file.name;

    saveRealFile(fileId, file);

    currentFolder[file.name] = {

      type: 'file',

      fileType: file.type,

      fileId: fileId
    };
  });

  saveFileSystem();

  renderFolder(currentFolder);
});

  // ===== BACK BUTTON =====
  backBtn.addEventListener('click', () => {

    if (history.length === 0) return;

    const prev = history.pop();

    currentFolder = prev.folder;

    currentPath = prev.path;

    pathText.textContent = currentPath;

    renderFolder(currentFolder);
  });

  // ===== INITIAL RENDER =====
  renderFolder(fileSystem);
}






  // Create Notepad content
  function createNotepadContent(container) {
  container.innerHTML = '';

  // Main wrapper
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
wrapper.style.flex = '1';
  wrapper.style.width = '100%';
  wrapper.style.background = '#ffffff';

  // ===== Toolbar =====
  const toolbar = document.createElement('div');
  toolbar.style.display = 'flex';
  toolbar.style.alignItems = 'center';
  toolbar.style.gap = '10px';
  toolbar.style.padding = '8px';
  toolbar.style.background = '#f1f1f1';
  toolbar.style.borderBottom = '1px solid #ccc';
  toolbar.style.flexShrink = '0';

  // Save Button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';

  // Download Button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Download';

  // Clear Button
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';

  // Word Counter
  const wordCount = document.createElement('div');
  wordCount.style.marginLeft = 'auto';
  wordCount.style.fontSize = '14px';
  wordCount.textContent = 'Words: 0';

  // ===== Textarea =====
const textarea = document.createElement('textarea');

// textarea.value = localStorage.getItem('webos-notepad') || '';
textarea.style.position = 'relative';
textarea.style.zIndex = '9999';
textarea.style.display = 'block';
textarea.style.visibility = 'visible';
textarea.placeholder = 'Start typing here...';


textarea.style.width = '100%';
textarea.style.flex = '1';
textarea.style.minHeight = '0';

textarea.style.padding = '15px';
textarea.style.border = 'none';
textarea.style.outline = 'none';
textarea.style.resize = 'none';

textarea.style.fontSize = '16px';
textarea.style.fontFamily = 'Consolas, monospace';
textarea.style.lineHeight = '1.5';

// IMPORTANT FIX
textarea.style.backgroundColor = '#ffffff';
textarea.style.color = '#000000';
textarea.style.caretColor = '#000000';
textarea.style.opacity = '1';

textarea.style.boxSizing = 'border-box';

textarea.spellcheck = false;
textarea.autocomplete = 'off';
textarea.autocorrect = 'off';
textarea.autocapitalize = 'off';

  // IMPORTANT FIXES
  textarea.style.boxSizing = 'border-box';
  textarea.removeAttribute('readonly');
  textarea.disabled = false;

  // ===== Functions =====

  function updateWordCount() {
    const words = textarea.value
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    wordCount.textContent = `Words: ${words.length}`;
  }

  // Auto Save
  textarea.addEventListener('input', () => {
    localStorage.setItem('webos-notepad', textarea.value);
    updateWordCount();
  });

  // Save Button
  saveBtn.addEventListener('click', () => {
    localStorage.setItem('webos-notepad', textarea.value);
    alert('Note Saved!');
  });

  // Clear Button
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    localStorage.removeItem('webos-notepad');
    updateWordCount();
  });

  // Download Button
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([textarea.value], {
      type: 'text/plain'
    });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'note.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  });

  // Initial count
  updateWordCount();

  // ===== Append =====
  toolbar.appendChild(saveBtn);
  toolbar.appendChild(downloadBtn);
  toolbar.appendChild(clearBtn);
  toolbar.appendChild(wordCount);

  wrapper.appendChild(toolbar);
  wrapper.appendChild(textarea);

  container.appendChild(wrapper);

  // Auto focus
  setTimeout(() => {
    textarea.focus();
  }, 100);
}





  // Create Calculator content (simple)
  function createCalculatorContent(container) {
    container.innerHTML = '';
    const display = document.createElement('input');
    display.type = 'text';
    display.readOnly = true;
    display.style.width = '100%';
    display.style.height = '40px';
    display.style.fontSize = '20px';
    display.style.textAlign = 'right';
    display.style.marginBottom = '10px';
    container.appendChild(display);

    const buttons = [
      ['7','8','9','/'],
      ['4','5','6','*'],
      ['1','2','3','-'],
      ['0','.','=','+']
    ];

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'grid';
    btnContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    btnContainer.style.gridGap = '5px';

    buttons.flat().forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.fontSize = '18px';
      btn.style.padding = '10px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        if(label === '=') {
          try {
            display.value = eval(display.value) || '';
          } catch {
            display.value = 'Error';
          }
        } else {
          if(display.value === 'Error') display.value = '';
          display.value += label;
        }
      });
      btnContainer.appendChild(btn);
    });

    container.appendChild(btnContainer);
  }

  // Create Media file app content (music, video, photos)
  function createFileAppContent(type, container) {
    container.innerHTML = '';

    // Controls container
    const controls = document.createElement('div');
    controls.className = 'file-app-controls';


   
    const fileInput = document.createElement('input');

fileInput.type = 'file';

if (type === 'music') {
  fileInput.accept = 'audio/*';
}

if (type === 'video') {
  fileInput.accept = 'video/*';
}

if (type === 'photos') {
  fileInput.accept = 'image/*';
}

controls.appendChild(fileInput);
   

    container.appendChild(controls);


    fileInput.addEventListener('change', () => {

  const file = fileInput.files[0];

  if (!file) return;

 const fileId = Date.now() + '_' + file.name;

saveRealFile(fileId, file);

fileStorage[type].push({
  name: file.name,
  type: file.type,
  fileId: fileId
});

saveMediaStorage();

renderFiles();
});

    // File list container
    const list = document.createElement('div');
    list.className = 'file-list';
    container.appendChild(list);

    // Render file list
   function renderFiles() {

  list.innerHTML = '';

  fileStorage[type].forEach((file, index) => {

    const item = document.createElement('div');

    item.className = 'file-item';

    item.style.marginBottom = '10px';

    // FILE NAME
    const title = document.createElement('div');

    title.textContent = file.name;

    item.appendChild(title);

    // IMAGES
    if (type === 'photos') {

      const img = document.createElement('img');

      loadRealFile(file.fileId, realFile => {

  if (!realFile) return;

  img.src = URL.createObjectURL(realFile);
});

      img.style.width = '120px';
      img.style.marginTop = '5px';

      item.appendChild(img);
    }

    // MUSIC
    if (type === 'music') {

      const audio = document.createElement('audio');

      audio.controls = true;
      loadRealFile(file.fileId, realFile => {

  if (!realFile) return;

  audio.src = URL.createObjectURL(realFile);
});

      item.appendChild(audio);
    }

    // VIDEO
    if (type === 'video') {

      const video = document.createElement('video');

      video.controls = true;
   loadRealFile(file.fileId, realFile => {

  if (!realFile) return;

  video.src = URL.createObjectURL(realFile);
});

      video.style.width = '200px';

      item.appendChild(video);
    }

    // DELETE BUTTON
    const delBtn = document.createElement('button');

    delBtn.textContent = 'Delete';

    delBtn.addEventListener('click', () => {

      fileStorage[type].splice(index, 1);
     saveMediaStorage();

      renderFiles();
    });

    item.appendChild(delBtn);

    list.appendChild(item);
  });
}

    

   

    renderFiles();
  }

  // Create REcycle Bin content (placeholder)
  function createControlPanelContent(container) {
    container.innerHTML = '<h3>Recycle Bin </h3><p>(Not implemented)</p>';
  }

  // Open app by key
  function openApp(appKey) {
    for (let win of openWindows.values()) {
      if (win.dataset.appKey === appKey) {
        if (win.style.display === 'none') {
          win.style.display = 'flex';
        }
        focusWindow(win);
        return;
      }
    }
    createWindow(appKey);
  }






  // Start Menu apps list
  function populateStartMenuList(filter = '') {
    startMenuList.innerHTML = '';
    const filterLower = filter.toLowerCase();
    Object.entries(apps).forEach(([key, app]) => {
      if (app.name.toLowerCase().includes(filterLower)) {
        const btn = document.createElement('button');
        btn.textContent = app.name;
        btn.setAttribute('aria-label', 'Launch ' + app.name);
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = '';
        btn.prepend(img);
        btn.addEventListener('click', () => {
          openApp(key);
          toggleStartMenu(false);
        });
        startMenuList.appendChild(btn);
      }
    });
  }

  
  // Toggle start menu visibility
  function toggleStartMenu(show) {
    if (typeof show === 'undefined') {
      show = startMenu.style.display !== 'flex';
    }
    if (show) {
      populateStartMenuList();
      startMenu.style.display = 'flex';
      startMenuSearch.value = '';
      startMenuSearch.focus();
    } else {
      startMenu.style.display = 'none';
      startButton.focus();
    }
  }

  // Desktop icon double click open app
  desktop.addEventListener('dblclick', e => {
    const icon = e.target.closest('.desktop-icon');
    if (!icon) return;
    const appKey = icon.dataset.app;
    if (appKey) openApp(appKey);
  });
  desktop.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const icon = document.activeElement;
      if (!icon || !icon.classList.contains('desktop-icon')) return;
      const appKey = icon.dataset.app;
      if (appKey) openApp(appKey);
    }
  });

  // Start button click
  startButton.addEventListener('click', () => {
    toggleStartMenu();
  });

  // Start menu search input
  startMenuSearch.addEventListener('input', () => {
    populateStartMenuList(startMenuSearch.value);
  });

  // Close start menu on outside click
  document.addEventListener('click', e => {
    if (!startMenu.contains(e.target) && e.target !== startButton) {
      toggleStartMenu(false);
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape'))) {
      e.preventDefault();
      toggleStartMenu();
    }
    if (e.key === 'Escape') {
      toggleStartMenu(false);
    }
  });

  // Context menu on desktop (empty space)
  desktop.addEventListener('contextmenu', e => {
    if (e.target.closest('.desktop-icon')) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  });

 document.addEventListener('click', () => {

  contextMenu.style.display = 'none';

  iconContextMenu.style.display = 'none';

  explorerContextMenu.style.display = 'none';
});

  function showContextMenu(x, y) {
    contextMenu.style.display = 'block';
    const rect = contextMenu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height - 10;
    }
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
  }


  // Icon context menu (for desktop icons)
  desktop.addEventListener('contextmenu', e => {
    const icon = e.target.closest('.desktop-icon');
    if (!icon) return;
    e.preventDefault();
    currentIcon = icon;
    showIconContextMenu(e.clientX, e.clientY);
  });

  function showIconContextMenu(x, y) {
    iconContextMenu.style.display = 'block';
    const rect = iconContextMenu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height - 10;
    }
    iconContextMenu.style.left = x + 'px';
    iconContextMenu.style.top = y + 'px';
  }


  // delete icon from desktop
  iconContextDelete.addEventListener('click', () => {
    if (currentIcon) {
      currentIcon.remove();
      currentIcon = null;
      iconContextMenu.style.display = 'none';
    }
  });

      // Open app from icon context menu

  iconContextOpen.addEventListener('click', () => {

  if (!currentIcon) return;

  const appKey = currentIcon.dataset.app;

  if (appKey) {
    openApp(appKey);
  }

  iconContextMenu.style.display = 'none';
});


// Rename icon from context menu
iconContextRename.addEventListener('click', () => {

  if (!currentIcon) return;

  const label = currentIcon.querySelector('div');

  const newName = prompt('Rename file:', label.textContent);

  if (newName && newName.trim() !== '') {
    label.textContent = newName;
  }

  iconContextMenu.style.display = 'none';
});

// Show properties (placeholder)
iconContextProperties.addEventListener('click', () => {

  if (!currentIcon) return;

  const appKey = currentIcon.dataset.app;

  const app = apps[appKey];

  alert(
    'Name: ' + app.name + '\n' +
    'Type: Application\n' +
    'App Key: ' + appKey
  );

  iconContextMenu.style.display = 'none';
});

  desktop.focus();

  window.addEventListener('resize', () => {
    openWindows.forEach(win => {
      if (win.dataset.maximized === 'true') {
        win.style.width = window.innerWidth + 'px';
        win.style.height = (window.innerHeight - 40) + 'px';
      }
    });
  });

  // Focus window and set z-index
function focusWindow(win) {
  if (!win) return;
  windowZIndex++;
  win.style.zIndex = windowZIndex;

  // Highlight focused window
  openWindows.forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
}

// Make a window draggable by header
function makeDraggable(win, header) {
  let offsetX = 0, offsetY = 0;
  let dragging = false;

  header.addEventListener('mousedown', e => {
    if (e.button !== 0) return; // left click only
    dragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    focusWindow(win);
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // clamp inside viewport
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;

    win.style.left = x + 'px';
    win.style.top = y + 'px';
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });
}

// Make a window resizable from bottom-right corner
function makeResizable(win, handle) {
  let startX, startY, startWidth, startHeight, resizing = false;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    focusWindow(win);
  });

  window.addEventListener('mousemove', e => {
    if (!resizing) return;
    const newWidth = startWidth + (e.clientX - startX);
    const newHeight = startHeight + (e.clientY - startY);

    win.style.width = Math.max(newWidth, 200) + 'px';
    win.style.height = Math.max(newHeight, 100) + 'px';
  });

  window.addEventListener('mouseup', () => {
    resizing = false;
  });
}

// Add window to taskbar
function addToTaskbar(win, app) {
  const existing = taskbarApps.querySelector(`[data-window-id="${win.dataset.windowId}"]`);
  if (existing) return;

  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.dataset.windowId = win.dataset.windowId;
  btn.textContent = app.name;

  btn.addEventListener('click', () => {
    if (win.style.display === 'none') {
      win.style.display = 'flex';
      focusWindow(win);
    } else {
      minimizeWindow(win);
    }
  });

  taskbarApps.appendChild(btn);
}

// Minimize window
function minimizeWindow(win) {
  win.style.display = 'none';
}

// Maximize / restore window
function toggleMaximizeWindow(win, btnMax) {
  if (win.dataset.maximized === 'true') {
    // restore
    win.style.width = win.dataset.prevWidth;
    win.style.height = win.dataset.prevHeight;
    win.style.top = win.dataset.prevTop;
    win.style.left = win.dataset.prevLeft;
    win.dataset.maximized = 'false';
    btnMax.innerHTML = '&#9744;'; // square
  } else {
    // store current size and position
    win.dataset.prevWidth = win.offsetWidth + 'px';
    win.dataset.prevHeight = win.offsetHeight + 'px';
    win.dataset.prevTop = win.offsetTop + 'px';
    win.dataset.prevLeft = win.offsetLeft + 'px';

    // maximize
    win.style.top = '0px';
    win.style.left = '0px';
    win.style.width = window.innerWidth + 'px';
    win.style.height = (window.innerHeight - 40) + 'px';
    win.dataset.maximized = 'true';
    btnMax.innerHTML = '&#9633;'; // restore symbol
  }
}

// Close window and remove taskbar button
function closeWindow(win) {
  const btn = taskbarApps.querySelector(`[data-window-id="${win.dataset.windowId}"]`);
  if (btn) btn.remove();
  openWindows.delete(win.dataset.windowId);
  win.remove();
}

// Update maximized windows on resize
window.addEventListener('resize', () => {
  openWindows.forEach(win => {
    if (win.dataset.maximized === 'true') {
      win.style.width = window.innerWidth + 'px';
      win.style.height = (window.innerHeight - 40) + 'px';
    }
  });
});


// ==========================================
// EXPLORER CONTEXT MENU ACTIONS
// ==========================================

// ===== OPEN =====
explorerOpenBtn.addEventListener('click', () => {

  if (!explorerSelectedItem) return;

  // OPEN FOLDER
  if (explorerSelectedItem.type === 'folder') {

    explorerContextMenu.style.display = 'none';

    return;
  }

  // OPEN FILE
  loadRealFile(explorerSelectedItem.fileId, file => {

    if (!file) return;

    const url = URL.createObjectURL(file);

    window.open(url);
  });

  explorerContextMenu.style.display = 'none';
});


// ===== RENAME =====
explorerRenameBtn.addEventListener('click', () => {

  if (!explorerSelectedItem) return;

  const newName = prompt(
    'Rename:',
    explorerSelectedName
  );

  if (!newName || newName.trim() === '') return;

  // COPY OBJECT
  explorerCurrentFolder[newName] =
    explorerSelectedItem;

  // DELETE OLD
  delete explorerCurrentFolder[
    explorerSelectedName
  ];

  saveFileSystem();

  explorerContextMenu.style.display = 'none';

  location.reload();
});


// ===== DELETE =====
explorerDeleteBtn.addEventListener('click', () => {

  if (!explorerSelectedItem) return;

  const confirmed = confirm(
    'Delete ' + explorerSelectedName + '?'
  );

  if (!confirmed) return;

  delete explorerCurrentFolder[
    explorerSelectedName
  ];

  saveFileSystem();

  explorerContextMenu.style.display = 'none';

  location.reload();
});


// ===== PROPERTIES =====
explorerPropertiesBtn.addEventListener('click', () => {

  if (!explorerSelectedItem) return;

  let info = '';

  info += 'Name: ' +
    explorerSelectedName + '\\n';

  info += 'Type: ' +
    explorerSelectedItem.type + '\\n';

  if (explorerSelectedItem.fileType) {

    info += 'File Type: ' +
      explorerSelectedItem.fileType;
  }

  alert(info);

  explorerContextMenu.style.display = 'none';
});
  createDesktopIcons();
  initDB();


// Refresh desktop: reload the page
contextRefresh.addEventListener('click', () => {
  contextMenu.style.display = 'none';
  location.reload(); // reloads the whole page
});



