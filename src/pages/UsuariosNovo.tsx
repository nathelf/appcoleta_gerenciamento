import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function UsuariosNovo() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<'ADMINISTRADOR' | 'OPERADOR' | 'SUPERVISOR'>('OPERADOR');
  const [ativo, setAtivo] = useState(true);

  const handleSalvar = async () => {
    if (!nome || !email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    try {
      await db.usuarios.add({
        uuid: crypto.randomUUID(),
        nome,
        email,
        perfil,
        ativo,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: "Usuário criado",
        description: "Novo usuário adicionado com sucesso"
      });

      navigate('/usuarios');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao criar usuário"
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: 'Usuários', href: '/usuarios' },
        { label: 'Novo Usuário' }
      ]} />
      
      <PageHeader
        title="Novo Usuário"
        description="Adicione um novo usuário ao sistema"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Preencha os dados do novo usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
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

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/usuarios')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvar} className="flex-1">
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
