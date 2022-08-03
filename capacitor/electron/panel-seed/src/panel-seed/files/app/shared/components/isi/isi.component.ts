import { Component, OnInit } from "@angular/core"

@Component({
  selector: "[app-isi]",
  templateUrl: "./isi.component.html",
  styleUrls: ["./isi.component.scss"],
})
export class IsiComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
      console.log('Hello');
  }
}
