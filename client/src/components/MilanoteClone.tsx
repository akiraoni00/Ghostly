import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, MoreHorizontal, Edit3, Image, FileText, Minus, Square, MousePointer, StickyNote, Link2, CheckSquare, Undo2, Redo2, ZoomIn, ZoomOut, ChevronRight, Copy, Trash2, Tag, X, Maximize2, Minimize2, Settings, Upload, FilePlus, Music, Save, FolderOpen, Download, Star, Heart, Move, Network, MapPin, GitBranch } from 'lucide-react';

// Custom Sharp Hand Icon Component - Clean minimalist hand/drag icon
const SharpHandIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4.5" />
    <path d="M18 11c1.1 0 2 .9 2 2v4a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-4c0-1.1.9-2 2-2z" />
  </svg>
);

// Custom Search Icon Component
const SearchIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MilanoteClone = () => {
  // Load initial state from localStorage or use default
  const [boards, setBoards] = useState(() => {
    const savedBoards = localStorage.getItem('ghostly-boards');
    return savedBoards ? JSON.parse(savedBoards) : {
      home: {
        id: 'home',
        name: 'Home',
        items: [],
        image: null,
        parent: null
      }
    };
  });
  
  const [currentBoard, setCurrentBoard] = useState(() => {
    const savedCurrentBoard = localStorage.getItem('ghostly-currentBoard');
    return savedCurrentBoard ? JSON.parse(savedCurrentBoard) : 'home';
  });
  const [selectedTool, setSelectedTool] = useState('hand');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingItem, setEditingItem] = useState(null);
  const [boardHierarchy, setBoardHierarchy] = useState(() => {
    const savedHierarchy = localStorage.getItem('ghostly-boardHierarchy');
    return savedHierarchy ? JSON.parse(savedHierarchy) : ['home'];
  });
  const [zoom, setZoom] = useState(() => {
    const savedZoom = localStorage.getItem('ghostly-zoom');
    return savedZoom ? JSON.parse(savedZoom) : 1;
  });
  const [pan, setPan] = useState(() => {
    const savedPan = localStorage.getItem('ghostly-pan');
    return savedPan ? JSON.parse(savedPan) : { x: 0, y: 0 };
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [pendingImagePosition, setPendingImagePosition] = useState(null);
  const [openEditors, setOpenEditors] = useState([]);
  const [tags, setTags] = useState(() => {
    const savedTags = localStorage.getItem('ghostly-tags');
    return savedTags ? JSON.parse(savedTags) : [];
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingItemForTags, setEditingItemForTags] = useState(null);
  const [showTagPrompt, setShowTagPrompt] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [rectangleSelection, setRectangleSelection] = useState(null);
  const [isRectangleSelecting, setIsRectangleSelecting] = useState(false);
  const [rectangleSelectionStart, setRectangleSelectionStart] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionOffsets, setSelectionOffsets] = useState([]);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [draggedItems, setDraggedItems] = useState([]);
  const [multiDragOffset, setMultiDragOffset] = useState({ x: 0, y: 0 });
  const [noteColorPicker, setNoteColorPicker] = useState({ show: false, x: 0, y: 0, itemId: null });
  const [colorPickerHue, setColorPickerHue] = useState(200);
  const [colorPickerSaturation, setColorPickerSaturation] = useState(70);
  const [colorPickerLightness, setColorPickerLightness] = useState(50);

  const [linePreview, setLinePreview] = useState(null);
  const [editingLine, setEditingLine] = useState(null);
  const [lineStartPoint, setLineStartPoint] = useState(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [pendingTextFileImport, setPendingTextFileImport] = useState(null);
  const [showTagSelectionModal, setShowTagSelectionModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [favoriteDirectory, setFavoriteDirectory] = useState(() => {
    return localStorage.getItem('ghostly-favoriteDirectory') || '';
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    return localStorage.getItem('ghostly-autoSaveEnabled') === 'true';
  });
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTag, setColorPickerTag] = useState(null);
  const [showTagNameInput, setShowTagNameInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Search functionality
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = [];
    const seen = new Set(); // Track unique results
    const searchLower = query.toLowerCase();
    
    // Search through all boards
    Object.entries(boards).forEach(([boardId, board]) => {
      // Search board names
      if (board.name.toLowerCase().includes(searchLower)) {
        const key = `board-${boardId}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            type: 'board',
            boardId,
            title: board.name,
            boardName: board.name,
            preview: `${board.items.length} items`
          });
        }
      }
      
      // Search board items
      board.items.forEach(item => {
        let matches = false;
        let preview = '';
        
        if (item.name && item.name.toLowerCase().includes(searchLower)) {
          matches = true;
          preview = item.name;
        } else if (item.content && item.content.toLowerCase().includes(searchLower)) {
          matches = true;
          preview = item.content.substring(0, 100) + '...';
        } else if (item.title && item.title.toLowerCase().includes(searchLower)) {
          matches = true;
          preview = item.title;
        } else if (item.url && item.url.toLowerCase().includes(searchLower)) {
          matches = true;
          preview = item.url;
        }
        
        if (matches) {
          const key = `item-${item.id}-${boardId}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              type: item.type,
              boardId,
              title: item.name || item.title || item.type,
              boardName: board.name,
              preview,
              itemId: item.id
            });
          }
        }
      });
    });
    
    setSearchResults(results);
  }, [boards]);

  // Settings and theme state
  const [showSettings, setShowSettings] = useState(false);
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('ghostly-shortcuts');
    return saved ? JSON.parse(saved) : {
      hand: 'h',
      select: 'v',
      rectangleSelect: 'r',
      board: 'b',
      note: 'n', 
      textfile: 't',
      image: 'i',
      link: 'l',
      line: 'p',
      todo: 'c',
      tag: 'g',
      undo: 'z',
      redo: 'y',
      zoomIn: '=',
      zoomOut: '-',
      projectManager: 'o',
      tagManager: 'f'
    };
  });
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem('ghostly-colors');
    return saved ? JSON.parse(saved) : {
      accent: '#f4c2c2',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#404040'
    };
  });
  
  // Apply color theme to CSS variables
  const applyColorTheme = useCallback((themeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', themeColors.accent);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--color-surface', themeColors.surface);
    root.style.setProperty('--color-text', themeColors.text);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondary);
    root.style.setProperty('--color-border', themeColors.border);
  }, []);

  // Apply colors on mount and whenever colors change
  useEffect(() => {
    applyColorTheme(colors);
  }, [colors, applyColorTheme]);
  
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const boardImageInputRef = useRef(null);
  const textFileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const projectFolderInputRef = useRef(null);
  const projectDirectoryInputRef = useRef(null);
  const favoriteDirectoryInputRef = useRef(null);
  const [selectedBoardForImage, setSelectedBoardForImage] = useState(null);
  const [draggingEditor, setDraggingEditor] = useState(null);
  const [editorDragOffset, setEditorDragOffset] = useState({ x: 0, y: 0 });


  // Save state to history for undo functionality
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(boards)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [boards, history, historyIndex]);

  // Create a comprehensive project data structure
  const createProjectData = () => {
    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      boards,
      tags,
      openEditors,
      shortcuts,
      colors,
      favoriteDirectory,
      autoSaveEnabled,
      settings: {
        zoom,
        pan,
        currentBoard,
        boardHierarchy,

        selectedTool,
        history: history.slice(-50), // Keep last 50 history items
        historyIndex
      },
      metadata: {
        projectName: boards[currentBoard]?.name || 'Ghostly Project',
        totalBoards: Object.keys(boards).length,
        totalItems: Object.values(boards).reduce((sum, board) => sum + board.items.length, 0),
        totalTags: tags.length
      }
    };
  };

  // Auto-save to localStorage and create downloadable backup every 60 seconds
  const autoSaveProject = useCallback(async () => {
    if (!autoSaveEnabled || !favoriteDirectory) return;
    
    try {
      const projectData = createProjectData();
      
      // Save to localStorage as primary storage
      localStorage.setItem('ghostly-project-backup', JSON.stringify(projectData));
      localStorage.setItem('ghostly-last-autosave', Date.now().toString());
      
      console.log(`✓ Auto-saved project: ${Object.keys(boards).length} boards, ${tags.length} tags, ${Object.values(boards).reduce((sum, board) => sum + board.items.length, 0)} items`);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [autoSaveEnabled, favoriteDirectory, boards, tags, openEditors, zoom, pan, currentBoard, boardHierarchy, selectedTool, history, historyIndex]);

  // Export project data as downloadable file
  const exportProject = async () => {
    setIsExporting(true);
    try {
      const projectData = createProjectData();
      
      // Create the main project file
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
        type: 'application/json' 
      });
      
      // Create downloadable link
      const exportUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `ghostly-project-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(exportUrl);
      
      console.log('✓ Project exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Import project from file
  const importProject = useCallback(async (file) => {
    setIsImporting(true);
    setImportProgress('Reading project file...');
    
    try {
      const content = await file.text();
      const projectData = JSON.parse(content);
      
      setImportProgress('Validating project data...');
      
      // Validate the project data structure
      if (!projectData.boards || !projectData.version) {
        throw new Error('Invalid project file format');
      }
      
      setImportProgress('Restoring boards and settings...');
      
      // Restore all project data
      if (projectData.boards) {
        setBoards(projectData.boards);
        localStorage.setItem('ghostly-boards', JSON.stringify(projectData.boards));
      }
      
      if (projectData.tags) {
        setTags(projectData.tags);
        localStorage.setItem('ghostly-tags', JSON.stringify(projectData.tags));
      }
      
      if (projectData.openEditors) {
        setOpenEditors(projectData.openEditors);
        localStorage.setItem('ghostly-openEditors', JSON.stringify(projectData.openEditors));
      }
      
      // Import shortcuts and colors
      if (projectData.shortcuts) {
        setShortcuts(projectData.shortcuts);
        localStorage.setItem('ghostly-shortcuts', JSON.stringify(projectData.shortcuts));
      }
      
      if (projectData.colors) {
        setColors(projectData.colors);
        localStorage.setItem('ghostly-colors', JSON.stringify(projectData.colors));
      }
      
      // Import favorite directory and auto-save settings
      if (projectData.favoriteDirectory) {
        setFavoriteDirectory(projectData.favoriteDirectory);
        localStorage.setItem('ghostly-favoriteDirectory', projectData.favoriteDirectory);
      }
      
      if (typeof projectData.autoSaveEnabled === 'boolean') {
        setAutoSaveEnabled(projectData.autoSaveEnabled);
        localStorage.setItem('ghostly-autoSaveEnabled', projectData.autoSaveEnabled.toString());
      }

      if (projectData.settings) {
        const { zoom: importZoom, pan: importPan, currentBoard: importCurrentBoard, 
                boardHierarchy: importBoardHierarchy,
                selectedTool: importSelectedTool } = projectData.settings;
        
        if (importZoom) setZoom(importZoom);
        if (importPan) setPan(importPan);
        if (importCurrentBoard) setCurrentBoard(importCurrentBoard);
        if (importBoardHierarchy) setBoardHierarchy(importBoardHierarchy);
        if (importSelectedTool) setSelectedTool(importSelectedTool);
        
        // Save settings to localStorage
        localStorage.setItem('ghostly-currentBoard', JSON.stringify(importCurrentBoard || 'home'));
        localStorage.setItem('ghostly-boardHierarchy', JSON.stringify(importBoardHierarchy || ['home']));
        localStorage.setItem('ghostly-zoom', JSON.stringify(importZoom || 1));
        localStorage.setItem('ghostly-pan', JSON.stringify(importPan || { x: 0, y: 0 }));

      }
      
      setImportProgress('Project imported successfully!');
      
      // Auto-enable favorite directory and auto-save for seamless experience
      const projectName = projectData.metadata?.projectName || 'Imported Project';
      setFavoriteDirectory(file.name.replace('.json', ''));
      setAutoSaveEnabled(true);
      localStorage.setItem('ghostly-favoriteDirectory', file.name.replace('.json', ''));
      localStorage.setItem('ghostly-autoSaveEnabled', 'true');
      
      console.log('✓ Project imported successfully:', projectName);
      
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress('');
        setShowSaveLoadModal(false);
      }, 1500);
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress(`Import failed: ${error.message}`);
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress('');
      }, 3000);
    }
  }, []);

  // Auto-load functionality on app startup
  const autoLoadProject = useCallback(async () => {
    if (hasAutoLoaded || !favoriteDirectory) return;
    
    try {
      // Check if there's a backup in localStorage
      const backup = localStorage.getItem('ghostly-project-backup');
      if (backup) {
        const projectData = JSON.parse(backup);
        console.log('✓ Auto-loaded project from localStorage backup');
        setHasAutoLoaded(true);
      }
    } catch (error) {
      console.warn('Auto-load failed:', error);
    }
  }, [hasAutoLoaded, favoriteDirectory]);

  // Manual save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const projectData = createProjectData();
      localStorage.setItem('ghostly-project-backup', JSON.stringify(projectData));
      localStorage.setItem('ghostly-last-save', Date.now().toString());
      console.log('✓ Manually saved to localStorage');
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  }, [createProjectData]);

  // Auto-save effect - trigger auto-save every 60 seconds when enabled
  useEffect(() => {
    if (!autoSaveEnabled || !favoriteDirectory) return;
    
    const autoSaveInterval = setInterval(autoSaveProject, 60000); // 60 seconds
    return () => clearInterval(autoSaveInterval);
  }, [autoSaveProject, autoSaveEnabled, favoriteDirectory]);

  // Auto-load on startup effect
  useEffect(() => {
    if (hasAutoLoaded || !favoriteDirectory) return;
    
    const autoLoad = async () => {
      try {
        const backup = localStorage.getItem('ghostly-project-backup');
        if (backup) {
          const projectData = JSON.parse(backup);
          console.log('✓ Auto-loaded project from localStorage backup');
          setHasAutoLoaded(true);
        }
      } catch (error) {
        console.warn('Auto-load failed:', error);
      }
    };
    
    // Auto-load after a short delay to let the app initialize
    setTimeout(autoLoad, 1000);
  }, [hasAutoLoaded, favoriteDirectory]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Ctrl+Enter for search
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }
      
      if (e.ctrlKey || e.metaKey || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      
      switch (key) {
        case shortcuts.hand:
          setSelectedTool('hand');
          break;
        case shortcuts.select:
          setSelectedTool('select');
          break;
        case shortcuts.rectangleSelect:
          setSelectedTool('rectangle-select');
          break;
        case shortcuts.board:
          setSelectedTool('board');
          break;
        case shortcuts.note:
          setSelectedTool('note');
          break;
        case shortcuts.textfile:
          setSelectedTool('textfile');
          break;
        case shortcuts.image:
          setSelectedTool('image');
          break;
        case shortcuts.link:
          setSelectedTool('link');
          break;
        case shortcuts.line:
          setSelectedTool('line');
          break;
        case shortcuts.todo:
          setSelectedTool('todo');
          break;
        case shortcuts.tag:
          setSelectedTool('tag');
          break;

        case shortcuts.projectManager:
          setShowSaveLoadModal(!showSaveLoadModal);
          break;
        case shortcuts.tagManager:
          setShowTagManager(!showTagManager);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, showSaveLoadModal, showTagManager]);

  // Apply colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-secondary-color', colors.textSecondary);
    root.style.setProperty('--border-color', colors.border);
  }, [colors]);

  // Enhanced download latest backup functionality
  const downloadLatestBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem('ghostly-project-backup');
      if (!backup) {
        alert('No backup available');
        return;
      }
      
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ghostly-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(exportUrl);
      
      console.log('✓ Downloaded latest backup');
    } catch (error) {
      console.error('Download backup failed:', error);
    }
  }, []);



  // Handle project file import
  const handleProjectFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.json')) {
      importProject(file);
    }
    event.target.value = ''; // Reset input
  }, [importProject]);

  // Set up favorite directory (for organizational purposes)
  const handleFavoriteDirectorySelect = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const folderPath = files[0].webkitRelativePath.split('/')[0];
      setFavoriteDirectory(folderPath);
      setAutoSaveEnabled(true);
      localStorage.setItem('ghostly-favoriteDirectory', folderPath);
      localStorage.setItem('ghostly-autoSaveEnabled', 'true');
      
      // Look for project files in the directory
      const projectFile = files.find(f => 
        f.name.includes('ghostly-project') || 
        f.name.includes('project-data') || 
        f.name.includes('backup')
      );
      
      if (projectFile && projectFile.name.endsWith('.json')) {
        importProject(projectFile);
      } else {
        console.log('✓ Favorite directory set:', folderPath);
        setShowSaveLoadModal(false);
      }
    }
    event.target.value = ''; // Reset input
  }, [importProject]);



  // Add new tag
  const addTag = useCallback((tagName) => {
    if (!tagName.trim() || tags.some(tag => tag.name === tagName.trim())) return;
    
    const newTag = {
      id: `tag_${Date.now()}`,
      name: tagName.trim(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    };
    
    setTags(prev => [...prev, newTag]);
  }, [tags]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setBoards(previousState);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBoards(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Clear rectangle selection when tool changes
  useEffect(() => {
    if (selectedTool !== 'rectangle-select') {
      setRectangleSelection(null);
      setIsRectangleSelecting(false);
    }
  }, [selectedTool]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(boards))]);
      setHistoryIndex(0);
    }
  }, []);

  // Autosave functionality - save to localStorage whenever boards change
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('ghostly-boards', JSON.stringify(boards));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }, 500); // Debounce saves by 500ms to avoid excessive saving during rapid changes

    return () => clearTimeout(saveTimer);
  }, [boards]);

  // Autosave current board
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-currentBoard', JSON.stringify(currentBoard));
    } catch (error) {
      console.warn('Failed to save currentBoard to localStorage:', error);
    }
  }, [currentBoard]);

  // Autosave board hierarchy
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-boardHierarchy', JSON.stringify(boardHierarchy));
    } catch (error) {
      console.warn('Failed to save boardHierarchy to localStorage:', error);
    }
  }, [boardHierarchy]);

  // Autosave zoom level
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-zoom', JSON.stringify(zoom));
    } catch (error) {
      console.warn('Failed to save zoom to localStorage:', error);
    }
  }, [zoom]);

  // Autosave pan position
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-pan', JSON.stringify(pan));
    } catch (error) {
      console.warn('Failed to save pan to localStorage:', error);
    }
  }, [pan]);

  // Autosave tags
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-tags', JSON.stringify(tags));
    } catch (error) {
      console.warn('Failed to save tags to localStorage:', error);
    }
  }, [tags]);

  // Autosave node positions - removed as part of node graph cleanup

  useEffect(() => {
    try {
      localStorage.setItem('ghostly-openEditors', JSON.stringify(openEditors));
    } catch (error) {
      console.warn('Failed to save openEditors to localStorage:', error);
    }
  }, [openEditors]);

  // Auto-save to favorite directory when enabled
  useEffect(() => {
    if (!autoSaveEnabled || !favoriteDirectory) return;
    
    const autoSaveInterval = setInterval(async () => {
      try {
        // Create project data for auto-save
        const projectData = {
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          boards,
          tags,
          openEditors,
          settings: {
            zoom,
            pan,
            currentBoard,
            boardHierarchy,

            selectedTool,
            history: history.slice(-50),
            historyIndex
          },
          metadata: {
            totalBoards: Object.keys(boards).length,
            totalTags: tags.length,
            totalItems: Object.values(boards).reduce((sum, board) => sum + board.items.length, 0),
            lastAutoSave: new Date().toLocaleString(),
            isAutoSave: true
          }
        };
        
        // Save to favorite directory data cache
        const favoriteData = {
          directoryPath: favoriteDirectory,
          projectData,
          lastSync: new Date().toISOString()
        };
        localStorage.setItem('ghostly-favoriteDirectoryData', JSON.stringify(favoriteData));
        
        // Trigger export (this will download files for manual backup)
        await exportProject(true);
      } catch (error) {
        console.warn('Auto-save to directory failed:', error);
      }
    }, 60000); // Auto-save every 60 seconds when directory is set

    return () => clearInterval(autoSaveInterval);
  }, [boards, tags, openEditors, zoom, pan, currentBoard, boardHierarchy, selectedTool, autoSaveEnabled, favoriteDirectory, history, historyIndex]);

  // Create new item based on selected tool
  const createItem = useCallback((x, y, type = selectedTool) => {
    // Convert screen coordinates to canvas coordinates considering zoom and pan
    const canvasX = (x - pan.x) / zoom;
    const canvasY = (y - pan.y) / zoom;
    
    const id = `${type}_${Date.now()}`;
    let newItem;
    
    switch (type) {
      case 'board':
        const boardId = `board_${Date.now()}`;
        setBoards(prev => ({
          ...prev,
          [boardId]: {
            id: boardId,
            name: 'New Board',
            items: [],
            image: null,
            parent: currentBoard
          }
        }));
        newItem = {
          id,
          type: 'board',
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 220,
          boardId,
          name: 'New Board',
          image: null
        };
        break;
      case 'note':
        newItem = {
          id,
          type: 'note',
          x: canvasX,
          y: canvasY,
          width: 250,
          height: 150,
          content: 'Click to edit...',
          backgroundColor: '#f5f5dc'
        };
        break;
      case 'textfile':
        // Store the pending text file data
        setPendingTextFileImport({
          id,
          type: 'textfile',
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 140,
          title: 'New Document',
          content: '# New Document\n\nStart writing here...',
          tags: [],
          connections: []
        });
        
        // Show tag selection modal immediately
        setSelectedTags([]);
        setShowTagSelectionModal(true);
        setSelectedTool('select');
        return; // Don't create the item yet
      case 'image':
        setPendingImagePosition({ x: canvasX, y: canvasY });
        fileInputRef.current?.click();
        setSelectedTool('select');
        return;
      case 'link':
        newItem = {
          id,
          type: 'link',
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 80,
          url: '',
          title: '',
          color: '#f8fafc'
        };
        break;
      case 'todo':
        newItem = {
          id,
          type: 'todo',
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 180,
          title: 'Project Tasks',
          color: '#f4c2c2',
          tasks: [
            { id: 1, text: 'Task 1', completed: false },
            { id: 2, text: 'Task 2', completed: false }
          ]
        };
        break;
      default:
        return;
    }
    
    setBoards(prev => ({
      ...prev,
      [currentBoard]: {
        ...prev[currentBoard],
        items: [...prev[currentBoard].items, newItem]
      }
    }));
    
    setSelectedTool('select');
    saveToHistory();
  }, [selectedTool, currentBoard, saveToHistory, zoom, pan]);

  // Fixed line drawing - snap once and show preview
  const handleLineDrawing = useCallback((e) => {
    if (selectedTool !== 'line') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const canvasX = (clickX - pan.x) / zoom;
    const canvasY = (clickY - pan.y) / zoom;
    
    if (!lineStartPoint) {
      // First click - set start point and begin drawing mode
      setLineStartPoint({ x: canvasX, y: canvasY });
      setIsDrawingLine(true);
    } else {
      // Second click - complete the line
      const length = Math.sqrt(Math.pow(canvasX - lineStartPoint.x, 2) + Math.pow(canvasY - lineStartPoint.y, 2));
      if (length > 5) {
        const newLine = {
          id: `line_${Date.now()}`,
          type: 'line',
          x: Math.min(lineStartPoint.x, canvasX) - 10,
          y: Math.min(lineStartPoint.y, canvasY) - 10,
          width: Math.abs(canvasX - lineStartPoint.x) + 20,
          height: Math.abs(canvasY - lineStartPoint.y) + 20,
          startX: lineStartPoint.x,
          startY: lineStartPoint.y,
          endX: canvasX,
          endY: canvasY,
          color: '#f4c2c2',
          strokeWidth: 2,
          rotation: 0
        };
        
        setBoards(prev => ({
          ...prev,
          [currentBoard]: {
            ...prev[currentBoard],
            items: [...prev[currentBoard].items, newLine]
          }
        }));
        
        saveToHistory();
      }
      
      // Reset line drawing state and switch back to select tool
      setLinePreview(null);
      setLineStartPoint(null);
      setIsDrawingLine(false);
      setSelectedTool('select');
    }
  }, [selectedTool, currentBoard, saveToHistory, zoom, pan, lineStartPoint]);

  // Handle rectangle selection
  const handleRectangleSelection = useCallback((e) => {
    if (selectedTool !== 'rectangle-select') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    const canvasStartX = (startX - pan.x) / zoom;
    const canvasStartY = (startY - pan.y) / zoom;
    
    setIsRectangleSelecting(true);
    setRectangleSelection({
      startX: canvasStartX,
      startY: canvasStartY,
      endX: canvasStartX,
      endY: canvasStartY
    });
    
    const handleMouseMove = (moveEvent) => {
      const endX = moveEvent.clientX - rect.left;
      const endY = moveEvent.clientY - rect.top;
      
      const canvasEndX = (endX - pan.x) / zoom;
      const canvasEndY = (endY - pan.y) / zoom;
      
      setRectangleSelection(prev => ({
        ...prev,
        startX: canvasStartX,
        startY: canvasStartY,
        endX: canvasEndX,
        endY: canvasEndY
      }));
    };
    
    const handleMouseUp = () => {
      setRectangleSelection(prevSelection => {
        if (!prevSelection) return null;
        
        const { startX, startY, endX, endY } = prevSelection;
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        
        // Find items within selection rectangle - select on any touch/overlap
        const selectedItemsInRect = boards[currentBoard].items.filter(item => {
          const itemLeft = item.x;
          const itemRight = item.x + (item.width || 0);
          const itemTop = item.y;
          const itemBottom = item.y + (item.height || 0);
          
          // Check if selection rectangle overlaps with item bounds (any touch selects)
          return !(itemRight < minX || itemLeft > maxX || itemBottom < minY || itemTop > maxY);
        });
        
        setSelectedItems(selectedItemsInRect.map(item => item.id));
        setIsRectangleSelecting(false);
        setSelectedTool('select');
        
        return null; // Clear the rectangle selection
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [selectedTool, currentBoard, zoom, pan, rectangleSelection, boards]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (selectedTool === 'select') return;
    if (selectedTool === 'tag') {
      // Don't handle in canvas click - tag tool opens immediately
      return;
    }
    if (selectedTool === 'textfile-import') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      setPendingImagePosition({ x: canvasX, y: canvasY });
      textFileInputRef.current?.click();
      setSelectedTool('select');
      return;
    }
    if (selectedTool === 'audio') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      setPendingImagePosition({ x: canvasX, y: canvasY });
      audioFileInputRef.current?.click();
      setSelectedTool('select');
      return;
    }
    if (selectedTool === 'line') {
      handleLineDrawing(e);
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createItem(x, y);
  }, [selectedTool, createItem, handleLineDrawing, addTag, zoom, pan]);

  // Handle mouse down for dragging and panning
  const handleMouseDown = useCallback((e, item = null) => {
    // Ctrl+click dynamic zoom functionality
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Continuous zoom behavior like Photoshop
      // Left click = zoom in, right click = zoom out
      const zoomFactor = e.button === 2 ? 0.8 : 1.25; // Right click zooms out, left click zooms in
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5);
      
      // Smooth zoom with focal point at mouse cursor
      const newPan = {
        x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
      };
      
      setZoom(newZoom);
      setPan(newPan);
      return;
    }
    
    if (item) {
      e.stopPropagation();
      
      if (e.button === 2) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      // Hand tool - switch to select when touching an element
      if (selectedTool === 'hand') {
        // Hand tool - no automatic switching, just pan the canvas
        return;
      }
      
      if (selectedTool === 'select') {
        if (selectedItems.includes(item.id)) {
          const selectedItemsData = boards[currentBoard].items.filter(boardItem => selectedItems.includes(boardItem.id));
          const offsets = selectedItemsData.map(selectedItem => ({
            id: selectedItem.id,
            offsetX: canvasX - selectedItem.x,
            offsetY: canvasY - selectedItem.y
          }));
          setSelectionOffsets(offsets);
          setIsDragging(true);
        } else {
          setSelectedItems([item.id]);
          setDragOffset({ x: canvasX - item.x, y: canvasY - item.y });
          setDraggedItem(item);
          setIsDragging(true);
        }
        return;
      }
      
      // Select tool - handle item selection and dragging
      if (selectedTool === 'select') {
        
        // Check if clicking on selected items group
        if (selectedItems.includes(item.id)) {
          // Start multi-item drag - calculate offsets for smooth dragging
          const selectedItemsData = boards[currentBoard].items.filter(boardItem => selectedItems.includes(boardItem.id));
          const offsets = selectedItemsData.map(selectedItem => ({
            id: selectedItem.id,
            offsetX: canvasX - selectedItem.x,
            offsetY: canvasY - selectedItem.y
          }));
          setSelectionOffsets(offsets);
          setIsDragging(true);
        } else {
          // Single item selection and drag
          setSelectedItems([item.id]);
          setDragOffset({ x: canvasX - item.x, y: canvasY - item.y });
          setDraggedItem(item);
          setIsDragging(true);
        }
        
        // Check if clicking on a line for editing
        if (item.type === 'line') {
          setEditingLine(item.id);
        }
        
        setContextMenu(null);
        return;
      }
      
      // For other tools, don't handle item clicks
      return;
    } else {
      // Empty space clicks
      if (selectedTool === 'line') {
        handleLineDrawing(e);
        return;
      }
      
      if (selectedTool === 'select') {
        // Start rectangle selection
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const canvasX = (x - pan.x) / zoom;
        const canvasY = (y - pan.y) / zoom;
        
        setIsRectangleSelecting(true);
        setRectangleSelectionStart({ x: canvasX, y: canvasY });
        setRectangleSelection({ x: canvasX, y: canvasY, width: 0, height: 0 });
        
        // Clear previous selection
        setSelectedItems([]);
        return;
      }
      
      if (selectedTool === 'hand') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }
      
      // For other tools, create items but don't auto-switch tools
      if (selectedTool !== 'select' && selectedTool !== 'hand') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          createItem(e.clientX - rect.left, e.clientY - rect.top);
        }
        return;
      }
    }
  }, [zoom, pan, selectedTool, selectedItems, boards, currentBoard, handleLineDrawing, createItem]);

  // Handle mouse move for dragging and panning
  const handleMouseMove = useCallback((e) => {
    // Handle line preview while drawing
    if (isDrawingLine && lineStartPoint) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - pan.x) / zoom;
        const canvasY = (mouseY - pan.y) / zoom;
        
        setLinePreview({
          startX: lineStartPoint.x,
          startY: lineStartPoint.y,
          endX: canvasX,
          endY: canvasY,
          color: '#f4c2c2',
          strokeWidth: 2,
          isDash: true
        });
      }
    }
    
    if (isResizing && resizeStart) {
      // Handle image resizing
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const aspectRatio = resizeStart.width / resizeStart.height;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      // Proportional resizing based on handle
      if (resizeHandle === 'bottom-right') {
        newWidth = Math.max(50, resizeStart.width + deltaX / zoom);
        newHeight = newWidth / aspectRatio;
      } else if (resizeHandle === 'bottom-left') {
        newWidth = Math.max(50, resizeStart.width - deltaX / zoom);
        newHeight = newWidth / aspectRatio;
      } else if (resizeHandle === 'top-right') {
        newWidth = Math.max(50, resizeStart.width + deltaX / zoom);
        newHeight = newWidth / aspectRatio;
      } else if (resizeHandle === 'top-left') {
        newWidth = Math.max(50, resizeStart.width - deltaX / zoom);
        newHeight = newWidth / aspectRatio;
      }
      
      // Update the selected image's dimensions
      setBoards(prev => ({
        ...prev,
        [currentBoard]: {
          ...prev[currentBoard],
          items: prev[currentBoard].items.map(item => {
            if (selectedItems.includes(item.id) && item.type === 'image') {
              return { ...item, width: newWidth, height: newHeight };
            }
            return item;
          })
        }
      }));
    } else if (isRectangleSelecting) {
      // Update rectangle selection
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      const width = canvasX - rectangleSelectionStart.x;
      const height = canvasY - rectangleSelectionStart.y;
      
      setRectangleSelection({
        x: width < 0 ? canvasX : rectangleSelectionStart.x,
        y: height < 0 ? canvasY : rectangleSelectionStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (isDragging && selectedItems.length > 0 && selectionOffsets.length > 0) {
      // Multi-item drag with proper offset handling
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      setBoards(prev => ({
        ...prev,
        [currentBoard]: {
          ...prev[currentBoard],
          items: prev[currentBoard].items.map(item => {
            if (selectedItems.includes(item.id)) {
              const offset = selectionOffsets.find(o => o.id === item.id);
              if (offset) {
                return { ...item, x: canvasX - offset.offsetX, y: canvasY - offset.offsetY };
              }
            }
            return item;
          })
        }
      }));
    } else if (isDragging && draggedItem) {
      // Single item drag
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasX = (x - pan.x) / zoom - dragOffset.x;
      const canvasY = (y - pan.y) / zoom - dragOffset.y;
      
      setBoards(prev => ({
        ...prev,
        [currentBoard]: {
          ...prev[currentBoard],
          items: prev[currentBoard].items.map(item =>
            item.id === draggedItem.id ? { ...item, x: canvasX, y: canvasY } : item
          )
        }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isDragging, draggedItem, dragOffset, currentBoard, isPanning, panStart, zoom, pan, isRectangleSelecting, rectangleSelectionStart, selectedItems, selectionOffsets, isResizing, resizeStart, resizeHandle]);

  // Handle mouse up for dragging and panning
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setResizeStart(null);
      saveToHistory();
    }
    
    if (isRectangleSelecting) {
      // Complete rectangle selection
      if (rectangleSelection) {
        const selectedIds = boards[currentBoard].items.filter(item => {
          const itemLeft = item.x;
          const itemRight = item.x + (item.width || 150);
          const itemTop = item.y;
          const itemBottom = item.y + (item.height || 100);
          
          const selectionLeft = rectangleSelection.x;
          const selectionRight = rectangleSelection.x + rectangleSelection.width;
          const selectionTop = rectangleSelection.y;
          const selectionBottom = rectangleSelection.y + rectangleSelection.height;
          
          // Check for any overlap between item and selection rectangle
          return !(itemRight < selectionLeft || itemLeft > selectionRight || 
                   itemBottom < selectionTop || itemTop > selectionBottom);
        }).map(item => item.id);
        
        setSelectedItems(selectedIds);
      }
      
      setIsRectangleSelecting(false);
      setRectangleSelection(null);
      setRectangleSelectionStart(null);
    }
    
    if (isDragging) {
      setIsDragging(false);
      setDraggedItem(null);
      setSelectionOffsets([]);
      saveToHistory();
      
      // Don't auto-switch tools after dragging
    }
    if (isPanning) {
      setIsPanning(false);
    }
  }, [isDragging, isPanning, saveToHistory, isRectangleSelecting, rectangleSelection, boards, currentBoard, isResizing]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5);
    
    const newPan = {
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    };
    
    setZoom(newZoom);
    setPan(newPan);
  }, [zoom, pan]);

  // Handle right click context menu
  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  }, []);

  // Delete item
  const deleteItem = useCallback((itemId) => {
    // If multiple items are selected, delete all of them
    if (selectedItems.length > 0) {
      setBoards(prev => {
        const newBoards = { ...prev };
        
        // Delete all selected items
        selectedItems.forEach(selectedId => {
          const item = prev[currentBoard].items.find(i => i.id === selectedId);
          if (item?.type === 'board') {
            delete newBoards[item.boardId];
          }
        });
        
        newBoards[currentBoard] = {
          ...prev[currentBoard],
          items: prev[currentBoard].items.filter(i => !selectedItems.includes(i.id))
        };
        
        return newBoards;
      });
      setSelectedItems([]);
    } else {
      // Single item deletion
      setBoards(prev => {
        const newBoards = { ...prev };
        const item = prev[currentBoard].items.find(i => i.id === itemId);
        
        if (item?.type === 'board') {
          delete newBoards[item.boardId];
        }
        
        newBoards[currentBoard] = {
          ...prev[currentBoard],
          items: prev[currentBoard].items.filter(i => i.id !== itemId)
        };
        
        return newBoards;
      });
    }
    setContextMenu(null);
    saveToHistory();
  }, [currentBoard, saveToHistory, selectedItems]);

  // Change item color
  const changeItemColor = useCallback((itemId, color) => {
    setBoards(prev => ({
      ...prev,
      [currentBoard]: {
        ...prev[currentBoard],
        items: prev[currentBoard].items.map(item => {
          if (item.id === itemId) {
            // Use backgroundColor for notes, color for other items
            if (item.type === 'note') {
              return { ...item, backgroundColor: color };
            } else {
              return { ...item, color };
            }
          }
          return item;
        })
      }
    }));
    setColorPicker({ show: false, x: 0, y: 0, itemId: null });
    saveToHistory();
  }, [currentBoard, saveToHistory]);

  // Handle double click on board
  const handleBoardDoubleClick = useCallback((boardItem) => {
    setCurrentBoard(boardItem.boardId);
    setBoardHierarchy(prev => [...prev, boardItem.boardId]);
  }, []);

  // Navigate to board
  const navigateToBoard = useCallback((boardId, index) => {
    setCurrentBoard(boardId);
    setBoardHierarchy(prev => prev.slice(0, index + 1));
  }, []);

  // Handle file upload - FIXED
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePosition) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 200;
        const maxHeight = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        const newItem = {
          id: `image_${Date.now()}`,
          type: 'image',
          x: pendingImagePosition.x,
          y: pendingImagePosition.y,
          width: width,
          height: height,
          src: event.target.result
        };
        
        setBoards(prev => ({
          ...prev,
          [currentBoard]: {
            ...prev[currentBoard],
            items: [...prev[currentBoard].items, newItem]
          }
        }));
        
        setPendingImagePosition(null);
        saveToHistory();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  }, [currentBoard, saveToHistory, pendingImagePosition]);

  // Handle text file import
  const handleTextFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePosition) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      
      const content = event.target.result;
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      
      // Store the pending text file import data
      setPendingTextFileImport({
        id: `textfile_${Date.now()}`,
        type: 'textfile',
        x: pendingImagePosition.x,
        y: pendingImagePosition.y,
        width: 200,
        height: 140,
        title: fileName,
        content: content,
        tags: [],
        connections: []
      });
      
      // Show tag selection modal immediately
      setSelectedTags([]);
      setShowTagSelectionModal(true);
    };
    reader.readAsText(file);
    
    e.target.value = '';
  }, [currentBoard, saveToHistory, pendingImagePosition]);

  // Handle audio file import
  const handleAudioFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePosition) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      
      const newItem = {
        id: `audio_${Date.now()}`,
        type: 'audio',
        x: pendingImagePosition.x,
        y: pendingImagePosition.y,
        width: 200,
        height: 60,
        title: fileName,
        src: event.target.result
      };
      
      setBoards(prev => ({
        ...prev,
        [currentBoard]: {
          ...prev[currentBoard],
          items: [...prev[currentBoard].items, newItem]
        }
      }));
      
      setPendingImagePosition(null);
      saveToHistory();
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  }, [currentBoard, saveToHistory, pendingImagePosition]);

  // Handle board image upload
  const handleBoardImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBoardForImage) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      
      setBoards(prev => ({
        ...prev,
        [selectedBoardForImage.boardId]: {
          ...prev[selectedBoardForImage.boardId],
          image: event.target.result
        },
        [currentBoard]: {
          ...prev[currentBoard],
          items: prev[currentBoard].items.map(item =>
            item.id === selectedBoardForImage.id
              ? { ...item, image: event.target.result }
              : item
          )
        }
      }));
      saveToHistory();
    };
    reader.readAsDataURL(file);
    setSelectedBoardForImage(null);
    
    e.target.value = '';
  }, [selectedBoardForImage, currentBoard, saveToHistory]);

  // Handle item editing
  const handleItemEdit = useCallback((item, newValue) => {
    if (!item || !newValue) {
      setEditingItem(null);
      return;
    }
    
    setBoards(prev => {
      const newBoards = { ...prev };
      
      // Update the item in the current board
      newBoards[currentBoard] = {
        ...prev[currentBoard],
        items: prev[currentBoard].items.map(i => {
          if (i.id === item.id) {
            let updatedItem = { ...i };
            
            // Handle different item types
            switch (item.type) {
              case 'note':
                updatedItem.content = newValue;
                // Auto-resize note based on content
                if (newValue) {
                  const lines = newValue.split('\n').length;
                  const minHeight = 60;
                  const lineHeight = 20;
                  const padding = 24;
                  updatedItem.height = Math.max(minHeight, lines * lineHeight + padding);
                }
                break;
              case 'board':
                updatedItem.name = newValue;
                break;
              case 'link':
                updatedItem.title = newValue;
                break;
              case 'todo':
                updatedItem.title = newValue;
                break;
              case 'textfile':
                updatedItem.title = newValue;
                // Update corresponding editor title if open
                setOpenEditors(prev => prev.map(editor =>
                  editor.fileId === item.id 
                    ? { ...editor, title: newValue }
                    : editor
                ));
                break;
              default:
                updatedItem.title = newValue;
                break;
            }
            
            return updatedItem;
          }
          return i;
        })
      };
      
      // If it's a board item, also update the board data
      if (item.type === 'board' && item.boardId) {
        newBoards[item.boardId] = {
          ...prev[item.boardId],
          name: newValue
        };
      }
      
      return newBoards;
    });
    
    setEditingItem(null);
    saveToHistory();
  }, [currentBoard, saveToHistory]);

  // Set board image
  const setBoardImage = useCallback((boardItem) => {
    setSelectedBoardForImage(boardItem);
    boardImageInputRef.current?.click();
  }, []);

  // Open text file in editor
  const openTextFileEditor = useCallback((textFile) => {
    const existingEditor = openEditors.find(editor => editor.fileId === textFile.id);
    if (!existingEditor) {
      const newEditor = {
        id: `editor_${Date.now()}`,
        fileId: textFile.id,
        title: textFile.title,
        content: textFile.content,
        x: 100 + openEditors.length * 30,
        y: 100 + openEditors.length * 30,
        width: 600,
        height: 400,
        isMinimized: false
      };
      setOpenEditors(prev => [...prev, newEditor]);
    }
  }, [openEditors]);

  // Close editor
  const closeEditor = useCallback((editorId) => {
    setOpenEditors(prev => prev.filter(editor => editor.id !== editorId));
  }, []);

  // Update text file content
  const updateTextFileContent = useCallback((fileId, newContent) => {
    setBoards(prev => ({
      ...prev,
      [currentBoard]: {
        ...prev[currentBoard],
        items: prev[currentBoard].items.map(item =>
          item.id === fileId && item.type === 'textfile'
            ? { ...item, content: newContent }
            : item
        )
      }
    }));
    
    // Update open editor
    setOpenEditors(prev => prev.map(editor =>
      editor.fileId === fileId
        ? { ...editor, content: newContent }
        : editor
    ));
    
    saveToHistory();
  }, [currentBoard, saveToHistory]);

  // Handle editor dragging
  const handleEditorMouseDown = useCallback((e, editorId) => {
    const editor = openEditors.find(ed => ed.id === editorId);
    if (!editor) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggingEditor(editorId);
    setEditorDragOffset({
      x: e.clientX - editor.x,
      y: e.clientY - editor.y
    });
  }, [openEditors]);

  const handleEditorMouseMove = useCallback((e) => {
    if (!draggingEditor) return;
    
    const newX = e.clientX - editorDragOffset.x;
    const newY = e.clientY - editorDragOffset.y;
    
    setOpenEditors(prev => prev.map(editor =>
      editor.id === draggingEditor 
        ? { ...editor, x: Math.max(0, newX), y: Math.max(0, newY) }
        : editor
    ));
  }, [draggingEditor, editorDragOffset]);

  const handleEditorMouseUp = useCallback(() => {
    setDraggingEditor(null);
  }, []);

  // Editor drag event listeners
  useEffect(() => {
    if (draggingEditor) {
      document.addEventListener('mousemove', handleEditorMouseMove);
      document.addEventListener('mouseup', handleEditorMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleEditorMouseMove);
        document.removeEventListener('mouseup', handleEditorMouseUp);
      };
    }
  }, [draggingEditor, handleEditorMouseMove, handleEditorMouseUp]);

  // Custom Hand Icon Component
  const HandIcon = ({ size = 20 }) => (
    <SharpHandIcon size={size} />
  );

  // Tool components
  const tools = [
    { id: 'hand', icon: SharpHandIcon, label: 'Hand Tool' },
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'board', icon: Square, label: 'Board' },
    { id: 'textfile', icon: FilePlus, label: 'New Text File' },
    { id: 'textfile-import', icon: Upload, label: 'Import Text File' },
    { id: 'image', icon: Image, label: 'Add Image' },
    { id: 'audio', icon: Music, label: 'Add Audio' },
    { id: 'note', icon: StickyNote, label: 'Note' },
    { id: 'link', icon: Link2, label: 'Link' },
    { id: 'todo', icon: CheckSquare, label: 'Todo List' },
    { id: 'tag', icon: Tag, label: 'Tags' }
  ];

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  // Close context menu and color picker on click
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setColorPicker({ show: false, x: 0, y: 0, itemId: null });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const currentBoardData = boards[currentBoard];

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] border-b border-gray-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4" style={{ marginLeft: '80px' }}>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm">
            {boardHierarchy.map((boardId, index) => (
              <React.Fragment key={boardId}>
                <button
                  onClick={() => navigateToBoard(boardId, index)}
                  className={`text-sm px-2 py-1 rounded transition-colors ${
                    boardId === currentBoard
                      ? 'text-white bg-[#2d2d2d]'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {boards[boardId]?.name || 'Home'}
                </button>
                {index < boardHierarchy.length - 1 && (
                  <ChevronRight size={16} className="text-gray-600" />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          
          {/* Save/Load Project */}
          <button
            onClick={() => setShowSaveLoadModal(true)}
            className="p-3 text-gray-400 hover:text-white transition-colors"
            title={
              autoSaveEnabled && favoriteDirectory
                ? `Auto-sync enabled: ${favoriteDirectory}`
                : 'Project Manager'
            }
          >
            <FolderOpen size={20} />
          </button>
          
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="p-3 text-gray-400 hover:text-white transition-colors"
            title="Search (Ctrl+Enter)"
          >
            <SearchIcon size={20} />
          </button>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 bg-[#2d2d2d] rounded-lg px-4 py-2">
            <button 
              onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm font-mono min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn size={18} />
            </button>
          </div>
          
          {/* Undo/Redo */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={undo}
              className="p-3 text-gray-400 hover:text-white transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={20} />
            </button>
            <button 
              onClick={redo}
              className="p-3 text-gray-400 hover:text-white transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Left Toolbar - Full Height */}
        <div className="w-20 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-6 space-y-4">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                if (id === 'tag') {
                  setShowTagManager(true);
                  setSelectedTool('select');
                } else {
                  setSelectedTool(id);
                }
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                selectedTool === id
                  ? 'bg-[#f4c2c2] text-black'
                  : 'bg-[#2d2d2d] text-[#f4c2c2] hover:bg-[#f4c2c2] hover:text-black'
              }`}
              title={label}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-black"
            style={{
              cursor: selectedTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') 
                     : selectedTool === 'select' ? 'default'
                     : selectedTool === 'line' ? 'crosshair' 
                     : selectedTool !== 'select' && selectedTool !== 'hand' ? 'crosshair' 
                     : 'default'
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Items container */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              {currentBoardData?.items.map((item) => (
                <div key={item.id}>
                  {/* Selection highlight */}
                  {selectedItems.includes(item.id) && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: item.type === 'board' ? item.x : item.x - 4,
                        top: item.type === 'board' ? item.y : item.y - 4,
                        width: item.type === 'board' ? item.width : item.width + 8,
                        height: item.type === 'board' ? 192 : item.height + 8, // 192px = h-48 (board height)
                        border: '2px solid #f4c2c2',
                        borderRadius: item.type === 'board' ? '12px' : '8px',
                        backgroundColor: 'rgba(244, 194, 194, 0.1)',
                        zIndex: 1000
                      }}
                    />
                  )}
                  
                  {/* Main item */}
                  <div
                    className="absolute select-none"
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      transform: isDragging && draggedItem?.id === item.id ? 'scale(1.02)' : 'scale(1)',
                      transition: isDragging && draggedItem?.id === item.id ? 'none' : 'transform 0.2s ease'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    onDoubleClick={() => item.type === 'board' && handleBoardDoubleClick(item)}
                  >
                    {item.type === 'board' && (
                      <div className="w-full h-full cursor-pointer">
                        <div className="w-full h-48 bg-[#2d2d2d] rounded-xl hover:border-[#f4c2c2] hover:border-2 transition-colors shadow-2xl overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Square size={48} />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.name}
                              className="bg-[#1a1a1a] text-white font-medium text-lg text-center border border-[#f4c2c2] rounded px-2 py-1 w-full outline-none"
                              onBlur={(e) => handleItemEdit(item, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleItemEdit(item, e.target.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h3 className="text-white font-medium text-lg truncate">{item.name}</h3>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'note' && (
                      <div
                        className="w-full h-full rounded-lg shadow-xl cursor-pointer hover:shadow-2xl transition-shadow border border-gray-300"
                        style={{ backgroundColor: item.backgroundColor }}
                      >
                        {editingItem?.id === item.id ? (
                          <textarea
                            defaultValue={item.content}
                            className="w-full h-full bg-transparent border-none outline-none resize-none p-4 text-gray-800 text-sm leading-relaxed"
                            onBlur={(e) => handleItemEdit(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                handleItemEdit(item, e.target.value);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="w-full h-full p-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap"
                            onClick={() => setEditingItem(item)}
                          >
                            {item.content}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'textfile' && (
                      <div 
                        className="w-full h-full bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg shadow-xl cursor-pointer hover:bg-[#2d2d2d] transition-colors"
                        onDoubleClick={() => openTextFileEditor(item)}
                      >
                        <div className="p-3 h-full flex flex-col">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText size={16} className="text-[#f4c2c2]" />
                            {editingItem?.id === item.id ? (
                              <input
                                type="text"
                                defaultValue={item.title}
                                className="text-white font-medium text-sm bg-transparent border-b border-[#f4c2c2] outline-none flex-1 mr-1"
                                onBlur={(e) => handleItemEdit(item, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleItemEdit(item, e.target.value);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingItem(null);
                                  }
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h4 className="text-white font-medium text-sm truncate flex-1">{item.title}</h4>
                            )}
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <div className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                              {item.content.replace(/^#.*$/gm, '').slice(0, 100)}...
                            </div>
                          </div>
                          
                          {/* Tags section at bottom */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags?.map((tagId) => {
                              const tag = tags.find(t => t.id === tagId);
                              return tag ? (
                                <span
                                  key={tagId}
                                  className="px-2 py-1 rounded-full text-xs font-medium cursor-pointer"
                                  style={{ backgroundColor: tag.color, color: '#000' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove tag from item
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id 
                                            ? { ...i, tags: i.tags?.filter(t => t !== tagId) || [] }
                                            : i
                                        )
                                      }
                                    }));
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ) : null;
                            })}
                            <button
                              className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:border-[#f4c2c2] hover:text-[#f4c2c2] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open tag selection for this item
                                const currentTags = item.tags || [];
                                setSelectedTags([...currentTags]);
                                setEditingItemForTags(item);
                                setShowTagSelectionModal(true);
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                    
                    {item.type === 'image' && (
                      <div className="w-full h-full rounded-lg shadow-xl cursor-pointer overflow-hidden hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-[#f4c2c2] relative">
                        <img
                          src={item.src}
                          alt="Uploaded"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        
                        {/* Resize handles for selected images */}
                        {selectedItems.includes(item.id) && (
                          <>
                            {/* Corner resize handles */}
                            <div 
                              className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#f4c2c2] border-2 border-white rounded-full cursor-nw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setResizeHandle('bottom-right');
                                setResizeStart({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  width: item.width, 
                                  height: item.height 
                                });
                              }}
                            />
                            <div 
                              className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#f4c2c2] border-2 border-white rounded-full cursor-ne-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setResizeHandle('bottom-left');
                                setResizeStart({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  width: item.width, 
                                  height: item.height 
                                });
                              }}
                            />
                            <div 
                              className="absolute -top-2 -right-2 w-4 h-4 bg-[#f4c2c2] border-2 border-white rounded-full cursor-sw-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setResizeHandle('top-right');
                                setResizeStart({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  width: item.width, 
                                  height: item.height 
                                });
                              }}
                            />
                            <div 
                              className="absolute -top-2 -left-2 w-4 h-4 bg-[#f4c2c2] border-2 border-white rounded-full cursor-se-resize"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsResizing(true);
                                setResizeHandle('top-left');
                                setResizeStart({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  width: item.width, 
                                  height: item.height 
                                });
                              }}
                            />
                          </>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'line' && (
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: 0,
                          top: 0,
                          width: item.width || 1,
                          height: item.height || 1,
                          transform: `rotate(${item.rotation || 0}deg)`,
                          transformOrigin: 'center'
                        }}
                        width={item.width || 1}
                        height={item.height || 1}
                      >
                        <line
                          x1={item.startX - item.x}
                          y1={item.startY - item.y}
                          x2={item.endX - item.x}
                          y2={item.endY - item.y}
                          stroke={item.color || '#f4c2c2'}
                          strokeWidth={item.strokeWidth || 2}
                          strokeLinecap="round"
                        />
                        {/* Selection handles for lines */}
                        {selectedItems.includes(item.id) && (
                          <g>
                            <circle
                              cx={item.startX - item.x}
                              cy={item.startY - item.y}
                              r="6"
                              fill="#f4c2c2"
                              stroke="#fff"
                              strokeWidth="2"
                              className="cursor-move"
                            />
                            <circle
                              cx={item.endX - item.x}
                              cy={item.endY - item.y}
                              r="6"
                              fill="#f4c2c2"
                              stroke="#fff"
                              strokeWidth="2"
                              className="cursor-move"
                            />
                          </g>
                        )}
                      </svg>
                    )}

                    {item.type === 'link' && (
                      <div 
                        className={`rounded-lg shadow-xl border p-3 cursor-pointer hover:opacity-90 transition-colors ${
                          editingItem?.id === item.id ? 'border-[#f4c2c2]' : 'border-gray-300'
                        }`}
                        style={{
                          width: item.width || 200,
                          height: item.height || 80,
                          backgroundColor: item.color || '#f8fafc',
                          borderColor: editingItem?.id === item.id ? '#f4c2c2' : (item.color ? item.color : '#e2e8f0')
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.url && !editingItem) {
                            window.open(item.url, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-start space-x-2 h-full">
                          <Link2 size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 space-y-1 h-full">
                            {editingItem?.id === item.id ? (
                              <div className="h-full flex flex-col space-y-2">
                                <input
                                  type="text"
                                  defaultValue={item.title || ''}
                                  onBlur={(e) => {
                                    const newTitle = e.target.value;
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id ? { ...i, title: newTitle } : i
                                        )
                                      }
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                      // Focus on URL input
                                      const urlInput = e.target.parentElement.querySelector('input[type="url"]');
                                      if (urlInput) urlInput.focus();
                                    } else if (e.key === 'Escape') {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="w-full text-gray-800 font-medium text-sm bg-transparent border-b border-gray-400 outline-none"
                                  placeholder="Link title"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                  type="url"
                                  defaultValue={item.url || ''}
                                  onBlur={(e) => {
                                    const newUrl = e.target.value;
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id ? { ...i, url: newUrl } : i
                                        )
                                      }
                                    }));
                                    setEditingItem(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                      setEditingItem(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="w-full text-blue-600 text-xs bg-transparent border-b border-blue-300 outline-none"
                                  placeholder="https://example.com"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            ) : (
                              <>
                                <div className="text-gray-800 font-medium text-sm break-words">
                                  {item.title || 'Untitled Link'}
                                </div>
                                <div className="text-blue-600 text-xs break-all">
                                  {item.url || 'No URL'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'todo' && (
                      <div 
                        className="w-full h-full rounded-lg shadow-xl border border-gray-300 cursor-pointer"
                        style={{ backgroundColor: item.color || '#f4c2c2' }}
                      >
                        <div className="p-4">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.title}
                              className="text-gray-800 font-medium text-base mb-3 w-full bg-transparent border-b border-gray-400 outline-none"
                              onBlur={(e) => handleItemEdit(item, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleItemEdit(item, e.target.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h4 className="text-gray-800 font-medium text-base mb-3">{item.title}</h4>
                          )}
                          <div className="space-y-2">
                            {item.tasks.map((task, index) => (
                              <div key={task.id} className="flex items-center space-x-2">
                                <input 
                                  type="checkbox" 
                                  checked={task.completed}
                                  className="w-4 h-4 text-[#f4c2c2]"
                                  onChange={() => {
                                    const updatedTasks = [...item.tasks];
                                    updatedTasks[index].completed = !updatedTasks[index].completed;
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id ? { ...i, tasks: updatedTasks } : i
                                        )
                                      }
                                    }));
                                  }}
                                />
                                {!task.completed ? (
                                  <input
                                    type="text"
                                    value={task.text}
                                    onChange={(e) => {
                                      const updatedTasks = [...item.tasks];
                                      updatedTasks[index].text = e.target.value;
                                      setBoards(prev => ({
                                        ...prev,
                                        [currentBoard]: {
                                          ...prev[currentBoard],
                                          items: prev[currentBoard].items.map(i =>
                                            i.id === item.id ? { ...i, tasks: updatedTasks } : i
                                          )
                                        }
                                      }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.target.value.trim()) {
                                        // Add new task
                                        const updatedTasks = [...item.tasks, {
                                          id: Date.now(),
                                          text: '',
                                          completed: false
                                        }];
                                        setBoards(prev => ({
                                          ...prev,
                                          [currentBoard]: {
                                            ...prev[currentBoard],
                                            items: prev[currentBoard].items.map(i =>
                                              i.id === item.id ? { ...i, tasks: updatedTasks } : i
                                            )
                                          }
                                        }));
                                      } else if (e.key === 'Backspace' && e.target.value === '') {
                                        // Remove empty task
                                        const updatedTasks = item.tasks.filter((_, i) => i !== index);
                                        setBoards(prev => ({
                                          ...prev,
                                          [currentBoard]: {
                                            ...prev[currentBoard],
                                            items: prev[currentBoard].items.map(i =>
                                              i.id === item.id ? { ...i, tasks: updatedTasks } : i
                                            )
                                          }
                                        }));
                                      }
                                    }}
                                    className="text-sm text-gray-800 bg-transparent border-none outline-none flex-1"
                                    placeholder="Enter task..."
                                  />
                                ) : (
                                  <span className="text-sm text-gray-600 line-through flex-1">
                                    {task.text}
                                  </span>
                                )}
                              </div>
                            ))}
                            {/* Add new task button */}
                            <button
                              onClick={() => {
                                const updatedTasks = [...item.tasks, {
                                  id: Date.now(),
                                  text: '',
                                  completed: false
                                }];
                                setBoards(prev => ({
                                  ...prev,
                                  [currentBoard]: {
                                    ...prev[currentBoard],
                                    items: prev[currentBoard].items.map(i =>
                                      i.id === item.id ? { ...i, tasks: updatedTasks } : i
                                    )
                                  }
                                }));
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              + Add task
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'audio' && (
                      <div className="w-full h-full bg-purple-50 rounded-lg shadow-xl border border-purple-200 p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Music size={16} className="text-purple-600" />
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.title}
                              className="text-purple-800 font-medium text-sm bg-transparent border-b border-purple-400 outline-none flex-1"
                              onBlur={(e) => handleItemEdit(item, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleItemEdit(item, e.target.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingItem(null);
                                }
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h4 className="text-purple-800 font-medium text-sm truncate flex-1">{item.title}</h4>
                          )}
                        </div>
                        <audio controls className="w-full">
                          <source src={item.src} type="audio/mpeg" />
                          <source src={item.src} type="audio/wav" />
                          <source src={item.src} type="audio/ogg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Rectangle Selection Overlay */}
              {rectangleSelection && (
                <div
                  className="absolute pointer-events-none border-2 border-dashed border-[#f4c2c2] bg-[#f4c2c2] bg-opacity-20"
                  style={{
                    left: rectangleSelection.x,
                    top: rectangleSelection.y,
                    width: rectangleSelection.width,
                    height: rectangleSelection.height
                  }}
                />
              )}
              
              {/* Line Preview */}
              {linePreview && (
                <svg
                  className="absolute pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  width="100%"
                  height="100%"
                >
                  <line
                    x1={linePreview.startX}
                    y1={linePreview.startY}
                    x2={linePreview.endX}
                    y2={linePreview.endY}
                    stroke={linePreview.color}
                    strokeWidth={linePreview.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={linePreview.isDash ? "8,4" : "none"}
                    opacity="0.8"
                  />
                </svg>
              )}
              
              {/* Selected Items Outline - Only for non-board items */}
              {selectedItems.map(itemId => {
                const item = boards[currentBoard].items.find(i => i.id === itemId);
                if (!item || item.type === 'board') return null;
                
                return (
                  <div
                    key={`selection-${itemId}`}
                    className="absolute pointer-events-none border-2 border-[#f4c2c2] rounded-lg"
                    style={{
                      left: item.x - 2,
                      top: item.y - 2,
                      width: item.width + 4,
                      height: item.height + 4
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl py-2 z-50 min-w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditingItem(contextMenu.item)}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2d2d2d] hover:text-white transition-colors flex items-center space-x-2"
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </button>
          {contextMenu.item.type === 'board' && (
            <button
              onClick={() => setBoardImage(contextMenu.item)}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2d2d2d] hover:text-white transition-colors flex items-center space-x-2"
            >
              <Image size={16} />
              <span>Set Image</span>
            </button>
          )}
          
          {(['note', 'link', 'todo', 'tag'].includes(contextMenu.item.type)) && (
            <button
              onClick={() => {
                setNoteColorPicker({
                  show: true,
                  x: contextMenu.x,
                  y: contextMenu.y + 30,
                  itemId: contextMenu.item.id
                });
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2d2d2d] hover:text-white transition-colors flex items-center space-x-2"
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: contextMenu.item.backgroundColor || contextMenu.item.color || '#f4c2c2' }} />
              <span>Change Color</span>
            </button>
          )}

          <button
            onClick={() => deleteItem(contextMenu.item.id)}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}



      {/* Text File Editors */}
      {openEditors.map(editor => (
        <div
          key={editor.id}
          className="fixed bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg shadow-2xl z-40"
          style={{
            left: editor.x,
            top: editor.y,
            width: editor.width,
            height: editor.height,
            display: editor.isMinimized ? 'none' : 'block'
          }}
        >
          {/* Editor Header */}
          <div 
            className="flex items-center justify-between p-3 border-b border-gray-700 bg-[#2d2d2d] rounded-t-lg cursor-move"
            onMouseDown={(e) => handleEditorMouseDown(e, editor.id)}
          >
            <div className="flex items-center space-x-2">
              <FileText size={14} className="text-[#f4c2c2]" />
              <span className="text-white text-sm font-medium">{editor.title}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => closeEditor(editor.id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Editor Content */}
          <div className="p-4 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
            <textarea
              value={editor.content}
              onChange={(e) => {
                const newContent = e.target.value;
                setOpenEditors(prev => prev.map(ed => 
                  ed.id === editor.id ? { ...ed, content: newContent } : ed
                ));
                updateTextFileContent(editor.fileId, newContent);
              }}
              className="w-full h-full bg-transparent text-white text-sm leading-relaxed outline-none resize-none font-mono"
              placeholder="Start writing..."
            />
          </div>
          
          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-[#f4c2c2] opacity-50 hover:opacity-100"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = editor.width;
              const startHeight = editor.height;
              
              const handleResize = (moveEvent) => {
                const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
                
                setOpenEditors(prev => prev.map(ed =>
                  ed.id === editor.id 
                    ? { ...ed, width: newWidth, height: newHeight }
                    : ed
                ));
              };
              
              const handleResizeEnd = () => {
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', handleResizeEnd);
              };
              
              document.addEventListener('mousemove', handleResize);
              document.addEventListener('mouseup', handleResizeEnd);
            }}
          />
        </div>
      ))}

      {/* Tag Prompt Modal */}
      {showTagPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-96">
            <h3 className="text-white text-lg font-medium mb-4">Create New Tag</h3>
            <input
              type="text"
              placeholder="Enter tag name..."
              className="w-full bg-[#2d2d2d] text-white border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-[#f4c2c2]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addTag(e.target.value.trim());
                  setShowTagPrompt(false);
                } else if (e.key === 'Escape') {
                  setShowTagPrompt(false);
                }
              }}
            />
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowTagPrompt(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling.previousElementSibling;
                  if (input.value.trim()) {
                    addTag(input.value.trim());
                    setShowTagPrompt(false);
                  }
                }}
                className="px-4 py-2 bg-[#f4c2c2] text-black rounded-lg hover:bg-[#f5d2d2] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Manager Window */}
      {showTagManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">Tag Manager</h3>
              <button
                onClick={() => setShowTagManager(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-3 p-2 rounded-lg bg-[#2d2d2d]">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-600 cursor-pointer"
                    style={{ backgroundColor: tag.color }}
                    onClick={() => {
                      setColorPickerTag(tag);
                      setShowColorPicker(true);
                    }}
                  />
                  <span className="text-white flex-1">{tag.name}</span>
                  <button
                    onClick={() => {
                      setTags(prev => prev.filter(t => t.id !== tag.id));
                      // Remove this tag from all items
                      setBoards(prev => {
                        const newBoards = { ...prev };
                        Object.keys(newBoards).forEach(boardId => {
                          if (newBoards[boardId].items) {
                            newBoards[boardId].items = newBoards[boardId].items.map(item => ({
                              ...item,
                              tags: item.tags?.filter(t => t !== tag.id) || []
                            }));
                          }
                        });
                        return newBoards;
                      });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setNewTagName('');
                  setShowTagNameInput(true);
                }}
                className="w-full p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-[#f4c2c2] hover:text-[#f4c2c2] transition-colors"
              >
                + Add New Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Color Picker Modal */}
      {showColorPicker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setShowColorPicker(false);
              setColorPickerTag(null);
            }
          }}
        >
          <div 
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl p-4 w-[320px]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h4 className="text-white font-medium mb-3">Tag Color Picker</h4>
            
            {/* Color Palette */}
            <div className="mb-4">
              <label className="text-white text-xs mb-2 block">Quick Colors</label>
              <div className="grid grid-cols-8 gap-2">
                {[
                  '#ffffff', '#f5f5dc', '#fff2cc', '#ffe6cc', '#ffcccc', '#e6ccff', '#ccf2ff',
                  '#ccffe6', '#ffccf2', '#d4ccff', '#fff4cc', '#ccffcc', '#ffcce6',
                  '#e6f2ff', '#f2ffcc', '#ffccdc', '#ccf2e6', '#e6ccf2', '#f2ccff',
                  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b',
                  '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055', '#00b894',
                  '#74b9ff', '#81ecec', '#fab1a0', '#00cec9', '#000000'
                ].map((color, index) => (
                  <button
                    key={index}
                    className="w-6 h-6 rounded-md border border-gray-600 hover:border-[#f4c2c2] transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (colorPickerTag) {
                        setTags(prev => prev.map(t => 
                          t.id === colorPickerTag.id ? { ...t, color } : t
                        ));
                      }
                      setShowColorPicker(false);
                      setColorPickerTag(null);
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Photoshop-Style Color Picker */}
            <div className="mb-4">
              <label className="text-white text-xs mb-2 block">Advanced Color Picker</label>
              
              {/* Main Color Area */}
              <div className="relative w-full h-48 mb-3 rounded border border-gray-600 cursor-crosshair overflow-hidden"
                style={{
                  background: `linear-gradient(to right, white, hsl(${colorPickerHue}, 100%, 50%)), 
                              linear-gradient(to bottom, transparent, black)`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const saturation = (x / rect.width) * 100;
                  const lightness = 100 - (y / rect.height) * 100;
                  setColorPickerSaturation(saturation);
                  setColorPickerLightness(lightness);
                  const color = `hsl(${colorPickerHue}, ${saturation}%, ${lightness}%)`;
                  if (colorPickerTag) {
                    setTags(prev => prev.map(t => 
                      t.id === colorPickerTag.id ? { ...t, color } : t
                    ));
                  }
                }}
              >
                {/* Color Crosshair */}
                <div 
                  className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
                  style={{
                    left: `${(colorPickerSaturation / 100) * 100}%`,
                    top: `${100 - (colorPickerLightness / 100) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
              
              {/* Hue Slider */}
              <div className="mb-3">
                <label className="text-white text-xs mb-1 block">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={colorPickerHue}
                  className="w-full h-4 rounded appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                      hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), 
                      hsl(360, 100%, 50%))`
                  }}
                  onChange={(e) => {
                    const hue = parseInt(e.target.value);
                    setColorPickerHue(hue);
                    const color = `hsl(${hue}, ${colorPickerSaturation}%, ${colorPickerLightness}%)`;
                    if (colorPickerTag) {
                      setTags(prev => prev.map(t => 
                        t.id === colorPickerTag.id ? { ...t, color } : t
                      ));
                    }
                  }}
                />
              </div>
              
              {/* Current Color Display */}
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded border border-gray-600"
                  style={{ backgroundColor: `hsl(${colorPickerHue}, ${colorPickerSaturation}%, ${colorPickerLightness}%)` }}
                />
                <div className="flex-1">
                  <div className="text-white text-xs">
                    Current: hsl({Math.round(colorPickerHue)}, {Math.round(colorPickerSaturation)}%, {Math.round(colorPickerLightness)}%)
                  </div>
                </div>
              </div>
              
              {/* Hex Input */}
              <div>
                <label className="text-white text-xs mb-1 block">Hex Color</label>
                <input
                  type="text"
                  placeholder="#000000"
                  className="w-full bg-[#2d2d2d] text-white border border-gray-600 rounded px-3 py-2 text-sm"
                  onBlur={(e) => {
                    const hex = e.target.value;
                    if (hex.match(/^#[0-9A-F]{6}$/i) && colorPickerTag) {
                      setTags(prev => prev.map(t => 
                        t.id === colorPickerTag.id ? { ...t, color: hex } : t
                      ));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const hex = e.target.value;
                      if (hex.match(/^#[0-9A-F]{6}$/i) && colorPickerTag) {
                        setTags(prev => prev.map(t => 
                          t.id === colorPickerTag.id ? { ...t, color: hex } : t
                        ));
                        setShowColorPicker(false);
                        setColorPickerTag(null);
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  setColorPickerTag(null);
                }}
                className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Name Input Modal */}
      {showTagNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">New Tag</h3>
              <button
                onClick={() => {
                  setShowTagNameInput(false);
                  setNewTagName('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full p-2 bg-[#2d2d2d] border border-gray-600 rounded text-white outline-none focus:border-[#f4c2c2]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTagName.trim()) {
                  const newTag = {
                    id: Date.now(),
                    name: newTagName.trim(),
                    color: '#' + Math.floor(Math.random()*16777215).toString(16)
                  };
                  setTags(prev => [...prev, newTag]);
                  setShowTagNameInput(false);
                  setNewTagName('');
                }
                if (e.key === 'Escape') {
                  setShowTagNameInput(false);
                  setNewTagName('');
                }
              }}
            />
            
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowTagNameInput(false);
                  setNewTagName('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newTagName.trim()) {
                    const newTag = {
                      id: Date.now(),
                      name: newTagName.trim(),
                      color: '#' + Math.floor(Math.random()*16777215).toString(16)
                    };
                    setTags(prev => [...prev, newTag]);
                    setShowTagNameInput(false);
                    setNewTagName('');
                  }
                }}
                className="px-4 py-2 bg-[#f4c2c2] text-black rounded-lg hover:bg-[#f5d2d2] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Selection Modal */}
      {showTagSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-96">
            <h3 className="text-white text-lg font-medium mb-4">Select Tags</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTags.includes(tag.id) 
                      ? 'bg-[#f4c2c2] bg-opacity-20' 
                      : 'bg-[#2d2d2d] hover:bg-[#3d3d3d]'
                  }`}
                  onClick={() => {
                    const newSelectedTags = selectedTags.includes(tag.id) 
                      ? selectedTags.filter(t => t !== tag.id)
                      : [...selectedTags, tag.id];
                    
                    setSelectedTags(newSelectedTags);
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-white flex-1">{tag.name}</span>
                  {selectedTags.includes(tag.id) && (
                    <div className="w-4 h-4 rounded-full bg-[#f4c2c2] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowTagSelectionModal(false);
                  setSelectedTags([]);
                  setEditingItemForTags(null);
                  setPendingTextFileImport(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingTextFileImport) {
                    // Complete text file import with selected tags
                    const newItem = {
                      ...pendingTextFileImport,
                      tags: selectedTags
                    };
                    setBoards(prev => ({
                      ...prev,
                      [currentBoard]: {
                        ...prev[currentBoard],
                        items: [...prev[currentBoard].items, newItem]
                      }
                    }));
                    setPendingImagePosition(null);
                    setPendingTextFileImport(null);
                    saveToHistory();
                  } else if (editingItemForTags) {
                    // Update existing item tags
                    setBoards(prev => ({
                      ...prev,
                      [currentBoard]: {
                        ...prev[currentBoard],
                        items: prev[currentBoard].items.map(i =>
                          i.id === editingItemForTags.id ? { ...i, tags: selectedTags } : i
                        )
                      }
                    }));
                    setEditingItemForTags(null);
                    saveToHistory();
                  }
                  setShowTagSelectionModal(false);
                  setSelectedTags([]);
                }}
                className="px-4 py-2 bg-[#f4c2c2] text-black rounded-lg hover:bg-[#f5d2d2] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save/Load Project Modal */}
      {showSaveLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-white text-lg font-medium mb-4">Project Manager</h3>
            
            {/* Auto-Sync Settings */}
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-white font-medium mb-2">Auto-Sync</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Auto-save and auto-load your project data
                </p>
                {favoriteDirectory ? (
                  <div className="bg-[#2d2d2d] rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Project:</div>
                        <div className="text-white text-sm">{favoriteDirectory}</div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-gray-400">Auto-sync:</span>
                          {autoSaveEnabled ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              Enabled
                            </span>
                          ) : (
                            <span className="text-gray-500">Disabled</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          autoSaveEnabled 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {autoSaveEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#2d2d2d] rounded-lg p-3 mb-3">
                    <div className="text-gray-500 text-sm">
                      Import a project file to enable auto-sync
                    </div>
                  </div>
                )}
              </div>

              {/* Import Section */}
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-white font-medium mb-2">Import Project</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Load a project file to restore all your data
                </p>
                {isImporting ? (
                  <div className="w-full bg-[#2d2d2d] rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-4 h-4 border-2 border-[#f4c2c2] border-t-transparent rounded-full animate-spin" />
                      <span className="text-white">Importing...</span>
                    </div>
                    {importProgress && (
                      <p className="text-gray-400 text-sm text-center">{importProgress}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => projectFolderInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 bg-[#2d2d2d] text-[#f4c2c2] rounded-lg px-4 py-2 hover:bg-[#3d3d3d] transition-colors border border-[#f4c2c2]"
                  >
                    <Upload size={16} />
                    <span>Import Project File</span>
                  </button>
                )}
              </div>

              {/* Export Section */}
              <div>
                <h4 className="text-white font-medium mb-2">Export Project</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Download your project as a backup file
                </p>
                <div className="bg-[#2d2d2d] rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-400">Current Project:</div>
                  <div className="text-white text-sm">
                    {Object.keys(boards).length} boards • {tags.length} tags • {Object.values(boards).reduce((sum, board) => sum + board.items.length, 0)} items
                  </div>
                </div>
                <button
                  onClick={exportProject}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center space-x-2 bg-[#2d2d2d] text-[#f4c2c2] rounded-lg px-4 py-2 hover:bg-[#3d3d3d] transition-colors disabled:opacity-50 border border-[#f4c2c2]"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#f4c2c2] border-t-transparent rounded-full animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Export Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>



            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSaveLoadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isExporting || isImporting}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <h3 className="text-white text-lg font-medium mb-4">Settings</h3>
            
            <div className="space-y-6">
              {/* Keyboard Shortcuts */}
              <div>
                <h4 className="text-white font-medium mb-3">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(shortcuts).map(([action, key]) => (
                    <div key={action} className="flex items-center justify-between bg-[#2d2d2d] rounded p-3">
                      <span className="text-gray-300 text-sm capitalize">
                        {action === 'textfile' ? 'Text File' : action.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <button
                        className="bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1 text-[#f4c2c2] text-sm min-w-[48px] hover:border-[#f4c2c2] transition-colors"
                      >
                        {key.toUpperCase() || '?'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>


            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setEditingShortcut(null);
                  setEditingColor(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg w-[600px] max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#f4c2c2]/30">
              <h3 className="text-[#f4c2c2] text-xl font-light">Search</h3>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-[#f4c2c2] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="p-4 border-b border-[#f4c2c2]/30">
              <input
                type="text"
                placeholder="Search boards, items, and content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  performSearch(e.target.value);
                }}
                className="w-full bg-[#2d2d2d] text-white border border-[#f4c2c2]/50 rounded-lg px-4 py-2 outline-none focus:border-[#f4c2c2] transition-colors"
                autoFocus
              />
            </div>
            
            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchResults.length === 0 && searchQuery && (
                <div className="text-gray-400 text-center py-8">
                  No results found for "{searchQuery}"
                </div>
              )}
              
              {searchResults.length === 0 && !searchQuery && (
                <div className="text-gray-400 text-center py-8">
                  Start typing to search through your boards and content
                </div>
              )}
              
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-[#2d2d2d] rounded-lg p-3 hover:bg-[#3d3d3d] transition-colors cursor-pointer"
                  onDoubleClick={() => {
                    if (result.type === 'board') {
                      setCurrentBoard(result.boardId);
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-[#f4c2c2]">
                      {result.type === 'board' && <Square size={16} />}
                      {result.type === 'note' && <StickyNote size={16} />}
                      {result.type === 'textfile' && <FileText size={16} />}
                      {result.type === 'image' && <Image size={16} />}
                      {result.type === 'link' && <Link2 size={16} />}
                      {result.type === 'todo' && <CheckSquare size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{result.title}</div>
                      <div className="text-gray-400 text-sm">
                        {result.type === 'board' ? 'Board' : `${result.type} in ${result.boardName}`}
                      </div>
                      {result.preview && (
                        <div className="text-gray-500 text-sm mt-1 truncate">
                          {result.preview}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photoshop-Style Color Picker */}
      {noteColorPicker.show && (
        <div
          className="fixed bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl p-4 z-50 w-[320px]"
          style={{ left: noteColorPicker.x, top: noteColorPicker.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-white font-medium mb-3">Color Picker</h4>
          
          {/* Color Palette */}
          <div className="mb-4">
            <label className="text-white text-xs mb-2 block">Quick Colors</label>
            <div className="grid grid-cols-8 gap-2">
              {[
                '#ffffff', '#f5f5dc', '#fff2cc', '#ffe6cc', '#ffcccc', '#e6ccff', '#ccf2ff',
                '#ccffe6', '#ffccf2', '#d4ccff', '#fff4cc', '#ccffcc', '#ffcce6',
                '#e6f2ff', '#f2ffcc', '#ffccdc', '#ccf2e6', '#e6ccf2', '#f2ccff',
                '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b',
                '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055', '#00b894',
                '#74b9ff', '#81ecec', '#fab1a0', '#00cec9', '#000000'
              ].map((color, index) => (
                <button
                  key={index}
                  className="w-6 h-6 rounded-md border border-gray-600 hover:border-[#f4c2c2] transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    changeItemColor(noteColorPicker.itemId, color);
                    setNoteColorPicker({ show: false, x: 0, y: 0, itemId: null });
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Photoshop-Style Color Picker */}
          <div className="mb-4">
            <label className="text-white text-xs mb-2 block">Advanced Color Picker</label>
            
            {/* Main Color Area */}
            <div className="relative w-full h-48 mb-3 rounded border border-gray-600 cursor-crosshair overflow-hidden"
              style={{
                background: `linear-gradient(to right, white, hsl(${colorPickerHue}, 100%, 50%)), 
                            linear-gradient(to bottom, transparent, black)`
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const saturation = (x / rect.width) * 100;
                const lightness = 100 - (y / rect.height) * 100;
                setColorPickerSaturation(saturation);
                setColorPickerLightness(lightness);
                const color = `hsl(${colorPickerHue}, ${saturation}%, ${lightness}%)`;
                changeItemColor(noteColorPicker.itemId, color);
              }}
            >
              {/* Color Crosshair */}
              <div 
                className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
                style={{
                  left: `${(colorPickerSaturation / 100) * 100}%`,
                  top: `${100 - (colorPickerLightness / 100) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
            
            {/* Hue Slider */}
            <div className="mb-3">
              <label className="text-white text-xs mb-1 block">Hue</label>
              <input
                type="range"
                min="0"
                max="360"
                value={colorPickerHue}
                className="w-full h-4 rounded appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`
                }}
                onChange={(e) => {
                  const hue = parseInt(e.target.value);
                  setColorPickerHue(hue);
                  const color = `hsl(${hue}, ${colorPickerSaturation}%, ${colorPickerLightness}%)`;
                  changeItemColor(noteColorPicker.itemId, color);
                }}
              />
            </div>
            
            {/* Current Color Display */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded border border-gray-600"
                style={{ backgroundColor: `hsl(${colorPickerHue}, ${colorPickerSaturation}%, ${colorPickerLightness}%)` }}
              />
              <div className="flex-1">
                <div className="text-white text-xs">
                  Current: hsl({Math.round(colorPickerHue)}, {Math.round(colorPickerSaturation)}%, {Math.round(colorPickerLightness)}%)
                </div>
              </div>
            </div>
            
            {/* Hex Input */}
            <div>
              <label className="text-white text-xs mb-1 block">Hex Color</label>
              <input
                type="text"
                placeholder="#000000"
                className="w-full bg-[#2d2d2d] text-white border border-gray-600 rounded px-3 py-2 text-sm"
                onBlur={(e) => {
                  const hex = e.target.value;
                  if (hex.match(/^#[0-9A-F]{6}$/i)) {
                    changeItemColor(noteColorPicker.itemId, hex);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const hex = e.target.value;
                    if (hex.match(/^#[0-9A-F]{6}$/i)) {
                      changeItemColor(noteColorPicker.itemId, hex);
                      setNoteColorPicker({ show: false, x: 0, y: 0, itemId: null });
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setNoteColorPicker({ show: false, x: 0, y: 0, itemId: null })}
              className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={boardImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleBoardImageUpload}
        className="hidden"
      />
      <input
        ref={textFileInputRef}
        type="file"
        accept=".txt,.md,.markdown"
        onChange={handleTextFileImport}
        className="hidden"
      />
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioFileImport}
        className="hidden"
      />
      <input
        ref={projectFolderInputRef}
        type="file"
        accept=".json"
        onChange={handleProjectFileSelect}
        className="hidden"
      />
      <input
        ref={favoriteDirectoryInputRef}
        type="file"
        webkitdirectory="true"
        multiple
        onChange={handleFavoriteDirectorySelect}
        className="hidden"
      />


    </div>
  );
};

export default MilanoteClone;
