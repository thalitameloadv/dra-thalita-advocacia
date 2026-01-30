import { supabase } from '@/lib/supabase';
import { validateNewsletter, validateSubscriber, ValidationError } from './validationService';
import { toast } from 'sonner';

export interface Campaign {
    id: string;
    subject: string;
    previewText?: string;
    content: string;
    htmlContent: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduledFor?: string;
    sentAt?: string;
    recipientCount: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
    createdAt: string;
    updatedAt: string;
    template: string;
    segments: string[];
    metadata?: {
        openRate: number;
        clickRate: number;
        unsubscribeRate: number;
        deliveryRate: number;
        bounceRate: number;
        spamRate: number;
    };
}

export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    status: 'active' | 'pending' | 'unsubscribed';
    subscribedAt: string;
    confirmedAt?: string;
    tags: string[];
    source?: string;
    metadata?: {
        totalOpens: number;
        totalClicks: number;
        lastOpenedAt?: string;
        lastClickedAt?: string;
        deviceType?: string;
        browser?: string;
        location?: string;
    };
}

export interface CampaignAnalytics {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    deliveryRate: number;
    bounceRate: number;
    spamRate: number;
    revenueGenerated?: number;
    conversionRate?: number;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    htmlContent: string;
    variables: string[];
    isDefault: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
}

class EnhancedNewsletterService {
    // Campaign management
    async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
        try {
            // Validate campaign data
            const validation = validateNewsletter(campaignData);
            if (!validation.success) {
                const error = validation.errors[0];
                throw new ValidationError(error.message, error.field, error.code);
            }

            // Generate HTML content
            const htmlContent = this.generateHTMLContent(campaignData.content || '', campaignData.template || 'default');

            const { data, error } = await supabase
                .from('newsletter_campaigns')
                .insert([{
                    subject: campaignData.subject,
                    preview_text: campaignData.previewText,
                    content: campaignData.content,
                    html_content: htmlContent,
                    status: 'draft',
                    template: campaignData.template || 'default',
                    segments: campaignData.segments || [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Campanha criada com sucesso!');
            return this.mapCampaignData(data);
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Erro ao criar campanha');
            throw error;
        }
    }

    async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
        try {
            // Validate campaign data
            const validation = validateNewsletter(campaignData);
            if (!validation.success) {
                const error = validation.errors[0];
                throw new ValidationError(error.message, error.field, error.code);
            }

            // Generate HTML content if content changed
            const updateData: Record<string, any> = { ...campaignData, updated_at: new Date().toISOString() };
            if (campaignData.content) {
                updateData.html_content = this.generateHTMLContent(campaignData.content, campaignData.template || 'default');
            }

            const { data, error } = await supabase
                .from('newsletter_campaigns')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast.success('Campanha atualizada com sucesso!');
            return this.mapCampaignData(data);
        } catch (error) {
            console.error('Error updating campaign:', error);
            toast.error('Erro ao atualizar campanha');
            throw error;
        }
    }

    async deleteCampaign(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('newsletter_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Campanha excluída com sucesso!');
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Erro ao excluir campanha');
            throw error;
        }
    }

    async duplicateCampaign(id: string): Promise<Campaign> {
        try {
            const originalCampaign = await this.getCampaign(id);
            
            const duplicatedData = {
                subject: `${originalCampaign.subject} (Cópia)`,
                content: originalCampaign.content,
                template: originalCampaign.template,
                status: 'draft' as const,
                segments: originalCampaign.segments
            };

            return await this.createCampaign(duplicatedData);
        } catch (error) {
            console.error('Error duplicating campaign:', error);
            toast.error('Erro ao duplicar campanha');
            throw error;
        }
    }

    async getCampaign(id: string): Promise<Campaign> {
        try {
            const { data, error } = await supabase
                .from('newsletter_campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.mapCampaignData(data);
        } catch (error) {
            console.error('Error fetching campaign:', error);
            throw error;
        }
    }

    async getCampaigns(filters?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<Campaign[]> {
        try {
            let query = supabase
                .from('newsletter_campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }

            if (filters?.limit) {
                const offset = filters.offset || 0;
                query = query.range(offset, offset + filters.limit - 1);
            }

            const { data, error } = await query;

            if (error) throw error;

            return (data || []).map(this.mapCampaignData);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    }

    async sendCampaign(id: string): Promise<void> {
        try {
            const campaign = await this.getCampaign(id);
            
            if (campaign.status !== 'draft') {
                throw new Error('Apenas rascunhos podem ser enviados');
            }

            // Update status to sending
            await this.updateCampaign(id, { status: 'sending' });

            // Get active subscribers
            const subscribers = await this.getSubscribers({ status: 'active' });
            
            // Send emails (this would typically be handled by a background job)
            const results = await this.sendEmails(campaign, subscribers);

            // Update campaign status and metrics
            await this.updateCampaign(id, {
                status: 'sent',
                sentAt: new Date().toISOString(),
                recipientCount: results.sent,
                openedCount: 0,
                clickedCount: 0,
                unsubscribedCount: 0
            });

            toast.success(`Campanha enviada para ${results.sent} inscritos!`);
        } catch (error) {
            console.error('Error sending campaign:', error);
            toast.error('Erro ao enviar campanha');
            throw error;
        }
    }

    async scheduleCampaign(id: string, scheduledDate: string): Promise<void> {
        try {
            const campaign = await this.getCampaign(id);
            
            if (campaign.status !== 'draft') {
                throw new Error('Apenas rascunhos podem ser agendados');
            }

            await this.updateCampaign(id, {
                status: 'scheduled',
                scheduledFor: scheduledDate
            });

            toast.success('Campanha agendada com sucesso!');
        } catch (error) {
            console.error('Error scheduling campaign:', error);
            toast.error('Erro ao agendar campanha');
            throw error;
        }
    }

    // Subscriber management
    async subscribe(subscriberData: {
        email: string;
        name?: string;
        tags?: string[];
        source?: string;
    }): Promise<Subscriber> {
        try {
            // Validate subscriber data
            const validation = validateSubscriber(subscriberData);
            if (!validation.success) {
                const error = validation.errors[0];
                throw new ValidationError(error.message, error.field, error.code);
            }

            // Check if already exists
            const { data: existing } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .eq('email', subscriberData.email)
                .single();

            if (existing) {
                if (existing.status === 'unsubscribed') {
                    // Reactivate unsubscribed user
                    const { data, error } = await supabase
                        .from('newsletter_subscribers')
                        .update({
                            status: 'active',
                            subscribed_at: new Date().toISOString(),
                            tags: subscriberData.tags || existing.tags
                        })
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (error) throw error;
                    toast.success('Inscrição reativada com sucesso!');
                    return this.mapSubscriberData(data);
                } else {
                    throw new ValidationError('Email já está inscrito', 'email', 'already_exists');
                }
            }

            // Create new subscriber
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .insert([{
                    email: subscriberData.email,
                    name: subscriberData.name,
                    tags: subscriberData.tags || [],
                    source: subscriberData.source || 'direct',
                    status: 'active',
                    subscribed_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Inscrição realizada com sucesso!');
            return this.mapSubscriberData(data);
        } catch (error) {
            console.error('Error subscribing:', error);
            if (error instanceof ValidationError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao realizar inscrição');
            }
            throw error;
        }
    }

    async unsubscribe(email: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .update({
                    status: 'unsubscribed',
                    unsubscribed_at: new Date().toISOString()
                })
                .eq('email', email);

            if (error) throw error;

            toast.success('Inscrição cancelada com sucesso!');
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Erro ao cancelar inscrição');
            throw error;
        }
    }

    async getSubscribers(filters?: {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<Subscriber[]> {
        try {
            let query = supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('subscribed_at', { ascending: false });

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }

            if (filters?.search) {
                query = query.or(`email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
            }

            if (filters?.limit) {
                const offset = filters.offset || 0;
                query = query.range(offset, offset + filters.limit - 1);
            }

            const { data, error } = await query;

            if (error) throw error;

            return (data || []).map(this.mapSubscriberData);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            throw error;
        }
    }

    async updateSubscriber(id: string, subscriberData: Partial<Subscriber>): Promise<Subscriber> {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .update(subscriberData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.mapSubscriberData(data);
        } catch (error) {
            console.error('Error updating subscriber:', error);
            throw error;
        }
    }

    async deleteSubscriber(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            throw error;
        }
    }

    async bulkAction(subscriberIds: string[], action: 'unsubscribe' | 'delete' | 'activate'): Promise<void> {
        try {
            let updateData: Record<string, any> = {};

            switch (action) {
                case 'unsubscribe':
                    updateData = {
                        status: 'unsubscribed',
                        unsubscribed_at: new Date().toISOString()
                    };
                    break;
                case 'activate':
                    updateData = {
                        status: 'active',
                        subscribed_at: new Date().toISOString()
                    };
                    break;
                case 'delete':
                    await supabase
                        .from('newsletter_subscribers')
                        .delete()
                        .in('id', subscriberIds);
                    toast.success('Inscritos excluídos com sucesso!');
                    return;
            }

            const { error } = await supabase
                .from('newsletter_subscribers')
                .update(updateData)
                .in('id', subscriberIds);

            if (error) throw error;

            toast.success(`Ação em massa realizada com sucesso!`);
        } catch (error) {
            console.error('Error performing bulk action:', error);
            toast.error('Erro ao realizar ação em massa');
            throw error;
        }
    }

    async exportSubscribers(subscribers: Subscriber[]): Promise<string> {
        try {
            const headers = ['Email', 'Nome', 'Status', 'Data de Inscrição', 'Tags'];
            const rows = subscribers.map(sub => [
                sub.email,
                sub.name || '',
                sub.status,
                new Date(sub.subscribedAt).toLocaleDateString('pt-BR'),
                sub.tags.join('; ')
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            return csvContent;
        } catch (error) {
            console.error('Error exporting subscribers:', error);
            throw error;
        }
    }

    // Analytics
    async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
        try {
            const campaign = await this.getCampaign(campaignId);
            
            // Calculate metrics
            const totalSent = campaign.recipientCount;
            const totalOpened = campaign.openedCount;
            const totalClicked = campaign.clickedCount;
            const totalUnsubscribed = campaign.unsubscribedCount;

            return {
                totalSent,
                totalOpened,
                totalClicked,
                totalUnsubscribed,
                openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
                clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
                unsubscribeRate: totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0,
                deliveryRate: 95, // Mock data
                bounceRate: 5, // Mock data
                spamRate: 0.5 // Mock data
            };
        } catch (error) {
            console.error('Error fetching campaign analytics:', error);
            throw error;
        }
    }

    async getSubscriberStats(): Promise<Record<string, number>> {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('status')
                .then(({ data }) => {
                    const stats: Record<string, number> = {
                        totalSubscribers: data?.length || 0,
                        active: data?.filter((s: { status: string }) => s.status === 'active').length || 0,
                        pending: data?.filter((s: { status: string }) => s.status === 'pending').length || 0,
                        unsubscribed: data?.filter((s: { status: string }) => s.status === 'unsubscribed').length || 0
                    };
                    return { data: stats, error: null };
                });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching subscriber stats:', error);
            throw error;
        }
    }

    // Template management
    async getTemplates(): Promise<EmailTemplate[]> {
        try {
            const { data, error } = await supabase
                .from('newsletter_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(this.mapTemplateData);
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    async createTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
        try {
            const { data, error } = await supabase
                .from('newsletter_templates')
                .insert([{
                    ...templateData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            return this.mapTemplateData(data);
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    // Helper methods
    private generateHTMLContent(content: string, template: string): string {
        const templates = {
            default: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Newsletter</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #f8f9fa; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Dra. Thalita Melo Advocacia</h1>
                        </div>
                        <div class="content">
                            ${content}
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Dra. Thalita Melo Advocacia. Todos os direitos reservados.</p>
                            <p><a href="{{unsubscribeUrl}}">Cancelar inscrição</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            welcome: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bem-vindo</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Bem-vindo!</h1>
                        </div>
                        <div class="content">
                            ${content}
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Dra. Thalita Melo Advocacia. Todos os direitos reservados.</p>
                            <p><a href="{{unsubscribeUrl}}">Cancelar inscrição</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return templates[template as keyof typeof templates] || templates.default;
    }

    private async sendEmails(campaign: Campaign, subscribers: Subscriber[]): Promise<{ sent: number; failed: number }> {
        // This would typically integrate with an email service like SendGrid, Mailgun, etc.
        // For now, we'll simulate the sending process
        
        let sent = 0;
        let failed = 0;

        for (const subscriber of subscribers) {
            try {
                // Simulate email sending
                await new Promise(resolve => setTimeout(resolve, 10));
                
                // Track the send
                await supabase
                    .from('newsletter_sends')
                    .insert([{
                        campaign_id: campaign.id,
                        subscriber_id: subscriber.id,
                        sent_at: new Date().toISOString(),
                        status: 'sent'
                    }]);

                sent++;
            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error);
                failed++;
            }
        }

        return { sent, failed };
    }

    private mapCampaignData(data: Record<string, any>): Campaign {
        return {
            id: data.id,
            subject: data.subject,
            previewText: data.preview_text,
            content: data.content,
            htmlContent: data.html_content,
            status: data.status,
            scheduledFor: data.scheduled_for,
            sentAt: data.sent_at,
            recipientCount: data.recipient_count || 0,
            openedCount: data.opened_count || 0,
            clickedCount: data.clicked_count || 0,
            unsubscribedCount: data.unsubscribed_count || 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            template: data.template || 'default',
            segments: data.segments || [],
            metadata: data.metadata
        };
    }

    private mapSubscriberData(data: Record<string, any>): Subscriber {
        return {
            id: data.id,
            email: data.email,
            name: data.name,
            status: data.status,
            subscribedAt: data.subscribed_at,
            confirmedAt: data.confirmed_at,
            tags: data.tags || [],
            source: data.source,
            metadata: data.metadata
        };
    }

    private mapTemplateData(data: Record<string, any>): EmailTemplate {
        return {
            id: data.id,
            name: data.name,
            subject: data.subject,
            content: data.content,
            htmlContent: data.html_content,
            variables: data.variables || [],
            isDefault: data.is_default || false,
            category: data.category || 'general',
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }
}

export const enhancedNewsletterService = new EnhancedNewsletterService();
