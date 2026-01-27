import { useQuery } from '@tanstack/react-query';

export interface HistoryEvent {
  id: number;
  callId: number | null;
  serviceId: number | null;
  transactionId: number | null;
  eventType: string;
  description: string;
  userId: number | null;
  userName: string;
  metadata: string | null;
  createdAt: string;
}

export function useCallHistory(callId: number) {
  return useQuery<HistoryEvent[]>({
    queryKey: ['/api/history/call', callId],
    enabled: !!callId,
  });
}

export function useServiceHistory(serviceId: number) {
  return useQuery<HistoryEvent[]>({
    queryKey: ['/api/history/service', serviceId],
    enabled: !!serviceId,
  });
}

export function useTransactionHistory(transactionId: number) {
  return useQuery<HistoryEvent[]>({
    queryKey: ['/api/history/transaction', transactionId],
    enabled: !!transactionId,
  });
}
