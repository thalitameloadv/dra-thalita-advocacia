import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    Save,
    Eye,
    Send,
    Image as ImageIcon,
    Tag,
    FileText,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { blogService } from '@/services/blogService';
import { BlogPost, BlogCategory } from '@/types/blog';
import { toast } from 'sonner';

const postSchema = z.object({
    title: z.string().min(10, 'Título deve ter no mínimo 10 caracteres'),
    slug: z.string().min(5, 'Slug deve ter no mínimo 5 caracteres'),
    excerpt: z.string().min(50, 'Resumo deve ter no mínimo 50 caracteres'),
    content: z.string().min(100, 'Conteúdo deve ter no mínimo 100 caracteres'),
    category: z.string().min(1, 'Selecione uma categoria'),
    tags: z.string(),
    featuredImage: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived'])
});

type PostFormData = z.infer<typeof postSchema>;

const BlogEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);
    const isEditing = !!id && id !== 'novo';

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            status: 'draft',
            tags: ''
        }
    });

    useEffect(() => {
        loadCategories();
        if (isEditing) {
            loadPost();
        }
    }, [id]);

    const loadCategories = async () => {
        try {
            const data = await blogService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Erro ao carregar categorias');
        }
    };

    const loadPost = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const post = await blogService.getPostById(id);

            if (!post) {
                toast.error('Artigo não encontrado');
                navigate('/admin/blog');
                return;
            }

            // Populate form
            setValue('title', post.title);
            setValue('slug', post.slug);
            setValue('excerpt', post.excerpt);
            setValue('content', post.content);
            setValue('category', post.category);
            setValue('tags', post.tags.join(', '));
            setValue('featuredImage', post.featuredImage);
            setValue('seoTitle', post.seoTitle);
            setValue('seoDescription', post.seoDescription);
            setValue('seoKeywords', post.seoKeywords?.join(', '));
            setValue('status', post.status);
        } catch (error) {
            console.error('Error loading post:', error);
            toast.error('Erro ao carregar artigo');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const onSubmit = async (data: PostFormData) => {
        try {
            setLoading(true);

            const postData = {
                ...data,
                tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                seoKeywords: data.seoKeywords?.split(',').map(kw => kw.trim()).filter(Boolean),
                readingTime: calculateReadingTime(data.content),
                author: 'Dra. Thalita Melo',
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (isEditing) {
                await blogService.updatePost(id!, postData);
                toast.success('Artigo atualizado com sucesso!');
            } else {
                await blogService.createPost(postData as any);
                toast.success('Artigo criado com sucesso!');
            }

            navigate('/admin/blog');
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Erro ao salvar artigo');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setValue('title', title);

        if (!isEditing) {
            setValue('slug', generateSlug(title));
        }
    };

    const watchedContent = watch('content');
    const watchedTitle = watch('title');
    const watchedExcerpt = watch('excerpt');

    return (
        <>
            <Helmet>
                <title>{isEditing ? 'Editar Artigo' : 'Novo Artigo'} - Blog Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/admin/blog">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Voltar
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreview(!preview)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {preview ? 'Editor' : 'Preview'}
                                </Button>
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={loading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Conteúdo do Artigo</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <Label htmlFor="title">Título *</Label>
                                            <Input
                                                id="title"
                                                {...register('title')}
                                                onChange={handleTitleChange}
                                                placeholder="Digite o título do artigo"
                                                className="text-lg"
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                                            )}
                                        </div>

                                        {/* Slug */}
                                        <div>
                                            <Label htmlFor="slug">Slug (URL) *</Label>
                                            <Input
                                                id="slug"
                                                {...register('slug')}
                                                placeholder="slug-do-artigo"
                                            />
                                            {errors.slug && (
                                                <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                URL: /blog/{watch('slug') || 'slug-do-artigo'}
                                            </p>
                                        </div>

                                        {/* Excerpt */}
                                        <div>
                                            <Label htmlFor="excerpt">Resumo *</Label>
                                            <Textarea
                                                id="excerpt"
                                                {...register('excerpt')}
                                                placeholder="Breve resumo do artigo (aparece nas listagens)"
                                                rows={3}
                                            />
                                            {errors.excerpt && (
                                                <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {watch('excerpt')?.length || 0} caracteres
                                            </p>
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <Label htmlFor="content">Conteúdo *</Label>
                                            <Textarea
                                                id="content"
                                                {...register('content')}
                                                placeholder="Escreva o conteúdo do artigo em HTML ou Markdown"
                                                rows={20}
                                                className="font-mono text-sm"
                                            />
                                            {errors.content && (
                                                <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {calculateReadingTime(watchedContent || '')} min de leitura
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SEO Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Configurações de SEO
                                        </CardTitle>
                                        <CardDescription>
                                            Otimize seu artigo para mecanismos de busca
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="seoTitle">Título SEO</Label>
                                            <Input
                                                id="seoTitle"
                                                {...register('seoTitle')}
                                                placeholder="Título otimizado para SEO (deixe vazio para usar o título principal)"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(watch('seoTitle') || watchedTitle)?.length || 0}/60 caracteres
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="seoDescription">Descrição SEO</Label>
                                            <Textarea
                                                id="seoDescription"
                                                {...register('seoDescription')}
                                                placeholder="Descrição otimizada para SEO (deixe vazio para usar o resumo)"
                                                rows={3}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(watch('seoDescription') || watchedExcerpt)?.length || 0}/160 caracteres
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="seoKeywords">Palavras-chave SEO</Label>
                                            <Input
                                                id="seoKeywords"
                                                {...register('seoKeywords')}
                                                placeholder="palavra1, palavra2, palavra3"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Separe as palavras-chave com vírgulas
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Publish Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Publicação</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={watch('status')}
                                                onValueChange={(value: any) => setValue('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Rascunho</SelectItem>
                                                    <SelectItem value="published">Publicado</SelectItem>
                                                    <SelectItem value="archived">Arquivado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="category">Categoria *</Label>
                                            <Select
                                                value={watch('category')}
                                                onValueChange={(value) => setValue('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.name}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="tags">Tags</Label>
                                            <Input
                                                id="tags"
                                                {...register('tags')}
                                                placeholder="tag1, tag2, tag3"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Separe as tags com vírgulas
                                            </p>
                                            {watch('tags') && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {watch('tags').split(',').map((tag, i) => (
                                                        tag.trim() && (
                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                #{tag.trim()}
                                                            </Badge>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Featured Image */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Imagem Destacada
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <Label htmlFor="featuredImage">URL da Imagem</Label>
                                            <Input
                                                id="featuredImage"
                                                {...register('featuredImage')}
                                                placeholder="https://exemplo.com/imagem.jpg"
                                            />
                                            {watch('featuredImage') && (
                                                <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
                                                    <img
                                                        src={watch('featuredImage')}
                                                        alt="Preview"
                                                        className="w-full h-auto"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagem+não+encontrada';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Estatísticas</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Palavras:</span>
                                            <span className="font-medium">
                                                {watchedContent?.split(/\s+/).length || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Caracteres:</span>
                                            <span className="font-medium">
                                                {watchedContent?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Tempo de leitura:</span>
                                            <span className="font-medium">
                                                {calculateReadingTime(watchedContent || '')} min
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default BlogEditor;
