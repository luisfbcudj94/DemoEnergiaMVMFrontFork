import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GeneradorFactoryService } from 'src/app/services/generador-factory.service';

@Component({
  selector: 'app-agregar-generador',
  templateUrl: './agregar-generador.component.html',
  styleUrls: ['./agregar-generador.component.css']
})
export class AgregarGeneradorComponent implements OnInit {

  generadorForm: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    private generadorService: GeneradorFactoryService,
    private spinnerService: NgxSpinnerService
  ) {
    this.generadorForm = this.fb.group({
      nombreGenerador: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      await this.generadorService.loadBlockChainContractData();
      console.log("Cargado generador!");
    }
    catch {
      this.toastr.error('Error al cargar el contrato', 'Error');
    }
  }


  guardarGenerador(): void {
    console.log("Guardando generador");
    this.spinnerService.show();
    this.generadorService.agregarGenerador(this.generadorForm.value.nombreGenerador).subscribe({

      next: data => {
        console.log(data);
        this.toastr.success('Generador guardado con éxito', 'Operación exitosa');
        this.generadorForm.reset();
        this.spinnerService.hide();
      },
      error: err => {
        console.log(err);
        this.toastr.error('Error realizando la transacción', 'Error');
        this.generadorForm.reset();
        this.spinnerService.hide();
      }
    });

  }

}
