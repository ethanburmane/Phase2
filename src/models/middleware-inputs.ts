/**
 * Defines the models representing the data inputs to the middleware for calculations.
 */

export interface BusFactorData {
  criticalContrubitorCommits: number
  totalCommits: number
  criticalContributorPullRequests: number
  totalPullRequests: number
}

export interface CorrectnessData {
  closedIssues: number
  openIssues: number
}

export interface ResponsesivenessData {
  monthlyCommitCount: Array<number>
  annualCommitCount: number
}
<<<<<<< Updated upstream
=======

export interface ReviewPercentageData{
  numReviewedPullRequests: number
  numPullRequests: number
}

export interface RampUpData {
  numContributors: number
  numCommits: number
  numPullRequests: number
}
>>>>>>> Stashed changes
