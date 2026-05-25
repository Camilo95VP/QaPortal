import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmRequest } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  visible = false;
  message = '';
  private current: ConfirmRequest | null = null;

  constructor(private confirm: ConfirmService) {
    this.confirm.requests$.subscribe(req => this.open(req));
  }

  open(req: ConfirmRequest) {
    this.current = req;
    this.message = req.message;
    this.visible = true;
  }

  accept() {
    if (this.current) this.current.resolve(true);
    this.close();
  }

  cancel() {
    if (this.current) this.current.resolve(false);
    this.close();
  }

  close() {
    this.visible = false;
    this.current = null;
  }
}
