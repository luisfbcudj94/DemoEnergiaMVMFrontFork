import { Web3ConnectService } from 'src/app/services/web3-connect.service';
import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import reguladorMercado from "../../../build/contracts/ReguladorMercado.json";
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

  constructor(private winRef: WinRefService, private web3ConnectService: Web3ConnectService) { }

  async loadBlockChainContractData() {
    await this.web3ConnectService.loadWeb3();
    const web3 = this.winRef.window.web3 as Web3;
    const networkId = await web3.eth.net.getId();
    const networkData = reguladorMercado.networks[networkId];
    if (networkData) {
      const abi = reguladorMercado.abi;
      this.adressContract = networkData.address;
      this.contract = new web3.eth.Contract(abi as unknown as AbiItem, this.adressContract);

      this.ComprandoTokens$ = this.contract.events.ComprandoTokens();
      this.tokensDevueltos$ = this.contract.events.tokensDevueltos();
      this.EnviarTokens$ = this.contract.events.EnviarTokensEvent();

      localStorage.setItem('addressRegulador', this.adressContract);
    } else {
      window.alert('Esta aplicación no está disponible en este network.');
    }
  }

  getTokensDisponibles(): Observable<number> {
    return from(this.contract?.methods.TokensDisponibles().call({ from: this.account })).pipe(
      map((data: string) => {
        return parseInt(data);
      })
    );
  }

  postComprarTokens(cantidadTokens: number): Observable<any> {
    return from(this.contract?.methods.ComprarTokens(cantidadTokens).send({ from: this.account })).pipe(
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

}
