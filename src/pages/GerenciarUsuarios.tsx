import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { db } from '@/lib/db';
import { routes } from '@/lib/routes';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Pencil, KeyRound, Trash2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function GerenciarUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const usuarios = useLiveQuery(() => {
    if (searchTerm) {
      return db.usuarios
        .filter(u => 
          u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .toArray();
    }
    return db.usuarios.toArray();
  }, [searchTerm]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await db.usuarios.update(id, { ativo: !currentStatus, updatedAt: new Date() });
      toast({
        title: 'Status atualizado',
        description: `Usuário ${!currentStatus ? 'ativado' : 'inativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar o status do usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      await db.usuarios.delete(deleteUserId);
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido do sistema.',
      });
      setDeleteUserId(null);
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o usuário.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Gerenciar Usuários"
        description="Visualize e gerencie todos os usuários cadastrados"
        actions={
          <Button onClick={() => navigate(routes.usuarios.novo)}>
            Novo Usuário
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Input
              placeholder="Buscar por nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {usuarios?.map((usuario) => (
              <Card key={usuario.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{usuario.nome}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {usuario.perfil}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(routes.usuarios.editar(usuario.id!.toString()))}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(usuario.id!, usuario.ativo)}
                    >
                      {usuario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteUserId(usuario.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {usuarios?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
