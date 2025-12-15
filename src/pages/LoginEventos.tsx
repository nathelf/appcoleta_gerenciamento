import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle2, XCircle } from 'lucide-react';

export default function LoginEventos() {
  const [searchTerm, setSearchTerm] = useState('');

  const eventos = useLiveQuery(
    () => db.loginEventos.orderBy('createdAt').reverse().toArray()
  );

  const filteredEventos = eventos?.filter(e => 
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Eventos de Login' }]} />
      
      <PageHeader
        title="Eventos de Login"
        description="Histórico de tentativas de acesso ao sistema"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
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
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motivo da Falha</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventos?.map((evento) => (
                  <TableRow key={evento.id}>
                    <TableCell>
                      {evento.createdAt ? formatDateTime(evento.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{evento.email}</TableCell>
                    <TableCell>
                      {evento.sucesso ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Falha
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {evento.motivoFalha || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {evento.dispositivo || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {evento.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredEventos || filteredEventos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum evento de login encontrado
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
