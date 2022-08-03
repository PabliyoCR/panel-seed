import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appCursorManager]'
})
export class CursorManagerDirective {

  constructor() { }

  hideCursor = true

  @HostBinding('style')
  elementStyle = 'cursor : none';

  @HostListener('document:keydown.shift.X', ['$event'])
  onKeyDown(e: any) {
    this.hideCursor = !this.hideCursor
    if (this.hideCursor) {
      this.elementStyle = 'cursor : none'
    } else {
      this.elementStyle = ''
    }
  }

}
