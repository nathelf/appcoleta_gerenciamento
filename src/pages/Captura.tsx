import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Settings, Volume2, VolumeX, Zap, FastForward, BookOpen, X, Check, Circle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HandDiagram } from '@/components/HandDiagram';

interface DedoCaptura {
  tipo: 'POLEGAR' | 'INDICADOR' | 'MEDIO' | 'ANELAR' | 'MINDINHO';
  label: string;
  qualidade: number;
  frames: number;
  status: 'pending' | 'capturing' | 'captured' | 'skipped';
}

export default function Captura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [coletaRapida, setColetaRapida] = useState(false);
  const [avancarAuto, setAvancarAuto] = useState(false);
  const [somHabilitado, setSomHabilitado] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [confirmarFinalizarOpen, setConfirmarFinalizarOpen] = useState(false);
  const [hasPendencias, setHasPendencias] = useState(false);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [maoAtual, setMaoAtual] = useState<'DIREITA' | 'ESQUERDA'>('DIREITA');
  const [dedoAtual, setDedoAtual] = useState(0);

  // All fingers of one hand, then the other (polegar, indicador, médio, anelar, mindinho)
  const [dedosDireita, setDedosDireita] = useState<DedoCaptura[]>([
    { tipo: 'POLEGAR', label: 'Polegar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'INDICADOR', label: 'Indicador', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MEDIO', label: 'Médio', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'ANELAR', label: 'Anelar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MINDINHO', label: 'Mindinho', qualidade: 0, frames: 0, status: 'pending' },
  ]);

  const [dedosEsquerda, setDedosEsquerda] = useState<DedoCaptura[]>([
    { tipo: 'POLEGAR', label: 'Polegar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'INDICADOR', label: 'Indicador', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MEDIO', label: 'Médio', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'ANELAR', label: 'Anelar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MINDINHO', label: 'Mindinho', qualidade: 0, frames: 0, status: 'pending' },
  ]);

  const dedosAtuais = maoAtual === 'DIREITA' ? dedosDireita : dedosEsquerda;
  const setDedosAtuais = maoAtual === 'DIREITA' ? setDedosDireita : setDedosEsquerda;

  const dedosFiltrados = coletaRapida 
    ? dedosAtuais.filter(d => d.tipo === 'POLEGAR' || d.tipo === 'INDICADOR')
    : dedosAtuais;

  const dedoAtivo = dedosFiltrados[dedoAtual];

  const simularCaptura = () => {
    const newDedos = [...dedosAtuais];
    const dedoIndex = dedosAtuais.findIndex(d => d.tipo === dedoAtivo.tipo);
    newDedos[dedoIndex].status = 'capturing';
    setDedosAtuais(newDedos);
    
    const interval = setInterval(() => {
      setDedosAtuais(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(d => d.tipo === dedoAtivo.tipo);
        if (updated[idx].qualidade < 100) {
          updated[idx].qualidade += 10;
          updated[idx].frames += 3;
        } else {
          clearInterval(interval);
          updated[idx].status = 'captured';
          
          if (avancarAuto) {
            setTimeout(() => {
              if (dedoAtual < dedosFiltrados.length - 1) {
                setDedoAtual(dedoAtual + 1);
              }
            }, 500);
          }
          
          toast({
            title: "Captura realizada",
            description: `${dedoAtivo.label} da mão ${maoAtual.toLowerCase()} capturado com sucesso`
          });
        }
        return updated;
      });
    }, 300);
  };

  const handleFinalizar = () => {
    const pendentesDireita = dedosDireita.filter((d) => d.status !== 'captured').map((d) => `${d.label} (mão direita)`);
    const pendentesEsquerda = dedosEsquerda.filter((d) => d.status !== 'captured').map((d) => `${d.label} (mão esquerda)`);
    const pendentesOuPulados = [...pendentesDireita, ...pendentesEsquerda];

    setFaltantes(pendentesOuPulados);
    setHasPendencias(pendentesOuPulados.length > 0);
    setConfirmarFinalizarOpen(true);
  };

  const confirmarFinalizacao = () => {
    setConfirmarFinalizarOpen(false);
    navigate(`/coleta/sessao/${id}/captura-pincas`, {
      state: { faltantes },
    });
  };

  const getStatusIcon = (status: DedoCaptura['status']) => {
    switch (status) {
      case 'captured':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'capturing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <X className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalDedosCapturados = 
    dedosDireita.filter(d => d.status === 'captured').length + 
    dedosEsquerda.filter(d => d.status === 'captured').length;

  const totalDedos = coletaRapida ? 4 : 10;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb items={[
          { label: 'Coleta', href: '/coleta/primeira' },
          { label: 'Sessão', href: `/coleta/sessao/${id}` },
          { label: 'Captura' }
        ]} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.removeItem('authUser');
            navigate('/');
          }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-1" />
          Sair
        </Button>
      </div>
      
      <PageHeader
        title="Captura de Digitais"
        description={`Progresso: ${totalDedosCapturados}/${totalDedos} dedos capturados`}
      />

      <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
        {/* First - Hand visualization with both hands */}
        <Card className="p-3 bg-card">
          <h3 className="font-medium mb-2 text-title text-center text-sm">Posição do Dedo</h3>
          <div className="grid grid-cols-2 gap-2">
            <HandDiagram
              hand="DIREITA"
              isActive={maoAtual === 'DIREITA'}
              currentFingerIndex={dedoAtual}
              fingers={dedosDireita}
            />
            <HandDiagram
              hand="ESQUERDA"
              isActive={maoAtual === 'ESQUERDA'}
              currentFingerIndex={dedoAtual}
              fingers={dedosEsquerda}
            />
          </div>
          {/* Legend */}
          <div className="mt-2 text-[10px] text-muted-foreground text-center">
            P=Polegar | I=Indicador | M=Médio | A=Anelar | Mi=Mindinho
          </div>
        </Card>

        {/* Second - Scanner preview (compact) */}
        <Card className="p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-title text-sm">Pré-visualização</h3>
            <Button variant="ghost" size="sm" onClick={() => setConfigOpen(true)} className="h-7 w-7 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {/* Scanner preview - smaller */}
            <div className="relative aspect-[4/3] max-h-28 mx-auto bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">
                {dedoAtivo?.status === 'capturing' ? 'Capturando...' : 'Aguardando'}
              </div>
              <div className="absolute left-1 top-1 bottom-1 w-3 bg-black/50 rounded-full p-0.5">
                <div 
                  className="w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-full transition-all"
                  style={{ height: `${dedoAtivo?.qualidade || 0}%` }}
                />
              </div>
              <div className="absolute left-1 top-1/2 -translate-y-1/2 text-white text-[8px] font-bold w-3 text-center">
                {dedoAtivo?.qualidade || 0}
              </div>
            </div>

            {/* Current finger label */}
            <div className="text-center text-xs font-medium text-title">
              Posicione o {dedoAtivo?.label?.toLowerCase()} {maoAtual === 'DIREITA' ? 'direito' : 'esquerdo'}
            </div>

            {/* Capture button */}
            <Button
              onClick={simularCaptura}
              disabled={dedoAtivo?.status === 'capturing' || dedoAtivo?.status === 'captured'}
              className="w-full bg-button-primary hover:bg-button-primary/90 text-xs h-9"
            >
              {dedoAtivo?.status === 'captured' 
                ? `${dedoAtivo.label} Capturado` 
                : dedoAtivo?.status === 'capturing'
                  ? 'Capturando...'
                  : `Capturar ${dedoAtivo?.label} ${maoAtual === 'DIREITA' ? 'Direito' : 'Esquerdo'}`
              }
            </Button>

            {/* Skip finger */}
            <button
              type="button"
              onClick={() => {
                const newDedos = [...dedosAtuais];
                const dedoIndex = dedosAtuais.findIndex(d => d.tipo === dedoAtivo.tipo);
                newDedos[dedoIndex].status = 'skipped';
                setDedosAtuais(newDedos);
                if (dedoAtual < dedosFiltrados.length - 1) {
                  setDedoAtual(dedoAtual + 1);
                }
              }}
              disabled={dedoAtivo?.status === 'capturing' || dedoAtivo?.status === 'captured' || dedoAtivo?.status === 'skipped'}
              className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50 w-full text-center"
            >
              Pular Dedo
            </button>

            {/* Navigation */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDedoAtual(Math.max(0, dedoAtual - 1))}
                disabled={dedoAtual === 0}
                className="flex-1 text-xs h-7"
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDedoAtual(Math.min(dedosFiltrados.length - 1, dedoAtual + 1))}
                disabled={dedoAtual === dedosFiltrados.length - 1}
                className="flex-1 text-xs h-7"
              >
                Próximo →
              </Button>
            </div>

            {/* Hand selection */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setMaoAtual('DIREITA'); setDedoAtual(0); }}
                className={`flex-1 text-xs h-7 ${maoAtual === 'DIREITA' ? 'bg-accent border-primary' : ''}`}
              >
                Mão Direita
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setMaoAtual('ESQUERDA'); setDedoAtual(0); }}
                className={`flex-1 text-xs h-7 ${maoAtual === 'ESQUERDA' ? 'bg-accent border-primary' : ''}`}
              >
                Mão Esquerda
              </Button>
            </div>

            {/* Finalizar CTA sempre visível */}
            <Button
              onClick={handleFinalizar}
              className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Finalizar captura
            </Button>
          </div>
        </Card>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="bg-modal-bg border-none max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-title">Configurações de Captura</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfigOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">Coleta Rápida</Label>
                  <p className="text-xs text-muted-foreground">
                    Captura apenas Polegar e Indicador
                  </p>
                </div>
              </div>
              <Switch
                checked={coletaRapida}
                onCheckedChange={setColetaRapida}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <FastForward className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">Avanço Automático</Label>
                  <p className="text-xs text-muted-foreground">
                    Avança automaticamente após captura
                  </p>
                </div>
              </div>
              <Switch
                checked={avancarAuto}
                onCheckedChange={setAvancarAuto}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                {somHabilitado ? <Volume2 className="h-5 w-5 text-title" /> : <VolumeX className="h-5 w-5 text-title" />}
                <div>
                  <Label className="text-sm font-medium">Habilitar Som</Label>
                  <p className="text-xs text-muted-foreground">
                    Sinais sonoros durante captura
                  </p>
                </div>
              </div>
              <Switch
                checked={somHabilitado}
                onCheckedChange={setSomHabilitado}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">Manual de Instruções</Label>
                  <p className="text-xs text-muted-foreground">
                    Guia de boas práticas
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Abrir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de finalização mesmo com erros/pêndencias */}
      <Dialog open={confirmarFinalizarOpen} onOpenChange={setConfirmarFinalizarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar captura?</DialogTitle>
            <DialogDescription>
              {hasPendencias
                ? 'Alguns dedos não foram capturados ou apresentaram erro. Deseja finalizar mesmo assim?'
                : 'Deseja finalizar as capturas e avançar?'}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Você poderá revisar no formulário antes de concluir a sessão.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmarFinalizarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarFinalizacao}>
              Tenho certeza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
