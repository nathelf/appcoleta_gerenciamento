import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { setTermoAceito, getAuthUser } from '@/lib/auth';
import { FingerprintBackground } from '@/components/FingerprintBackground';

export default function TermoDeUso() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleAccept = () => {
    if (!accepted) {
      toast({
        title: 'Termo não aceito',
        description: 'Você precisa aceitar os termos para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setTermoAceito('1.0');
    toast({
      title: 'Termo aceito',
      description: 'Bem-vindo ao sistema!',
    });
    navigate('/dashboard');
  };

  const handleReject = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#e8e4dc] flex items-center justify-center p-4 relative">
      <FingerprintBackground />
      
      <Card className="w-full max-w-3xl bg-modal/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Termo de Confidencialidade</CardTitle>
          <p className="text-card-foreground/80 mt-2">Versão 1.0 - Sistema de Coleta Biométrica Neonatal</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded border p-4 bg-background/50">
            <div className="space-y-4 text-sm text-foreground">
              <p className="font-semibold">1. OBJETO</p>
              <p>O presente Termo estabelece as condições de confidencialidade para acesso e uso do Sistema de Coleta Biométrica Neonatal.</p>
              
              <p className="font-semibold">2. CONFIDENCIALIDADE</p>
              <p>O usuário compromete-se a manter sigilo absoluto sobre todas as informações obtidas através do sistema, especialmente dados pessoais e biométricos de recém-nascidos e responsáveis.</p>
              
              <p className="font-semibold">3. RESPONSABILIDADES</p>
              <p>O usuário é responsável por:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Manter suas credenciais em sigilo</li>
                <li>Utilizar o sistema apenas para fins autorizados</li>
                <li>Reportar imediatamente qualquer acesso não autorizado</li>
                <li>Seguir todos os protocolos de coleta estabelecidos</li>
              </ul>
              
              <p className="font-semibold">4. LGPD</p>
              <p>Todos os dados coletados seguem as diretrizes da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). O tratamento de dados é realizado com base no consentimento dos responsáveis legais e para finalidades específicas de triagem neonatal.</p>
              
              <p className="font-semibold">5. AUDITORIA</p>
              <p>Todas as ações realizadas no sistema são registradas para fins de auditoria e rastreabilidade, incluindo acessos, coletas e alterações de dados.</p>
              
              <p className="font-semibold">6. PENALIDADES</p>
              <p>O descumprimento deste termo pode resultar em sanções administrativas, civis e criminais, conforme previsto na legislação vigente.</p>
              
              <p className="font-semibold">7. VIGÊNCIA</p>
              <p>Este termo entra em vigor na data de sua aceitação e permanece válido durante todo o período de utilização do sistema.</p>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-4 p-3 rounded bg-background/30">
            <Checkbox id="accept" checked={accepted} onCheckedChange={(checked) => setAccepted(checked as boolean)} />
            <label htmlFor="accept" className="text-sm cursor-pointer text-card-foreground/90 font-medium">
              Eu aceito o termo de CONFIDENCIALIDADE
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleReject} 
            className="flex-1 h-11 font-bold"
          >
            Sair
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted} 
            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            Aceitar e Continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
