import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { newsletterService } from '@/services/newsletterService';
import { toast } from 'sonner';

const newsletterSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().optional()
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
    variant?: 'default' | 'compact' | 'inline';
    source?: string;
    className?: string;
}

export const NewsletterSignup = ({
    variant = 'default',
    source = 'blog',
    className = ''
}: NewsletterSignupProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<NewsletterFormData>({
        resolver: zodResolver(newsletterSchema)
    });

    const onSubmit = async (data: NewsletterFormData) => {
        try {
            setLoading(true);
            await newsletterService.subscribe({
                email: data.email,
                name: data.name,
                source
            });

            setSuccess(true);
            toast.success('Inscrição realizada com sucesso! Verifique seu email.');
            reset();

            // Reset success state after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (error: any) {
            console.error('Error subscribing:', error);
            toast.error(error.message || 'Erro ao realizar inscrição');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'compact') {
        return (
            <div className={`bg-gradient-to-r from-navy to-navy/80 rounded-lg p-6 ${className}`}>
                {success ? (
                    <div className="text-center text-white">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Inscrição Confirmada!</h3>
                        <p className="text-white/80 text-sm">
                            Verifique seu email para confirmar a inscrição.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-4">
                            <Mail className="h-8 w-8 text-white mx-auto mb-2" />
                            <h3 className="text-lg font-semibold text-white mb-1">
                                Receba Novidades
                            </h3>
                            <p className="text-white/80 text-sm">
                                Artigos jurídicos direto no seu email
                            </p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Seu melhor email"
                                className="bg-white"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-200">{errors.email.message}</p>
                            )}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-navy hover:bg-slate-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Inscrevendo...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Inscrever-se
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={className}>
                {success ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Inscrição confirmada!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="seu@email.com"
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Inscrever'
                            )}
                        </Button>
                    </form>
                )}
                {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <Card className={className}>
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-navy" />
                </div>
                <CardTitle className="text-2xl">Newsletter Jurídica</CardTitle>
                <CardDescription>
                    Receba artigos especializados, atualizações legislativas e dicas jurídicas
                    diretamente no seu email. Sem spam, apenas conteúdo de qualidade.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Inscrição Realizada!
                        </h3>
                        <p className="text-slate-600">
                            Enviamos um email de confirmação para você.
                            Por favor, verifique sua caixa de entrada.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                {...register('name')}
                                type="text"
                                placeholder="Seu nome (opcional)"
                            />
                        </div>

                        <div>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Seu melhor email *"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Inscrevendo...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-5 w-5 mr-2" />
                                    Inscrever-se Gratuitamente
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-slate-500 text-center">
                            Ao se inscrever, você concorda em receber emails da nossa newsletter.
                            Você pode cancelar a inscrição a qualquer momento.
                        </p>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default NewsletterSignup;
