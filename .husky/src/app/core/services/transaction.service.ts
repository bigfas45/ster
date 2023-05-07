import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AddBeneficiaryRequestPayload,
  BeneficiaryListRequestResponse,
  EditBeneficiaryRequestPayload,
  InitiateOtpRequestPayload,
  InitiateOtpResponse,
  NameEnquiryRequestPayload,
  NameEnquiryRequestResponse,
  RemoveBeneficiaryRequestPayload,
  RequestResponse,
  TransactionChargesResponsePayload,
  TransferLimitResponsePayload,
  TransferRequestPayload,
  TransferResponsePayload,
  WalletTransferRequestPayload,
  WesternUnionRedemptionRequestPayload,
} from '../models/transaction.models';
import { StorageService } from './storage.service';
import { TransactionCategoryService } from './transaction-category.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsAPIBaseUrl: string =
    environment.transactionManagementBaseUrl;
  private profileManagementBaseUrl = environment.profileManagementBaseUrl;
  private beneficiaryManagementBaseUrl =
    environment.beneficiaryManagementBaseUrl;
    userId = sessionStorage.getItem('userId');

  constructor(
    private transactionsCategory: TransactionCategoryService,
    private httpClient: HttpClient
  ) {}

  getBanks(): Observable<any> {
    return this.httpClient.post<any>(
      `${this.transactionsAPIBaseUrl}/GetBankList`,
      { UserId: StorageService.UserId }
    );
  }

  getDailyTransferLimit(): Observable<TransferLimitResponsePayload> {
    const userId = StorageService.UserId;
    return this.httpClient.post<any>(
      `${this.transactionsAPIBaseUrl}/GetTransactionLimit`,
      {
        SessionId: 'sample string 1',
        AccountNumber: userId,
        StartDate: '2018-07-15T12:47:30.4494839+01:00',
        EndDate: '2018-07-15T12:47:30.4494839+01:00',
        TransactionCount: 5,
        TransactionOwner: 6,
        UserId: userId,
        transactionType: 'AHP',
      }
    );
  }

  getTransferCharges(): Observable<TransactionChargesResponsePayload> {
    return this.httpClient.post<any>(
      `${this.transactionsAPIBaseUrl}/GetCharges`,
      { UserId: StorageService.UserId }
    );
  }

  doNameEnquiry(
    payload: NameEnquiryRequestPayload
  ): Observable<NameEnquiryRequestResponse> {
    return this.httpClient.post<NameEnquiryRequestResponse>(
      `${this.transactionsAPIBaseUrl}/DoNameEnquiry`,
      payload
    );
  }

  doTransfer(
    payload: TransferRequestPayload
  ): Promise<TransferResponsePayload> {
    return this.httpClient
      .post<TransferResponsePayload>(
        `${this.transactionsAPIBaseUrl}/Transfer`,
        payload
      )
      .toPromise();
  }

  doWalletTransfer(
    payload: WalletTransferRequestPayload
  ): Promise<TransferResponsePayload> {
    return this.httpClient
      .post<TransferResponsePayload>(
        `${this.transactionsAPIBaseUrl}/WalllerTransfer`,
        payload
      )
      .toPromise();
  }

  initiateOtpRequest(
    payload: InitiateOtpRequestPayload
  ): Observable<InitiateOtpResponse> {
    return this.httpClient.post<InitiateOtpResponse>(
      `${this.profileManagementBaseUrl}/InitiateOTPRequest`,
      payload
    );
  }

  validateLoginOTP(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      `https://devtest.stanbicibtc.com:7443/ocelotgateway/api/v1/OneTimePassword/ValidateOtp`,
      payload
    );
  }

  getBeneficiaries(): Observable<any> {
const payload = {
  accountNumber: this.userId
}
    return this.httpClient.post<any>(
      `https://devtest.stanbicibtc.com:7443/ocelotgateway/api/v1/Beneficiary/GetBeneficiary`,
      payload
    );
  }


  getNameEnquiry(): Observable<any> {
    const payload = {
      accountNumber: this.userId
    }
        return this.httpClient.get<any>(
          `https://devtest.stanbicibtc.com:7443/ocelotgateway/api/v1/AccountDetails/getNameEnquiry?CustomerId=0019632945&CustomerIdType=1&BankCode=221&DestinationAccountNo=0034205708&sessionId=1&requestId=1`,
          
        );
      }
  

  addBeneficiary(payload: any): Observable<any> {
    return this.httpClient.post<any>(
      `https://devtest.stanbicibtc.com:7443/ocelotgateway/api/v1/Beneficiary/AddBeneficiary`,
      payload
    );
  }

  editBeneficiary(
    payload: EditBeneficiaryRequestPayload
  ): Observable<RequestResponse> {
    return this.httpClient.post<RequestResponse>(
      `${this.beneficiaryManagementBaseUrl}/EditBeneficiary`,
      payload
    );
  }

  removeBeneficiary(
    payload: RemoveBeneficiaryRequestPayload
  ): Observable<RequestResponse> {
    return this.httpClient.post<RequestResponse>(
      `${this.beneficiaryManagementBaseUrl}/DeleteBeneficiary`,
      payload
    );
  }

  doWesternUnionRedemption(
    payload: WesternUnionRedemptionRequestPayload
  ): Observable<TransferResponsePayload> {
    return this.httpClient.post<TransferResponsePayload>(
      `${this.transactionsAPIBaseUrl}/RedeemWesternUnion`,
      payload
    );
  }
}
