import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AcuerdoEnergia, EstadoAcuerdo } from 'src/app/models/AcuerdoEnergia';

@Component({
  selector: 'app-comprobante-acuerdo',
  templateUrl: './comprobante-acuerdo.component.html'
})
export class ComprobanteAcuerdoComponent implements OnInit {

  nameComercializador: string = '';
  nameGenerador: string = '';
  nameCliente: string = '';
  fechaInicial: string = '';
  fechaFinal: string = '';
  tipoEnergia: string = '';
  cantidadEnergiaTotal: number = 0;
  cantidadEnergiaEntregada: number = 0;

  dataAcuerdo: AcuerdoEnergia;

  constructor(public dialogRef: MatDialogRef<ComprobanteAcuerdoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    ) {
      this.dataAcuerdo = data;
   }

  ngOnInit(): void {
    console.log("COMPROBANTE CUADRO: ",this.dataAcuerdo.dataCliente)
  }

}
