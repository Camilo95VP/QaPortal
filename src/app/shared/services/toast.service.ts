import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() {
    // listen for global custom events (useful for non-Angular helpers)
    window.addEventListener('app:toast', (e: any) => {
      try {
        const d = e.detail || {};
        this.show(d.type || 'info', d.message || '', d.timeout);
      } catch (err) { /* ignore */ }
    });
  }

  show(type: ToastType, message: string, timeout = 5000) {
    const id = Math.random().toString(36).slice(2, 9);
    const list = [...this.toastsSubject.value, { id, type, message, timeout }];
    this.toastsSubject.next(list);
    if (timeout && timeout > 0) setTimeout(() => this.dismiss(id), timeout);
    return id;
  }

  dismiss(id: string) {
    const filtered = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }
}
