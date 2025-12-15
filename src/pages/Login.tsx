import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateLogin, setAuthUser, getAuthUser } from '@/lib/auth';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { ConnectivityIndicator } from '@/components/ConnectivityIndicator';
import biometriaLogo from '@/assets/biometria-logo.png';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const usuarioRef = useRef<HTMLInputElement | null>(null);
  const senhaRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Foca no campo de usuário quando a página carrega
  useEffect(() => {
    usuarioRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = usuario.trim();
    const password = senha;

    if (!username || !password) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Informe usuário e senha.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await validateLogin(username, password);

      if (result.success && result.user) {
        setAuthUser(result.user);

        toast({
          title: 'Login realizado',
          description: `Bem-vindo(a), ${result.user.name}!`,
        });

        // 🔵 AQUI MANTEMOS O QUE VOCÊ PEDIU:
        navigate('/termo-de-uso', { replace: true });

      } else {
        toast({
          title: 'Erro no login',
          description: result.message || 'Usuário ou senha inválidos.',
          variant: 'destructive',
        });

        setSenha('');
        senhaRef.current?.focus();
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Falha de conexão. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = usuario.trim().length > 0 && senha.trim().length > 0;

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-[#f5f7fb] via-[#f3f6fa] to-[#eef2f7] flex items-center justify-center px-6">
        <div className="absolute right-8 top-8">
          <ConnectivityIndicator />
        </div>

        <Card className="w-full max-w-xl border border-slate-200 shadow-2xl bg-white/95 backdrop-blur-sm" role="region" aria-label="Formulário de login">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="flex justify-center">
              <img
                src={biometriaLogo}
                alt="Logo Sistema de Coleta Biométrica Neonatal"
                className="w-20 h-20 object-contain"
              />
            </div>

            <div>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Coleta Biométrica
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-600">
                Sistema de triagem em neonatal
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleLogin} noValidate>
            <CardContent className="space-y-5 pt-0">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-sm text-slate-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
                  <Input
                    id="usuario"
                    ref={usuarioRef}
                    type="email"
                    placeholder="seu@email.com"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="h-12 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:ring-offset-0"
                    autoComplete="username"
                    aria-label="E-mail"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm text-slate-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
                  <Input
                    id="senha"
                    ref={senhaRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-12 pl-10 pr-12 bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:ring-offset-0"
                    autoComplete="current-password"
                    aria-label="Senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-0">
              <Button
                type="submit"
                className="w-full h-12 bg-[#0c63d4] hover:bg-[#0b58bf] text-white font-semibold shadow-md transition-colors"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <p className="text-center text-xs text-slate-500">
                Modo offline disponível após primeiro login
              </p>

              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                <p className="text-sm font-semibold text-slate-800">Acessos de teste</p>
                <p className="text-xs text-slate-600 mt-1">
                  Enquanto não há banco, use os logins abaixo:
                </p>
                <div className="mt-3 grid gap-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 border border-slate-200">
                    <span className="font-semibold text-slate-800">Admin</span>
                    <span className="font-mono text-[11px]">admin / admin123</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 border border-slate-200">
                    <span className="font-semibold text-slate-800">Coletista</span>
                    <span className="font-mono text-[11px]">coletor / coletor123</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Também aceita e-mail: admin@local.test ou coletor@local.test.
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
}
