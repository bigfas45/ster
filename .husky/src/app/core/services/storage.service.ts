import { Injectable } from '@angular/core';
import {
  CustomerAccount,
  Bank,
  TransactionCharges,
  DailyTransferLimits,
  Beneficiary,
  AppUser,
} from '../models/transaction.models';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public static CustomerAccounts: Array<CustomerAccount>;
  public static DefaultAccount: string;
  public static Banks: Array<Bank>;
  public static TransferCharges: Array<TransactionCharges>;
  public static TransferChannelOrder: Array<string>;
  public static DailyTransferLimit: Array<DailyTransferLimits>;
  public static UserId: string;
  public static UserDeatils: AppUser;
  public static CifId: string;
  public static CustomerHWTEnabled: boolean;
  public static Benficiaries: Array<Beneficiary>


  private customerAccounts: Array<CustomerAccount> = [];
  set CustomerAccounts(accounts: Array<CustomerAccount>) {
    this.customerAccounts = accounts;
  }

  get CustomerAccounts(): Array<CustomerAccount> {
    return this.customerAccounts;
  }

  private _banks: Array<Bank> = [];
  set Banks(transferCharges: Array<Bank>) {
    this._banks = transferCharges;
  }
  get Banks(): Array<Bank> {
    return this._banks;
  }

  private beneficiaries: Array<Beneficiary> = [];
  set Benficiaries(beneficiaries: Array<Beneficiary>) {
    this.beneficiaries = beneficiaries;
  }
  get Benficiaries(): Array<Beneficiary> {
    return this.beneficiaries;
  }

  private _customerHWTEnabled: boolean;
  set CustomerHWTEnabled(customerHWTEnabled: boolean) {
    this._customerHWTEnabled = customerHWTEnabled;
  }
  get CustomerHWTEnabled(): boolean {
    return this._customerHWTEnabled;
  }

  private transferCharges: Array<TransactionCharges> = [];
  set TransferCharges(transferCharges: Array<TransactionCharges>) {
    this.transferCharges = transferCharges;
  }
  get TransferCharges(): Array<TransactionCharges> {
    return this.transferCharges;
  }

  private userID: String = null;
  set UserID(UserID: String) {
    this.userID = UserID;
  }
  get UserID(): String {
    return this.userID;
  }

  private userDetails: AppUser = null;
  set  UserDeatils( UserDeatils: AppUser) {
    this.userDetails = UserDeatils;
  }
  get  UserDeatils(): AppUser {
    return this.userDetails;
  }

  private cifId: String = null;
  set CifId(cifId: String) {
    this.cifId = cifId;
  }
  get CifId(): String {
    return this.cifId;
  }

  private dailyTransferLimit: Array<DailyTransferLimits> = [];
  set DailyTransferLimit(transferCharges: Array<DailyTransferLimits>) {
    this.dailyTransferLimit = transferCharges;
  }
  get DailyTransferLimit(): Array<DailyTransferLimits> {
    return this.dailyTransferLimit;
  }
}
