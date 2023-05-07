import { Injectable } from '@angular/core';
import {
  faGift,
  faVideo,
  faGraduationCap,
  faShirt,
  faCar,
  faMoneyBill,
  faUtensils,
  faNoteSticky,
  faSuitcaseMedical,
  faHotel,
  faBuildingColumns,
  faPiggyBank,
  faArrowRightArrowLeft,
  faPlane,
  faHouse,
  faCarBurst
} from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class TransactionCategoryService {

  giftIcon = faGift;
  videoIcon = faVideo;
  graduationCapIcon = faGraduationCap;
  shirtIcon = faShirt;
  carIcon = faCar;
  moneyBillIcon = faMoneyBill;
  utensilsIcon = faUtensils;
  noteIcon = faNoteSticky;
  medicalIcon = faSuitcaseMedical;
  hotelIcon = faHotel;
  buildingColumnsIcon = faBuildingColumns;
  piggyBankIcon = faPiggyBank;
  transferIcon = faArrowRightArrowLeft;
  planeIcon = faPlane;
  huseIcon = faHouse;
  insuranceIcon = faCarBurst;

  private transactionCategory = [
    {name:'Education', icon: this.graduationCapIcon},
    {name:'Beauty & Clothing', icon: this.shirtIcon},
    {name:'Auto & Transport', icon: this.carIcon},
    {name:'Gifts & Entertainment', icon: this.giftIcon},
    {name:'Cash (ATM & Bank)', icon: this.moneyBillIcon},
    {name:'Food & Dinning', icon: this.utensilsIcon},
    {name:'Bills & Utilities', icon: this.noteIcon},
    {name:'Health & Wellness', icon: this.medicalIcon},
    {name:'Others - CI', icon: this.hotelIcon},
    {name:'Loans', icon: this.buildingColumnsIcon},
    {name:'Savings & Investment', icon: this.piggyBankIcon},
    {name:'Transfer', icon: this.transferIcon},
    {name:'Travel', icon: this.planeIcon},
    {name:'Housing', icon: this.huseIcon},
    {name:'Insurance', icon: this.insuranceIcon}
  ];


  constructor() { }

  getTransactionsCategory() {
    return this,this.transactionCategory.slice();
  }
}
