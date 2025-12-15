import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Formulario() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const faltantes = (location.state as any)?.faltantes ?? [];

  const [temperatura, setTemperatura] = useState('23.5');
  const [umidade, setUmidade] = useState('55');
  const [tipoMistura, setTipoMistura] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [mostrarJustificativa] = useState(false);

  const [pressaoSensor, setPressaoSensor] = useState('');
  const [comportamentoBebe, setComportamentoBebe] = useState('');
  const [umidadeMao, setUmidadeMao] = useState('');
  const [amamentacao, setAmamentacao] = useState('');
  const [facilidadePosicionar, setFacilidadePosicionar] = useState('');
  const [posicaoBebe, setPosicaoBebe] = useState('');
  const [interferencia, setInterferencia] = useState('');
  const [iluminacao, setIluminacao] = useState('');
  const [aceitacaoFamilia, setAceitacaoFamilia] = useState('');
  const [triagemNeonatal, setTriagemNeonatal] = useState('');

  const handleValidar = async () => {
    if (!temperatura || !umidade || !tipoMistura) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha os campos obrigatórios"
      });
      return;
    }

    if (!pressaoSensor || !comportamentoBebe || !umidadeMao || !amamentacao || 
        !facilidadePosicionar || !posicaoBebe || !interferencia || !iluminacao || 
        !aceitacaoFamilia || !triagemNeonatal) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todas as perguntas do questionário"
      });
      return;
    }

    if (mostrarJustificativa && (!justificativa || justificativa.length < 10)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Informe o motivo da coleta parcial (mínimo 10 caracteres)"
      });
      return;
    }

    try {
      await db.formsColeta.add({
        uuid: crypto.randomUUID(),
        sessaoColetaId: Number(id),
        temperatura: parseFloat(temperatura),
        umidade: parseFloat(umidade),
        tipoMistura,
        questionarioVersao: 'v1.3',
        observacoes: JSON.stringify({
          pressaoSensor,
          comportamentoBebe,
          umidadeMao,
          amamentacao,
          facilidadePosicionar,
          posicaoBebe,
          interferencia,
          iluminacao,
          aceitacaoFamilia,
          triagemNeonatal
        }),
        justificativaParcial: justificativa || null,
        coletaRapida: false,
        createdAt: new Date()
      });

      await db.sessoesColeta.update(Number(id), {
        status: 'CONCLUIDA',
        dataFim: new Date()
      });

      toast({
        title: "Formulário registrado",
        description: "Coleta encerrada com sucesso"
      });

      navigate(`/coleta/sessao/${id}/conclusao`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar formulário"
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: 'Coleta', href: '/coleta/primeira' },
        { label: 'Sessão', href: `/coleta/sessao/${id}` },
        { label: 'Formulário' }
      ]} />
      
      <PageHeader
        title="Formulário Pós-Coleta"
        description="Complete as informações da sessão de coleta"
      />

      {faltantes.length > 0 && (
        <Alert variant="warning" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Captura incompleta</AlertTitle>
          <AlertDescription>
            Dedos sem captura: {faltantes.join(', ')}. Confirme os dados e registre justificativa no campo de observações, se necessário.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Condições Ambientais</CardTitle>
            <CardDescription>
              Registre as condições do ambiente durante a coleta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperatura">Temperatura (°C) *</Label>
                <Input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="umidade">Umidade (%) *</Label>
                <Input
                  id="umidade"
                  type="number"
                  value={umidade}
                  onChange={(e) => setUmidade(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mistura">Tipo de Mistura *</Label>
              <Select value={tipoMistura} onValueChange={setTipoMistura}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mistura 1">Mistura 1</SelectItem>
                  <SelectItem value="Mistura 3">Mistura 3</SelectItem>
                  <SelectItem value="Álcool">Álcool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questionário de Procedimento</CardTitle>
            <CardDescription>
              Responda as perguntas sobre as condições da coleta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>1. Pressão aplicada pelo sensor sobre os dedos *</Label>
              <Select value={pressaoSensor} onValueChange={setPressaoSensor}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve_constante">Leve e constante em todos os dedos</SelectItem>
                  <SelectItem value="leve_variacoes">Predominantemente leve, com pequenas variações</SelectItem>
                  <SelectItem value="irregular">Irregular, variando entre leve e forte</SelectItem>
                  <SelectItem value="forte_maioria">Predominantemente forte na maioria dos dedos</SelectItem>
                  <SelectItem value="forte_constante">Forte e constante em todos os dedos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>2. Comportamento do bebê durante a coleta (sono/estado) *</Label>
              <Select value={comportamentoBebe} onValueChange={setComportamentoBebe}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dormiu_toda">Dormiu durante toda a coleta</SelectItem>
                  <SelectItem value="acordou_calmo">Acordou durante a coleta e permaneceu calmo</SelectItem>
                  <SelectItem value="acordou_agitado">Acordou durante a coleta e ficou agitado</SelectItem>
                  <SelectItem value="acordado_calmo">Permaneceu acordado e calmo durante toda a coleta</SelectItem>
                  <SelectItem value="acordado_agitado">Permaneceu acordado e agitado durante toda a coleta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>3. Umidade da mão do bebê durante a coleta *</Label>
              <Select value={umidadeMao} onValueChange={setUmidadeMao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seca_toda">Pele seca durante toda a coleta</SelectItem>
                  <SelectItem value="suada_seca">Chegou suada, foi seca e permaneceu seca</SelectItem>
                  <SelectItem value="voltou_suar">Chegou suada, foi seca e voltou a suar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>4. Amamentação durante a coleta *</Label>
              <Select value={amamentacao} onValueChange={setAmamentacao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fora_peito">Fora do peito durante toda a coleta</SelectItem>
                  <SelectItem value="amamentou_momento">Amamentou em algum momento da coleta</SelectItem>
                  <SelectItem value="amamentou_toda">Amamentou durante toda a coleta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>5. Facilidade para posicionar os dedos do recém-nascido *</Label>
              <Select value={facilidadePosicionar} onValueChange={setFacilidadePosicionar}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexiveis_imediato">Flexíveis, posicionamento imediato sem resistência</SelectItem>
                  <SelectItem value="flexiveis_tentativas">Flexíveis, posicionamento correto após poucas tentativas</SelectItem>
                  <SelectItem value="rigidez_ajustes">Leve rigidez, exigiu ajustes repetidos para posicionar</SelectItem>
                  <SelectItem value="rigidos_esforco">Rígidos, exigiu esforço para posicionar corretamente</SelectItem>
                  <SelectItem value="fechados">Fechados, impossibilitando o posicionamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>6. Posição do recém-nascido durante a coleta *</Label>
              <Select value={posicaoBebe} onValueChange={setPosicaoBebe}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="berco">Berço</SelectItem>
                  <SelectItem value="colo">Colo (responsável ou profissional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>7. Houve interferência durante a recoleta? *</Label>
              <Select value={interferencia} onValueChange={setInterferencia}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim, houve interferência relevante</SelectItem>
                  <SelectItem value="nao">Não, sem interferências</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>8. Iluminação do ambiente *</Label>
              <Select value={iluminacao} onValueChange={setIluminacao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muito_fraca">Muito fraca (ambiente escuro)</SelectItem>
                  <SelectItem value="fraca">Fraca</SelectItem>
                  <SelectItem value="adequada">Adequada (iluminação regular)</SelectItem>
                  <SelectItem value="forte">Forte</SelectItem>
                  <SelectItem value="muito_forte">Muito forte (ambiente muito claro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>9. Aceitação da família *</Label>
              <Select value={aceitacaoFamilia} onValueChange={setAceitacaoFamilia}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resistencia">Resistência ou desconforto</SelectItem>
                  <SelectItem value="neutra">Aceitação neutra, sem manifestações</SelectItem>
                  <SelectItem value="entusiasmo">Entusiasmo e apoio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>10. Triagem neonatal (Teste do pezinho) *</Label>
              <Select value={triagemNeonatal} onValueChange={setTriagemNeonatal}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_realizado">Não realizado ou sem registro</SelectItem>
                  <SelectItem value="normal">Realizado, resultado dentro da normalidade</SelectItem>
                  <SelectItem value="alteracao">Realizado, alteração detectada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {mostrarJustificativa && (
          <Card className="border-yellow-500/50">
            <CardHeader>
              <CardTitle className="text-yellow-600">Algo de errado aconteceu durante a coleta</CardTitle>
              <CardDescription>
                Justificativa obrigatória para coleta parcial ou rápida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="justificativa" className="text-yellow-600">
                Motivo: *
              </Label>
              <Textarea
                id="justificativa"
                placeholder="Explique o que aconteceu (mínimo 10 caracteres)..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/coleta/sessao/${id}/captura`)}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            variant="outline"
            onClick={handleValidar} 
            className="flex-1"
          >
            Finalizar
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
