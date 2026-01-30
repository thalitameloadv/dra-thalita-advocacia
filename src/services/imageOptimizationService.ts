// Serviço de otimização de imagens para o blog
export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ImageOptimizationOptions {
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    placeholder?: boolean;
    lazy?: boolean;
    sizes?: string;
}

export interface BlogImageSpecs {
    // Página do blog (lista de artigos)
    blogList: {
        thumbnail: ImageDimensions & { maxFileSizeKB: number };
        card: ImageDimensions & { maxFileSizeKB: number };
    };
    // Página do artigo individual
    articlePage: {
        hero: ImageDimensions & { maxFileSizeKB: number };
        featured: ImageDimensions & { maxFileSizeKB: number };
        inline: ImageDimensions & { maxFileSizeKB: number };
        thumbnail: ImageDimensions & { maxFileSizeKB: number };
    };
    // Open Graph e Redes Sociais
    social: {
        ogImage: ImageDimensions & { maxFileSizeKB: number };
        twitterCard: ImageDimensions & { maxFileSizeKB: number };
    };
}

export const BLOG_IMAGE_SPECS: BlogImageSpecs = {
    blogList: {
        thumbnail: { width: 400, height: 225, maxFileSizeKB: 50 }, // 16:9
        card: { width: 800, height: 450, maxFileSizeKB: 150 }, // 16:9
    },
    articlePage: {
        hero: { width: 1920, height: 1080, maxFileSizeKB: 500 }, // 16:9
        featured: { width: 1200, height: 675, maxFileSizeKB: 300 }, // 16:9
        inline: { width: 800, height: 600, maxFileSizeKB: 200 }, // 4:3
        thumbnail: { width: 300, height: 169, maxFileSizeKB: 30 }, // 16:9
    },
    social: {
        ogImage: { width: 1200, height: 630, maxFileSizeKB: 200 }, // 1.91:1
        twitterCard: { width: 1200, height: 600, maxFileSizeKB: 200 }, // 2:1
    }
};

export interface ImageMetadata {
    originalUrl: string;
    optimizedUrl: string;
    dimensions: ImageDimensions;
    fileSize: number;
    format: string;
    quality: number;
    alt: string;
    title?: string;
}

class ImageOptimizationService {
    private cache = new Map<string, ImageMetadata>();

    /**
     * Gera URL otimizada para imagem baseada nas especificações
     */
    generateOptimizedUrl(
        originalUrl: string,
        specs: ImageDimensions & { maxFileSizeKB: number },
        options: ImageOptimizationOptions = {}
    ): string {
        const {
            quality = 85,
            format = 'webp',
            placeholder = true,
            lazy = true
        } = options;

        // Se já for uma URL otimizada, retorna ela
        if (originalUrl.includes('?') || originalUrl.includes('optimized_')) {
            return originalUrl;
        }

        // Para imagens locais, retorna como está (em produção, implementar otimização)
        if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
            return originalUrl;
        }

        // Para imagens externas, gera URL otimizada
        const isExternal = originalUrl.startsWith('http');
        
        if (!isExternal) {
            return originalUrl;
        }

        // Simulação de URL otimizada
        // Em produção, integrar com serviços como:
        // - Cloudinary: https://cloudinary.com/documentation/image_optimization
        // - Imgix: https://docs.imgix.com/apis/rendering
        // - Vercel Image Optimization: https://vercel.com/docs/concepts/images-and-optimization
        
        const optimizedUrl = `${originalUrl}?w=${specs.width}&h=${specs.height}&q=${quality}&format=${format}&fit=crop&auto=format`;
        
        return optimizedUrl;
    }

    /**
     * Valida se a imagem atende aos requisitos
     */
    validateImage(
        url: string,
        specs: ImageDimensions & { maxFileSizeKB: number }
    ): Promise<{ valid: boolean; issues: string[] }> {
        return new Promise((resolve) => {
            const img = new Image();
            const issues: string[] = [];

            img.onload = () => {
                // Verifica dimensões
                if (img.naturalWidth < specs.width * 0.8) {
                    issues.push(`Imagem muito pequena: ${img.naturalWidth}px (mínimo: ${Math.round(specs.width * 0.8)}px)`);
                }

                if (img.naturalHeight < specs.height * 0.8) {
                    issues.push(`Altura muito pequena: ${img.naturalHeight}px (mínimo: ${Math.round(specs.height * 0.8)}px)`);
                }

                // Verifica proporção
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const targetRatio = specs.width / specs.height;
                const ratioDiff = Math.abs(aspectRatio - targetRatio);

                if (ratioDiff > 0.2) {
                    issues.push(`Proporção inadequada: ${aspectRatio.toFixed(2)} (ideal: ${targetRatio.toFixed(2)})`);
                }

                resolve({
                    valid: issues.length === 0,
                    issues
                });
            };

            img.onerror = () => {
                issues.push('Não foi possível carregar a imagem');
                resolve({
                    valid: false,
                    issues
                });
            };

            img.src = url;
        });
    }

    /**
     * Gera placeholder SVG para imagem
     */
    generatePlaceholder(
        width: number,
        height: number,
        text?: string
    ): string {
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                ${text ? `
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                          font-family="system-ui, sans-serif" font-size="14" fill="#9ca3af">
                        ${text}
                    </text>
                ` : ''}
            </svg>
        `;

        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    /**
     * Obtém metadados da imagem
     */
    async getImageMetadata(url: string): Promise<ImageMetadata | null> {
        if (this.cache.has(url)) {
            return this.cache.get(url)!;
        }

        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                const metadata: ImageMetadata = {
                    originalUrl: url,
                    optimizedUrl: url,
                    dimensions: {
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    },
                    fileSize: 0, // Em produção, obter tamanho real do arquivo
                    format: url.split('.').pop()?.toLowerCase() || 'unknown',
                    quality: 85,
                    alt: ''
                };

                this.cache.set(url, metadata);
                resolve(metadata);
            };

            img.onerror = () => {
                resolve(null);
            };

            img.src = url;
        });
    }

    /**
     * Gera srcset para imagens responsivas
     */
    generateSrcSet(
        baseUrl: string,
        breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536]
    ): string {
        return breakpoints
            .map(width => `${baseUrl}?w=${width}&q=85&format=webp ${width}w`)
            .join(', ');
    }

    /**
     * Sugere otimizações para imagem
     */
    suggestOptimizations(
        metadata: ImageMetadata,
        targetSpecs: ImageDimensions & { maxFileSizeKB: number }
    ): string[] {
        const suggestions: string[] = [];
        const { dimensions, fileSize, format } = metadata;

        // Verifica tamanho
        if (fileSize > targetSpecs.maxFileSizeKB * 1024) {
            suggestions.push(`Reduzir qualidade para atingir ${targetSpecs.maxFileSizeKB}KB`);
        }

        // Verifica formato
        if (format === 'png' && !format.includes('transparency')) {
            suggestions.push('Converter para JPEG para melhor compressão');
        }

        if (format === 'jpg' || format === 'png') {
            suggestions.push('Converter para WebP para melhor compressão');
        }

        // Verifica dimensões
        if (dimensions.width > targetSpecs.width) {
            suggestions.push(`Reduzir largura para ${targetSpecs.width}px`);
        }

        if (dimensions.height > targetSpecs.height) {
            suggestions.push(`Reduzir altura para ${targetSpecs.height}px`);
        }

        return suggestions;
    }

    /**
     * Gera atributos SEO para imagem
     */
    generateSEOAttributes(
        url: string,
        alt: string,
        title?: string,
        isDecorative = false
    ): {
        alt: string;
        title?: string;
        loading: 'lazy' | 'eager';
        decoding: 'async' | 'sync';
        importance: 'high' | 'low' | 'auto';
    } {
        return {
            alt: isDecorative ? '' : alt,
            title: title || alt,
            loading: 'lazy',
            decoding: 'async',
            importance: 'auto'
        };
    }
}

export const imageOptimizationService = new ImageOptimizationService();

// Funções utilitárias para uso nos componentes
export const getBlogListImage = (url: string, type: 'thumbnail' | 'card' = 'card') => {
    const specs = BLOG_IMAGE_SPECS.blogList[type];
    return imageOptimizationService.generateOptimizedUrl(url, specs);
};

export const getArticleImage = (url: string, type: 'hero' | 'featured' | 'inline' | 'thumbnail' = 'featured') => {
    const specs = BLOG_IMAGE_SPECS.articlePage[type];
    return imageOptimizationService.generateOptimizedUrl(url, specs);
};

export const getSocialImage = (url: string, type: 'ogImage' | 'twitterCard' = 'ogImage') => {
    const specs = BLOG_IMAGE_SPECS.social[type];
    return imageOptimizationService.generateOptimizedUrl(url, specs);
};

// Diretrizes de imagem para o blog
export const IMAGE_GUIDELINES = {
    blogList: {
        thumbnail: {
            dimensions: '400x225px',
            aspectRatio: '16:9',
            maxFileSize: '50KB',
            formats: ['WebP', 'JPEG'],
            description: 'Imagem pequena para lista de artigos'
        },
        card: {
            dimensions: '800x450px',
            aspectRatio: '16:9',
            maxFileSize: '150KB',
            formats: ['WebP', 'JPEG'],
            description: 'Imagem média para cards de artigos'
        }
    },
    articlePage: {
        hero: {
            dimensions: '1920x1080px',
            aspectRatio: '16:9',
            maxFileSize: '500KB',
            formats: ['WebP', 'JPEG'],
            description: 'Imagem principal do artigo (hero)'
        },
        featured: {
            dimensions: '1200x675px',
            aspectRatio: '16:9',
            maxFileSize: '300KB',
            formats: ['WebP', 'JPEG'],
            description: 'Imagem em destaque do artigo'
        },
        inline: {
            dimensions: '800x600px',
            aspectRatio: '4:3',
            maxFileSize: '200KB',
            formats: ['WebP', 'JPEG'],
            description: 'Imagens dentro do conteúdo'
        },
        thumbnail: {
            dimensions: '300x169px',
            aspectRatio: '16:9',
            maxFileSize: '30KB',
            formats: ['WebP', 'JPEG'],
            description: 'Miniatura para navegação'
        }
    },
    social: {
        ogImage: {
            dimensions: '1200x630px',
            aspectRatio: '1.91:1',
            maxFileSize: '200KB',
            formats: ['JPEG', 'PNG'],
            description: 'Open Graph para Facebook/LinkedIn'
        },
        twitterCard: {
            dimensions: '1200x600px',
            aspectRatio: '2:1',
            maxFileSize: '200KB',
            formats: ['JPEG', 'PNG'],
            description: 'Twitter Card'
        }
    }
};
