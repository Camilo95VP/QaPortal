import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmRequest {
  message: string;
  resolve: (ok: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private requests = new Subject<ConfirmRequest>();
  public requests$ = this.requests.asObservable();

  confirm(message: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.requests.next({ message, resolve });
    });
  }
}
