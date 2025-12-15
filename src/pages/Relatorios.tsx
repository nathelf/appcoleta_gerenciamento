import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Download, TrendingUp, Users, Fingerprint } from 'lucide-react';

export default function Relatorios() {
  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Relatórios' }]} />
      
      <PageHeader
        title="Relatórios e Estatísticas"
        description="Visualize e exporte dados do sistema"
        actions={
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Sessões</CardDescription>
            <CardTitle className="text-3xl font-bold">127</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Sucesso</CardDescription>
            <CardTitle className="text-3xl font-bold">95%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3% este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuários Ativos</CardDescription>
            <CardTitle className="text-3xl font-bold">8</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dedos Capturados</CardDescription>
            <CardTitle className="text-3xl font-bold">1,240</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Tipo</CardTitle>
            <CardDescription>Distribuição nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <span className="text-sm">Primeira Coleta</span>
                </div>
                <span className="font-medium">78 (61%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '61%' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-accent" />
                  <span className="text-sm">Recoleta</span>
                </div>
                <span className="font-medium">49 (39%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '39%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operadores Mais Ativos</CardTitle>
            <CardDescription>Sessões realizadas este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { nome: 'Operador Coleta', sessoes: 45 },
                { nome: 'Administrador Sistema', sessoes: 32 },
                { nome: 'Supervisor Principal', sessoes: 28 }
              ].map((operador, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{operador.nome}</span>
                  </div>
                  <span className="font-medium">{operador.sessoes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Sessões</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Gráfico de sessões por dia</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
