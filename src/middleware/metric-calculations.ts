// funciton imports
import * as utils from './utils'
import {
  getBusFactorData,
  getCorrectnessData,
  getResponsivenessData,
  getLiscenseComplianceData,
  getDependencyData,
} from '../services/gh-service'
import {fetchAllPullRequests,
checkIfPullRequestReviewed} from '../services/gh-api'

import logger from '../logger'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from "child_process";

// Bus Factor Calculations
export async function calculateBusFactor(url: string) {
  logger.info('Calculating Bus Factor')

  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
    link = link.replace(/\.git$/, '')
  }

  let data = null

  // get data using ./services/gh-service.ts
  if (link) {
    data = await getBusFactorData(link)
  } else {
    return 0
  }

  // get data from returned object
  const {
    criticalContrubitorCommits,
    totalCommits,
    criticalContributorPullRequests,
    totalPullRequests,
  } = data

  logger.debug(
    `criticalContrubitorCommits: ${criticalContrubitorCommits}, totalCommits: ${totalCommits}, criticalContributorPullRequests: ${criticalContributorPullRequests}, totalPullRequests: ${totalPullRequests}`,
  )

  // variable weights
  const commitWeight = 0.4
  const prWeight = 0.6

  // calculate bus factor score
  const critBusFactor =
    criticalContrubitorCommits * commitWeight +
    criticalContributorPullRequests * prWeight

  const totalBusFactor =
    totalCommits * commitWeight + totalPullRequests * prWeight

  let busFactorScore = 1 - critBusFactor / totalBusFactor

  // round to 3 decimal places
  busFactorScore = utils.round(busFactorScore, 3)

  return busFactorScore
}

// Correctness Calculations
export async function calculateCorrectness(url: string) {
  logger.info('Calculating Correctness')

  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
  }

  let data = null

  // get data using ./services/gh-service.ts
  if (link) {
    data = await getCorrectnessData(link)
  } else {
    return 0
  }

  // get data from returned object
  const {closedIssues, openIssues} = data

  logger.debug(`closedIssues: ${closedIssues}, openIssues: ${openIssues}`)

  const totalIssues = closedIssues + openIssues

  if (totalIssues === 0) {
    return 0
  }

  // calculate correctness score
  let correctnessScore = closedIssues / totalIssues

  // round to 3 decimal places
  correctnessScore = utils.round(correctnessScore, 3)

  return correctnessScore
}

// // Ramp-up Time Calculations
// export async function calculateRampUpTime(url: string): Promise<number> {
//   logger.info('Calculating Ramp Up Time');
//   let link: string | null = await utils.evaluateLink(url);
//   if (link) {
//       link = link?.split('github.com').pop() ?? null;
//       link = 'https://github.com' + link;
//   } else {
//       console.error('Invalid URL or unable to process the link.');
//       return 0;
//   }

//   console.log(`Processed link: ${link}`);

//   let localPath: string = 'dist/middleware/cloned-repos';
//   const parts: string[] = url.split('/');
//   const repoName: string = parts[parts.length - 1] || parts[parts.length - 2];

//   if (repoName) {
//       localPath = path.join(localPath, repoName);
//   }

//   try {
      
//       if (!fs.existsSync(localPath)) {
//           console.log(`Creating directory: ${localPath}`);
//           fs.mkdirSync(localPath, { recursive: true });
//           console.log(`Attempting to clone repository into: ${localPath}`);
//           execSync(`git clone ${link} ${localPath}`, { stdio: 'inherit' });
//         } else {
//           console.log(`Directory already exists: ${localPath}`);
//           // Check if the directory is empty
//           const files: string[] = fs.readdirSync(localPath);
//           if (files.length === 0) {
//               console.log(`Directory is empty. Cloning repository into: ${localPath}`);
//               execSync(`git clone ${link} ${localPath}`, { stdio: 'inherit' });
//           }
//       }

      

//       console.log(`Starting line count in: ${localPath}`);
//       let linesOfCode: number = utils.countLinesOfCode(localPath);

//       console.log(`Total lines of code in the repository: ${linesOfCode}`);
//       let rampUpScore = 1
//       if (linesOfCode <= 500) {
//         rampUpScore = 1
//       } else if (linesOfCode <= 1000) {
//         rampUpScore = 0.9
//       } else if (linesOfCode <= 5000) {
//         rampUpScore = 0.8
//       } else if (linesOfCode <= 10_000) {
//         rampUpScore = 0.7
//       } else if (linesOfCode <= 50_000) {
//         rampUpScore = 0.6
//       } else if (linesOfCode <= 100_000) {
//         rampUpScore = 0.5
//       } else if (linesOfCode <= 500_000) {
//         rampUpScore = 0.4
//       } else if (linesOfCode <= 1_000_000) {
//         rampUpScore = 0.1
//       }
//       return rampUpScore;
//   } catch (error: any) {
//       console.error(`An error occurred: ${error.message}`);
//       return 0;
//   }
// }
export async function calculateRampUpTime(url: string): Promise<number> {
  logger.info('Calculating Ramp Up Time');
  let link: string | null = await utils.evaluateLink(url);
  if (link) {
    link = link?.split('github.com').pop() ?? null;
    link = 'https://github.com' + link;
  } else {
    console.error('Invalid URL or unable to process the link.');
    return 0;
  }

  console.log(`Processed link: ${link}`);

  let localPath: string = 'dist/middleware/cloned-repos';
  const parts: string[] = url.split('/');
  const repoName: string = parts[parts.length - 1] || parts[parts.length - 2];
  let rampUpScore = 0;
  if (repoName) {
    localPath = path.join(localPath, repoName);
  }

  try {
    if (!fs.existsSync(localPath)) {
      console.log(`Creating directory: ${localPath}`);
      fs.mkdirSync(localPath, { recursive: true });
    } else {
      console.log(`Directory already exists: ${localPath}`);
      const files: string[] = fs.readdirSync(localPath);
      if (files.length !== 0) {
        console.log(`Directory is not empty. Deleting contents of: ${localPath}`);
        fs.rmSync(localPath, { recursive: true, force: true });
        fs.mkdirSync(localPath, { recursive: true });
      }
    }

    console.log(`Attempting to clone repository into: ${localPath}`);
    execSync(`git clone --depth 1 ${link} ${localPath}`, { stdio: 'inherit' });

    // Additional steps for sparse checkout if needed

    console.log(`Starting line count in: ${localPath}`);
    let linesOfCode: number = utils.countLinesOfCode(localPath);

    console.log(`Total lines of code in the repository: ${linesOfCode}`);
    
    if (linesOfCode <= 500) {
      rampUpScore = 1
    } else if (linesOfCode <= 1000) {
      rampUpScore = 0.9
    } else if (linesOfCode <= 5000) {
      rampUpScore = 0.8
    } else if (linesOfCode <= 10_000) {
      rampUpScore = 0.7
    } else if (linesOfCode <= 50_000) {
      rampUpScore = 0.6
    } else if (linesOfCode <= 100_000) {
      rampUpScore = 0.5
    } else if (linesOfCode <= 500_000) {
      rampUpScore = 0.4
    } else if (linesOfCode <= 1_000_000) {
      rampUpScore = 0.1
    }
    

  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
    return 0;
  } finally {
    // Cleanup: Delete the cloned directory
    if (fs.existsSync(localPath)) {
      console.log(`Deleting directory: ${localPath}`);
      fs.rmSync(localPath, { recursive: true, force: true });
    }
    
  }
  return rampUpScore;
}

// Responsiveness Calculations

export async function calculateResponsiveness(url: string) {
  logger.info('Calculating Responsiveness')

  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
    link = link.replace(/\.git$/, '')
  }

  let data = null

  // get data using ./services/gh-service.ts
  if (link) {
    data = await getResponsivenessData(link)
  } else {
    return 0
  }

  const {monthlyCommitCount, annualCommitCount} = data

  // calculate difference between the max and min monthly commits
  const maxMonthlyCommitCount = Math.max(...monthlyCommitCount)
  const minMonthlyCommitCount = Math.min(...monthlyCommitCount)
  console.log('maxMonthlyCommitCount', maxMonthlyCommitCount)
  console.log('minMonthlyCommitCount', minMonthlyCommitCount)
  const diffCommit = maxMonthlyCommitCount - minMonthlyCommitCount

  logger.debug(
    `maxMonthlyCommitCount: ${maxMonthlyCommitCount}, minMonthlyCommitCount: ${minMonthlyCommitCount}, diffCommit: ${diffCommit}`,
  )

  /* eslint-disable no-implicit-coercion */
  /* eslint-disable no-else-return */

  // assign score based oon difference between max and min monthly commits
  if (diffCommit < annualCommitCount * 0.1) {
    return 1
  } else if (diffCommit < annualCommitCount * 0.2) {
    return 0.9
  } else if (diffCommit < annualCommitCount * 0.3) {
    return 0.8
  } else if (diffCommit < annualCommitCount * 0.4) {
    return 0.7
  } else if (diffCommit < annualCommitCount * 0.5) {
    return 0.6
  } else if (diffCommit < annualCommitCount * 0.6) {
    return 0.5
  } else if (diffCommit < annualCommitCount * 0.7) {
    return 0.4
  } else if (diffCommit < annualCommitCount * 0.8) {
    return 0.3
  } else if (diffCommit < annualCommitCount * 0.9) {
    return 0.2
  } else if (diffCommit < annualCommitCount * 1) {
    return 0.1
  } else {
    return 0
  }
  /* eslint-enable no-else-return */
  /* eslint-enable no-implicit-coercion */
}

// License Compliance Calculations
export async function calculateLicenseCompliance(url: string) {
  logger.info('Calculating License Compliance')
  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
  }

  let licenseCompliantScore = 0

  // get data using ./services/gh-service.ts
  if (link) {
    let readme = await utils.CloneReadme(url);
    let licenses = utils.FindMatch(readme);
    if (licenses.length > 0)
    {
        console.log('true')
        return 1;
    }
    else
    {
        console.log('false')
        return 0;
    }
    //logger.debug(`licenseCompliantScore: ${licenseCompliantScore}`)
  } else {
    return 0
  }

  return licenseCompliantScore
}

export async function calculateDependency(url: string) {
  logger.info('Calculating Dependency')
  console.log('Calculating Dependency')
  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  console.log('link', link);
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
    link = link.replace(/\.git$/, '');
  }
  console.log('link after', link);
  let data = null

  // get data using ./services/gh-service.ts
  if (link) {
    data = await getDependencyData(link)
  } else {
    return 0
  }

  const dev = Object.entries(data);
  const numDep = dev.length
  let numPin = 0;
  for (const [key, value] of dev) {
      let version: string = value as string
      let pinned = utils.isPinned(version)
      console.log(`Dependency: ${key}, Version: ${version}`)
      console.log(utils.isPinned(version));
      if (pinned) { // Check if the property is a direct property of the object
          numPin +=1
      }
  }
  console.log('numPin', numPin);
  console.log('length', dev.length);
  
  // calculate difference between the max and min monthly commits
  if (numPin === 0) {
    return 1.0;
  }else{
    return numPin / numDep;
  }

  /* eslint-disable no-implicit-coercion */
  /* eslint-disable no-else-return */

}


export async function calculateReviewPercentage(url: string): Promise<number> {
  logger.info('Calculating License Compliance')
  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  let reviewPercentage = 0
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
    link = link.replace(/\.git$/, '');
  }
  const repoOwner = link ? link.split('/')[3] : '';
  const repoName = link ? link.split('/')[4] : '';

  try {
      console.log(`Fetching all pull requests for ${repoOwner}/${repoName}`);
      const pullRequests = await fetchAllPullRequests(repoOwner, repoName);
      let reviewedPRCount = 0;
      
      //cut off at 50 pull requests
      if (pullRequests.length > 50) {
        pullRequests.length = 50
      }

      for (const pr of pullRequests) {

          const isReviewed = await checkIfPullRequestReviewed(repoOwner, repoName, pr.number);
          if (isReviewed) {
              reviewedPRCount += 1;
          }
      }

      if (reviewedPRCount == 0) {
        return 0;
      }

      const totalPullRequests = pullRequests.length;
      
    
      reviewPercentage = (reviewedPRCount / totalPullRequests)

      //scale up 
      if (reviewPercentage > 1) {
        reviewPercentage = 1
      }
      

      console.log(`Reviewed Pull Requests: ${reviewedPRCount}`);
      console.log(`Total Pull Requests: ${totalPullRequests}`);
      console.log(`Review Percentage: ${reviewPercentage}`);
      
      return (reviewPercentage);
  } catch (error) {
      console.error(`Error calculating review percentage:`, error);
      return -1;
  }
}