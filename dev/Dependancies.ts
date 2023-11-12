import axios from 'axios'
import {
  BusFactorData,
  CorrectnessData,
  ResponsesivenessData,
  ReviewPercentageData,
} from '../models/middleware-inputs'
import * as ghApi from './gh-api'
import logger from '../logger'


dotenv.config() // load enviroment variables


export async function getDependencies(
  repoUrl: string,
): Promise<Array<{ name: string; version: string }>> {
  logger.info('GH_API: running getDependencies');

  const instance = axios.create({
    baseURL: 'https://api.github.com/repos/',
    timeout: 10000,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const repoOwner = repoUrl.split('/')[3];
  const repoName = repoUrl.split('/')[4];

  try {
    const response = await instance.get(`${repoOwner}/${repoName}/contents/package.json`);
    const packageJson = JSON.parse(Buffer.from(response.data.content, 'base64').toString());

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    const combinedDependencies = {...dependencies, ...devDependencies};

    return Object.entries(combinedDependencies).map(([name, version]) => ({ name, version: version as string }));
  } catch (error) {
    logger.error('GH_API: getDependencies failed', error);
    return [];
  }
}



export async function getDependencyScore(repoUrl: string): Promise<number> {
    logger.info('GH_SERVICE: running getDependencyScore');
  
    // Fetch the list of dependencies from the repo
    const dependencies = await ghApi.getDependencies(repoUrl);
  
    if (dependencies.length === 0) {
      return 1.0; // If no dependencies, score is 1.0
    }
  
    let pinnedCount = 0;
    dependencies.forEach(dep => {
      if (isPinnedToMajorMinor(dep.version)) {
        pinnedCount++;
      }
    });
  
    const score = pinnedCount / dependencies.length;
    return score;
  }
  

