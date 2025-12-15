import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { formatCPF } from '@/lib/cpf';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Edit, Trash2, KeyRound, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export default function Usuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getAuthUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [usuarioParaRedefinir, setUsuarioParaRedefinir] = useState<{ id: number; nome: string } | null>(null);
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<{ id: number; nome: string } | null>(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(false);

  const usuarios = useLiveQuery(() => db.usuarios.toArray());

  // Filtrar usuários
  const filteredUsuarios = useMemo(() => {
    if (!usuarios) return [];

    let filtrados = usuarios;

    // Busca por nome, login (email) ou CPF
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      filtrados = filtrados.filter(u => 
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.cpf && formatCPF(u.cpf).includes(termo))
      );
    }

    // Filtro por perfil
    if (filtroPerfil !== 'TODOS') {
      filtrados = filtrados.filter(u => u.perfil === filtroPerfil);
    }

    // Filtro por status
    if (filtroStatus !== 'TODOS') {
      const ativo = filtroStatus === 'ATIVO';
      filtrados = filtrados.filter(u => u.ativo === ativo);
    }

    return filtrados;
  }, [usuarios, searchTerm, filtroPerfil, filtroStatus]);

  // Contar administradores ativos
  const contarAdministradoresAtivos = () => {
    return usuarios?.filter(u => u.perfil === 'ADMINISTRADOR' && u.ativo).length || 0;
  };

  // Verificar se é o último administrador
  const isUltimoAdmin = (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario || usuario.perfil !== 'ADMINISTRADOR' || !usuario.ativo) {
      return false;
    }
    return contarAdministradoresAtivos() === 1;
  };

  // Gerar senha temporária
  const gerarSenhaTemporaria = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  };

  // Redefinir senha
  const handleRedefinirSenha = async (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado"
      });
      return;
    }

    const senhaTemp = gerarSenhaTemporaria();
    setSenhaTemporaria(senhaTemp);
    setUsuarioParaRedefinir({ id: usuarioId, nome: usuario.nome });
    
    // TODO: Salvar senha temporária no banco de dados
    // Por enquanto, apenas exibimos no modal
  };

  const confirmarRedefinicaoSenha = () => {
    toast({
      title: "Senha redefinida",
      description: `Senha temporária gerada para ${usuarioParaRedefinir?.nome}`,
    });
    setUsuarioParaRedefinir(null);
    setSenhaTemporaria('');
  };

  // Ativar/Inativar usuário
  const handleToggleStatus = async (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado"
      });
      return;
    }

    // Verificar se é o último administrador
    if (isUltimoAdmin(usuarioId) && usuario.ativo) {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Não é possível inativar o último administrador do sistema."
      });
      return;
    }

    try {
      await db.usuarios.update(usuarioId, {
        ativo: !usuario.ativo,
        updatedAt: new Date()
      });

      toast({
        title: "Alterações salvas",
        description: `Usuário ${!usuario.ativo ? 'ativado' : 'inativado'} com sucesso`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do usuário"
      });
    }
  };

  // Excluir usuário
  const handleExcluir = (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado"
      });
      return;
    }

    // Verificar se está tentando excluir a si mesmo
    if (currentUser?.email === usuario.email) {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Você não pode excluir sua própria conta."
      });
      return;
    }

    // Verificar se é o último administrador
    if (isUltimoAdmin(usuarioId)) {
      toast({
        variant: "destructive",
        title: "Operação não permitida",
        description: "Não é possível excluir o último administrador do sistema."
      });
      return;
    }

    setUsuarioParaExcluir({ id: usuarioId, nome: usuario.nome });
    setConfirmacaoExclusao(false);
  };

  const confirmarExclusao = async () => {
    if (!usuarioParaExcluir) return;

    if (!confirmacaoExclusao) {
      setConfirmacaoExclusao(true);
      return;
    }

    try {
      await db.usuarios.delete(usuarioParaExcluir.id);
      
      toast({
        title: "Usuário excluído",
        description: `${usuarioParaExcluir.nome} foi removido permanentemente do sistema.`
      });

      setUsuarioParaExcluir(null);
      setConfirmacaoExclusao(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o usuário"
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Usuários' }]} />
      
      <PageHeader
        title="Gerenciar Usuários"
        description="Listar, buscar e operar sobre contas existentes"
        actions={
          <Button onClick={() => navigate('/usuarios/novo')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {/* Busca e Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, login ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os perfis</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="OPERADOR">Operador</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios?.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{usuario.perfil}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? 'success' : 'destructive'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.updatedAt ? formatDateTime(usuario.updatedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRedefinirSenha(usuario.id!)}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Redefinir senha
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(usuario.id!)}
                            disabled={isUltimoAdmin(usuario.id!) && usuario.ativo}
                          >
                            {usuario.ativo ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Inativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleExcluir(usuario.id!)}
                            className="text-destructive"
                            disabled={currentUser?.email === usuario.email || isUltimoAdmin(usuario.id!)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredUsuarios || filteredUsuarios.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Redefinir Senha */}
      <Dialog open={!!usuarioParaRedefinir} onOpenChange={(open) => !open && setUsuarioParaRedefinir(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Senha temporária gerada para {usuarioParaRedefinir?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Senha Temporária</Label>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-lg text-center">
                {senhaTemporaria}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Esta senha deve ser alterada no primeiro acesso.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsuarioParaRedefinir(null)}>
              Fechar
            </Button>
            <Button onClick={confirmarRedefinicaoSenha}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir Usuário */}
      <Dialog open={!!usuarioParaExcluir} onOpenChange={(open) => !open && setUsuarioParaExcluir(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              {confirmacaoExclusao 
                ? `Esta ação é PERMANENTE e IRREVERSÍVEL. Tem certeza absoluta que deseja excluir ${usuarioParaExcluir?.nome}?`
                : `Deseja excluir permanentemente o usuário ${usuarioParaExcluir?.nome}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUsuarioParaExcluir(null);
              setConfirmacaoExclusao(false);
            }}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmarExclusao}
              className={confirmacaoExclusao ? 'bg-destructive' : ''}
            >
              {confirmacaoExclusao ? 'Confirmar Exclusão' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
