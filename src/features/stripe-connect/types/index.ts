export interface StripeConnectResponse {
  onboardingUrl: string | null;
  accountId:     string;
  status:        'complete' | 'pending';
}