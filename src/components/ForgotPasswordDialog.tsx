import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Recuperar Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Para recuperar sua senha, entre em contato com o administrador do sistema. 
            Para mais informações, fale com o suporte.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Suporte:</p>
            <a 
              href="mailto:matheusaugustooliveira@alunos.utfpr.edu.br" 
              className="text-sm text-primary hover:underline break-all"
            >
              matheusaugustooliveira@alunos.utfpr.edu.br
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
