import { ReguladorMercadoService } from 'src/app/services/regulador-mercado.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { Web3ConnectService } from 'src/app/services/web3-connect.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private web3Service: Web3ConnectService,
    private regulardorMercado: ReguladorMercadoService,
    private spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  async onLogin() {
    try {
      this.spinnerService.show();
      await this.web3Service.loadWeb3();
      await this.regulardorMercado.loadBlockChainContractData();
      this.regulardorMercado.validarUsuario().subscribe({
        next: (data) => {
          debugger;
          if(data[0]){
            this.spinnerService.hide();
            localStorage.setItem('tipoAgente', data[1]);
            this.router.navigate(['/dashboard']);
          }else{
            this.spinnerService.hide();
            this.router.navigate(['/register']);
          }          
        }, error: (err) => {
          debugger;
          console.log(err);
          this.spinnerService.hide();
          this.toastr.error('Error al validar usuario', 'Error');
        }
      });
    } catch (error) {

      this.spinnerService.hide();
      this.toastr.error(error.message, 'Error');
    }

  }

}

