import { useSyncQueue } from '@/hooks/useSyncQueue';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Sincronizacao() {
  const { queueItems, pendingCount, errorCount, retryItem, removeFromQueue } = useSyncQueue();
  const { toast } = useToast();

  const handleRetry = async (id: number) => {
    await retryItem(id);
    toast({
      title: "Tentativa agendada",
      description: "Item será processado novamente"
    });
  };

  const handleRemove = async (id: number) => {
    if (confirm('Tem certeza que deseja descartar este item?')) {
      await removeFromQueue(id);
      toast({
        title: "Item removido",
        description: "Item foi descartado da fila"
      });
    }
  };

  const handleRetryAll = () => {
    toast({
      title: "Sincronização iniciada",
      description: "Processando todos os itens pendentes"
    });
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Sincronização' }]} />
      
      <PageHeader
        title="Fila de Sincronização"
        description="Gerencie os itens aguardando sincronização com o servidor"
        actions={
          <Button onClick={handleRetryAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Tudo Agora
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-warning" />
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Com Erro</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              {errorCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total na Fila</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              {queueItems.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens na Fila</CardTitle>
          <CardDescription>
            Lista de todos os itens aguardando sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Último Erro</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'CONCLUIDO' ? 'success' :
                        item.status === 'ERRO' || item.status === 'CONFLITO' ? 'destructive' :
                        item.status === 'ENVIANDO' ? 'default' :
                        'warning'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.prioridade === 1 ? 'destructive' : 'secondary'}>
                        {item.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.tentativas}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.ultimoErro || '-'}
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? formatDateTime(item.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(item.status === 'ERRO' || item.status === 'CONFLITO') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(item.id!)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {queueItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                      Nenhum item na fila de sincronização
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
