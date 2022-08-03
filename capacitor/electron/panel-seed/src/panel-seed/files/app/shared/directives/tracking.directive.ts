import { Directive, HostListener, Injectable } from "@angular/core";

interface Tracking {
  frame: string;
}

@Directive({
  selector: "[appTracking]"
})

@Injectable()
export class TrackingDirective {
  //private _ipc: IpcRenderer | undefined = void 0;

  constructor() {
    // IPC communication
/*     if (window.require) {
      try {
        this._ipc = window.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('Electron\'s IPC was not loaded');
    } */
  }

  @HostListener('click', ['$event'])
  trackItem(e: any) {
    // e.stopPropagation();
    const trackItem: HTMLElement = e.target.closest("[data-tracking]");
    if (!trackItem) return;

    const trackValue: string = trackItem.dataset["tracking"]!;

    // Tracking
    const trackData: Tracking = {
      frame: trackValue
    }

    //if (!this._ipc) return;

    console.log(trackData);

    try {
      (<any>window).API_ELECTRON.ipcSend('create-tracking', trackData)
    } catch {
      console.log("No se enuentra el servicio ipSend");
    }
  }

  @HostListener('document:keydown.esc', ['$event'])
  onEscDown(e: any) {
    try {
      (<any>window).API_ELECTRON.closeAPP()
    } catch {
      console.log("No se enuentra el servicio ipSend");
    }
  }
}