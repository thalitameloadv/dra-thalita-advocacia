import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";

const AdminResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If user already has a valid session, allow reset. Otherwise, show message.
    // Supabase will set the session automatically from the recovery link when detectSessionInUrl=true.
    (async () => {
      try {
        await authService.getSession();
      } catch {
        // ignore
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      toast.success("Senha atualizada com sucesso!");
      navigate("/admin/login");
    } catch (err: any) {
      setError(err?.message || "Erro ao atualizar senha");
      toast.error("Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Redefinir senha</CardTitle>
              <CardDescription className="text-center">
                Defina uma nova senha para sua conta administrativa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Salvando..." : "Atualizar senha"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Voltar para o login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminResetPassword;
