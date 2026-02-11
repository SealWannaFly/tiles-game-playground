import {Component, EventEmitter, OnDestroy} from '@angular/core';

@Component({
  selector: 'common-base',
  standalone: true,
  template: '',
  styles: ''
})
export class CommonBase implements OnDestroy {
  protected destroyed$ = new EventEmitter<void>();

  public ngOnDestroy() {
    this.destroyed$.emit();
    this.destroyed$.complete();
  }
}
