"use client"
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { FaUndo, FaRedo, FaSprayCan, FaCircle, FaPaintBrush } from 'react-icons/fa';
import ColorPicker from '../color_picker/ColorPicker';

const SignatureCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [undoHistory, setUndoHistory] = useState<{ dataURL: string }[]>([]);
  const [redoHistory, setRedoHistory] = useState<{ dataURL: string }[]>([]);
  const [brushType, setBrushType] = useState<string>('brush');

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth * 0.92;
      canvas.height = window.innerHeight * 0.7;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior of touch events
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    if (!ctx) return;
    if ('touches' in e) {
      const touch = e.touches[0];
      ctx.beginPath();
      ctx.moveTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
    } else {
      ctx.beginPath();
      ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();
    setUndoHistory(prevHistory => [...prevHistory, { dataURL }]);
    setRedoHistory([]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior of touch events
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if ('touches' in e) {
      const touch = e.touches[0];
      if (brushType === 'spray') {
        spray(ctx, touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
      } else if (brushType === 'dotted') {
        dotted(ctx, touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
      } else {
        ctx.lineTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
        ctx.stroke();
      }
    } else {
      if (brushType === 'spray') {
        spray(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      } else if (brushType === 'dotted') {
        dotted(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      } else {
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
      }
    }
  };

  const spray = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const density = 50; // Change this to adjust the density of spray
    ctx.fillStyle = strokeColor;
    for (let i = 0; i < density; i++) {
      const offsetX = Math.random() * 20 - 10;
      const offsetY = Math.random() * 20 - 10;
      ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
  };

  const dotted = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.closePath();
  };

  const undo = () => {
    if (undoHistory.length === 0) return;
    const lastDrawing = undoHistory.pop();
    if (!lastDrawing) return;
    setRedoHistory(prevHistory => [...prevHistory, lastDrawing]);
    redrawCanvas();
    toast.success('Undo successful');
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const nextDrawing = redoHistory.pop();
    if (!nextDrawing) return;
    setUndoHistory(prevHistory => [...prevHistory, nextDrawing]);
    redrawCanvas();
    toast.success('Redo successful');
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = undoHistory[undoHistory.length - 1].dataURL;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared successfully!');
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'signature.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Signature downloaded successfully!');
    } else {
      toast.error('Please draw something first!');
    }
  };

  const handleColorChange = (color: string) => {
    setStrokeColor(color);
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(parseInt(e.target.value));
  };

  const handleBackgroundColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  };

  const handleBrushTypeChange = (type: string) => {
    setBrushType(type);
  };

  return (
    <div className='flex justify-center pt-10 min-h-screen'>
      <div className='flex flex-col items-center'>
        <div className=''>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchMove={draw}
            style={{ backgroundColor }}
            className='shadow-lg'
          />
        </div>
        <div className='flex flex-col gap-4 mt-5'>
          <div className='flex justify-between my-2'>
            <ColorPicker
              color={strokeColor}
              onChange={handleColorChange}
            />
            <input
              type='range'
              min='1'
              max='80'
              value={strokeWidth}
              onChange={handleWidthChange}
            />
            <button onClick={() => handleBrushTypeChange('brush')} className={`bg-black py-[6px] px-[14px] font-bold text-white rounded-full ${brushType === 'brush' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaPaintBrush />
            </button>
            <button onClick={() => handleBrushTypeChange('spray')} className={`bg-black py-[6px] px-[14px] font-bold text-white rounded-full ${brushType === 'spray' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaSprayCan />
            </button>
            <button onClick={() => handleBrushTypeChange('dotted')} className={`bg-black py-[6px] px-[14px] font-bold text-white rounded-full ${brushType === 'dotted' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaCircle />
            </button>

            <button onClick={undo} className='bg-black py-[6px] px-[14px] font-bold text-white rounded-full hover:bg-[#1a1818]'>
              <FaUndo />
            </button>
            <button onClick={redo} className='bg-black py-[6px] px-[14px] font-bold text-white rounded-full hover:bg-[#1a1818]'>
              <FaRedo />
            </button>
          </div>
          <div className='flex justify-between'>
            {/* <button onClick={() => handleBrushTypeChange('brush')} className={`bg-black py-[6px] px-[14px] font-bold text-white  ${brushType === 'brush' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Brush
            </button>
            <button onClick={() => handleBrushTypeChange('spray')} className={`bg-black py-[6px] px-[14px] font-bold text-white  ${brushType === 'spray' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Spray
            </button>
            <button onClick={() => handleBrushTypeChange('dotted')} className={`bg-black py-[6px] px-[14px] font-bold text-white  ${brushType === 'dotted' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              Dotted
            </button> */}
          </div>
          <div className='flex gap-32'>
            <button onClick={clearCanvas} className='bg-[#f14343] py-2 px-4 font-semibold text-white hover:bg-[#ee5f5f] shadow-md'>Clear Canvas</button>
            <button onClick={downloadSignature} className='bg-[#475cfa] py-2 px-4 font-semibold text-white hover:bg-[#5a9cdf] shadow-md'>Download Canvas</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;
