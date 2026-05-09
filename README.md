# Web-Based-Operating-System-v2.4
It's a Browser Based Operating System clone, where i have cloned a basic windows 10 functionalities that is working in browser only.

A fully interactive browser-based operating system inspired by Windows, built using HTML, CSS, and JavaScript. This project recreates the feel of a real desktop environment directly inside the browser, including a file system, desktop UI, apps, windows, media players, settings, and much more.

---

## Features

### Desktop Environment
- Windows-style desktop UI
- Draggable desktop icons
- Custom wallpapers
- Taskbar and Start Menu
- Right-click context menus
- Desktop shortcuts
- Icon position saving using `localStorage`

---

## File System
- Virtual file system structure
- Local Disk C and D support
- Create/Delete/Rename files and folders
- Nested folders and subdirectories
- File Explorer with navigation
- Multi-tab File Explorer support
- Persistent storage using `localStorage`

---

## Recycle Bin System
Instead of permanently deleting files:
- Deleted files move to Recycle Bin
- Restore deleted files
- Empty Recycle Bin
- Simulates real Windows behavior

---

## Window Management
- Draggable windows
- Resizable windows
- Minimize / Maximize / Close
- Smooth animations
- Snap window behavior
- Restore open windows after refresh

---

## Media Applications

### Image Viewer
- Slideshow mode
- Zoom controls
- Fullscreen support
- Previous / Next navigation

### Music Player
- Playlist support
- Progress bar
- Shuffle and Repeat
- Volume controls
- Background playback
- Next / Previous track controls

---

## Terminal / CMD
Interactive command-line interface with commands like:
- `dir`
- `cd`
- `mkdir`
- `del`
- `help`
- `cls`

Built on top of the custom filesystem logic.

---

## Settings App
Customize the operating system with:
- Wallpaper changer
- Dark mode
- Theme switching
- Accent colors
- Taskbar settings
- Desktop icon size

All settings are saved using `localStorage`.

---

## Boot & Login System

### Boot Screen
Simulated startup experience:
- Starting WebOS...
- Loading files...
- Initializing desktop...

### Login System
- Username/password login
- Lock screen support
- Planned multi-user accounts

---

## Search System
Advanced system-wide search:
- Apps
- Files
- Folders
- Notes
- Media content

Inspired by Windows Search.

---

## Web Browser App
Integrated browser-style application:
- iframe-based browsing
- Multi-tab support planned
- Future Electron integration

---

## Notifications
System notifications such as:
- File uploaded
- Download completed
- System alerts
- Background activity updates

---

## Advanced Features
- Installable apps system
- Dynamic app loading
- Animated wallpapers
- File thumbnails and previews
- Fullscreen mode
- Session restore
- Persistent desktop state

---

## Technologies Used
- HTML5
- CSS3
- JavaScript
- LocalStorage API

### Future Stack
- Electron
- IndexedDB
- Node.js backend
- Cloud sync
- Multi-user environment

---

## Vision

This project is not just a UI clone.

The goal is to build a complete browser-based computing environment that behaves like a real operating system while remaining lightweight, customizable, and fully web-powered.

The project explores:
- Operating system architecture
- UI/UX engineering
- Filesystem simulation
- Window management systems
- Desktop application design
- Browser-based computing

---

## Future Goals
- Real file persistence
- Package manager
- App marketplace
- Browser kernel
- AI assistant integration
- Virtual desktop support
- Multiplayer/shared desktop sessions
- Linux terminal emulation
- Cloud storage sync

---

## Screenshots
_Add screenshots here_

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repo-name.git
```

Open the project folder:

```bash
cd your-repo-name
```

Run using VS Code Live Server or simply open `index.html`.

---

## Status
Currently in active development.

Major systems like the filesystem, desktop environment, media apps, and window manager are continuously being expanded.

---

## Author
Built by Bhaskar Gupta.