import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Plus,
    Edit,
    Trash2,
    Send,
    Users,
    TrendingUp,
    Eye,
    MousePointer,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    Copy,
    Pause,
    Play,
    RefreshCw,
    Upload,
    MailOpen,
    MousePointer2,
    Target,
    Zap,
    Bell,
    Archive,
    ChevronDown,
    ChevronRight,
    UserPlus,
    MailCheck,
    Activity,
    PieChart,
    LineChart,
    CalendarDays,
    Timer,
    Star,
    Award,
    Globe,
    Smartphone,
    Tablet,
    Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { enhancedNewsletterService } from '@/services/enhancedNewsletterService';
import { authService } from '@/lib/supabase';
import { NewsletterSubscriber } from '@/types/blog';
import { toast } from 'sonner';
import NewsletterAnalytics from '@/components/NewsletterAnalytics';

const NewsletterAdmin = () => {
    const navigate = useNavigate();
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'unsubscribed'>('all');
    const [campaignStatusFilter, setCampaignStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent' | 'sending'>('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showBulkDialog, setShowBulkDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
    const [newNewsletter, setNewNewsletter] = useState({
        subject: '',
        content: '',
        previewText: '',
        template: 'default',
        scheduledFor: '',
        segments: []
    });
    const [sending, setSending] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subscribersData, statsData, campaignsData] = await Promise.all([
                enhancedNewsletterService.getSubscribers(),
                enhancedNewsletterService.getSubscriberStats(),
                enhancedNewsletterService.getCampaigns()
            ]);

            setSubscribers(subscribersData);
            setStats(statsData);
            setCampaigns(campaignsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    // Filter functions
    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(subscriber => {
            const matchesSearch = subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [subscribers, searchTerm, statusFilter]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign => {
            const matchesStatus = campaignStatusFilter === 'all' || campaign.status === campaignStatusFilter;
            return matchesStatus;
        });
    }, [campaigns, campaignStatusFilter]);

    // Campaign actions
    const handleCreateCampaign = async () => {
        try {
            setSending(true);
            await enhancedNewsletterService.createCampaign(newNewsletter);
            toast.success('Campanha criada com sucesso!');
            setShowCreateDialog(false);
            setNewNewsletter({ subject: '', content: '', previewText: '', template: 'default', scheduledFor: '', segments: [] });
            loadData();
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Erro ao criar campanha');
        } finally {
            setSending(false);
        }
    };

    const handleSendCampaign = async (campaignId: string) => {
        if (!confirm('Tem certeza que deseja enviar esta campanha?')) return;
        
        try {
            setSending(true);
            await enhancedNewsletterService.sendCampaign(campaignId);
            toast.success('Campanha enviada com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error sending campaign:', error);
            toast.error('Erro ao enviar campanha');
        } finally {
            setSending(false);
        }
    };

    const handleScheduleCampaign = async () => {
        try {
            setSending(true);
            await enhancedNewsletterService.scheduleCampaign(selectedCampaign.id, newNewsletter.scheduledFor);
            toast.success('Campanha agendada com sucesso!');
            setShowScheduleDialog(false);
            loadData();
        } catch (error) {
            console.error('Error scheduling campaign:', error);
            toast.error('Erro ao agendar campanha');
        } finally {
            setSending(false);
        }
    };

    const handleDuplicateCampaign = async (campaign: any) => {
        try {
            await enhancedNewsletterService.duplicateCampaign(campaign.id);
            toast.success('Campanha duplicada com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error duplicating campaign:', error);
            toast.error('Erro ao duplicar campanha');
        }
    };

    const handleDeleteCampaign = async (campaignId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;
        
        try {
            await enhancedNewsletterService.deleteCampaign(campaignId);
            toast.success('Campanha excluída com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Erro ao excluir campanha');
        }
    };

    // Subscriber actions
    const handleExportSubscribers = async () => {
        try {
            setExporting(true);
            const data = await enhancedNewsletterService.exportSubscribers(filteredSubscribers, 'csv');
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Inscritos exportados com sucesso!');
        } catch (error) {
            console.error('Error exporting subscribers:', error);
            toast.error('Erro ao exportar inscritos');
        } finally {
            setExporting(false);
        }
    };

    const handleBulkAction = async (action: 'unsubscribe' | 'delete' | 'activate') => {
        if (selectedSubscribers.length === 0) {
            toast.error('Selecione pelo menos um inscrito');
            return;
        }

        const confirmMessage = {
            unsubscribe: 'Tem certeza que deseja cancelar a inscrição dos selecionados?',
            delete: 'Tem certeza que deseja excluir os selecionados?',
            activate: 'Tem certeza que deseja ativar os selecionados?'
        };

        if (!confirm(confirmMessage[action])) return;

        try {
            await enhancedNewsletterService.bulkAction(selectedSubscribers, action);
            toast.success(`Ação em massa realizada com sucesso!`);
            setSelectedSubscribers([]);
            loadData();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            toast.error('Erro ao realizar ação em massa');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedSubscribers(filteredSubscribers.map(s => s.id));
        } else {
            setSelectedSubscribers([]);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            navigate('/admin/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Erro ao sair');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Ativo', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
            pending: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
            unsubscribed: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
            draft: { label: 'Rascunho', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
            scheduled: { label: 'Agendado', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
            sent: { label: 'Enviado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
            sending: { label: 'Enviando', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Newsletter Admin - Dra. Thalita Melo Advocacia</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Mail className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Newsletter Admin</h1>
                                    <p className="text-sm text-slate-600">Gerencie campanhas e inscritos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/admin/blog')}
                                    className="gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Blog Admin
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Total de Inscritos
                                </CardTitle>
                                <Users className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {stats?.totalSubscribers || 0}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+12.5% este mês</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Taxa de Abertura
                                </CardTitle>
                                <MailOpen className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {stats?.averageOpenRate || 0}%
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+3.2% este mês</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Taxa de Cliques
                                </CardTitle>
                                <MousePointer className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {stats?.averageClickRate || 0}%
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+1.8% este mês</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Campanhas Enviadas
                                </CardTitle>
                                <Send className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {campaigns.filter(c => c.status === 'sent').length}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                    <span>Este mês</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Visão Geral
                            </TabsTrigger>
                            <TabsTrigger value="campaigns" className="gap-2">
                                <Mail className="h-4 w-4" />
                                Campanhas
                            </TabsTrigger>
                            <TabsTrigger value="subscribers" className="gap-2">
                                <Users className="h-4 w-4" />
                                Inscritos
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <LineChart className="h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Campaigns */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Campanhas Recentes</CardTitle>
                                        <CardDescription>
                                            Últimas campanhas enviadas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {campaigns.slice(0, 5).map((campaign) => (
                                                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            campaign.status === 'sent' ? 'bg-green-500' :
                                                            campaign.status === 'sending' ? 'bg-orange-500' :
                                                            campaign.status === 'scheduled' ? 'bg-blue-500' :
                                                            'bg-gray-500'
                                                        }`} />
                                                        <div>
                                                            <p className="font-medium text-slate-900">{campaign.subject}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{campaign.recipients || 0}</p>
                                                        <p className="text-xs text-slate-500">destinatários</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ações Rápidas</CardTitle>
                                        <CardDescription>
                                            Operações comuns do sistema
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            onClick={() => setShowCreateDialog(true)}
                                            className="w-full gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Criar Nova Campanha
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/admin/newsletter/criar')}
                                            className="w-full gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Editor Avançado
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleExportSubscribers}
                                            disabled={exporting}
                                            className="w-full gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            {exporting ? 'Exportando...' : 'Exportar Inscritos'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowBulkDialog(true)}
                                            className="w-full gap-2"
                                        >
                                            <Users className="h-4 w-4" />
                                            Ação em Massa
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Campaigns Tab */}
                        <TabsContent value="campaigns" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Input
                                        placeholder="Buscar campanhas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                    <Select value={campaignStatusFilter} onValueChange={(value) => setCampaignStatusFilter(value as any)}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="draft">Rascunho</SelectItem>
                                            <SelectItem value="scheduled">Agendado</SelectItem>
                                            <SelectItem value="sending">Enviando</SelectItem>
                                            <SelectItem value="sent">Enviado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova Campanha
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Assunto</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Destinatários</TableHead>
                                                <TableHead>Taxa de Abertura</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCampaigns.map((campaign) => (
                                                <TableRow key={campaign.id}>
                                                    <TableCell className="font-medium">
                                                        {campaign.subject}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(campaign.status)}
                                                    </TableCell>
                                                    <TableCell>{campaign.recipients || 0}</TableCell>
                                                    <TableCell>
                                                        {campaign.openRate ? `${campaign.openRate}%` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/newsletter/editar/${campaign.id}`)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign)}>
                                                                    <Copy className="h-4 w-4 mr-2" />
                                                                    Duplicar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedCampaign(campaign);
                                                                    setShowScheduleDialog(true);
                                                                }}>
                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                    Agendar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleSendCampaign(campaign.id)}
                                                                    disabled={campaign.status === 'sent' || campaign.status === 'sending'}
                                                                >
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Enviar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subscribers Tab */}
                        <TabsContent value="subscribers" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Input
                                        placeholder="Buscar inscritos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="active">Ativos</SelectItem>
                                            <SelectItem value="pending">Pendentes</SelectItem>
                                            <SelectItem value="unsubscribed">Cancelados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedSubscribers.length > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowBulkDialog(true)}
                                            className="gap-2"
                                        >
                                            <Users className="h-4 w-4" />
                                            Ação em Massa ({selectedSubscribers.length})
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={handleExportSubscribers}
                                        disabled={exporting}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        {exporting ? 'Exportando...' : 'Exportar'}
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedSubscribers.length === filteredSubscribers.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Data de Inscrição</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSubscribers.map((subscriber) => (
                                                <TableRow key={subscriber.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedSubscribers.includes(subscriber.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                                                                } else {
                                                                    setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {subscriber.email}
                                                    </TableCell>
                                                    <TableCell>{subscriber.name || '-'}</TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(subscriber.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(subscriber.subscribedAt).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/subscribers/${subscriber.id}`)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver Detalhes
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => {
                                                                    if (confirm(`Enviar email de teste para ${subscriber.email}?`)) {
                                                                        toast.success('Email de teste enviado!');
                                                                    }
                                                                }}>
                                                                    <Mail className="h-4 w-4 mr-2" />
                                                                    Enviar Teste
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        if (confirm(`Cancelar inscrição de ${subscriber.email}?`)) {
                                                                            enhancedNewsletterService.unsubscribe(subscriber.email);
                                                                            toast.success('Inscrição cancelada');
                                                                            loadData();
                                                                        }
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Cancelar Inscrição
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-6">
                            <NewsletterAnalytics />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Create Campaign Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Criar Nova Campanha</DialogTitle>
                            <DialogDescription>
                                Crie uma nova campanha de newsletter
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="subject">Assunto</Label>
                                <Input
                                    id="subject"
                                    value={newNewsletter.subject}
                                    onChange={(e) => setNewNewsletter({...newNewsletter, subject: e.target.value})}
                                    placeholder="Digite o assunto da newsletter"
                                />
                            </div>
                            <div>
                                <Label htmlFor="previewText">Texto de Preview</Label>
                                <Input
                                    id="previewText"
                                    value={newNewsletter.previewText}
                                    onChange={(e) => setNewNewsletter({...newNewsletter, previewText: e.target.value})}
                                    placeholder="Texto que aparece na caixa de entrada"
                                />
                            </div>
                            <div>
                                <Label htmlFor="template">Template</Label>
                                <Select value={newNewsletter.template} onValueChange={(value) => setNewNewsletter({...newNewsletter, template: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Padrão</SelectItem>
                                        <SelectItem value="welcome">Boas-vindas</SelectItem>
                                        <SelectItem value="promotion">Promocional</SelectItem>
                                        <SelectItem value="newsletter">Newsletter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="content">Conteúdo</Label>
                                <Textarea
                                    id="content"
                                    value={newNewsletter.content}
                                    onChange={(e) => setNewNewsletter({...newNewsletter, content: e.target.value})}
                                    placeholder="Digite o conteúdo da newsletter"
                                    rows={6}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleCreateCampaign} disabled={sending} className="flex-1">
                                    {sending ? 'Criando...' : 'Criar Campanha'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Bulk Action Dialog */}
                <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ação em Massa</DialogTitle>
                            <DialogDescription>
                                Selecione uma ação para aplicar aos {selectedSubscribers.length} inscritos selecionados
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <RadioGroup>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="activate" id="activate" />
                                    <Label htmlFor="activate">Ativar Inscritos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="unsubscribe" id="unsubscribe" />
                                    <Label htmlFor="unsubscribe">Cancelar Inscrição</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="delete" id="delete" />
                                    <Label htmlFor="delete">Excluir Inscritos</Label>
                                </div>
                            </RadioGroup>
                            <div className="flex gap-2">
                                <Button onClick={() => {
                                    const selected = document.querySelector('input[name="action"]:checked') as HTMLInputElement;
                                    if (selected) {
                                        handleBulkAction(selected.value as any);
                                    }
                                }} className="flex-1">
                                    Aplicar Ação
                                </Button>
                                <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Schedule Campaign Dialog */}
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agendar Campanha</DialogTitle>
                            <DialogDescription>
                                Agende o envio da campanha para uma data específica
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="scheduledFor">Data e Hora</Label>
                                <Input
                                    id="scheduledFor"
                                    type="datetime-local"
                                    value={newNewsletter.scheduledFor}
                                    onChange={(e) => setNewNewsletter({...newNewsletter, scheduledFor: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleScheduleCampaign} disabled={sending} className="flex-1">
                                    {sending ? 'Agendando...' : 'Agendar Campanha'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default NewsletterAdmin;
