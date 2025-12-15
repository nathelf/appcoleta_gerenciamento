import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { TimePickerScroll } from '@/components/TimePickerScroll';

export default function CadastroBebe() {
  const [nomeBebe, setNomeBebe] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [horaNascimento, setHoraNascimento] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getAuthUser();

  useEffect(() => {
    const maeId = sessionStorage.getItem('mae_id');
    if (!maeId) {
      toast({
        title: 'Erro',
        description: 'Dados da mãe não encontrados. Reinicie o processo.',
        variant: 'destructive',
      });
      navigate('/coleta/primeira');
    }
  }, [navigate, toast]);

  const handleIniciar = async () => {
    if (!dataNascimento) {
      toast({
        title: 'Campo obrigatório',
        description: 'A data de nascimento é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const maeId = parseInt(sessionStorage.getItem('mae_id')!);
      const scannerId = parseInt(sessionStorage.getItem('scanner_id')!);

      // Criar bebê
      const dataNasc = new Date(dataNascimento);
      if (horaNascimento) {
        const [horas, minutos] = horaNascimento.split(':');
        dataNasc.setHours(parseInt(horas), parseInt(minutos));
      }

      const bebeId = await db.bebes.add({
        maeId,
        nome: nomeBebe || undefined,
        dataNascimento: dataNasc,
        createdAt: new Date()
      });

      // Criar sessão de coleta
      const sessaoId = await db.sessoesColeta.add({
        usuarioId: user!.id,
        maeId,
        bebeId,
        scannerId,
        tipoSessao: 'PRIMEIRA_COLETA',
        matchingHabilitado: false,
        dataInicio: new Date(),
        status: 'EM_ANDAMENTO',
        syncStatus: 'PENDENTE',
        createdAt: new Date()
      });

      // Limpar session storage
      sessionStorage.removeItem('mae_id');
      sessionStorage.removeItem('scanner_id');

      toast({
        title: 'Sessão iniciada',
        description: 'Prossiga para a captura das digitais.',
      });

      navigate(`/coleta/sessao/${sessaoId}/captura`);
    } catch (error) {
      toast({
        title: 'Erro ao iniciar sessão',
        description: 'Não foi possível criar a sessão de coleta.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Identificação do Bebê"
        description="Registre os dados do recém-nascido"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Bebê</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeBebe">Nome completo do bebê (opcional)</Label>
            <Input
              id="nomeBebe"
              value={nomeBebe}
              onChange={(e) => setNomeBebe(e.target.value)}
              placeholder="Nome completo do bebê"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaNascimento">Hora de Nascimento *</Label>
            <p className="text-xs text-muted-foreground mb-1">Use as setas ↑↓ para ajustar hora, minuto e segundo</p>
            <TimePickerScroll 
              value={horaNascimento}
              onChange={setHoraNascimento}
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleIniciar} 
              disabled={!dataNascimento || loading}
              className="w-full"
            >
              {loading ? 'Iniciando...' : 'Iniciar Coleta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
