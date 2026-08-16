import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeCanvas: React.FC<QrCodeCanvasProps> = ({
  value,
  size = 280,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#003399', // Nordic IKEA Blue
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className={`inline-flex items-center justify-center bg-white p-3 border border-[#DFDFDF] rounded-[4px] shadow-sm ${className}`}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
