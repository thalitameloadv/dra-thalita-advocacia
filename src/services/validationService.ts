import { z } from 'zod';

// Validation schemas
export const articleSchema = z.object({
    title: z.string()
        .min(10, 'O título deve ter pelo menos 10 caracteres')
        .max(200, 'O título deve ter no máximo 200 caracteres')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}:;'"\/\\@#$%^&*+=|`~<>]+$/, 'O título contém caracteres inválidos'),
    
    slug: z.string()
        .min(3, 'O slug deve ter pelo menos 3 caracteres')
        .max(100, 'O slug deve ter no máximo 100 caracteres')
        .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hífens'),
    
    excerpt: z.string()
        .min(50, 'O resumo deve ter pelo menos 50 caracteres')
        .max(500, 'O resumo deve ter no máximo 500 caracteres'),
    
    content: z.string()
        .min(100, 'O conteúdo deve ter pelo menos 100 caracteres')
        .max(50000, 'O conteúdo deve ter no máximo 50.000 caracteres'),
    
    category: z.string()
        .min(1, 'Selecione uma categoria')
        .max(50, 'O nome da categoria deve ter no máximo 50 caracteres'),
    
    tags: z.array(z.string())
        .max(10, 'Máximo de 10 tags permitidas')
        .optional(),
    
    author: z.string()
        .min(2, 'O nome do autor deve ter pelo menos 2 caracteres')
        .max(100, 'O nome do autor deve ter no máximo 100 caracteres'),
    
    featuredImage: z.string()
        .url('URL da imagem em destaque inválida')
        .optional()
        .or(z.literal('')),
    
    seoTitle: z.string()
        .min(30, 'O título SEO deve ter pelo menos 30 caracteres')
        .max(60, 'O título SEO deve ter no máximo 60 caracteres')
        .optional(),
    
    seoDescription: z.string()
        .min(120, 'A descrição SEO deve ter pelo menos 120 caracteres')
        .max(160, 'A descrição SEO deve ter no máximo 160 caracteres')
        .optional(),
    
    seoKeywords: z.array(z.string())
        .max(15, 'Máximo de 15 palavras-chave permitidas')
        .optional(),
    
    status: z.enum(['draft', 'published', 'archived'], {
        errorMap: () => ({ message: 'Status inválido' })
    }),
    
    publishedAt: z.string()
        .datetime('Data de publicação inválida')
        .optional()
        .or(z.literal('')),
    
    readingTime: z.number()
        .min(1, 'O tempo de leitura deve ser pelo menos 1 minuto')
        .max(120, 'O tempo de leitura deve ser no máximo 120 minutos')
        .optional(),
    
    featured: z.boolean().optional(),
    
    commentsEnabled: z.boolean().optional(),
    
    sharingEnabled: z.boolean().optional()
});

export const newsletterSchema = z.object({
    subject: z.string()
        .min(10, 'O assunto deve ter pelo menos 10 caracteres')
        .max(100, 'O assunto deve ter no máximo 100 caracteres'),
    
    previewText: z.string()
        .max(200, 'O texto de preview deve ter no máximo 200 caracteres')
        .optional(),
    
    content: z.string()
        .min(50, 'O conteúdo deve ter pelo menos 50 caracteres')
        .max(100000, 'O conteúdo deve ter no máximo 100.000 caracteres'),
    
    template: z.enum(['default', 'welcome', 'promotion', 'newsletter'], {
        errorMap: () => ({ message: 'Template inválido' })
    }),
    
    scheduledFor: z.string()
        .datetime('Data de agendamento inválida')
        .optional()
        .or(z.literal('')),
    
    segments: z.array(z.string()).optional(),
    
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed'], {
        errorMap: () => ({ message: 'Status inválido' })
    })
});

export const subscriberSchema = z.object({
    email: z.string()
        .email('Email inválido')
        .max(255, 'O email deve ter no máximo 255 caracteres'),
    
    name: z.string()
        .min(2, 'O nome deve ter pelo menos 2 caracteres')
        .max(100, 'O nome deve ter no máximo 100 caracteres')
        .optional(),
    
    tags: z.array(z.string()).optional(),
    
    source: z.string()
        .max(50, 'A fonte deve ter no máximo 50 caracteres')
        .optional(),
    
    status: z.enum(['active', 'pending', 'unsubscribed'], {
        errorMap: () => ({ message: 'Status inválido' })
    })
});

// Validation functions
export const validateArticle = (data: any) => {
    try {
        const result = articleSchema.parse(data);
        return { success: true, data: result, errors: [] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }));
            return { success: false, data: null, errors };
        }
        return { 
            success: false, 
            data: null, 
            errors: [{ field: 'general', message: 'Erro de validação desconhecido', code: 'unknown' }] 
        };
    }
};

export const validateNewsletter = (data: any) => {
    try {
        const result = newsletterSchema.parse(data);
        return { success: true, data: result, errors: [] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }));
            return { success: false, data: null, errors };
        }
        return { 
            success: false, 
            data: null, 
            errors: [{ field: 'general', message: 'Erro de validação desconhecido', code: 'unknown' }] 
        };
    }
};

export const validateSubscriber = (data: any) => {
    try {
        const result = subscriberSchema.parse(data);
        return { success: true, data: result, errors: [] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }));
            return { success: false, data: null, errors };
        }
        return { 
            success: false, 
            data: null, 
            errors: [{ field: 'general', message: 'Erro de validação desconhecido', code: 'unknown' }] 
        };
    }
};

// Utility functions
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

export const extractKeywords = (content: string): string[] => {
    // Simple keyword extraction - can be enhanced with NLP
    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    return Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
};

export const validateImage = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const extension = urlObj.pathname.toLowerCase().slice(urlObj.pathname.lastIndexOf('.'));
        return imageExtensions.includes(extension);
    } catch {
        return false;
    }
};

export const sanitizeHtml = (html: string): string => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// SEO validation functions
export const validateSEOTitle = (title: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (title.length < 30) issues.push('Título muito curto (mínimo 30 caracteres)');
    if (title.length > 60) issues.push('Título muito longo (máximo 60 caracteres)');
    if (!/[A-Z]/.test(title)) issues.push('Título deve conter letras maiúsculas');
    if (!/\d/.test(title)) issues.push('Considere adicionar números ao título');
    
    return {
        valid: issues.length === 0,
        issues
    };
};

export const validateSEODescription = (description: string): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (description.length < 120) issues.push('Descrição muito curta (mínimo 120 caracteres)');
    if (description.length > 160) issues.push('Descrição muito longa (máximo 160 caracteres)');
    if (!/[A-Z]/.test(description)) issues.push('Descrição deve conter letras maiúsculas');
    
    return {
        valid: issues.length === 0,
        issues
    };
};

export const validateContentSEO = (content: string): { valid: boolean; issues: string[]; score: number } => {
    const issues: string[] = [];
    let score = 0;
    
    // Content length
    if (content.length < 300) {
        issues.push('Conteúdo muito curto (mínimo 300 caracteres)');
    } else {
        score += 20;
    }
    
    // Headings
    const headingCount = (content.match(/<h[1-6]/gi) || []).length;
    if (headingCount === 0) {
        issues.push('Adicione headings para melhor estrutura');
    } else {
        score += 15;
    }
    
    // Images
    const imageCount = (content.match(/<img/gi) || []).length;
    if (imageCount === 0) {
        issues.push('Adicione imagens para melhor engajamento');
    } else {
        score += 15;
    }
    
    // Links
    const linkCount = (content.match(/<a/gi) || []).length;
    if (linkCount === 0) {
        issues.push('Adicione links para outros conteúdos');
    } else {
        score += 10;
    }
    
    // Lists
    const listCount = (content.match(/<[ou]l/gi) || []).length;
    if (listCount === 0) {
        issues.push('Considere usar listas para melhor legibilidade');
    } else {
        score += 10;
    }
    
    // Word count
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 1000) {
        score += 20;
    } else if (wordCount >= 500) {
        score += 10;
    }
    
    // Readability
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    if (avgWordsPerSentence <= 20) {
        score += 10;
    }
    
    return {
        valid: issues.length === 0,
        issues,
        score: Math.min(100, score)
    };
};

// Error handling utilities
export class ValidationError extends Error {
    public field: string;
    public code: string;
    
    constructor(message: string, field: string, code: string) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
    }
}

export const handleValidationError = (error: any): { message: string; field?: string } => {
    if (error instanceof ValidationError) {
        return {
            message: error.message,
            field: error.field
        };
    }
    
    if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return {
            message: firstError.message,
            field: firstError.path.join('.')
        };
    }
    
    return {
        message: error?.message || 'Erro de validação desconhecido'
    };
};

// Async validation functions
export const validateUniqueSlug = async (slug: string, excludeId?: string): Promise<boolean> => {
    // This would check against the database
    // Implementation depends on your data layer
    return true; // Placeholder
};

export const validateUniqueEmail = async (email: string, excludeId?: string): Promise<boolean> => {
    // This would check against the database
    // Implementation depends on your data layer
    return true; // Placeholder
};

export const validateImageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
        return false;
    }
};
