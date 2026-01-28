import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import React from "react";
import Index from "./pages/Index";
import Calculadoras from "./pages/Calculadoras";
import CalculadoraAposentadoria from "./pages/CalculadoraAposentadoria";
import CalculadoraRescisao from "./pages/CalculadoraRescisao";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import BlogAdmin from "./pages/BlogAdmin";
import BlogEditor from "./pages/BlogEditor";
import BlogSEO from "./pages/BlogSEO";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import CreateNewsletter from "./pages/CreateNewsletter";
import CreateArticle from "./pages/CreateArticle";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    console.error("App crash:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Erro ao renderizar a aplicação</h1>
          <p style={{ marginTop: 8 }}>Abra o Console (F12) para ver o stack trace completo.</p>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {String(this.state.error ?? "Erro desconhecido")}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/calculadoras" element={<Calculadoras />} />
                <Route path="/calculadora-aposentadoria" element={<CalculadoraAposentadoria />} />
                <Route path="/calculadora-rescisao-trabalhista" element={<CalculadoraRescisao />} />

                {/* Blog Routes */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />

                {/* Protected Admin Routes */}
                <Route path="/admin/blog" element={
                  <ProtectedRoute>
                    <BlogAdmin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/seo" element={
                  <ProtectedRoute>
                    <BlogSEO />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/:id" element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/novo" element={
                  <ProtectedRoute>
                    <CreateArticle />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/editar/:id" element={
                  <ProtectedRoute>
                    <CreateArticle />
                  </ProtectedRoute>
                } />

                {/* Newsletter Admin Routes */}
                <Route path="/admin/newsletter" element={
                  <ProtectedRoute>
                    <NewsletterAdmin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/newsletter/criar" element={
                  <ProtectedRoute>
                    <CreateNewsletter />
                  </ProtectedRoute>
                } />
                <Route path="/admin/newsletter/editar/:id" element={
                  <ProtectedRoute>
                    <CreateNewsletter />
                  </ProtectedRoute>
                } />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
