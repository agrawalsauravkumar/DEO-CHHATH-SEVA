export type NetworkStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'SYNC_ERROR';

class NetworkServiceManager {
  private status: NetworkStatus =
    typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE';
  private listeners = new Set<(status: NetworkStatus) => void>();
  private started = false;

  private handleOnline = () => {
    this.setStatus('ONLINE');
  };

  private handleOffline = () => {
    this.setStatus('OFFLINE');
  };

  public start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.setStatus(navigator.onLine ? 'ONLINE' : 'OFFLINE');
  }

  public stop(): void {
    if (!this.started || typeof window === 'undefined') return;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.started = false;
  }

  public getStatus(): NetworkStatus {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'OFFLINE';
    return this.status;
  }

  public setStatus(status: NetworkStatus): void {
    const nextStatus =
      typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : status;
    if (nextStatus === this.status) return;
    this.status = nextStatus;
    this.listeners.forEach((listener) => listener(nextStatus));
  }

  public subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }
}

export const NetworkService = new NetworkServiceManager();
