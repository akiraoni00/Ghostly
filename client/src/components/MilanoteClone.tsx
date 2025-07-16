import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, MoreHorizontal, Edit3, Image, FileText, Minus, Square, Ghost, MousePointer, StickyNote, Link2, CheckSquare, Undo2, Redo2, ZoomIn, ZoomOut, ChevronRight, Copy, Trash2, Tag, GitBranch, X, Maximize2, Minimize2, Settings, Upload, FilePlus, Music, Save, FolderOpen, Download, Star, Heart } from 'lucide-react';

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
  const [selectedTool, setSelectedTool] = useState('select');
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
  const [showNodeGraph, setShowNodeGraph] = useState(false);
  const [openEditors, setOpenEditors] = useState([]);
  const [tags, setTags] = useState(() => {
    const savedTags = localStorage.getItem('ghostly-tags');
    return savedTags ? JSON.parse(savedTags) : [];
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingItemForTags, setEditingItemForTags] = useState(null);
  const [showTagPrompt, setShowTagPrompt] = useState(false);
  const [nodeGraphSettings, setNodeGraphSettings] = useState({
    nodeDistance: 120,
    textSize: 10,
    connectionOpacity: 0.6,
    nodeSize: 20,
    tagDistance: 180,
    tagSize: 15
  });
  const [nodePositions, setNodePositions] = useState(() => {
    const saved = localStorage.getItem('ghostly-node-positions');
    return saved ? new Map(JSON.parse(saved)) : new Map();
  }); // Store custom positions
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [clickTimer, setClickTimer] = useState(null);
  const [showNodeGraphSettings, setShowNodeGraphSettings] = useState(false);
  const [nodeGraphZoom, setNodeGraphZoom] = useState(1);
  const [nodeGraphPan, setNodeGraphPan] = useState({ x: 0, y: 0 });
  const [isNodeGraphPanning, setIsNodeGraphPanning] = useState(false);
  const [nodeGraphPanStart, setNodeGraphPanStart] = useState({ x: 0, y: 0 });
  const [showTagManager, setShowTagManager] = useState(false);
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
  const nodeGraphRef = useRef(null);

  // Save state to history for undo functionality
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(boards)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [boards, history, historyIndex]);

  // Export all data to downloadable files
  const exportProject = async (isAutoSave = false) => {
    setIsExporting(true);
    try {
      // Create a comprehensive data structure with ALL application state
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
          nodeGraphSettings,
          showNodeGraph,
          selectedTool,
          history: history.slice(-50), // Keep last 50 history items
          historyIndex
        },
        ui: {
          contextMenu,
          editingItem,
          pendingImagePosition,
          draggedItem,
          isDragging,
          dragOffset,
          isPanning,
          panStart,
          isNodeGraphPanning,
          nodeGraphPanStart,
          showTagManager,
          showTagSelectionModal,
          showColorPicker,
          showTagNameInput,
          selectedTags,
          editingItemForTags,
          colorPickerTag,
          draggingEditor,
          editorDragOffset
        },
        localStorage: {
          'ghostly-boards': JSON.stringify(boards),
          'ghostly-tags': JSON.stringify(tags),
          'ghostly-currentBoard': JSON.stringify(currentBoard),
          'ghostly-boardHierarchy': JSON.stringify(boardHierarchy),
          'ghostly-zoom': JSON.stringify(zoom),
          'ghostly-pan': JSON.stringify(pan),
          'ghostly-nodeGraphSettings': JSON.stringify(nodeGraphSettings),
          'ghostly-openEditors': JSON.stringify(openEditors)
        },
        metadata: {
          totalBoards: Object.keys(boards).length,
          totalTags: tags.length,
          totalItems: Object.values(boards).reduce((sum, board) => sum + board.items.length, 0),
          totalTextFiles: Object.values(boards).reduce((sum, board) => 
            sum + board.items.filter(item => item.type === 'textFile').length, 0),
          totalConnections: Object.values(boards).reduce((sum, board) => 
            sum + board.items.filter(item => item.type === 'line').length, 0),
          exportedAt: new Date().toLocaleString(),
          isAutoSave
        }
      };

      // Create individual files for different data types
      const files = [
        {
          name: 'project-data.json',
          content: JSON.stringify(projectData, null, 2),
          type: 'application/json'
        },
        {
          name: 'boards-backup.json',
          content: JSON.stringify(boards, null, 2),
          type: 'application/json'
        },
        {
          name: 'tags-backup.json',
          content: JSON.stringify(tags, null, 2),
          type: 'application/json'
        },
        {
          name: 'settings-backup.json',
          content: JSON.stringify({
            zoom,
            pan,
            currentBoard,
            boardHierarchy,
            nodeGraphSettings,
            openEditors
          }, null, 2),
          type: 'application/json'
        }
      ];

      // Export text files content
      const textFilesContent = {};
      Object.values(boards).forEach(board => {
        board.items.forEach(item => {
          if (item.type === 'textFile' && item.content) {
            textFilesContent[item.id] = {
              name: item.name,
              content: item.content,
              tags: item.tags || [],
              created: item.created || new Date().toISOString()
            };
          }
        });
      });

      if (Object.keys(textFilesContent).length > 0) {
        files.push({
          name: 'text-files.json',
          content: JSON.stringify(textFilesContent, null, 2),
          type: 'application/json'
        });
      }

      // Create and download each file
      for (const file of files) {
        const blob = new Blob([file.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create a README file with instructions
      const readmeContent = `# Ghostly Project Export

This folder contains a complete backup of your Ghostly note-taking project.

## Files included:
- project-data.json: Complete project data and settings
- boards-backup.json: All boards and their content
- tags-backup.json: All tags and their properties
- settings-backup.json: Application settings and preferences
- text-files.json: All text file contents (if any)

## How to restore:
1. Open Ghostly application
2. Click the folder icon in the top navigation
3. Select "Import Directory" 
4. Choose this entire folder
5. All your boards, notes, tags, and settings will be restored

## Auto-Save Setup:
After importing, this directory will be automatically set up for auto-save.
Your changes will be saved to this folder every minute.

## Export Details:
- Exported on: ${new Date().toLocaleString()}
- Total boards: ${Object.keys(boards).length}
- Total tags: ${tags.length}
- Version: 1.0.0
- Auto-save: ${isAutoSave ? 'Yes' : 'Manual Export'}

Keep this folder safe as a backup of your work!
`;

      const readmeBlob = new Blob([readmeContent], { type: 'text/plain' });
      const readmeUrl = URL.createObjectURL(readmeBlob);
      const readmeLink = document.createElement('a');
      readmeLink.href = readmeUrl;
      readmeLink.download = 'README.txt';
      readmeLink.style.display = 'none';
      document.body.appendChild(readmeLink);
      readmeLink.click();
      document.body.removeChild(readmeLink);
      URL.revokeObjectURL(readmeUrl);

      // If this is a manual export, suggest setting up auto-save
      if (!isAutoSave && !favoriteDirectory) {
        setTimeout(() => {
          if (confirm('Export complete!\n\nWould you like to set this as your favorite directory for auto-save and auto-load?\n\nThis will automatically save changes every minute and load this project when you start the app.')) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const suggestedName = `ghostly-project-${timestamp}`;
            setFavoriteDirectoryPath(suggestedName);
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      if (!isAutoSave) {
        setShowSaveLoadModal(false);
      }
    }
  };

  // Import project data from file
  const importProject = async (file) => {
    setIsImporting(true);
    setImportProgress('Reading file...');
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      setImportProgress('Validating data...');
      
      // Validate the import data structure
      if (!data.boards || !data.version) {
        throw new Error('Invalid project file format');
      }

      setImportProgress('Importing boards and items...');
      setBoards(data.boards);
      
      setImportProgress('Importing tags...');
      if (data.tags) {
        setTags(data.tags);
      }
      
      setImportProgress('Importing settings...');
      if (data.settings) {
        if (data.settings.zoom !== undefined) setZoom(data.settings.zoom);
        if (data.settings.pan) setPan(data.settings.pan);
        if (data.settings.currentBoard) setCurrentBoard(data.settings.currentBoard);
        if (data.settings.boardHierarchy) setBoardHierarchy(data.settings.boardHierarchy);
        if (data.settings.nodeGraphSettings) setNodeGraphSettings(data.settings.nodeGraphSettings);
        if (data.settings.openEditors) setOpenEditors(data.settings.openEditors);
        if (data.settings.showNodeGraph !== undefined) setShowNodeGraph(data.settings.showNodeGraph);
        if (data.settings.selectedTool) setSelectedTool(data.settings.selectedTool);
        if (data.settings.history) setHistory(data.settings.history);
        if (data.settings.historyIndex !== undefined) setHistoryIndex(data.settings.historyIndex);
      }

      setImportProgress('Restoring UI state...');
      if (data.ui) {
        // Reset all UI state to clean state
        setContextMenu(null);
        setEditingItem(null);
        setPendingImagePosition(null);
        setDraggedItem(null);
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        setIsPanning(false);
        setPanStart({ x: 0, y: 0 });
        setIsNodeGraphPanning(false);
        setNodeGraphPanStart({ x: 0, y: 0 });
        setShowTagManager(false);
        setShowTagSelectionModal(false);
        setShowColorPicker(false);
        setShowTagNameInput(false);
        setSelectedTags([]);
        setEditingItemForTags(null);
        setColorPickerTag(null);
        setDraggingEditor(null);
        setEditorDragOffset({ x: 0, y: 0 });
      }

      setImportProgress('Saving to local storage...');
      // Update localStorage with imported data using the complete localStorage backup
      if (data.localStorage) {
        Object.entries(data.localStorage).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      } else {
        // Fallback to manual localStorage update
        localStorage.setItem('ghostly-boards', JSON.stringify(data.boards));
        localStorage.setItem('ghostly-tags', JSON.stringify(data.tags || []));
        localStorage.setItem('ghostly-currentBoard', JSON.stringify(data.settings?.currentBoard || 'home'));
        localStorage.setItem('ghostly-boardHierarchy', JSON.stringify(data.settings?.boardHierarchy || ['home']));
        localStorage.setItem('ghostly-zoom', JSON.stringify(data.settings?.zoom || 1));
        localStorage.setItem('ghostly-pan', JSON.stringify(data.settings?.pan || { x: 0, y: 0 }));
        localStorage.setItem('ghostly-nodeGraphSettings', JSON.stringify(data.settings?.nodeGraphSettings || {}));
        localStorage.setItem('ghostly-openEditors', JSON.stringify(data.settings?.openEditors || []));
      }

      setImportProgress('Finalizing import...');
      
      // Save current state to history
      saveToHistory();
      
      setImportProgress('Complete!');
      
      setTimeout(() => {
        setIsImporting(false);
        setImportProgress('');
        setShowSaveLoadModal(false);
        alert(`Project imported successfully!\n\nRestored:\n- ${data.metadata?.totalBoards || 0} boards\n- ${data.metadata?.totalTags || 0} tags\n- ${data.metadata?.totalItems || 0} items\n- ${data.metadata?.totalTextFiles || 0} text files\n- ${data.metadata?.totalConnections || 0} connections`);
      }, 500);

    } catch (error) {
      console.error('Import failed:', error);
      setIsImporting(false);
      setImportProgress('');
      alert(`Import failed: ${error.message}\n\nPlease check your file and try again.`);
    }
  };

  const handleProjectFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 1) {
      // Single file import
      importProject(files[0]);
    } else if (files.length > 1) {
      // Multiple files from a directory
      importProjectDirectory(files);
    }
  };

  const handleDirectorySelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      importProjectDirectory(files);
    }
  };

  const handleFavoriteDirectorySelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      importProjectDirectory(files);
    }
  };

  // Import from multiple files in a directory
  const importProjectDirectory = async (files) => {
    setIsImporting(true);
    setImportProgress('Processing directory...');
    
    try {
      let projectData = null;
      const fileMap = {};
      
      // Process all files and create a file map
      for (const file of files) {
        fileMap[file.name] = file;
      }
      
      setImportProgress('Reading project data...');
      
      // Look for the main project file
      const mainProjectFile = fileMap['project-data.json'] || fileMap['ghostly-project.json'];
      if (mainProjectFile) {
        const text = await mainProjectFile.text();
        projectData = JSON.parse(text);
      } else {
        throw new Error('No main project file found. Looking for project-data.json or ghostly-project.json');
      }
      
      setImportProgress('Validating project structure...');
      
      if (!projectData.boards || !projectData.version) {
        throw new Error('Invalid project file format');
      }
      
      // Import additional data files if they exist
      if (fileMap['boards-backup.json']) {
        setImportProgress('Loading boards backup...');
        const boardsText = await fileMap['boards-backup.json'].text();
        const boardsData = JSON.parse(boardsText);
        projectData.boards = { ...projectData.boards, ...boardsData };
      }
      
      if (fileMap['tags-backup.json']) {
        setImportProgress('Loading tags backup...');
        const tagsText = await fileMap['tags-backup.json'].text();
        const tagsData = JSON.parse(tagsText);
        projectData.tags = tagsData;
      }
      
      if (fileMap['settings-backup.json']) {
        setImportProgress('Loading settings backup...');
        const settingsText = await fileMap['settings-backup.json'].text();
        const settingsData = JSON.parse(settingsText);
        projectData.settings = { ...projectData.settings, ...settingsData };
      }
      
      if (fileMap['text-files.json']) {
        setImportProgress('Loading text files...');
        const textFilesText = await fileMap['text-files.json'].text();
        const textFilesData = JSON.parse(textFilesText);
        
        // Merge text file content back into boards
        Object.values(projectData.boards).forEach(board => {
          board.items.forEach(item => {
            if (item.type === 'textFile' && textFilesData[item.id]) {
              item.content = textFilesData[item.id].content;
              item.tags = textFilesData[item.id].tags || item.tags;
            }
          });
        });
      }
      
      // Import the project data
      await importProject({ text: () => Promise.resolve(JSON.stringify(projectData)) });
      
      // Set up auto-save for this directory
      setImportProgress('Setting up auto-save...');
      const directoryName = files[0].webkitRelativePath.split('/')[0];
      setFavoriteDirectoryPath(directoryName);
      
      // Save the project data for auto-loading
      const favoriteData = {
        directoryPath: directoryName,
        projectData,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem('ghostly-favoriteDirectoryData', JSON.stringify(favoriteData));
      
    } catch (error) {
      console.error('Directory import failed:', error);
      setIsImporting(false);
      setImportProgress('');
      alert(`Directory import failed: ${error.message}`);
    }
  };

  // Set favorite directory for auto-save and auto-load
  const setFavoriteDirectoryPath = (directoryName) => {
    setFavoriteDirectory(directoryName);
    localStorage.setItem('ghostly-favoriteDirectory', directoryName);
    setAutoSaveEnabled(true);
    localStorage.setItem('ghostly-autoSaveEnabled', 'true');
  };

  // Auto-load from favorite directory on startup
  useEffect(() => {
    if (favoriteDirectory && !hasAutoLoaded) {
      // Check if there's data in localStorage that matches the favorite directory
      const savedData = localStorage.getItem('ghostly-favoriteDirectoryData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.directoryPath === favoriteDirectory) {
            // Auto-load the project data
            importProject({ text: () => Promise.resolve(JSON.stringify(data.projectData)) });
            setHasAutoLoaded(true);
          }
        } catch (error) {
          console.warn('Failed to auto-load from favorite directory:', error);
        }
      }
    }
  }, [favoriteDirectory, hasAutoLoaded]);

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

  // Autosave node positions
  useEffect(() => {
    try {
      localStorage.setItem('ghostly-node-positions', JSON.stringify([...nodePositions]));
    } catch (error) {
      console.warn('Failed to save node positions to localStorage:', error);
    }
  }, [nodePositions]);

  useEffect(() => {
    try {
      localStorage.setItem('ghostly-nodeGraphSettings', JSON.stringify(nodeGraphSettings));
    } catch (error) {
      console.warn('Failed to save nodeGraphSettings to localStorage:', error);
    }
  }, [nodeGraphSettings]);

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
            nodeGraphSettings,
            showNodeGraph,
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
  }, [boards, tags, openEditors, zoom, pan, currentBoard, boardHierarchy, nodeGraphSettings, showNodeGraph, selectedTool, autoSaveEnabled, favoriteDirectory, history, historyIndex]);

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
          width: 180,
          height: 60,
          url: '',
          title: ''
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

  // Handle line drawing
  const handleLineDrawing = useCallback((e) => {
    if (selectedTool !== 'line') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    const canvasStartX = (startX - pan.x) / zoom;
    const canvasStartY = (startY - pan.y) / zoom;
    
    const handleMouseMove = (moveEvent) => {
      const endX = moveEvent.clientX - rect.left;
      const endY = moveEvent.clientY - rect.top;
      
      const canvasEndX = (endX - pan.x) / zoom;
      const canvasEndY = (endY - pan.y) / zoom;
    };
    
    const handleMouseUp = (upEvent) => {
      const endX = upEvent.clientX - rect.left;
      const endY = upEvent.clientY - rect.top;
      
      const canvasEndX = (endX - pan.x) / zoom;
      const canvasEndY = (endY - pan.y) / zoom;
      
      const newLine = {
        id: `line_${Date.now()}`,
        type: 'line',
        x: Math.min(canvasStartX, canvasEndX),
        y: Math.min(canvasStartY, canvasEndY),
        width: Math.abs(canvasEndX - canvasStartX),
        height: Math.abs(canvasEndY - canvasStartY),
        startX: canvasStartX,
        startY: canvasStartY,
        endX: canvasEndX,
        endY: canvasEndY,
        color: '#f4c2c2',
        strokeWidth: 2
      };
      
      setBoards(prev => ({
        ...prev,
        [currentBoard]: {
          ...prev[currentBoard],
          items: [...prev[currentBoard].items, newLine]
        }
      }));
      
      setSelectedTool('select');
      saveToHistory();
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [selectedTool, currentBoard, saveToHistory, zoom, pan]);

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
    if (item) {
      e.stopPropagation();
      
      if (e.button === 2) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasX = (x - pan.x) / zoom;
      const canvasY = (y - pan.y) / zoom;
      
      setDragOffset({ x: canvasX - item.x, y: canvasY - item.y });
      setDraggedItem(item);
      setIsDragging(true);
      setContextMenu(null);
    } else {
      if (e.button === 0 && selectedTool === 'select') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  }, [zoom, pan, selectedTool]);

  // Handle mouse move for dragging and panning
  const handleMouseMove = useCallback((e) => {
    if (isDragging && draggedItem) {
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
  }, [isDragging, draggedItem, dragOffset, currentBoard, isPanning, panStart, zoom, pan]);

  // Handle mouse up for dragging and panning
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedItem(null);
      saveToHistory();
    }
    if (isPanning) {
      setIsPanning(false);
    }
  }, [isDragging, isPanning, saveToHistory]);

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
    setContextMenu(null);
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

  // Tool components
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'board', icon: Square, label: 'Board' },
    { id: 'textfile', icon: FilePlus, label: 'New Text File' },
    { id: 'textfile-import', icon: Upload, label: 'Import Text File' },
    { id: 'image', icon: Image, label: 'Add Image' },
    { id: 'audio', icon: Music, label: 'Add Audio' },
    { id: 'note', icon: StickyNote, label: 'Note' },
    { id: 'line', icon: Minus, label: 'Line' },
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

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const currentBoardData = boards[currentBoard];

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#1a1a1a] border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Ghost Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 text-[#f4c2c2]">
              <Ghost size={24} />
            </div>
          </div>
          
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
          {/* Save/Load Project */}
          <button
            onClick={() => setShowSaveLoadModal(true)}
            className={`p-2 transition-colors relative ${
              autoSaveEnabled && favoriteDirectory
                ? 'text-green-400 hover:text-green-300'
                : 'text-gray-400 hover:text-white'
            }`}
            title={
              autoSaveEnabled && favoriteDirectory
                ? `Auto-sync enabled: ${favoriteDirectory}`
                : 'Project Manager'
            }
          >
            <FolderOpen size={16} />
            {autoSaveEnabled && favoriteDirectory && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
          
          {/* Node Graph Toggle */}
          <button
            onClick={() => setShowNodeGraph(!showNodeGraph)}
            className={`p-2 rounded transition-colors ${
              showNodeGraph
                ? 'bg-[#f4c2c2] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Node Graph"
          >
            <GitBranch size={16} />
          </button>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 bg-[#2d2d2d] rounded-lg px-3 py-1">
            <button 
              onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn size={14} />
            </button>
          </div>
          
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={undo}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={redo}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-12">
        {/* Left Toolbar - Full Height */}
        <div className="w-16 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-4 space-y-3">
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
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                selectedTool === id
                  ? 'bg-[#f4c2c2] text-black'
                  : 'bg-[#2d2d2d] text-[#f4c2c2] hover:bg-[#f4c2c2] hover:text-black'
              }`}
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-black"
            style={{
              cursor: selectedTool === 'select' && !isDragging ? (isPanning ? 'grabbing' : 'grab') 
                     : selectedTool === 'line' ? 'crosshair' 
                     : selectedTool !== 'select' ? 'crosshair' 
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
                      <div className="w-full h-full rounded-lg shadow-xl cursor-pointer overflow-hidden hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-[#f4c2c2]">
                        <img
                          src={item.src}
                          alt="Uploaded"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {item.type === 'line' && (
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: 0,
                          top: 0,
                          width: item.width || 1,
                          height: item.height || 1
                        }}
                        width={item.width || 1}
                        height={item.height || 1}
                      >
                        <line
                          x1={item.startX - item.x}
                          y1={item.startY - item.y}
                          x2={item.endX - item.x}
                          y2={item.endY - item.y}
                          stroke={item.color}
                          strokeWidth={item.strokeWidth}
                          strokeDasharray="5,5"
                        />
                      </svg>
                    )}

                    {item.type === 'link' && (
                      <div 
                        className="bg-blue-50 rounded-lg shadow-xl border border-blue-200 p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                        style={{
                          minWidth: '180px',
                          minHeight: '60px',
                          width: Math.max(180, Math.min(400, ((item.title || 'Untitled Link').length * 8) + 60)),
                          height: 'auto'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.url && !editingItem) {
                            window.open(item.url, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-start space-x-2">
                          <Link2 size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            {editingItem?.id === item.id ? (
                              <>
                                <input
                                  type="text"
                                  defaultValue={item.title || ''}
                                  onBlur={(e) => {
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id ? { ...i, title: e.target.value } : i
                                        )
                                      }
                                    }));
                                    setEditingItem(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setBoards(prev => ({
                                        ...prev,
                                        [currentBoard]: {
                                          ...prev[currentBoard],
                                          items: prev[currentBoard].items.map(i =>
                                            i.id === item.id ? { ...i, title: e.target.value } : i
                                          )
                                        }
                                      }));
                                      setEditingItem(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="w-full text-gray-800 font-medium text-sm bg-transparent border-b border-gray-400 outline-none pr-2"
                                  placeholder="Link title"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                  type="text"
                                  defaultValue={item.url || ''}
                                  onBlur={(e) => {
                                    setBoards(prev => ({
                                      ...prev,
                                      [currentBoard]: {
                                        ...prev[currentBoard],
                                        items: prev[currentBoard].items.map(i =>
                                          i.id === item.id ? { ...i, url: e.target.value } : i
                                        )
                                      }
                                    }));
                                    setEditingItem(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setBoards(prev => ({
                                        ...prev,
                                        [currentBoard]: {
                                          ...prev[currentBoard],
                                          items: prev[currentBoard].items.map(i =>
                                            i.id === item.id ? { ...i, url: e.target.value } : i
                                          )
                                        }
                                      }));
                                      setEditingItem(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingItem(null);
                                    }
                                  }}
                                  className="w-full text-blue-600 text-xs bg-transparent border-b border-blue-300 outline-none"
                                  placeholder="https://example.com"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </>
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
                      <div className="w-full h-full bg-white rounded-lg shadow-xl border border-gray-300 cursor-pointer">
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

      {/* Node Graph */}
      {showNodeGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg w-4/5 h-4/5 flex flex-col">
            {/* Node Graph Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <GitBranch size={20} className="text-[#f4c2c2]" />
                <h2 className="text-white text-lg font-medium">Node Graph</h2>
              </div>
              <div className="flex items-center space-x-2">
                {/* Node Graph Controls */}
                <div className="flex items-center space-x-2 bg-[#2d2d2d] rounded-lg px-3 py-1">
                  <button 
                    onClick={() => setNodeGraphZoom(Math.max(nodeGraphZoom / 1.2, 0.1))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-sm font-mono">{Math.round(nodeGraphZoom * 100)}%</span>
                  <button 
                    onClick={() => setNodeGraphZoom(Math.min(nodeGraphZoom * 1.2, 5))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setShowNodeGraphSettings(!showNodeGraphSettings)}
                  className={`p-2 rounded transition-colors ${
                    showNodeGraphSettings ? 'bg-[#f4c2c2] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={() => setShowNodeGraph(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Node Graph Content */}
            <div className="flex-1 p-6 overflow-hidden relative">
              <div 
                ref={nodeGraphRef}
                className="w-full h-full bg-[#0d1117] rounded-lg border border-gray-800 relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  setIsNodeGraphPanning(true);
                  setNodeGraphPanStart({
                    x: e.clientX - nodeGraphPan.x,
                    y: e.clientY - nodeGraphPan.y
                  });
                }}
                onMouseMove={(e) => {
                  if (draggedNode && !draggedNode.hasMoved) {
                    const moved = Math.abs(e.clientX - draggedNode.startX) > 5 || Math.abs(e.clientY - draggedNode.startY) > 5;
                    if (moved) {
                      setDraggedNode(prev => ({ ...prev, hasMoved: true }));
                      if (clickTimer) {
                        clearTimeout(clickTimer);
                        setClickTimer(null);
                      }
                      setIsDraggingNode(true);
                    }
                  }
                  
                  if (isDraggingNode && draggedNode) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left - nodeGraphPan.x) / nodeGraphZoom;
                    const y = (e.clientY - rect.top - nodeGraphPan.y) / nodeGraphZoom;
                    
                    setNodePositions(prev => {
                      const newMap = new Map(prev);
                      newMap.set(`${draggedNode.type}-${draggedNode.id}`, { x, y });
                      return newMap;
                    });
                  } else if (isNodeGraphPanning) {
                    setNodeGraphPan({
                      x: e.clientX - nodeGraphPanStart.x,
                      y: e.clientY - nodeGraphPanStart.y
                    });
                  }
                }}
                onMouseUp={() => {
                  if (clickTimer) {
                    clearTimeout(clickTimer);
                    setClickTimer(null);
                  }
                  setIsNodeGraphPanning(false);
                  setIsDraggingNode(false);
                  setDraggedNode(null);
                }}
                onMouseLeave={() => {
                  if (clickTimer) {
                    clearTimeout(clickTimer);
                    setClickTimer(null);
                  }
                  setIsNodeGraphPanning(false);
                  setIsDraggingNode(false);
                  setDraggedNode(null);
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? 0.9 : 1.1;
                  setNodeGraphZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
                }}
              >
                <div
                  style={{
                    transform: `translate(${nodeGraphPan.x}px, ${nodeGraphPan.y}px) scale(${nodeGraphZoom})`,
                    transformOrigin: '0 0'
                  }}
                >
                  <svg className="w-full h-full" style={{ minWidth: '1000px', minHeight: '600px' }}>
                    {(() => {
                      const textFiles = Object.values(boards).flatMap(board => 
                        board.items?.filter(item => item.type === 'textfile') || []
                      );
                      
                      // Create organic positions for tags and files
                      const tagPositions = new Map();
                      const filePositions = new Map();
                      const centerX = 500;
                      const centerY = 300;
                      
                      // Position tags using custom positions or organic clusters
                      tags.forEach((tag, index) => {
                        const customPos = nodePositions.get(`tag-${tag.id}`);
                        if (customPos) {
                          tagPositions.set(tag.id, { x: customPos.x, y: customPos.y, tag });
                        } else {
                          const baseAngle = (index / tags.length) * 2 * Math.PI;
                          // Add randomness for organic feel
                          const angleVariation = (Math.sin(index * 2.3) * 0.8) + (Math.cos(index * 1.7) * 0.6);
                          const angle = baseAngle + angleVariation;
                          
                          // Vary radius for more interesting layout
                          const baseRadius = nodeGraphSettings.tagDistance;
                          const radiusVariation = Math.sin(index * 3.1) * 40;
                          const radius = baseRadius + radiusVariation;
                          
                          const x = centerX + Math.cos(angle) * radius;
                          const y = centerY + Math.sin(angle) * radius;
                          tagPositions.set(tag.id, { x, y, tag });
                        }
                      });
                      
                      // Position files using custom positions or around their primary tags
                      textFiles.forEach((file, fileIndex) => {
                        const customPos = nodePositions.get(`file-${file.id}`);
                        if (customPos) {
                          filePositions.set(file.id, { x: customPos.x, y: customPos.y, file });
                        } else if (file.tags && file.tags.length > 0) {
                          // Get primary tag (first tag or most central one)
                          const primaryTagId = file.tags[0];
                          const primaryTagPos = tagPositions.get(primaryTagId);
                          
                          if (primaryTagPos) {
                            // Calculate angle from center to primary tag
                            const tagAngle = Math.atan2(primaryTagPos.y - centerY, primaryTagPos.x - centerX);
                            
                            // Distribute files around the tag in 360° 
                            const filesWithSameTag = textFiles.filter(f => f.tags?.includes(primaryTagId));
                            const fileIndexInTag = filesWithSameTag.findIndex(f => f.id === file.id);
                            const totalFilesForTag = filesWithSameTag.length;
                            
                            // Create a circle around the tag
                            const fileAngleOffset = (fileIndexInTag / Math.max(1, totalFilesForTag)) * 2 * Math.PI;
                            const finalAngle = tagAngle + fileAngleOffset + (Math.PI / 4); // offset from tag
                            
                            // Distance from tag center
                            const distanceFromTag = nodeGraphSettings.nodeDistance * 0.8;
                            const x = primaryTagPos.x + Math.cos(finalAngle) * distanceFromTag;
                            const y = primaryTagPos.y + Math.sin(finalAngle) * distanceFromTag;
                            
                            filePositions.set(file.id, { x, y, file });
                          }
                        } else {
                          // Files without tags go in inner circle
                          const untaggedFiles = textFiles.filter(f => !f.tags || f.tags.length === 0);
                          const untaggedIndex = untaggedFiles.findIndex(f => f.id === file.id);
                          const angle = (untaggedIndex / Math.max(1, untaggedFiles.length)) * 2 * Math.PI;
                          const radius = 60;
                          const x = centerX + Math.cos(angle) * radius;
                          const y = centerY + Math.sin(angle) * radius;
                          filePositions.set(file.id, { x, y, file });
                        }
                      });
                      
                      return (
                        <>
                          {/* Render connections first (behind nodes) */}
                          {Array.from(filePositions.values()).map(filePos => {
                            const connections = [];
                            
                            // File to tag connections
                            filePos.file.tags?.forEach(tagId => {
                              const tagPos = tagPositions.get(tagId);
                              if (tagPos) {
                                connections.push(
                                  <line
                                    key={`file-tag-${filePos.file.id}-${tagId}`}
                                    x1={filePos.x}
                                    y1={filePos.y}
                                    x2={tagPos.x}
                                    y2={tagPos.y}
                                    stroke="#f4c2c2"
                                    strokeWidth="2"
                                    strokeOpacity={nodeGraphSettings.connectionOpacity}
                                    style={{
                                      filter: 'drop-shadow(0 1px 3px rgba(244, 194, 194, 0.3))',
                                    }}
                                  />
                                );
                              }
                            });
                            
                            return connections;
                          })}
                          
                          {/* Remove file-to-file connections to reduce visual clutter */}
                          
                          {/* Render tag nodes */}
                          {Array.from(tagPositions.values()).map(({ x, y, tag }) => (
                            <g key={`tag-${tag.id}`}>
                              <rect
                                x={x - nodeGraphSettings.tagSize}
                                y={y - nodeGraphSettings.tagSize * 0.6}
                                width={nodeGraphSettings.tagSize * 2}
                                height={nodeGraphSettings.tagSize * 1.2}
                                rx="4"
                                fill={tag.color}
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="cursor-move hover:opacity-80 transition-opacity"
                                style={{
                                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const startTime = Date.now();
                                  const startPos = { x: e.clientX, y: e.clientY };
                                  
                                  setDraggedNode({ 
                                    type: 'tag', 
                                    id: tag.id, 
                                    startX: e.clientX, 
                                    startY: e.clientY,
                                    startTime,
                                    hasMoved: false
                                  });
                                  
                                  const timer = setTimeout(() => {
                                    setIsDraggingNode(true);
                                  }, 150); // Small delay to distinguish from click
                                  
                                  setClickTimer(timer);
                                }}
                              />
                              <text
                                x={x}
                                y={y + nodeGraphSettings.tagSize + 20}
                                textAnchor="middle"
                                className="text-white fill-current font-medium pointer-events-none"
                                style={{ 
                                  fontSize: `${nodeGraphSettings.textSize}px`,
                                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                }}
                              >
                                {tag.name.length > 8 ? tag.name.slice(0, 8) + '...' : tag.name}
                              </text>
                            </g>
                          ))}
                          
                          {/* Render text file nodes */}
                          {Array.from(filePositions.values()).map(({ x, y, file }) => {
                            // Find board containing this file
                            const containingBoard = Object.values(boards).find(board => 
                              board.items?.some(item => item.id === file.id)
                            );
                            
                            return (
                              <g key={file.id}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={nodeGraphSettings.nodeSize}
                                  fill="#f4c2c2"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                  className="cursor-move hover:fill-[#f5d2d2] transition-all duration-200"
                                  style={{
                                    filter: 'drop-shadow(0 2px 8px rgba(244, 194, 194, 0.3))',
                                    opacity: 0.9
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const startTime = Date.now();
                                    const startPos = { x: e.clientX, y: e.clientY };
                                    
                                    setDraggedNode({ 
                                      type: 'file', 
                                      id: file.id, 
                                      startX: e.clientX, 
                                      startY: e.clientY,
                                      startTime,
                                      hasMoved: false
                                    });
                                    
                                    const timer = setTimeout(() => {
                                      setIsDraggingNode(true);
                                    }, 150); // Small delay to distinguish from click
                                    
                                    setClickTimer(timer);
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to board containing this file
                                    if (containingBoard) {
                                      setShowNodeGraph(false);
                                      const boardId = Object.keys(boards).find(key => boards[key] === containingBoard);
                                      if (boardId) {
                                        setCurrentBoard(boardId);
                                      }
                                    }
                                  }}
                                />
                                <text
                                  x={x}
                                  y={y + nodeGraphSettings.nodeSize + 15}
                                  textAnchor="middle"
                                  className="text-white fill-current font-medium pointer-events-none"
                                  style={{ 
                                    fontSize: `${nodeGraphSettings.textSize}px`,
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                  }}
                                >
                                  {file.title.length > 10 ? file.title.slice(0, 10) + '...' : file.title}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
              
              {/* Node Graph Settings Panel */}
              {showNodeGraphSettings && (
                <div className="absolute top-4 right-4 bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 w-64 z-10">
                  <h3 className="text-white font-medium mb-3">Graph Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Node Distance</label>
                      <input
                        type="range"
                        min="80"
                        max="200"
                        step="5"
                        value={nodeGraphSettings.nodeDistance}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, nodeDistance: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{nodeGraphSettings.nodeDistance}px</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Text Size</label>
                      <input
                        type="range"
                        min="8"
                        max="16"
                        step="0.5"
                        value={nodeGraphSettings.textSize}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, textSize: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{nodeGraphSettings.textSize}px</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Connection Opacity</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={nodeGraphSettings.connectionOpacity}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, connectionOpacity: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{Math.round(nodeGraphSettings.connectionOpacity * 100)}%</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Node Size</label>
                      <input
                        type="range"
                        min="15"
                        max="30"
                        step="1"
                        value={nodeGraphSettings.nodeSize}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, nodeSize: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{nodeGraphSettings.nodeSize}px</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Tag Distance</label>
                      <input
                        type="range"
                        min="120"
                        max="300"
                        step="10"
                        value={nodeGraphSettings.tagDistance}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, tagDistance: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{nodeGraphSettings.tagDistance}px</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-2">Tag Size</label>
                      <input
                        type="range"
                        min="10"
                        max="25"
                        step="1"
                        value={nodeGraphSettings.tagSize}
                        onChange={(e) => setNodeGraphSettings(prev => ({ ...prev, tagSize: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-pink"
                      />
                      <span className="text-gray-400 text-xs">{nodeGraphSettings.tagSize}px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Color Picker Modal */}
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
            className="bg-[#1a1a1a] border border-[#f4c2c2] rounded-lg p-6 w-80"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">Pick Color</h3>
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  setColorPickerTag(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {[
                '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd',
                '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa',
                '#f1948a', '#85929e', '#d7dbdd', '#fadbd8', '#d5dbdb', '#eaeded'
              ].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-[#f4c2c2] transition-colors"
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
            
            <div className="mt-4">
              <label className="text-white text-sm">Custom Color:</label>
              <input
                type="color"
                defaultValue={colorPickerTag?.color || '#ff6b6b'}
                className="w-full h-8 mt-1 rounded border border-gray-600 bg-[#2d2d2d]"
                onChange={(e) => {
                  if (colorPickerTag) {
                    setTags(prev => prev.map(t => 
                      t.id === colorPickerTag.id ? { ...t, color: e.target.value } : t
                    ));
                  }
                  // Don't close immediately, let user continue adjusting
                }}
                onBlur={() => {
                  // Close when user finishes with the color picker
                  setTimeout(() => {
                    setShowColorPicker(false);
                    setColorPickerTag(null);
                  }, 100);
                }}
              />
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
            
            {/* Favorite Directory Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-white font-medium mb-2">Favorite Directory</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Set your favorite project directory for auto-load and auto-save
                </p>
                {favoriteDirectory ? (
                  <div className="bg-[#2d2d2d] rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Favorite Directory:</div>
                        <div className="text-white text-sm">{favoriteDirectory}</div>
                        <div className="text-xs text-gray-500">
                          Auto-sync: {autoSaveEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFavoriteDirectory('');
                          setAutoSaveEnabled(false);
                          localStorage.removeItem('ghostly-favoriteDirectory');
                          localStorage.removeItem('ghostly-autoSaveEnabled');
                          localStorage.removeItem('ghostly-favoriteDirectoryData');
                        }}
                        className="text-gray-400 hover:text-white p-1"
                        title="Clear favorite directory"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm mb-3">
                    No favorite directory set. Import a project folder to set it up.
                  </div>
                )}
                <button
                  onClick={() => favoriteDirectoryInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 bg-[#f4c2c2] text-black rounded-lg px-4 py-2 hover:bg-[#f5d2d2] transition-colors"
                >
                  <Heart size={16} />
                  <span>Set Favorite Directory</span>
                </button>
              </div>

              {/* Import Section */}
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-white font-medium mb-2">Import Project</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Load a project directory to restore all your data and set up auto-sync
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
                    onClick={() => projectDirectoryInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 bg-[#2d2d2d] text-[#f4c2c2] rounded-lg px-4 py-2 hover:bg-[#3d3d3d] transition-colors border border-[#f4c2c2]"
                  >
                    <FolderOpen size={16} />
                    <span>Import Project Directory</span>
                  </button>
                )}
              </div>

              {/* Export Section */}
              <div>
                <h4 className="text-white font-medium mb-2">Export Project</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Download current project as backup files
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
        ref={projectDirectoryInputRef}
        type="file"
        webkitdirectory="true"
        multiple
        onChange={handleDirectorySelect}
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
