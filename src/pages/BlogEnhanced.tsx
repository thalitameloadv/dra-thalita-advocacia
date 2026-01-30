import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Search,
    Calendar,
    Clock,
    Eye,
    Heart,
    Share2,
    Filter,
    ChevronRight,
    TrendingUp,
    User,
    BookOpen,
    Zap,
    Star,
    ArrowRight,
    Grid,
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import NewsletterSignup from '@/components/NewsletterSignup';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import { blogService } from '@/services/blogService';
import { imageOptimizationService, getBlogListImage, IMAGE_GUIDELINES } from '@/services/imageOptimizationService';
import { BlogPost, BlogCategory } from '@/types/blog';
import { toast } from 'sonner';

const BlogEnhanced = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending' | 'title'>('recent');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [featuredOnly, setFeaturedOnly] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [postsData, categoriesData] = await Promise.all([
                    blogService.getPosts(),
                    blogService.getCategories()
                ]);
                setPosts(postsData);
                setCategories(categoriesData);
                setFilteredPosts(postsData);
            } catch (error) {
                console.error('Error loading blog data:', error);
                toast.error('Erro ao carregar dados do blog');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        let filtered = posts;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }

        // Filter featured only
        if (featuredOnly) {
            filtered = filtered.filter(post => post.featured);
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
                case 'popular':
                    return b.views - a.views;
                case 'trending':
                    return (b.likes + b.views) - (a.likes + a.views);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredPosts(filtered);
    }, [posts, searchTerm, selectedCategory, sortBy, featuredOnly]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const getCategoryInfo = (slug: string) => {
        return categories.find(cat => cat.slug === slug);
    };

    const generateStructuredData = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog Dra. Thalita Melo Advocacia",
            "description": "Artigos especializados em direito civil, trabalhista, empresarial, familiar e tributário",
            "url": window.location.href,
            "author": {
                "@type": "Person",
                "name": "Dra. Thalita Melo",
                "jobTitle": "Advogada"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Dra. Thalita Melo Advocacia",
                "logo": {
                    "@type": "ImageObject",
                    "url": "/logo.png"
                }
            },
            "blogPost": filteredPosts.map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "image": post.featuredImage,
                "author": {
                    "@type": "Person",
                    "name": post.author
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Dra. Thalita Melo Advocacia"
                },
                "datePublished": post.publishedAt,
                "dateModified": post.updatedAt,
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `${window.location.origin}/blog/${post.slug}`
                }
            }))
        };
    };

    const PostCard = ({ post, viewMode }: { post: BlogPost; viewMode: 'grid' | 'list' }) => {
        const categoryInfo = getCategoryInfo(post.category);
        const readingTime = calculateReadingTime(post.content);

        if (viewMode === 'list') {
            return (
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                            <Link to={`/blog/${post.slug}`}>
                                <OptimizedImage
                                    src={post.featuredImage || '/placeholder-blog.jpg'}
                                    alt={post.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-48 md:h-full object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </Link>
                        </div>
                        <div className="md:w-2/3 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                {categoryInfo && (
                                    <Badge variant="secondary" className="text-xs">
                                        {categoryInfo.name}
                                    </Badge>
                                )}
                                {post.featured && (
                                    <Badge variant="default" className="text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        Destaque
                                    </Badge>
                                )}
                            </div>
                            <Link to={`/blog/${post.slug}`}>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>
                            <p className="text-slate-600 mb-4 line-clamp-2">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(post.publishedAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {readingTime} min
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {post.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-4 w-4" />
                                        {post.likes}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            );
        }

        return (
            <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                    <Link to={`/blog/${post.slug}`}>
                        <OptimizedImage
                            src={post.featuredImage || '/placeholder-blog.jpg'}
                            alt={post.title}
                            width={800}
                            height={450}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </Link>
                    <div className="absolute top-4 left-4 flex gap-2">
                        {categoryInfo && (
                            <Badge variant="secondary" className="text-xs bg-white/90">
                                {categoryInfo.name}
                            </Badge>
                        )}
                        {post.featured && (
                            <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Destaque
                            </Badge>
                        )}
                    </div>
                </div>
                <CardContent className="p-6">
                    <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                        {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {readingTime} min
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {post.likes}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-2/3 mb-4" />
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>Blog - Dra. Thalita Melo Advocacia</title>
                <meta name="description" content="Artigos especializados em direito civil, trabalhista, empresarial, familiar e tributário" />
                <meta name="keywords" content="blog, advocacia, direito, artigos jurídicos, Dra. Thalita Melo" />
                <script type="application/ld+json">
                    {JSON.stringify(generateStructuredData())}
                </script>
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
                <Header />
                
                {/* Hero Section */}
                <section className="bg-primary text-white py-32 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
                    </div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center space-y-8">
                            <div className="flex items-center justify-center mb-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <BookOpen className="h-12 w-12 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold ml-4">
                                    Blog Jurídico
                                </h1>
                            </div>
                            <p className="text-xl text-primary-foreground/95 mb-12 max-w-4xl mx-auto leading-relaxed">
                                Artigos especializados em direito civil, trabalhista, empresarial, familiar e tributário. 
                                Conteúdo de qualidade para profissionais e estudantes de direito.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Button size="lg" className="bg-white text-navy hover:bg-accent/10 px-8 py-4 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300">
                                    <Zap className="h-5 w-5 mr-3" />
                                    Artigos em Destaque
                                </Button>
                                <Button size="lg" variant="outline" className="border-white text-navy hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold transition-all duration-300">
                                    <BookOpen className="h-5 w-5 mr-3" />
                                    Todas as Categorias
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-card py-16 border-y border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-serif font-semibold text-foreground mb-4">
                                Nossos Números
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Crescimento contínuo e compromisso com conteúdo de qualidade
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { value: `${posts.length}+`, label: "Artigos Publicados", icon: BookOpen },
                                { value: `${categories.length}`, label: "Categorias", icon: Grid },
                                { value: `${posts.reduce((acc, post) => acc + post.views, 0).toLocaleString()}+`, label: "Visualizações", icon: Eye },
                                { value: `${posts.reduce((acc, post) => acc + post.likes, 0).toLocaleString()}+`, label: "Curtidas", icon: Heart }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group">
                                    <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                                        <div className="absolute inset-0 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors"></div>
                                        <stat.icon className="h-8 w-8 text-primary relative z-10" />
                                    </div>
                                    <div className="text-4xl font-serif font-bold text-primary mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Search and Filters */}
                        <div className="mb-8">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                        <Input
                                            placeholder="Buscar artigos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filtros
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Categoria
                                            </label>
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todas as categorias" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas as categorias</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.slug}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Ordenar por
                                            </label>
                                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="recent">Mais recentes</SelectItem>
                                                    <SelectItem value="popular">Mais populares</SelectItem>
                                                    <SelectItem value="trending">Em alta</SelectItem>
                                                    <SelectItem value="title">Ordem alfabética</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="featured"
                                                    checked={featuredOnly}
                                                    onCheckedChange={setFeaturedOnly}
                                                />
                                                <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                                                    Apenas em destaque
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {filteredPosts.length} artigo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
                                </h2>
                                {searchTerm && (
                                    <p className="text-slate-600 mt-1">
                                        Resultados para "{searchTerm}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Posts Grid/List */}
                        {loading ? (
                            <LoadingSkeleton />
                        ) : filteredPosts.length > 0 ? (
                            <div className={
                                viewMode === 'grid' 
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-6'
                            }>
                                {filteredPosts.map((post) => (
                                    <PostCard key={post.id} post={post} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-slate-400 mb-4">
                                    <BookOpen className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    Nenhum artigo encontrado
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    Tente ajustar os filtros ou buscar por outros termos
                                </p>
                                <Button onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                    setFeaturedOnly(false);
                                }}>
                                    Limpar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="bg-primary text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Receba nossos artigos por e-mail
                        </h2>
                        <p className="text-primary-foreground/90 mb-8">
                            Fique atualizado com as últimas publicações jurídicas e análises especializadas
                        </p>
                        <NewsletterSignup variant="default" className="max-w-md mx-auto" />
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default BlogEnhanced;
