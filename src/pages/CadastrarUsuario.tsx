import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { PageHeader } from '@/components/PageHeader';
import { routes } from '@/lib/routes';
import { Eye, EyeOff } from 'lucide-react';

export default function CadastrarUsuario() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (cpf && !validateCPF(cpf)) {
        toast({
          title: 'CPF inválido',
          description: 'Por favor, verifique o CPF informado.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha.length < 8) {
        toast({
          title: 'Senha muito curta',
          description: 'A senha deve ter no mínimo 8 caracteres.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        toast({
          title: 'Senhas não coincidem',
          description: 'A senha e a confirmação devem ser iguais.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verificar unicidade
      const cpfNumeros = cpf.replace(/\D/g, '');
      if (cpfNumeros) {
        const cpfExists = await db.maes.where('cpf').equals(cpfNumeros).first();
        if (cpfExists) {
          toast({
            title: 'CPF já cadastrado',
            description: 'Este CPF já está em uso.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      const userExists = await db.usuarios.where('email').equals(usuario).first();
      if (userExists) {
        toast({
          title: 'Usuário já cadastrado',
          description: 'Este nome de usuário já está em uso.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Criar usuário
      await db.usuarios.add({
        nome,
        email: usuario,
        perfil: 'OPERADOR',
        ativo: status === 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: 'Usuário criado',
        description: 'O usuário foi cadastrado com sucesso.',
      });

      navigate(routes.usuarios.root);
    } catch (error) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Não foi possível cadastrar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Cadastrar Novo Usuário" description="Crie uma nova conta de usuário no sistema" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário *</Label>
              <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value: 'ATIVO' | 'INATIVO') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha inicial *</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(routes.usuarios.root)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
