import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, MoreHorizontal, Edit3, Image, FileText, Minus, Square, Ghost, Headphones, MousePointer, ALargeSmall, StickyNote, Link2, CheckSquare, Undo2, Redo2, ZoomIn, ZoomOut, ChevronRight, Copy, Trash2 } from 'lucide-react';

const MilanoteClone = () => {
  const [boards, setBoards] = useState({
    home: {
      id: 'home',
      name: 'Home',
      items: [],
      image: null,
      parent: null
    }
  });
  
  const [currentBoard, setCurrentBoard] = useState('home');
  const [selectedTool, setSelectedTool] = useState('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingItem, setEditingItem] = useState(null);
  const [boardHierarchy, setBoardHierarchy] = useState(['home']);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [pendingImagePosition, setPendingImagePosition] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const boardImageInputRef = useRef(null);
  const [selectedBoardForImage, setSelectedBoardForImage] = useState(null);

  // Save state to history for undo functionality
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(boards)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [boards, history, historyIndex]);

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
          height: 200,
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
          width: 220,
          height: 80,
          url: 'https://example.com',
          title: 'Example Link'
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
    if (selectedTool === 'line') {
      handleLineDrawing(e);
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createItem(x, y);
  }, [selectedTool, createItem, handleLineDrawing]);

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
      const img = new Image();
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
          src: event.target?.result
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
      img.src = event.target?.result;
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
      setBoards(prev => ({
        ...prev,
        [selectedBoardForImage.boardId]: {
          ...prev[selectedBoardForImage.boardId],
          image: event.target?.result
        },
        [currentBoard]: {
          ...prev[currentBoard],
          items: prev[currentBoard].items.map(item =>
            item.id === selectedBoardForImage.id
              ? { ...item, image: event.target?.result }
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
    setBoards(prev => ({
      ...prev,
      [currentBoard]: {
        ...prev[currentBoard],
        items: prev[currentBoard].items.map(i => {
          if (i.id === item.id) {
            const updatedItem = { ...i, [item.type === 'note' ? 'content' : 'title']: newValue };
            // Auto-resize note based on content
            if (item.type === 'note' && newValue) {
              const lines = newValue.split('\n').length;
              const minHeight = 60;
              const lineHeight = 20;
              const padding = 24;
              updatedItem.height = Math.max(minHeight, lines * lineHeight + padding);
            }
            return updatedItem;
          }
          return i;
        })
      }
    }));
    
    if (item.type === 'board') {
      setBoards(prev => ({
        ...prev,
        [item.boardId]: {
          ...prev[item.boardId],
          name: newValue
        }
      }));
    }
    
    setEditingItem(null);
    saveToHistory();
  }, [currentBoard, saveToHistory]);

  // Set board image
  const setBoardImage = useCallback((boardItem) => {
    setSelectedBoardForImage(boardItem);
    boardImageInputRef.current?.click();
  }, []);

  // Tool components
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'board', icon: ALargeSmall, label: 'Board' },
    { id: 'image', icon: Image, label: 'Add Image' },
    { id: 'note', icon: StickyNote, label: 'Note' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'link', icon: Link2, label: 'Link' },
    { id: 'todo', icon: CheckSquare, label: 'Todo List' }
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
          {/* Ghost Logo with Headphones */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 text-[#f4c2c2]">
              <Ghost size={24} />
            </div>
            <div className="w-6 h-6 text-[#f4c2c2]">
              <Headphones size={20} />
            </div>
            <span className="text-lg font-semibold text-[#f4c2c2]">Ghostly</span>
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
              onClick={() => setSelectedTool(id)}
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
                      <div className="w-full h-full bg-[#2d2d2d] rounded-xl hover:border-[#f4c2c2] hover:border-2 transition-colors shadow-2xl cursor-pointer overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ALargeSmall size={48} />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-white font-medium text-base truncate">{item.name}</h3>
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
                      <div className="w-full h-full bg-blue-50 rounded-lg shadow-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                        <div className="p-3 flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Link2 size={16} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-gray-800 font-medium text-sm">{item.title}</h4>
                            <p className="text-blue-600 text-xs truncate">{item.url}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'todo' && (
                      <div className="w-full h-full bg-white rounded-lg shadow-xl border border-gray-300 cursor-pointer">
                        <div className="p-4">
                          <h4 className="text-gray-800 font-medium text-base mb-3">{item.title}</h4>
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
                                <span className={`text-sm ${task.completed ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                                  {task.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
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
    </div>
  );
};

export default MilanoteClone;
