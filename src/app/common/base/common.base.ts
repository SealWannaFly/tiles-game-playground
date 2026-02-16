import {Component, EventEmitter, Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class CommonBase implements OnDestroy {
  protected destroyed$ = new EventEmitter<void>();

  public ngOnDestroy() {
    this.destroyed$.emit();
    this.destroyed$.complete();
  }
}
