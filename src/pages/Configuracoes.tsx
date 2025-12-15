import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trash2, HardDrive } from 'lucide-react';

export default function Configuracoes() {
  const { toast } = useToast();
  const [tema, setTema] = useState('light');
  const [idioma, setIdioma] = useState('pt-BR');
  const [notificacoes, setNotificacoes] = useState(true);
  
  const storageUsage = 35; // Mock value

  const handleLimparDados = () => {
    if (confirm('ATENÇÃO: Esta ação irá remover todos os dados locais. Apenas dados já sincronizados poderão ser recuperados do servidor. Deseja continuar?')) {
      toast({
        title: "Dados limpos",
        description: "Cache local foi removido com sucesso",
        variant: "destructive"
      });
    }
  };

  const handleSalvar = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas"
    });
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Configurações' }]} />
      
      <PageHeader
        title="Configurações"
        description="Gerencie suas preferências e dados do sistema"
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferências do Usuário</CardTitle>
            <CardDescription>
              Personalize sua experiência no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tema">Tema</Label>
              <Select value={tema} onValueChange={setTema}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idioma">Idioma</Label>
              <Select value={idioma} onValueChange={setIdioma}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="notificacoes">Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas sobre sincronização e eventos
                </p>
              </div>
              <Switch
                id="notificacoes"
                checked={notificacoes}
                onCheckedChange={setNotificacoes}
              />
            </div>

            <Button onClick={handleSalvar} className="w-full">
              Salvar Preferências
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Armazenamento Local</CardTitle>
            <CardDescription>
              Gerencie o espaço utilizado no dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Quota Utilizada</Label>
                <span className="text-sm font-medium">{storageUsage}%</span>
              </div>
              <Progress value={storageUsage} />
              <p className="text-sm text-muted-foreground mt-2">
                Aproximadamente 350 MB de 1 GB disponível
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <HardDrive className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">Limpar Dados Locais</p>
                <p className="text-xs text-muted-foreground">
                  Remove todos os dados armazenados localmente
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLimparDados}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última Sincronização</span>
              <span className="font-medium">Há 5 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco de Dados</span>
              <span className="font-medium">IndexedDB v1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
