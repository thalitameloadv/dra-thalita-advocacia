import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

class ErrorBoundaryEnhanced extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
            errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error para debugging
        console.error('ErrorBoundary caught an error:', {
            errorId: this.state.errorId,
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        });

        // Chamar callback de erro personalizado
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Enviar para serviço de analytics (em produção)
        if (process.env.NODE_ENV === 'production') {
            // Integrar com serviço de monitoramento como Sentry, LogRocket, etc.
            this.sendErrorToService(error, errorInfo);
        }
    }

    private sendErrorToService = (error: Error, errorInfo: ErrorInfo) => {
        // Aqui você pode integrar com serviços como:
        // - Sentry: Sentry.captureException(error, { extra: errorInfo })
        // - LogRocket: LogRocket.captureException(error, { extra: errorInfo })
        // - Custom endpoint: fetch('/api/errors', { method: 'POST', body: JSON.stringify(...) })
        
        try {
            // Exemplo de envio para endpoint customizado
            fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    errorId: this.state.errorId,
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            }).catch(() => {
                // Silently fail para não causar mais erros
            });
        } catch (e) {
            // Silently fail
        }
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Se houver fallback customizado, usar ele
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI padrão de erro
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        <Card className="border-red-200 shadow-lg">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-red-900">
                                    Oops! Algo deu errado
                                </CardTitle>
                                <CardDescription className="text-red-700">
                                    Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                {/* Informações do erro (em desenvolvimento) */}
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <Alert className="border-orange-200 bg-orange-50">
                                        <Bug className="h-4 w-4" />
                                        <AlertDescription className="text-orange-800">
                                            <div className="space-y-2">
                                                <div>
                                                    <strong>ID do Erro:</strong> {this.state.errorId}
                                                </div>
                                                <div>
                                                    <strong>Mensagem:</strong> {this.state.error.message}
                                                </div>
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer font-semibold">
                                                        Stack Trace (clique para expandir)
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                                                        {this.state.error.stack}
                                                    </pre>
                                                </details>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Ações para o usuário */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button 
                                        onClick={this.handleRetry}
                                        className="flex items-center gap-2"
                                        variant="default"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Tentar Novamente
                                    </Button>
                                    
                                    <Button 
                                        onClick={this.handleReload}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Recarregar Página
                                    </Button>
                                    
                                    <Button 
                                        onClick={this.handleGoHome}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Home className="h-4 w-4" />
                                        Página Inicial
                                    </Button>
                                </div>

                                {/* Informações de contato */}
                                <div className="text-center text-sm text-slate-600 border-t pt-4">
                                    <p>
                                        Se o problema persistir, entre em contato com nosso suporte:
                                    </p>
                                    <div className="mt-2 space-x-4">
                                        <a href="mailto:suporte@thalitamelo.adv.br" className="text-blue-600 hover:underline">
                                            suporte@thalitamelo.adv.br
                                        </a>
                                        <span className="text-slate-400">|</span>
                                        <a href="tel:+5511999999999" className="text-blue-600 hover:underline">
                                            (11) 99999-9999
                                        </a>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        ID do Erro: <code className="bg-slate-100 px-1 py-0.5 rounded">{this.state.errorId}</code>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundaryEnhanced;
