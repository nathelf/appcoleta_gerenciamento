import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search } from 'lucide-react';

export default function Sessoes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const sessoes = useLiveQuery(
    () => db.sessoesColeta.orderBy('dataInicio').reverse().toArray()
  );

  const filteredSessoes = sessoes?.filter(s => 
    s.uuid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Sessões' }]} />
      
      <PageHeader
        title="Sessões de Coleta"
        description="Visualize e gerencie as sessões realizadas"
        actions={
          <Button onClick={() => navigate('/coleta/primeira')}>
            Nova Sessão
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Sincronização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessoes?.map((sessao) => (
                  <TableRow key={sessao.id}>
                    <TableCell className="font-mono text-sm">
                      #{sessao.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sessao.tipoSessao}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        sessao.status === 'CONCLUIDA' ? 'success' :
                        sessao.status === 'EM_ANDAMENTO' ? 'default' :
                        'destructive'
                      }>
                        {sessao.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(sessao.dataInicio)}
                    </TableCell>
                    <TableCell>
                      {sessao.dataFim ? formatDateTime(sessao.dataFim) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        sessao.syncStatus === 'SINCRONIZADO' ? 'success' :
                        sessao.syncStatus === 'ERRO' ? 'destructive' :
                        'warning'
                      }>
                        {sessao.syncStatus || 'PENDENTE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/coleta/sessao/${sessao.id}/conclusao`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredSessoes || filteredSessoes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma sessão encontrada
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
