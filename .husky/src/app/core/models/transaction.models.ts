
export interface NameEnquiryRequestPayload {
  UserId: string;
  destinationAccountNo: string;
  destinationBankCode: string;
  transferMedium: Number;
  sourceAccountNo: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface TransactionCharges {
  StartAmount: number;
  EndAmount: number;
  Charges: number;
}

export interface Country {
  code: string;
  isoCode: string;
  countryName: string;
}

export interface UserRole {
  UserId: string;
  roles: 0;
  menus?: Array<string>;
  menuProfile?: string;
}

export interface AppUser {
  LastLoginIn: string;
  CifId: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  PinStatus: string;
  accountOfficerName: string;
  accountEmail: string;
  BVN?: string;
  BearerToken: string;
  SessionId: string;
  Reference: string;
  NotificationType: string;
  NotificationAddress: string;
  transactionId: string;
  QuestionDetailList?: any[];
  Token: string;
  UserId?: string;
  Role: UserRole;
  MenuProfile: string;


  LimitedAccess: boolean;
  LoginStatus: string;
  AuthPassForChange: string;


  YPSFlixDescription: string;
  OTPResponseDescription: string;
  OTPNotificationAddress: string;
  OTPNotificationType: string;
  Firstname: string;
  Lastname: string;
  AccountOfficerEmail: string;
  AccountOfficerName: string;
}

export interface WesternUnionRedemptionRequestPayload {
  amount: number;
  amountValue: number;
  testAnswer: string;
  creditAcct: string;
  mtcnNumber: string;
  redemptionCurrency: string;
  redemptionCountryCode: string;
  mobilePhoneNo: string;
  otp: string;
  SessionId: string;
  userId: string;
  SourceReferenceId: string;
  lastname: string;
  firstname: string;
  Status?: string;
  Checksum?: string;
  CreatedDate?: string;
  ApprovalRules?: any[];
  Id?: string;
}



export interface Beneficiary {
  beneficiaryAlias: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  beneficiaryBankCode: string;
  beneficiaryReference: string;
  customerReference: string;
  beneficiaryId: string;
  groupId: string;
  color?: string;
  checked?: boolean;
  Id: number;
}

export interface EditBeneficiaryRequestPayload {
  sessionId: string;
  UserId: string;
  beneficiaryReference: string;
  OTP: string;
  oBeneficiaryId: string;
  nBeneficiaryId: string;
  SourceReferenceId: string; // otpReference
  customerReference: string;
}

export interface DailyTransferLimits {
  currency: string;
  dailyLimitsAvailable: number;
  totalDailyLimits: number;
  limitApplicable: string;
}

export class DailyTransferLimits {
  currency: string;
  dailyLimitsAvailable: number;
  totalDailyLimits: number;
  limitApplicable: string;
}

export interface CustomerAccount {
  accountNumber: string;
  accountName: string;
  debitAllowed: boolean;
  creditAllowed: boolean;
  accountType: string;
  accountCategory: string;
  effectiveBalance: number;
  availableBalance: number;
  currency: string;
  isNICard? : boolean;
  PanMasked? : string;
  Foracid?:string;
  ExpDate?:string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface OtpRequestResponse {
  ResponseCode: string;
  ResponseDescription: string;
  NotificationAddress: string;
  NotificationType: string;
  ResponseFriendlyMessage: string;
}

export interface Beneficiary {
  beneficiaryAlias: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  beneficiaryBankCode: string;
  beneficiaryReference: string;
  customerReference: string;
  beneficiaryId: string;
  groupId: string;
  color?: string;
  checked?: boolean;
  Id: number;
}

export interface WalletTransferRequestPayload {
  amount: Number;
  beneficiaryReference: string;
  customerReference: string;
  destinationAccountName: string;
  destinationAccountNo: string;
  destinationBankCode: string;
  otp: string;
  recurrent: string;
  returnTranId: boolean;
  sessionId: string;
  sourceAccountName: string;
  sourceAccountNo: string;
  sourceRefId: string;
  transferDate: string; // 2018-11-14
  transferMedium: number;
  transferType: string; // ONE-OFF
  userId: string;
  firstTransferDate?: string;
  totalInstructionCount?: string;
  intervalType?: string;
}

export interface TransferRequestPayload {
  sourceAccountNo: string;
  sourceAccountName: string;
  destinationAccountNo: string;
  destinationAccountName: string;
  destinationBankCode: string;
  transferMedium: number;
  amount: any;
  transferDate: string;
  sessionId: string;
  otp: string;
  transferType: string;
  userId: string;
  beneficiaryReference: string;
  customerReference: string;
  recurrent: boolean;
  sourceRefId: string;
  firstTransferDate?: string;
  totalInstructionCount?: number;
  intervalType?: string;
  returnTranId: boolean;
  operationType?: string;
  Checksum?: string;
  Id?: number;
  IsWalletCollectionTransfer?: boolean;

  DeviceCookie?: string;
  DeviceUUID?: string;
  ClientTimeZone?: string;
  IsSuccessfulTransfer?: boolean;
  IsLocalCookie?: boolean;
  AvailableBalance?: number;
  LoginSessionId?: string;
  OTPType?:number;
}

export interface TransferResponsePayload {
  amount: number;
  transactionId: string;
  XCck?:string;
  XTranId?:string;
  XFLRE?: boolean;
  Data?:any;
  ResponseCode: string;
  ResponseDescription: string;
  ResponseFriendlyMessage?: string;
}

export interface OtpRequestResponse {
  ResponseCode: string;
  ResponseDescription: string;
  NotificationAddress: string;
  NotificationType: string;
  ResponseFriendlyMessage: string;
}

export interface TransactionCharges {
  StartAmount: number;
  EndAmount: number;
  Charges: number;
}

export interface InitiateOtpRequestPayload {
  UserId: string;
  ReasonCode: string;
  CifId?: string;
  reasonDescription?: string;
  ReasonDescription?: string;
  NoCif?: boolean;
}

export interface InitiateOtpResponse {
  ResponseCode: string;
  ResponseDescription: string;
  NotificationAddress: string;
  NotificationType: string;
  ResponseFriendlyMessage: string;
}

export interface TransactionChargesResponsePayload {
  ResponseCode: string;
  ResponseFriendlyMessage: string;
  Charges: Array<TransactionCharges>;
}

export interface NameEnquiryRequestPayload {
  UserId: string;
  destinationAccountNo: string;
  destinationBankCode: string;
  transferMedium: Number;
  sourceAccountNo: string;
  isVbCollectionAccount?: number;
}

export interface NameEnquiryRequestResponse {
  destinationAccountName: string;
  ResponseCode: string;
  ResponseDescription: string;
  ResponseFriendlyMessage: string;
  Reference: string;
  NotificationType: string;
  NotificationAddress: string;
  transactionId: string;
  QuestionDetailList: any[];
}

export interface TransferLimitResponsePayload {
  ResponseCode: string;
  ResponseDescription: string;
  LimitDataRecords: any;
}

export interface BeneficiaryListRequestResponse {
  ResponseCode: string;
  ResponseDescription: string;
  ResponseFriendlyMessage: string;
  Beneficiaries: Beneficiary[];
  color?: string;
  checked?: boolean;
}

export interface AddBeneficiaryRequestPayload {
  sessionId: string;
  UserId: string;
  beneficiaryAlias: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  beneficiaryBankCode: string;
  beneficiaryReference: string;
  customerReference: string;
  otp: string;
  otpReference: string;
  beneficiaryEmailAddress: string;
}

export interface AddBeneficiaryRequestPayload {
  sessionId: string;
  UserId: string;
  beneficiaryAlias: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryBank: string;
  beneficiaryBankCode: string;
  beneficiaryReference: string;
  customerReference: string;
  otp: string;
  otpReference: string;
  beneficiaryEmailAddress: string;
}

export interface RequestResponse {
  ResponseCode: string;
  ResponseFriendlyMessage: string;
}

export interface RemoveBeneficiaryRequestPayload {

  UserId: string;
  OTP: string;
  BeneficiaryId: string;
  SourceReferenceId: string;
  SessionId: string;
}




