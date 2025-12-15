import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { Eye, EyeOff } from 'lucide-react';

export default function UsuariosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [perfil, setPerfil] = useState<'ADMINISTRADOR' | 'OPERADOR' | 'SUPERVISOR'>('OPERADOR');
  const [ativo, setAtivo] = useState(true);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      if (!id) return;
      
      try {
        const usuarioData = await db.usuarios.get(Number(id));
        if (usuarioData) {
          setNome(usuarioData.nome);
          setCpf(usuarioData.cpf || '');
          setUsuario(usuarioData.email);
          setDataNascimento(usuarioData.dataNascimento || '');
          setPerfil(usuarioData.perfil);
          setAtivo(usuarioData.ativo);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar dados do usuário"
        });
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [id, toast]);

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  const handleSalvar = async () => {
    if (!nome || !usuario) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    if (cpf && !validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CPF inválido"
      });
      return;
    }

    if (senha && senha.length < 8) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter no mínimo 8 caracteres"
      });
      return;
    }

    if (senha && senha !== confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem"
      });
      return;
    }

    try {
      const updateData: any = {
        nome,
        email: usuario,
        perfil,
        ativo,
        updatedAt: new Date()
      };

      if (cpf) updateData.cpf = cpf;
      if (dataNascimento) updateData.dataNascimento = dataNascimento;
      if (senha) updateData.senha = senha;

      await db.usuarios.update(Number(id), updateData);

      toast({
        title: "Perfil atualizado",
        description: "Alterações salvas com sucesso"
      });

      navigate('/usuarios');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar usuário"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: 'Usuários', href: '/usuarios' },
        { label: 'Editar Usuário' }
      ]} />
      
      <PageHeader
        title="Editar Usuário"
        description="Atualize os dados do usuário"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Modifique os dados conforme necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <Label htmlFor="usuario">Usuário (Login) *</Label>
              <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="perfil">Perfil *</Label>
              <Select value={perfil} onValueChange={(v: any) => setPerfil(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="OPERADOR">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="ativo">Status</Label>
                <p className="text-sm text-muted-foreground">
                  Usuário ativo pode acessar o sistema
                </p>
              </div>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Alterar Senha (opcional)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="senha">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Deixe em branco para manter a atual"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/usuarios')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvar} 
                className="flex-1 bg-button-primary hover:bg-button-primary/90"
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
