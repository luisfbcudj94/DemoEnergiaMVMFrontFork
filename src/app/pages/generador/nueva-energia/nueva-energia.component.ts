import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GeneradorContractService } from 'src/app/services/generador-contract.service';
import { ReguladorMercadoService } from 'src/app/services/regulador-mercado.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';


@Component({
  selector: 'app-nueva-energia',
  templateUrl: './nueva-energia.component.html'
})
export class NuevaEnergiaComponent implements OnInit {

  nombreEnergia: string;
  cantidadEnergia: number;

  constructor(public dialogRef: MatDialogRef<NuevaEnergiaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reguladorMercado: ReguladorMercadoService,
    private generadorContract: GeneradorContractService,
    private alertDialog: SweetAlertService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) { }

  async ngOnInit() {
    await this.generadorContract.loadBlockChainContractData();
  }

  onCrearNuevaEnergia() {
    this.alertDialog.confirmAlert('Crear nueva energía', '¿Está seguro de crear la energía?').then(res => {
      if (res.isConfirmed) {
        this.spinner.show();

        this.generadorContract.postCrearNuevaEnergia(this.nombreEnergia,this.cantidadEnergia).subscribe(
          {
            next: () => {
              this.spinner.hide();
              this.dialogRef.close();
              this.toastr.success('¡Energía agregada con éxito!');
            },
            error: (err) => {
              this.spinner.hide();
              console.log(err);
              this.toastr.error(err.message, 'Error');
              this.dialogRef.close();
            }
          }
        );
      }
    })
  }

}
