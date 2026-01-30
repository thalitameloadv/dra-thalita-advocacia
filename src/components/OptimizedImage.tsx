import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

interface ImageState {
    loaded: boolean;
    error: boolean;
    currentSrc: string;
    aspectRatio: number;
    naturalWidth: number;
    naturalHeight: number;
}

const OptimizedImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1920px) 33vw',
    quality = 85,
    format = 'webp',
    placeholder = 'blur',
    onLoad,
    onError,
    ...props
}: OptimizedImageProps) => {
    const [imageState, setImageState] = useState<ImageState>({
        loaded: false,
        error: false,
        currentSrc: '',
        aspectRatio: 16 / 9,
        naturalWidth: 0,
        naturalHeight: 0
    });

    const imgRef = useRef<HTMLImageElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);

    // Generate optimized image URL
    const generateOptimizedUrl = (originalSrc: string, imageWidth: number, imageHeight: number) => {
        // Se já for uma URL otimizada, retorna ela
        if (originalSrc.includes('?')) {
            return originalSrc;
        }

        // Para imagens locais, retorna como está
        if (originalSrc.startsWith('/') || originalSrc.startsWith('data:')) {
            return originalSrc;
        }

        // Para imagens externas, gera URL otimizada
        const imageExtension = originalSrc.split('.').pop()?.toLowerCase();
        const isExternal = originalSrc.startsWith('http');
        
        if (!isExternal) {
            return originalSrc;
        }

        // Simulação de URL otimizada (em produção, usaria um serviço de otimização)
        const optimizedWidth = Math.min(imageWidth, 1920);
        const optimizedHeight = Math.round(imageHeight * (optimizedWidth / imageWidth));
        
        // Aqui você poderia integrar com serviços como:
        // - Cloudinary
        // - Imgix
        // - Vercel Image Optimization
        // - Next.js Image Optimization
        
        return `${originalSrc}?w=${optimizedWidth}&h=${optimizedHeight}&q=${quality}&format=${format}&fit=crop`;
    };

    useEffect(() => {
        const img = imgRef.current;
        const placeholder = placeholderRef.current;

        if (!img) return;

        // Set initial placeholder
        if (placeholder) {
            placeholder.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='${width || 800}' height='${height || 450}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E)`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.backgroundPosition = 'center';
            placeholder.style.filter = 'blur(20px)';
        }

        // Set initial image
        const optimizedUrl = generateOptimizedUrl(src, width || 800, height || 450);
        img.src = optimizedUrl;
        setImageState(prev => ({ ...prev, currentSrc: optimizedUrl }));

        // Handle load
        const handleLoad = () => {
            setImageState(prev => ({ ...prev, loaded: true }));
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            onLoad?.();
        };

        // Handle error
        const handleError = () => {
            setImageState(prev => ({ ...prev, error: true }));
            if (placeholder) {
                placeholder.style.display = 'block';
            }
            onError?.();
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);

        return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
        };
    }, [src, width, height, placeholder, onLoad, onError]);

    // Calculate aspect ratio when image loads
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.naturalWidth && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setImageState(prev => ({
                ...prev,
                aspectRatio,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            }));
        }
    }, [imageState.loaded]);

    const imageClasses = `
        transition-all duration-300 ease-in-out
        ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
        ${imageState.error ? 'bg-slate-200' : ''}
        ${className}
    `;

    return (
        <div className="relative overflow-hidden">
            {/* Placeholder */}
            {placeholder && (
                <div
                    ref={placeholderRef}
                    className={`absolute inset-0 ${imageState.loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='${width || 800}' height='${height || 450}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(20px)',
                    }}
                />
            )}

            {/* Main Image */}
            <img
                ref={imgRef}
                src={imageState.currentSrc}
                alt={alt}
                className={imageClasses}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                sizes={sizes}
                style={{
                    objectFit: 'cover',
                    aspectRatio: imageState.aspectRatio,
                }}
                {...props}
            />

            {/* Loading indicator */}
                {!imageState.loaded && !imageState.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                    </div>
                )}

                {/* Error indicator */}
                {imageState.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50/50">
                        <div className="text-center text-red-600 p-4">
                            <div className="text-lg font-semibold mb-2">Erro ao carregar imagem</div>
                            <div className="text-sm">Tente novamente mais tarde</div>
                        </div>
                    </div>
                )}

                {/* Image info overlay */}
                {imageState.loaded && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="text-xs">
                            {imageState.naturalWidth} × {imageState.naturalHeight}
                        </Badge>
                    </div>
                )}
            </div>
    );
};

export default OptimizedImage;
