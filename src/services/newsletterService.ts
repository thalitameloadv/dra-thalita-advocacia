import { supabase } from '@/lib/supabase';
import { NewsletterSubscriber } from '@/types/blog';

class NewsletterService {
    // Subscribers
    async getSubscribers(filters?: {
        status?: 'active' | 'unsubscribed' | 'pending';
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<NewsletterSubscriber[]> {
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

        if (error) {
            console.error('Error fetching subscribers:', error);
            return [];
        }

        return (data || []).map(this.mapSubscriber);
    }

    async subscribe(data: {
        email: string;
        name?: string;
        tags?: string[];
        source?: string;
    }): Promise<NewsletterSubscriber> {
        // Check if already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('email', data.email)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'unsubscribed') {
                const { data: updated, error } = await supabase
                    .from('newsletter_subscribers')
                    .update({
                        status: 'pending',
                        subscribed_at: new Date().toISOString()
                    })
                    .eq('email', data.email)
                    .select()
                    .single();

                if (error) throw error;
                return this.mapSubscriber(updated);
            }
            throw new Error('Este email já está cadastrado.');
        }

        const { data: inserted, error } = await supabase
            .from('newsletter_subscribers')
            .insert([{
                email: data.email,
                name: data.name,
                status: 'active', // For now auto-active, or 'pending' if you want double opt-in
                tags: data.tags || [],
                source: data.source || 'blog'
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapSubscriber(inserted);
    }

    async confirmSubscription(id: string): Promise<NewsletterSubscriber> {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .update({
                status: 'active',
                confirmed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapSubscriber(data);
    }

    async unsubscribe(email: string): Promise<void> {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ status: 'unsubscribed' })
            .eq('email', email);

        if (error) throw error;
    }

    async deleteSubscriber(id: string): Promise<void> {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async updateSubscriber(id: string, updates: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber> {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapSubscriber(data);
    }

    // Analytics
    async getSubscriberStats(): Promise<{
        total: number;
        active: number;
        pending: number;
        unsubscribed: number;
        growthRate: number;
    }> {
        const [
            { count: total },
            { count: active },
            { count: pending },
            { count: unsubscribed }
        ] = await Promise.all([
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'unsubscribed')
        ]);

        return {
            total: total || 0,
            active: active || 0,
            pending: pending || 0,
            unsubscribed: unsubscribed || 0,
            growthRate: 0 // Could calculate based on last 30 days if needed
        };
    }

    // Export subscribers
    async exportSubscribers(format: 'csv' | 'json' = 'csv'): Promise<string> {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('status', 'active');

        if (error) throw error;

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }

        // CSV format
        const headers = 'Email,Nome,Data de Inscrição,Status\n';
        const rows = (data || []).map(sub =>
            `${sub.email},${sub.name || ''},${sub.subscribed_at},${sub.status}`
        ).join('\n');

        return headers + rows;
    }

    // Helper
    private mapSubscriber(dbSub: any): NewsletterSubscriber {
        return {
            id: dbSub.id,
            email: dbSub.email,
            name: dbSub.name,
            subscribedAt: dbSub.subscribed_at,
            status: dbSub.status,
            confirmedAt: dbSub.confirmed_at,
            tags: dbSub.tags || [],
            source: dbSub.source
        };
    }
}

export const newsletterService = new NewsletterService();

