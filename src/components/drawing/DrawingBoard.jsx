import React, { useRef, useState, useEffect } from 'react';

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setLastPos({ x, y });

    // Save initial state for undo
    const newHistory = drawingHistory.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setDrawingHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

    switch (currentTool) {
      case 'pen':
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = 1;
        break;
      case 'marker':
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = brushSize * 2;
        ctx.globalAlpha = 0.7;
        break;
      case 'highlight':
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = brushSize * 3;
        ctx.globalAlpha = 0.3;
        break;
      case 'eraser':
        ctx.lineWidth = brushSize * 2;
        break;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    setLastPos({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseOut = () => {
    setIsDrawing(false);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newHistoryStep = historyStep - 1;
      setHistoryStep(newHistoryStep);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = drawingHistory[newHistoryStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const redo = () => {
    if (historyStep < drawingHistory.length - 1) {
      const newHistoryStep = historyStep + 1;
      setHistoryStep(newHistoryStep);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = drawingHistory[newHistoryStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setDrawingHistory([]);
      setHistoryStep(-1);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Drawing Board</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-100 rounded">
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded border ${
                currentTool === 'pen' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => setCurrentTool('pen')}
              title="Pen"
            >
              ✏️
            </button>
            <button
              className={`p-2 rounded border ${
                currentTool === 'marker' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => setCurrentTool('marker')}
              title="Marker"
            >
              🖍️
            </button>
            <button
              className={`p-2 rounded border ${
                currentTool === 'highlight' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => setCurrentTool('highlight')}
              title="Highlighter"
            >
              🖍️
            </button>
            <button
              className={`p-2 rounded border ${
                currentTool === 'eraser' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white border-gray-300'
              }`}
              onClick={() => setCurrentTool('eraser')}
              title="Eraser"
            >
              🗑️
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm w-10">{brushSize}px</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
              onClick={undo}
            >
              Undo
            </button>
            <button 
              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
              onClick={redo}
            >
              Redo
            </button>
          </div>
          
          <button 
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 ml-auto"
            onClick={clearCanvas}
          >
            Clear
          </button>
        </div>
        
        <div className="border border-gray-300 rounded overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full bg-white cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseOut={handleMouseOut}
          />
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
