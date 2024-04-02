"use client"
import React, { useState, useRef, MouseEvent, ChangeEvent, useEffect } from 'react';
import toast, { useToaster } from 'react-hot-toast';
import ColorPicker from '../color_picker/ColorPicker';

const SignatureCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokeColor, setStrokeColor] = useState<string>('#000000'); // Default black color
  const [strokeWidth, setStrokeWidth] = useState<number>(4); // Default stroke width
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff'); // Default white background
  const [error, setError] = useState<string>(''); // Error message
  const toaster = useToaster(); // Using react-hot-toast

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth * 0.92; // Adjust canvas width
      canvas.height = window.innerHeight * 0.7; // Adjust canvas height
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Call once to set initial canvas size
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.strokeStyle = strokeColor; // Set stroke color
    ctx.lineWidth = strokeWidth; // Set stroke width
    setError(''); // Reset error message when starting drawing
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared successfully!'); // Toast message for clearing canvas
    setError(''); // Reset error message when clearing signature
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
      toast.success('Signature downloaded successfully!'); // Toast message for downloading signature
    } else {
      setError('Please sign first to download.');
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

  return (
    <div className='flex justify-center pt-10 min-h-screen'>
      <div className='flex flex-col items-center'>
        {error && <p className="text-red-500">{error}</p>}
        <div className=''>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseMove={draw}
            style={{  backgroundColor }}
            className='shadow-lg'
          />
        </div>
        <div className='flex flex-col gap-2 mt-3'>
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
              className='mb-2'
            />
          </div>
          <div className='flex gap-4'>
            <button onClick={clearCanvas} className='bg-[#f14b43] py-2 px-4 font-bold text-white rounded-md'>Clear Canvas</button>
            <button onClick={downloadSignature} className='bg-[#298829] py-2 px-4 font-bold text-white rounded-md'>Download Signature</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;
