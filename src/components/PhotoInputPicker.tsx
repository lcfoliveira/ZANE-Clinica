import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  X, 
  Check, 
  RotateCcw, 
  SwitchCamera, 
  AlertCircle,
  Image as ImageIcon,
  User,
  Sparkles
} from 'lucide-react';

interface PhotoInputPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  placeholderName?: string;
}

// Helper to resize/compress images client-side into lightweight base64 JPEG
const processImageFile = (file: File, maxSize = 512): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with 85% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao processar a imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo.'));
    reader.readAsDataURL(file);
  });
};

export const PhotoInputPicker: React.FC<PhotoInputPickerProps> = ({
  value,
  onChange,
  label = 'Foto de Perfil',
  helperText = 'Adicione uma foto através de upload, câmera do dispositivo ou link web.',
  placeholderName = 'Profissional'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value.startsWith('http') ? value : '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync url input if value is a regular url
  useEffect(() => {
    if (value && value.startsWith('http')) {
      setUrlInput(value);
    }
  }, [value]);

  // Clean up camera on unmount or when modal closes
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleStartCamera = async (facing: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    setCapturedSnapshot(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      // Give React a tick to mount video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('Erro ao iniciar vídeo:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let msg = 'Não foi possível acessar a câmera do dispositivo.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permissão de acesso à câmera foi recusada pelo navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Nenhuma câmera foi encontrada conectada ao dispositivo.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = Math.min(width, 512);
    canvas.height = Math.min(height, 512);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (selfie) camera, mirror horizontally for natural feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const snapshotUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedSnapshot(snapshotUrl);
    stopCameraStream();
  };

  const handleConfirmSnapshot = () => {
    if (capturedSnapshot) {
      onChange(capturedSnapshot);
      setCapturedSnapshot(null);
    }
  };

  const handleCancelCamera = () => {
    stopCameraStream();
    setCapturedSnapshot(null);
    setCameraError(null);
  };

  const handleSwitchCameraFacing = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    handleStartCamera(nextFacing);
  };

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar a imagem.');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const dataUrl = await processImageFile(file);
        onChange(dataUrl);
      } catch (err: any) {
        alert(err.message || 'Erro ao carregar imagem arrastada.');
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClearPhoto = () => {
    onChange('');
    setUrlInput('');
    setCapturedSnapshot(null);
  };

  // Determine photo source description
  const isDataUrl = value && value.startsWith('data:image');
  const isHttpUrl = value && value.startsWith('http');
  const hasValue = Boolean(value);

  // Fallback initials
  const initials = placeholderName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-slate-800 text-xs">
            {label}
          </label>
          <p className="text-[11px] text-slate-500">
            {helperText}
          </p>
        </div>

        {hasValue && (
          <button
            type="button"
            onClick={handleClearPhoto}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Remover foto</span>
          </button>
        )}
      </div>

      {/* Main Container: Preview + Input Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Photo Avatar Preview */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shadow-xs flex items-center justify-center group">
            {hasValue ? (
              <img
                src={value}
                alt="Foto"
                className="w-full h-full object-cover"
                onError={() => {
                  // Fallback on invalid url
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-teal-50 text-teal-800 font-bold text-lg select-none">
                {initials || <User className="w-8 h-8 text-teal-600" />}
              </div>
            )}

            {hasValue && (
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="p-1.5 bg-white text-rose-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                  title="Excluir foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <span className="text-[10px] font-medium text-slate-500">
            {hasValue ? (
              isDataUrl ? 'Arquivo Local / Câmera' : isHttpUrl ? 'Link Web' : 'Foto Carregada'
            ) : (
              'Sem foto'
            )}
          </span>
        </div>

        {/* Input Methods Tabs */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Options Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                handleCancelCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>📁 Upar Arquivo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                if (!isCameraActive && !capturedSnapshot) {
                  handleStartCamera();
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
                activeTab === 'camera'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-teal-700" />
              <span>📷 Abrir Câmera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                handleCancelCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>🔗 URL da Web</span>
            </button>
          </div>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={nativeCameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {/* TAB 1: UPLOAD LOCAL FILE */}
          {activeTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-teal-600 bg-teal-50/80 scale-[0.99]'
                  : 'border-slate-300 hover:border-teal-700 bg-white/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-teal-800 mb-1">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-bold">Clique para escolher do computador ou celular</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ou arraste um arquivo de imagem aqui (JPG, PNG, WEBP). Otimizado automaticamente.
              </p>
            </div>
          )}

          {/* TAB 2: OPEN CAMERA */}
          {activeTab === 'camera' && (
            <div className="bg-slate-900 text-white rounded-xl p-3 space-y-3">
              {/* Snapshot confirmation state */}
              {capturedSnapshot ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-56">
                    <img
                      src={capturedSnapshot}
                      alt="Foto capturada"
                      className="max-h-56 w-auto object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" /> Foto Capturada!
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleStartCamera()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tirar Outra</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmSnapshot}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Usar Esta Foto</span>
                    </button>
                  </div>
                </div>
              ) : isCameraActive ? (
                /* Live Camera Stream */
                <div className="space-y-2.5">
                  <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center max-h-56">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`max-h-56 w-full object-cover rounded-lg ${
                        facingMode === 'user' ? 'scale-x-[-1]' : ''
                      }`}
                    />
                    
                    {/* Viewfinder Target Guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-32 h-40 border-2 border-dashed border-white/60 rounded-full" />
                    </div>

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>AO VIVO</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchCameraFacing}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                      title="Alternar câmera frontal / traseira"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleCancelCamera}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capturar Foto Agora</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Camera Inactive or Error State */
                <div className="p-3 text-center space-y-2.5">
                  {cameraError ? (
                    <div className="flex items-start gap-2 text-rose-300 text-xs text-left bg-rose-950/60 p-2.5 rounded-lg border border-rose-800">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-rose-200">{cameraError}</p>
                        <p className="text-[11px] mt-0.5 text-rose-300/80">
                          Se preferir, use o disparador nativo do seu dispositivo abaixo ou selecione um arquivo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">
                      Clique no botão abaixo para ligar a câmera do seu dispositivo em tempo real.
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartCamera()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Iniciar Câmera Web</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      <span>Abrir Câmera Nativa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENTER WEB URL */}
          {activeTab === 'url' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-3 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Insira o link direto de uma imagem hospedada na web.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
