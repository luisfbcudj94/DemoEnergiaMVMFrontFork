import { InfoReguladorMercado } from './../models/infoReguladorMercado';
import { TiposContratos } from './../models/EnumTiposContratos';
import { InfoContrato } from './../models/infoContrato';
import { SolicitudContrato } from './../models/solicitudContrato';
import { Web3ConnectService } from 'src/app/services/web3-connect.service';
import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import reguladorMercado from "../../../buildTruffle/contracts/ReguladorMercado.json";
import { WinRefService } from './win-ref.service';
import { catchError, from, map, Observable, Subscription, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReguladorMercadoService {

  contract: Contract | undefined;
  account: any;
  adressContract: any;
  ComprandoTokens$: any;
  tokensDevueltos$: any;
  EnviarTokens$: any;
  web3: Web3;
  constructor(private winRef: WinRefService, private web3ConnectService: Web3ConnectService) { }

  async loadBlockChainContractData() {
    await this.web3ConnectService.loadWeb3();
    this.web3 = this.winRef.window.web3 as Web3;

    const networkId = await this.web3.eth.net.getId();
    const networkData = reguladorMercado.networks[networkId];
    if (networkData) {
      const abi = reguladorMercado.abi;
      this.adressContract = networkData.address;
      this.contract = new this.web3.eth.Contract(abi as unknown as AbiItem, this.adressContract);
      this.account = localStorage.getItem('account');
      this.ComprandoTokens$ = this.contract.events.ComprandoTokens();
      this.tokensDevueltos$ = this.contract.events.tokensDevueltos();
      this.EnviarTokens$ = this.contract.events.EnviarTokensEvent();

      localStorage.setItem('addressRegulador', this.adressContract);
    } else {
      window.alert('Esta aplicación no está disponible en este network.');
    }
  }

  getOwner(): Observable<any> {
    return from(this.contract?.methods.owner().call({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  getTokensDisponibles(): Observable<number> {
    return from(this.contract?.methods.TokensDisponibles().call({ from: this.account })).pipe(
      map((data: string) => {
        return parseInt(data);
      })
    );
  }

  postComprarTokens(cantidadTokens: number): Observable<any> {
    let valorToken = this.web3.utils.toWei(cantidadTokens.toString(), 'finney');
    return from(this.contract?.methods.ComprarTokens(cantidadTokens).send({ from: this.account, value: valorToken })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  postDevolverTokens(cantidadTokens: number) {
    return from(this.contract?.methods.DevolverTokens(cantidadTokens).send({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  postGenerarTokens(numTokens: number): Observable<any> {
    return from(this.contract?.methods.GenerarTokens(numTokens).send({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  postDelegarTokens(delegateAddress: string, numTokens: number): Observable<any> {
    return from(this.contract?.methods.delegarTokens(delegateAddress, numTokens).send({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  getTokensDelegados(delegate: string, address: string): Observable<number> {
    return from(this.contract?.methods.getTokensDelegados(delegate).call({ from: address })).pipe(
      map((data: any) => {
        return parseInt(data);
      }), catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  getSolicitudesRegistro(): Observable<SolicitudContrato[]> {
    return from(this.contract?.methods.getSolicitudes().call({ from: this.account })).pipe(
      map((data: any) => {
        let solicitudes = data.map((solicitud: any) => {
          return this.mappingSolicitud(solicitud);
        });
        return solicitudes as SolicitudContrato[];
      }), catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  getContratosRegistrados(): Observable<SolicitudContrato[]> {
    return from(this.contract?.methods.getRegistros().call({ from: this.account })).pipe(
      map((data: any) => {
        let solicitudes = data.map((solicitud: any) => {
          return this.mappingSolicitud(solicitud);
        });
        return solicitudes as SolicitudContrato[];
      }), catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  getInfoRegulador(): Observable<InfoReguladorMercado> {
    return from(this.contract?.methods.getInfoRegulador().call({ from: this.account })).pipe(
      map((data: any) => {
        const [owner, dirContrato, cantidadTokens, nombreToken, simboloToken, valorToken] = data;
        const tempInfoRegulador: InfoReguladorMercado = {
          owner: owner,
          dirContrato: dirContrato,
          cantidadTokens: cantidadTokens,
          nombreToken: nombreToken,
          simboloToken: simboloToken,
          valorToken: parseFloat(this.web3.utils.fromWei(valorToken, 'ether'))
        }
        return tempInfoRegulador;
      }), catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  postRegistrarSolicitud(infoContrato: InfoContrato, tipoContrato: TiposContratos): Observable<any> {
    return from(this.contract?.methods.registrarSolicitud(infoContrato, tipoContrato).send({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  postDiligenciarSolicitud(index: number): Observable<any> {
    return from(this.contract?.methods.diligenciarSolicitud(index).send({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  existeSolicitud(): Observable<boolean> {
    return from(this.contract?.methods.existeSolicitud().call({ from: this.account })).pipe(
      map((data: any) => {
        return data as boolean;
      }), catchError((error) => {
        return throwError(() => new Error(error.message));
      })
    );
  }

  validarUsuario(): Observable<any> {
    return from(this.contract?.methods.validarUsuario().call({ from: this.account })).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }));
  }

  private mappingSolicitud(data: any): SolicitudContrato {
    let tempInfo: InfoContrato = {
      owner: data.infoContrato.owner,
      ciudad: data.infoContrato.ciudad,
      direccion: data.infoContrato.direccion,
      telefono: data.infoContrato.telefono,
      comercializador: data.infoContrato.comercializador,
      contacto: data.infoContrato.contacto,
      correo: data.infoContrato.correo,
      departamento: data.infoContrato.departamento,
      nit: data.infoContrato.nit,
      dirContrato: data.infoContrato.dirContrato,
      empresa: data.infoContrato.empresa,
      tipoComercio: data.infoContrato.tipoComercio
    };
    let tempTipo = data.tipoContrato;
    let solicitudDef: SolicitudContrato = {
      infoContrato: tempInfo,
      tipoContrato: tempTipo,
    }
    return solicitudDef;
  }
}