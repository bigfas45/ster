
export enum ResponseCodes {
  SUCCESS = '00',
  LoginSuccessWithLimitedAccess = '02',
  LoginSuccessWithLimitedAccessUnderReview = "11",
  QuestionAndPasswordRegistrationRequired = '04',
  PasswordChangeRequired = '05',
  TechnicalError = "99",
  TransferDynamicRouteFailure = "70",
  FailedSessionOnValidateOTP = '70',
  ResetSessionOnLogin = '800',
  IntellinxChallengeCode = '801',
  SuccessCreditCardAction = '000',
  FailedCreditCardAction = '999',
  TimeoutCreditCard = '202'

}
