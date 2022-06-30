import { Injectable } from '@angular/core';
import { WinRefService } from './win-ref.service';
import Web3 from 'web3';

@Injectable({
  providedIn: 'root'
})
export class Web3ConnectService {

  account: any;
  constructor(private winRef: WinRefService) {
    this.loadWeb3();
   }

   public async loadWeb3() {

    if (this.winRef.window.ethereum) {
      this.winRef.window.web3 = new Web3(this.winRef.window.ethereum);
      try {
        await this.winRef.window.ethereum.enable();

        const web3 = this.winRef.window.web3 as Web3;
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        this.account = accounts[0];
        localStorage.setItem('account',this.account);
        console.log('Web3 injected successfully.');
      } catch (error) {
        console.error(error);
      }
    }else if(this.winRef.window.web3) {
      this.winRef.window.web3 = new Web3(this.winRef.window.web3.currentProvider);
      console.log('Web3 injected successfully.');
    }else{
      window.alert('Please connect to Metamask.');
    }

  }
}
