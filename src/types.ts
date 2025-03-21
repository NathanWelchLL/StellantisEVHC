import { Database } from './database.types'

export type FormData = {
  name: string;
  role: string;
  retailerName: string;
  email: string;
  interestedInEVHC: string;
  question?: string;
  // New fields
  currentProcess: string;
  processEffectiveness: number;
  challenges: string[];
  missedOpportunities: string;
  automationInterest: string;
  automationInterestComments: string;
  valuableFeatures: string[];
  expectedBenefits: string[];
  investmentWillingness: string;
  hasConcerns: string; // Changed from concerns to hasConcerns
  concernDetails: string; // Added new field for concern details
  evhcProvider: string; // New field for eVHC provider
  otherEvhcProvider: string; // New field for other eVHC provider
  additionalFeedback: string;
}

export type Retailer = Database['public']['Tables']['retailers']['Row']
export type FormSubmission = Database['public']['Tables']['form_submissions']['Row']