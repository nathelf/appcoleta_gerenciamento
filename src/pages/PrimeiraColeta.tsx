import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { getAuthUser } from '@/lib/auth';
import { HelpCircle, Baby } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TimePickerScroll } from '@/components/TimePickerScroll';

export default function PrimeiraColeta() {
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [nomeBebe, setNomeBebe] = useState('');
  const [numeroFilhos, setNumeroFilhos] = useState('1');
  const [dataNascimento, setDataNascimento] = useState('');
  const [horaNascimento, setHoraNascimento] = useState('00:00:00');
  const [scannerId, setScannerId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getAuthUser();

  const scanners = useLiveQuery(() => db.scanners.toArray().then(s => s.filter(scanner => scanner.ativo)));

  // Pre-select the first scanner when available
  useEffect(() => {
    if (scanners && scanners.length > 0 && !scannerId) {
      setScannerId(scanners[0].id!.toString());
    }
  }, [scanners, scannerId]);

  const handleCpfChange = (value: string) => {
    setCpf(formatCPF(value));
  };

  const handleContinuar = async () => {
    if (!nomeMae.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome da mãe é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    // Validar se tem sobrenome (pelo menos 2 palavras)
    const nomePartes = nomeMae.trim().split(/\s+/).filter(p => p.length > 0);
    if (nomePartes.length < 2) {
      toast({
        title: 'Sobrenome obrigatório',
        description: 'É necessário informar o nome completo com sobrenome.',
        variant: 'destructive',
      });
      return;
    }

    if (!dataNascimento) {
      toast({
        title: 'Campo obrigatório',
        description: 'A data de nascimento é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    if (cpf && !validateCPF(cpf)) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, verifique o CPF informado.',
        variant: 'destructive',
      });
      return;
    }

    if (!scannerId) {
      toast({
        title: 'Scanner não selecionado',
        description: 'Selecione um scanner válido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const cpfNumeros = cpf.replace(/\D/g, '');
      let mae;
      
      if (cpfNumeros) {
        mae = await db.maes.where('cpf').equals(cpfNumeros).first();
      }

      if (!mae) {
        // Verificar duplicidade de nome completo (case-insensitive, normalizado)
        const nomeNormalizado = nomeMae.trim().toLowerCase().replace(/\s+/g, ' ');
        const todasMaes = await db.maes.toArray();
        const nomeDuplicado = todasMaes.find(m => 
          m.nome?.toLowerCase().replace(/\s+/g, ' ') === nomeNormalizado
        );

        if (nomeDuplicado) {
          toast({
            title: 'Nome já cadastrado',
            description: `Já existe um cadastro com o nome "${nomeDuplicado.nome}".`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const maeId = await db.maes.add({
          nome: nomeMae.trim(),
          cpf: cpfNumeros || undefined,
          rg: rg || undefined,
          createdAt: new Date()
        });
        mae = await db.maes.get(maeId);
      }

      // Create baby record
      const dataNasc = new Date(dataNascimento);
      if (horaNascimento) {
        const [horas, minutos, segundos] = horaNascimento.split(':');
        dataNasc.setHours(parseInt(horas) || 0, parseInt(minutos) || 0, parseInt(segundos) || 0);
      }

      const bebeId = await db.bebes.add({
        maeId: mae!.id!,
        nome: nomeBebe || undefined,
        dataNascimento: dataNasc,
        numeroFilho: parseInt(numeroFilhos) || 1,
        createdAt: new Date()
      });

      // Create collection session
      const sessaoId = await db.sessoesColeta.add({
        usuarioId: user!.id,
        maeId: mae!.id!,
        bebeId,
        scannerId: parseInt(scannerId),
        tipoSessao: 'PRIMEIRA_COLETA',
        matchingHabilitado: false,
        dataInicio: new Date(),
        status: 'EM_ANDAMENTO',
        syncStatus: 'PENDENTE',
        createdAt: new Date()
      });

      toast({
        title: 'Sessão iniciada',
        description: 'Prossiga para a captura das digitais.',
      });

      navigate(`/coleta/sessao/${sessaoId}/captura`);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível processar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nomeMae.trim().length > 0 && scannerId && dataNascimento;

  return (
    <AppLayout>
      <PageHeader 
        title="Primeira Coleta"
        description="Identificação da mãe, bebê e configuração do scanner"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da Mãe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG (opcional)</Label>
              <Input
                id="rg"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Digite o RG"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeMae">Nome completo da mãe (com sobrenome) *</Label>
            <Input
              id="nomeMae"
              value={nomeMae}
              onChange={(e) => setNomeMae(e.target.value)}
              placeholder="Nome e sobrenome da mãe"
              required
            />
            <p className="text-xs text-muted-foreground">É necessário informar nome e sobrenome</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="numeroFilhos"># Número de Filhos da Coleta *</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Quantidade de bebês nascidos neste parto (ex: gêmeos = 2)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">Quantidade de bebês nascidos neste parto (ex: gêmeos = 2)</p>
            <Select value={numeroFilhos} onValueChange={setNumeroFilhos}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (Parto único)</SelectItem>
                <SelectItem value="2">2 (Gêmeos)</SelectItem>
                <SelectItem value="3">3 (Trigêmeos)</SelectItem>
                <SelectItem value="4">4 ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-4">
        <CardHeader>
          <CardTitle>Configuração do Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scanner">Selecione o scanner *</Label>
            <Select value={scannerId} onValueChange={setScannerId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um scanner" />
              </SelectTrigger>
              <SelectContent>
                {scanners?.map((scanner) => (
                  <SelectItem key={scanner.id} value={scanner.id!.toString()}>
                    {scanner.nome} - {scanner.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {scanners && scanners.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum scanner ativo encontrado.</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleContinuar} 
              disabled={!isFormValid || loading}
              className="w-full"
            >
              {loading ? 'Processando...' : 'Iniciar Coleta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
