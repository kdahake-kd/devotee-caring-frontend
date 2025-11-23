import { useState } from 'react';
import { authService } from '../services/authService';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.generateQrToken();
      setQrData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (qrData?.qr_url) {
      navigator.clipboard.writeText(qrData.qr_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    // Create a canvas element to download the QR code
    const svg = document.querySelector('.qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'devotee-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="qr-generator-container">
      <div className="qr-generator-header">
        <h3>📱 Quick Entry QR Code</h3>
        <p className="qr-description">
          Generate a QR code to quickly enter your daily activities. Scan this code with your phone to open a simple form for today's entry.
        </p>
      </div>

      {error && <div className="qr-error">{error}</div>}

      {!qrData ? (
        <div className="qr-generate-section">
          <button 
            onClick={generateQRCode} 
            className="btn-generate-qr"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      ) : (
        <div className="qr-display-section">
          <div className="qr-code-wrapper">
            <QRCodeSVG
              value={qrData.qr_url}
              size={256}
              level="H"
              includeMargin={true}
              className="qr-code-svg"
            />
          </div>

          <div className="qr-info">
            <div className="qr-url-section">
              <label>QR Code URL:</label>
              <div className="qr-url-input-group">
                <input
                  type="text"
                  value={qrData.qr_url}
                  readOnly
                  className="qr-url-input"
                />
                <button onClick={copyToClipboard} className="btn-copy">
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="qr-actions">
              <button onClick={downloadQRCode} className="btn-download">
                Download QR Code
              </button>
              <button onClick={generateQRCode} className="btn-regenerate">
                Regenerate QR Code
              </button>
            </div>

            <div className="qr-instructions">
              <h4>How to use:</h4>
              <ol>
                <li>Scan this QR code with your phone camera</li>
                <li>It will open a simple form for today's activities</li>
                <li>Fill in only today's relevant fields</li>
                <li>Submit to save your daily entry</li>
                <li>You can scan again anytime to edit today's entry</li>
              </ol>
              <p className="qr-note">
                <strong>Note:</strong> This QR code is unique to your account. Keep it secure and regenerate if needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;

