import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Rss, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { blogService } from '@/services/blogService';
import { toast } from 'sonner';

const BlogSEO = () => {
    const [sitemap, setSitemap] = useState('');
    const [rssFeed, setRssFeed] = useState('');
    const [copiedSitemap, setCopiedSitemap] = useState(false);
    const [copiedRss, setCopiedRss] = useState(false);

    useEffect(() => {
        const sitemapXml = blogService.generateSitemap();
        const rssXml = blogService.generateRSSFeed();

        setSitemap(sitemapXml);
        setRssFeed(rssXml);
    }, []);

    const handleCopy = (content: string, type: 'sitemap' | 'rss') => {
        navigator.clipboard.writeText(content);

        if (type === 'sitemap') {
            setCopiedSitemap(true);
            setTimeout(() => setCopiedSitemap(false), 2000);
        } else {
            setCopiedRss(true);
            setTimeout(() => setCopiedRss(false), 2000);
        }

        toast.success('Copiado para a área de transferência!');
    };

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Download iniciado!');
    };

    return (
        <>
            <Helmet>
                <title>SEO Tools - Blog Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Ferramentas de SEO
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Sitemap e RSS Feed para otimização de busca
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Tabs defaultValue="sitemap" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="sitemap">
                                <FileText className="h-4 w-4 mr-2" />
                                Sitemap XML
                            </TabsTrigger>
                            <TabsTrigger value="rss">
                                <Rss className="h-4 w-4 mr-2" />
                                RSS Feed
                            </TabsTrigger>
                        </TabsList>

                        {/* Sitemap Tab */}
                        <TabsContent value="sitemap" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sitemap XML</CardTitle>
                                    <CardDescription>
                                        Arquivo XML para indexação em mecanismos de busca (Google, Bing, etc.)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleCopy(sitemap, 'sitemap')}
                                            variant="outline"
                                        >
                                            {copiedSitemap ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copiar
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleDownload(sitemap, 'sitemap.xml')}
                                            variant="outline"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-green-400 text-sm font-mono">
                                            {sitemap}
                                        </pre>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-slate-900 mb-2">
                                            Como usar:
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-800">
                                            <li>Salve o arquivo como <code className="bg-slate-100 px-1 rounded">sitemap.xml</code></li>
                                            <li>Coloque na raiz do seu site: <code className="bg-slate-100 px-1 rounded">https://seusite.com/sitemap.xml</code></li>
                                            <li>Envie para o Google Search Console</li>
                                            <li>Envie para o Bing Webmaster Tools</li>
                                        </ol>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* RSS Tab */}
                        <TabsContent value="rss" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>RSS Feed</CardTitle>
                                    <CardDescription>
                                        Feed RSS para syndication e leitores de feed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleCopy(rssFeed, 'rss')}
                                            variant="outline"
                                        >
                                            {copiedRss ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copiar
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleDownload(rssFeed, 'feed.xml')}
                                            variant="outline"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-green-400 text-sm font-mono">
                                            {rssFeed}
                                        </pre>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-slate-900 mb-2">
                                            Como usar:
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-800">
                                            <li>Salve o arquivo como <code className="bg-slate-100 px-1 rounded">feed.xml</code> ou <code className="bg-slate-100 px-1 rounded">rss.xml</code></li>
                                            <li>Coloque na raiz ou em /blog: <code className="bg-slate-100 px-1 rounded">https://seusite.com/feed.xml</code></li>
                                            <li>Adicione link no header do site para auto-discovery</li>
                                            <li>Compartilhe com agregadores de conteúdo</li>
                                        </ol>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-900 mb-2">
                                            Auto-Discovery Tag:
                                        </h4>
                                        <code className="block bg-green-100 p-2 rounded text-sm text-green-800">
                                            {`<link rel="alternate" type="application/rss+xml" title="Blog RSS Feed" href="/feed.xml" />`}
                                        </code>
                                        <p className="text-xs text-green-700 mt-2">
                                            Adicione esta tag no &lt;head&gt; do seu site para permitir que navegadores detectem automaticamente o feed RSS.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* SEO Tips */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Dicas de SEO</CardTitle>
                            <CardDescription>
                                Melhores práticas para otimização de busca
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-900">Sitemap</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>✓ Atualize regularmente após publicar novos artigos</li>
                                        <li>✓ Inclua apenas URLs importantes</li>
                                        <li>✓ Use prioridades corretas (0.0 - 1.0)</li>
                                        <li>✓ Defina frequência de atualização adequada</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-900">RSS Feed</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>✓ Limite a 20-50 artigos mais recentes</li>
                                        <li>✓ Inclua descrições completas</li>
                                        <li>✓ Use URLs absolutas para imagens</li>
                                        <li>✓ Mantenha formatação consistente</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default BlogSEO;
