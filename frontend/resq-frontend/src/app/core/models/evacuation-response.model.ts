export interface EvacuationResponse {
  building: string;
  path: string[];
  instructions: string[];
  recommendedExit: string;
  message: string;
}