import { UntypedFormGroup, UntypedFormBuilder, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClienteContractService } from 'src/app/services/cliente-contract.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { BancoEnergiaService } from 'src/app/services/banco-energia.service';
import { InfoEnergia } from 'src/app/models/InfoEnergia';
import moment from 'moment';


@Component({
  selector: 'app-acuerdo-energia',
  templateUrl: './acuerdo-energia.component.html'
})
export class AcuerdoEnergiaComponent implements OnInit {
  tokensDelegados: number;
  comprarEnergiaForm: FormGroup
  tiposEnergia: InfoEnergia[] = [];
  cantidadCompra: number = 0;
  infoEnergia: string = '';
  fechaFin: string = 'Invalid date';

  constructor(public dialogRef: MatDialogRef<AcuerdoEnergiaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertDialog: SweetAlertService,
    private spinner: NgxSpinnerService,
    private clienteService: ClienteContractService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private bancoEnergia: BancoEnergiaService) {
    this.tokensDelegados = this.data.tokensDelegados;
    this.initForm();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.spinner.show();
      let promises: Promise<void>[] = [];
      promises.push(this.bancoEnergia.loadBlockChainContractData());
      promises.push(this.clienteService.loadBlockChainContractData(this.data.dirContrato));
      await Promise.all(promises);
      this.spinner.hide();

      this.bancoEnergia.getTiposEnergiasDisponibles().subscribe({
        next: (data) => {
          this.tiposEnergia = data;
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.message, 'Error');
        }
      });
    } catch (error) {
      console.log(error);
      this.toastr.error('Error al cargar los datos', error.message);
    }
  }

  initForm() {
    this.comprarEnergiaForm = this.fb.group({
      tipoEnergia: ['', Validators.required],
      cantidadEnergia: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });

    this.comprarEnergiaForm.get('tipoEnergia').valueChanges.subscribe((data: string) => {
      this.infoEnergia = data;
    });
    this.comprarEnergiaForm.get('cantidadEnergia').valueChanges.subscribe((data: string) => {
      this.cantidadCompra = data !== '' ? parseInt(data) : 0;
    });
    this.comprarEnergiaForm.get('fechaFin').valueChanges.subscribe((data: string) => {
      this.fechaFin = data !== '' && data !== undefined ? moment(data).format('DD/MM/YYYY') : 'Invalid date';
    });
  }

  onComprarEnergia() {
    this.alertDialog.confirmAlert('Confirmar', '¿Está seguro de que desea comprar energía?')
      .then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          let infoEnergia = this.comprarEnergiaForm.get('tipoEnergia').value as InfoEnergia;
          let cantidadEnergia = this.comprarEnergiaForm.get('cantidadEnergia').value;
          let fechaFin = moment(this.comprarEnergiaForm.get('fechaFin').value, 'YYYY-MM-DD').hour(23).minute(59).second(59);
          this.clienteService.postComprarEnergia(infoEnergia.nombre, cantidadEnergia, fechaFin.unix()).subscribe({
            next: () => {
              this.spinner.hide();
              this.toastr.success('Emision de compra de energia', 'Éxito');
              this.dialogRef.close();
            }, error: (error) => {
              this.spinner.hide();
              this.toastr.error(error.message, 'Error');
            }
          });
        }
      });
  }

  onCancelar() {
    this.dialogRef.close();
  }

  get isComprarValid(): boolean {
    return this.cantidadCompra > 0 && this.infoEnergia !== '' && this.fechaFin !== 'Invalid date' ? true : false;
  }
}





