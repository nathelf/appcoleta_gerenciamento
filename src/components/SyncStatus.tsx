import { useSyncQueue } from '@/hooks/useSyncQueue';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function SyncStatus() {
  const { pendingCount, errorCount } = useSyncQueue();

  if (pendingCount === 0 && errorCount === 0) {
    return (
      <Badge variant="success" className="flex items-center gap-1.5 px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Sincronizado</span>
      </Badge>
    );
  }

  if (errorCount > 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1">
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{errorCount} erro(s)</span>
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1">
      <Clock className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{pendingCount} pendente(s)</span>
    </Badge>
  );
}
