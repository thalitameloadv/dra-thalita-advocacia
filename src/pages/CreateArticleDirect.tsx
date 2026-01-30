import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Send, Eye, Bold, Italic, Link, List, Quote, Code, Plus, X, BarChart3, Lightbulb, CheckCircle, AlertCircle, Edit3, ImageIcon, Image as ImageIcon2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ImageUpload from '@/components/ImageUpload';
import ImageEditor from '@/components/ImageEditor';
import { blogService } from '@/services/blogService';
import { toast } from 'sonner';

const articleSchema = z.object({
    title: z.string().min(5).max(200),
    slug: z.string().min(3).max(100),
    excerpt: z.string().min(10).max(500),
    content: z.string().min(50),
    category: z.string().min(1),
    tags: z.array(z.string()).min(1),
    featured: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']),
    featuredImage: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    author: z.string().min(2),
    allowComments: z.boolean().default(true),
    coverImage: z.string().optional(), // Imagem de capa da listagem
    postImage: z.string().optional() // Imagem da página do post
});

type ArticleFormData = z.infer<typeof articleSchema>;

const CreateArticleDirect = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const [isEditing, setIsEditing] = useState(!!id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [seoScore, setSeoScore] = useState(0);
    const [activeTab, setActiveTab] = useState('content');
    const [showImageEditor, setShowImageEditor] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const { register, watch, setValue, getValues, formState: { errors, isDirty } } = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: '', slug: '', excerpt: '', content: '', category: '', tags: [],
            featured: false, status: 'draft', metaTitle: '', metaDescription: '',
            author: 'Dra. Thalita Melo', allowComments: true, featuredImage: '',
            coverImage: '', postImage: ''
        }
    });

    const watchedValues = watch();
    const [newTag, setNewTag] = useState('');

    const categories = [
        { id: '1', name: 'Direito Civil', slug: 'direito-civil' },
        { id: '2', name: 'Direito Trabalhista', slug: 'direito-trabalhista' },
        { id: '3', name: 'Direito Empresarial', slug: 'direito-empresarial' },
        { id: '4', name: 'Direito Família', slug: 'direito-familia' },
        { id: '5', name: 'Direito Tributário', slug: 'direito-tributario' }
    ];

    const generateSlug = useCallback((title: string) => {
        return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }, []);

    const updateWordCount = useCallback((content: string) => {
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(words);
    }, []);

    const calculateSeoScore = useCallback((data: Partial<ArticleFormData>) => {
        let score = 0;
        if (data.title && data.title.length >= 30 && data.title.length <= 60) score += 30;
        if (data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160) score += 25;
        if (data.slug && data.slug.includes('-')) score += 15;
        if (data.content && data.content.length >= 300) score += 20;
        if (data.tags && data.tags.length >= 3) score += 10;
        setSeoScore(score);
        return score;
    }, []);

    const loadArticle = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const articles = await blogService.getPosts();
            const article = articles.find((a: any) => a.id === id);
            if (article) {
                Object.keys(article).forEach(key => {
                    if (key in article && key !== 'readingTime' && key !== 'publishedAt') {
                        setValue(key as keyof ArticleFormData, article[key as any]);
                    }
                });
                updateWordCount(article.content || '');
                calculateSeoScore(article);
            }
        } catch (error) {
            console.error('Error loading article:', error);
            toast.error('Erro ao carregar artigo');
        } finally {
            setLoading(false);
        }
    }, [id, setValue, updateWordCount, calculateSeoScore]);

    useEffect(() => { if (id) loadArticle(); }, [id, loadArticle]);

    useEffect(() => {
        const title = watchedValues.title || '';
        const slug = generateSlug(title);
        if (title && !watchedValues.slug) setValue('slug', slug);
        if (title && !watchedValues.metaTitle) setValue('metaTitle', title.length > 60 ? title.substring(0, 57) + '...' : title);
        calculateSeoScore(watchedValues);
    }, [watchedValues.title, watchedValues.slug, watchedValues.metaTitle, setValue, generateSlug, calculateSeoScore]);

    useEffect(() => { updateWordCount(watchedValues.content || ''); }, [watchedValues.content, updateWordCount]);

    const addTag = (tag: string) => {
        const currentTags = watchedValues.tags || [];
        if (tag && !currentTags.includes(tag)) {
            setValue('tags', [...currentTags, tag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = watchedValues.tags || [];
        setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
    };

    const saveDraft = async () => {
        try {
            setSaving(true);
            const data = getValues();
            const articleData = {
                ...data,
                readingTime: Math.ceil(wordCount / 200),
                publishedAt: null
            };
            
            if (id) {
                await blogService.updatePost(id, articleData);
                toast.success('Artigo atualizado com sucesso');
            } else {
                const newArticle = await blogService.createPost(articleData);
                navigate(`/admin/blog/editar/${newArticle.id}`, { replace: true });
                toast.success('Rascunho criado com sucesso');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error('Erro ao salvar rascunho');
        } finally {
            setSaving(false);
        }
    };

    const publishArticle = async () => {
        try {
            setPublishing(true);
            const data = getValues();
            const articleData = {
                ...data,
                status: 'published' as const,
                readingTime: Math.ceil(wordCount / 200),
                publishedAt: new Date().toISOString()
            };
            
            if (id) {
                await blogService.updatePost(id, articleData);
                toast.success('Artigo publicado com sucesso!');
            } else {
                const newArticle = await blogService.createPost(articleData);
                navigate(`/admin/blog/editar/${newArticle.id}`, { replace: true });
                toast.success('Artigo criado e publicado com sucesso!');
            }
        } catch (error) {
            console.error('Error publishing article:', error);
            toast.error('Erro ao publicar artigo');
        } finally {
            setPublishing(false);
        }
    };

    const formatText = (format: string) => {
        const textarea = contentRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = watchedValues.content?.substring(start, end) || '';
        let formattedText = '';
        
        switch (format) {
            case 'bold': formattedText = `**${selectedText}**`; break;
            case 'italic': formattedText = `*${selectedText}*`; break;
            case 'link': formattedText = `[${selectedText}](url)`; break;
            case 'list': formattedText = `\n- ${selectedText}`; break;
            case 'quote': formattedText = `\n> ${selectedText}`; break;
            case 'code': formattedText = `\`${selectedText}\``; break;
            case 'image': setShowImageEditor(true); return;
            default: return;
        }
        
        const newContent = watchedValues.content?.substring(0, start) + formattedText + watchedValues.content?.substring(end);
        setValue('content', newContent);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }, 0);
    };

    const handleImageInsert = (imageMarkdown: string) => {
        const textarea = contentRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const newContent = watchedValues.content?.substring(0, start) + imageMarkdown + watchedValues.content?.substring(start);
        setValue('content', newContent);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando artigo...</p>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gray-50">
                <Helmet>
                    <title>{isEditing ? 'Editar Artigo' : 'Novo Artigo'} | Admin | Dra. Thalita Melo</title>
                </Helmet>

                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blog')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                                <Badge variant={isEditing ? "secondary" : "default"}>
                                    {isEditing ? 'Editando' : 'Novo Artigo'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving || !isDirty}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                                </Button>
                                
                                <Button variant="default" size="sm" onClick={publishArticle} disabled={publishing} className="bg-blue-600 hover:bg-blue-700">
                                    <Send className="h-4 w-4 mr-2" />
                                    {publishing ? 'Publicando...' : 'Publicar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Status do Artigo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Palavras</span>
                                        <span className="text-sm font-medium">{wordCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Score SEO</span>
                                        <Badge variant={seoScore >= 70 ? "default" : "secondary"}>
                                            {seoScore}/100
                                        </Badge>
                                    </div>
                                    <Progress value={seoScore} className="h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        Dicas SEO
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        {watchedValues.title && watchedValues.title.length >= 30 && watchedValues.title.length <= 60 ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                        )}
                                        <span className="text-xs text-gray-600">Título: 30-60 caracteres</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        {wordCount >= 300 ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                        )}
                                        <span className="text-xs text-gray-600">Mínimo 300 palavras</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                                    <TabsTrigger value="seo">SEO</TabsTrigger>
                                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                                </TabsList>

                                <TabsContent value="content" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Edit3 className="h-5 w-5 mr-2" />
                                                Informações Básicas
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">Título *</Label>
                                                <Input id="title" placeholder="Digite um título atraente..." {...register('title')} />
                                                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="slug">Slug *</Label>
                                                <Input id="slug" placeholder="url-do-artigo" {...register('slug')} />
                                                {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="excerpt">Resumo *</Label>
                                                <Textarea id="excerpt" placeholder="Um resumo atraente do artigo..." rows={3} {...register('excerpt')} />
                                                {errors.excerpt && <p className="text-sm text-red-500 mt-1">{errors.excerpt.message}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Edit3 className="h-5 w-5 mr-2" />
                                                Conteúdo do Artigo
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="border-b border-gray-200 pb-3 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
                                                                <Bold className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Negrito</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
                                                                <Italic className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Itálico</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('link')}>
                                                                <Link className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Link</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('list')}>
                                                                <List className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Lista</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('quote')}>
                                                                <Quote className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Citação</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('code')}>
                                                                <Code className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Código</TooltipContent>
                                                    </Tooltip>
                                                    
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => formatText('image')}>
                                                                <ImageIcon className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Inserir Imagem</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            
                                            <Textarea
                                                ref={contentRef}
                                                placeholder="Escreva o conteúdo do artigo aqui. Use Markdown para formatação..."
                                                rows={20}
                                                {...register('content')}
                                            />
                                            
                                            {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Categoria e Tags</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="category">Categoria *</Label>
                                                <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma categoria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.slug}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                                            </div>
                                            
                                            <div>
                                                <Label>Tags</Label>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {watchedValues.tags?.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="flex items-center">
                                                            {tag}
                                                            <Button variant="ghost" size="sm" className="h-auto p-0 ml-1 hover:bg-transparent" onClick={() => removeTag(tag)}>
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex space-x-2">
                                                    <Input
                                                        placeholder="Adicionar tag..."
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
                                                    />
                                                    <Button type="button" variant="outline" onClick={() => addTag(newTag)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <ImageIcon2 className="h-5 w-5 mr-2" />
                                                Imagens do Artigo
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <Label>Imagem de Capa (Listagem do Blog)</Label>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    Imagem exibida na listagem do blog. Recomendado: 1200x630px
                                                </p>
                                                <ImageUpload
                                                    value={watchedValues.coverImage}
                                                    onChange={(url) => setValue('coverImage', url)}
                                                    bucket="blog-images"
                                                    aspectRatio="wide"
                                                    placeholder="Upload da imagem de capa"
                                                />
                                                <Input
                                                    {...register('coverImage')}
                                                    type="hidden"
                                                />
                                            </div>

                                            <div>
                                                <Label>Imagem do Post (Página do Artigo)</Label>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    Imagem principal no topo do artigo. Recomendado: 1920x1080px
                                                </p>
                                                <ImageUpload
                                                    value={watchedValues.postImage}
                                                    onChange={(url) => setValue('postImage', url)}
                                                    bucket="blog-images"
                                                    aspectRatio="wide"
                                                    placeholder="Upload da imagem do post"
                                                />
                                                <Input
                                                    {...register('postImage')}
                                                    type="hidden"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="seo" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>SEO e Meta Tags</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="metaTitle">Meta Título</Label>
                                                <Input id="metaTitle" placeholder="Título para SEO (60 caracteres)" {...register('metaTitle')} />
                                                <p className="text-sm text-gray-500 mt-1">{watchedValues.metaTitle?.length || 0}/60 caracteres</p>
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="metaDescription">Meta Descrição</Label>
                                                <Textarea id="metaDescription" placeholder="Descrição para SEO (160 caracteres)" rows={3} {...register('metaDescription')} />
                                                <p className="text-sm text-gray-500 mt-1">{watchedValues.metaDescription?.length || 0}/160 caracteres</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="settings" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Configurações do Artigo</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="author">Autor</Label>
                                                <Input id="author" placeholder="Nome do autor" {...register('author')} />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select value={watchedValues.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setValue('status', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Rascunho</SelectItem>
                                                        <SelectItem value="published">Publicado</SelectItem>
                                                        <SelectItem value="archived">Arquivado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Switch id="featured" checked={watchedValues.featured} onCheckedChange={(checked) => setValue('featured', checked)} />
                                                <Label htmlFor="featured">Artigo em Destaque</Label>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Switch id="allowComments" checked={watchedValues.allowComments} onCheckedChange={(checked) => setValue('allowComments', checked)} />
                                                <Label htmlFor="allowComments">Permitir Comentários</Label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>

            {/* Image Editor Modal */}
            {showImageEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <ImageEditor
                        onInsert={handleImageInsert}
                        onClose={() => setShowImageEditor(false)}
                    />
                </div>
            )}
            </div>
        </TooltipProvider>
    );
};

export default CreateArticleDirect;
