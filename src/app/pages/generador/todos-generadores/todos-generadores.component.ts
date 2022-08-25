import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subscription, timer } from 'rxjs';
import { SolicitudContrato } from 'src/app/models/solicitudContrato';
import { FactoryService } from 'src/app/services/factory.service';

import { ReguladorMercadoService } from 'src/app/services/regulador-mercado.service';
import { Chart, ChartConfiguration, ChartEvent, ChartType,ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {default as Annotation} from '../../../../../node_modules/chartjs-plugin-annotation';
import DatalabelsPlugin from '../../../../../node_modules/chartjs-plugin-datalabels';
import { EthereumService } from 'src/app/services/dashboard/ethereum.service';

import { MatTable, MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { InfoEnergia } from '../../../models/InfoEnergia'
import { InfoPlantaEnergia } from 'src/app/models/InfoPlantaEnergia';
import { BancoEnergiaService } from 'src/app/services/banco-energia.service';
import { GeneradorContractService } from 'src/app/services/generador-contract.service';

export interface PeriodicElement {
  nombre: string;
  tipo: string;
  cantidad: number;
  precio: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {nombre: 'EPM', cantidad: 100, tipo: 'Solar',precio:'2,300.00'},
  {nombre: 'ELECTROHUILA', cantidad: 400, tipo: 'Solar',precio:'2,600.00'},
  {nombre: 'EMCALI', cantidad: 694, tipo: 'Eólica',precio:'1,300.00'},
  {nombre: 'CELSIA', cantidad: 900, tipo: 'Solar',precio:'2,800.00'},
  {nombre: 'AES', cantidad: 1000, tipo: 'Eólica',precio:'2,400.00'}
];



@Component({
  selector: 'app-todos-generadores',
  templateUrl: './todos-generadores.component.html'
})

export class TodosGeneradoresComponent implements OnInit {

  generadores: string[] = [];
  dirContratos: string[] = [];
  dirGeneradores: string[] = [];
  registros: SolicitudContrato[] = [];
  message: string;
  timer$: Observable<any>;
  timerSubscription: Subscription;
  account: string;
  infoGenerador: SolicitudContrato = {} as SolicitudContrato;
  todoGeneradores: SolicitudContrato[] = [];
  tipoMapa = 'Generadores';
  
  plantasDeEnergia: InfoPlantaEnergia[] = [];
  dirContract: string;
  energiasDisponibles: string[] = [];
  
  titlte = "titulo desde generadores";
  departamento;
  panelOpenState = false;

  displayedColumns: string[] = ['Tipo agente', 'Nombre', 'TipoEnergia', 'Cantidad', 'Precio']
  dataSource: MatTableDataSource<InfoEnergia>
  @ViewChild('table', { static: true }) table: MatTable<any>;
  sort: MatSort;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  
  /*
  displayedColumns: string[] = ['nombre', 'cantidad', 'tipo','precio'];
  dataSource = ELEMENT_DATA;
  */

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    //labels: [ 'Solar', 'Eólica' ],
    datasets: [ {
      data: [ 300, 500 ],
      backgroundColor: ['#4C9C2E', '#C2D500'],
      hoverBackgroundColor: ['#4C9C2E','#C2D500'],
      hoverBorderColor: ['#4C9C2E','#C2D500']
      
    } ]
  };

  public pieChartData2: ChartData<'pie', number[], string | string[]> = {
    //labels: [ 'Solar', 'Eólica' ],
    datasets: [ {
      data: [ 300, 500 ],
      backgroundColor: ['#4C9C2E', '#C2D500'],
      hoverBackgroundColor: ['#4C9C2E','#C2D500'],
      hoverBorderColor: ['#4C9C2E','#C2D500']
      
    } ]
  };



  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];
  // events
  public chartClicked({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  changeLabels(): void {
    const words = [ 'hen', 'variable', 'embryo', 'instal', 'pleasant', 'physical', 'bomber', 'army', 'add', 'film',
      'conductor', 'comfortable', 'flourish', 'establish', 'circumstance', 'chimney', 'crack', 'hall', 'energy',
      'treat', 'window', 'shareholder', 'division', 'disk', 'temptation', 'chord', 'left', 'hospital', 'beef',
      'patrol', 'satisfied', 'academy', 'acceptance', 'ivory', 'aquarium', 'building', 'store', 'replace', 'language',
      'redeem', 'honest', 'intention', 'silk', 'opera', 'sleep', 'innocent', 'ignore', 'suite', 'applaud', 'funny' ];
    const randomWord = () => words[Math.trunc(Math.random() * words.length)];
    this.pieChartData.labels = new Array(3).map(_ => randomWord());

    this.chart?.update();
  }

  addSlice(): void {
    if (this.pieChartData.labels) {
      this.pieChartData.labels.push([ 'Line 1', 'Line 2', 'Line 3' ]);
    }

    this.pieChartData.datasets[0].data.push(400);

    this.chart?.update();
  }

  removeSlice(): void {
    if (this.pieChartData.labels) {
      this.pieChartData.labels.pop();
    }

    this.pieChartData.datasets[0].data.pop();

    this.chart?.update();
  }

  changeLegendPosition(): void {
    if (this.pieChartOptions?.plugins?.legend) {
      this.pieChartOptions.plugins.legend.position = this.pieChartOptions.plugins.legend.position === 'left' ? 'top' : 'left';
    }

    this.chart?.render();
  }

  toggleLegend(): void {
    if (this.pieChartOptions?.plugins?.legend) {
      this.pieChartOptions.plugins.legend.display = !this.pieChartOptions.plugins.legend.display;
    }

    this.chart?.render();
  }

  constructor(
    private toastr: ToastrService,
    private bancoEnergia: BancoEnergiaService,
    private generadorService: GeneradorContractService,
    private regulardorMercado: ReguladorMercadoService,
    private ethereumService: EthereumService ) { 
    this.timer$ = timer(0, 1000);
  }

  async ngOnInit(): Promise<void> {
    try {
      //this.isFromInit = true;
      //this.spinner.show();
      await this.regulardorMercado.loadBlockChainContractData();
      //this.spinner.hide();
      this.timerSubscription = this.timer$.subscribe(() => {
        this.regulardorMercado.getContratosRegistrados().subscribe({
          next: (data) => {

            console.log("data desde todos generadores: ",data)
          }, error: (err) => {
            console.log(err);
            this.toastr.error(err.message, 'Error');
          }
        });
      });      
    } catch (error) {
      console.log(error);
      this.toastr.error(error.message, 'Error');
    }
  }

  ngAfterViewInit(): void{
    console.log("Todos generadores emitiendo: ",this.titlte);
    this.ethereumService.TriggerDataChartLine.emit({
      data: {
        datasets: [
          {
            data: [200],
            label: 'Precio ETH (usd)',
            backgroundColor: 'rgba(12,199,132,0.2)',
            borderColor: 'rgba(12,199,132,1)',
            pointBackgroundColor: 'rgba(12,199,132,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(12,199,132,0.8)',
            fill: 'origin',
          },
        ],
        labels: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio','Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'  ]
      }
    })
  }

  dataGenerador(): void {
    //this.registros.filter();
    this.infoGenerador = this.registros.find(element => element.tipoContrato == 2)
    console.log(this.infoGenerador.infoContrato);

    this.registros.forEach(element => {
      if(element.tipoContrato == 2){
        this.todoGeneradores.push(element);
        console.log(this.todoGeneradores);
      } 
    });
    
  }

  //Gráfica
  addItem(newItem: string) {
    this.departamento = newItem;
    console.log("desde todos: ",this.departamento)
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [ 650, 590, 1200, 1140, 1210, 1155, 1400,2065, 1900, 1800, 1750, 1896  ],
        label: 'Energía generada MW',
        backgroundColor: 'rgba(12,199,132,0.2)',
        borderColor: 'rgba(12,199,132,1)',
        pointBackgroundColor: 'rgba(12,199,132,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(12,199,132,0.8)',
        fill: 'origin',
      },
    ],
    labels: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio','Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'  ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.1
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},
      'y-axis-0':
        {
          position: 'left',
        }/*,
      'y-axis-1': {
        position: 'right',
        grid: {
          //color: 'rgba(255,0,0,0.3)',
        },
        ticks: {
          color: 'red'
        }
      }*/
    },

    plugins: {
      legend: { display: true },
    }
  };

  public lineChartType: ChartType = 'line';




  /*
  //Circular
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ [ 'Download', 'Sales' ], [ 'In', 'Store', 'Sales' ], 'Mail Sales' ],
    datasets: [ {
      data: [ 300, 500, 100 ]
    } ]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [ DatalabelsPlugin ];

  // events
  public chartClicked2({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered2({ event, active }: { event: ChartEvent, active: {}[] }): void {
    console.log(event, active);
  }

  changeLabels(): void {
    const words = [ 'hen', 'variable', 'embryo', 'instal', 'pleasant', 'physical', 'bomber', 'army', 'add', 'film',
      'conductor', 'comfortable', 'flourish', 'establish', 'circumstance', 'chimney', 'crack', 'hall', 'energy',
      'treat', 'window', 'shareholder', 'division', 'disk', 'temptation', 'chord', 'left', 'hospital', 'beef',
      'patrol', 'satisfied', 'academy', 'acceptance', 'ivory', 'aquarium', 'building', 'store', 'replace', 'language',
      'redeem', 'honest', 'intention', 'silk', 'opera', 'sleep', 'innocent', 'ignore', 'suite', 'applaud', 'funny' ];
    const randomWord = () => words[Math.trunc(Math.random() * words.length)];
    this.pieChartData.labels = new Array(3).map(_ => randomWord());

    this.chart?.update();
  }

  addSlice(): void {
    if (this.pieChartData.labels) {
      this.pieChartData.labels.push([ 'Line 1', 'Line 2', 'Line 3' ]);
    }

    this.pieChartData.datasets[0].data.push(400);

    this.chart?.update();
  }

  removeSlice(): void {
    if (this.pieChartData.labels) {
      this.pieChartData.labels.pop();
    }

    this.pieChartData.datasets[0].data.pop();

    this.chart?.update();
  }

  changeLegendPosition(): void {
    if (this.pieChartOptions?.plugins?.legend) {
      this.pieChartOptions.plugins.legend.position = this.pieChartOptions.plugins.legend.position === 'left' ? 'top' : 'left';
    }

    this.chart?.render();
  }

  toggleLegend(): void {
    if (this.pieChartOptions?.plugins?.legend) {
      this.pieChartOptions.plugins.legend.display = !this.pieChartOptions.plugins.legend.display;
    }

    this.chart?.render();
  }
  */
}
