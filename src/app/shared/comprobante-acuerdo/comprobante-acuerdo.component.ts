import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable } from 'rxjs';
import { AcuerdoEnergia, EstadoAcuerdo } from 'src/app/models/AcuerdoEnergia';
import { InfoContrato } from 'src/app/models/infoContrato';
import { GeneradorContractService } from 'src/app/services/generador-contract.service';

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

  infoContratoGenerador: InfoContrato = {} as InfoContrato;

  dataAcuerdo: AcuerdoEnergia;

  constructor(public dialogRef: MatDialogRef<ComprobanteAcuerdoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private generadorService: GeneradorContractService,
    ) {
      this.dataAcuerdo = data;
      console.log("data del acuerdo: ",this.dataAcuerdo);
      
   }

  async ngOnInit(): Promise<void> {
    console.log("COMPROBANTE CUADRO: ",this.dataAcuerdo.dataCliente)
    let promises: Promise<void>[] = [];
    promises.push(this.generadorService.loadBlockChainContractData(this.dataAcuerdo[0].dataGenerador.dirContrato));
    await Promise.all(promises);

    this.loadContractInfo();
  }

  private loadContractInfo() {
    let observables: Observable<any>[] = [];
    observables.push(this.generadorService.getInfoContrato());
    this.spinner.show();
    forkJoin(observables).subscribe({
      next: (data: any[]) => {
        this.infoContratoGenerador = data[0] as InfoContrato;
        this.dataAcuerdo[1].contactoGenerador = this.infoContratoGenerador.contacto;
        console.log("INFO GENERADOR: ",this.infoContratoGenerador)
        this.spinner.hide();
      }, error: (error) => {
        this.spinner.hide();
        this.toastr.error(error.message, 'Error');
      }
    });

    
  }

}
