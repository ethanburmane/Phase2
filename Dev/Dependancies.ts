//import * as utils from '../src/middleware/utils'
import {
    getBusFactorData,
    getCorrectnessData,
    getResponsivenessData,
    getLiscenseComplianceData,
    
  } from '../src/services/gh-service'
  import axios from 'axios'
  const dotenv = require('dotenv');

  function isPinned(version): boolean {
      // Regex for an exact version (major.minor.patch)
      const exactVersionRegex = /^\d+\.\d+\.\d+$/;
  
      // Regex for major.minor.x or major.minor.*
      const majorMinorWildcardRegex = /^\d+\.\d+\.(x|\*)$/;
  
      return exactVersionRegex.test(version) || majorMinorWildcardRegex.test(version);
  }
  
  //import { calculateReviewPercentage } from '../src/middleware/metric-calculations'
  async function main() {
    dotenv.config();
    const Token = process.env.GITHUB_TOKEN;
    console.log(Token)
  
    
    const Django = 'https://github.com/django/django'
    console.log(Django)
    const instance = axios.create({
        baseURL: 'https://api.github.com/repos/',
        timeout: 10000,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${Token}`,
        },
    });
    
    const repoOwner = Django.split('/')[3];
    const repoName = Django.split('/')[4];
  
    try {
      const response = await instance.get(`${repoOwner}/${repoName}/contents/package.json`);
      const packageJson = JSON.parse(Buffer.from(response.data.content, 'base64').toString());
  
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      //console.log('dependancies',dependencies);
      
      const combinedDependencies = {...dependencies, ...devDependencies};
      const dev = Object.entries(combinedDependencies);
      console.log('dev',devDependencies); 
      console.log('combined datatype', typeof combinedDependencies);
      console.log('dev datatype', typeof dev);
      console.log('d0', dev[0][1]);
      console.log('d1', dev[1]);
      const d1 = dev[0];
      console.log(isPinned("~1.2.3"));
      console.log(isPinned("1.2.3")); // true (exact version)
      console.log(isPinned("1.2.x")); // true (major and minor pinned, any patch)
      console.log(isPinned("1.2.*"));
  
      let numPin = 0;
      for (const key in dev) {
          let pinned = isPinned(dev[key]);
          console.log('entiry type', typeof dev[key]);
          console.log(`Dependency: ${key}, Version: ${dev[key]}`);
          console.log(isPinned(dev[key]));
          if (pinned) { // Check if the property is a direct property of the object
              numPin +=1
          }
      }
      console.log('numPin', numPin);
      console.log('length', dev.length);
      
      if (numPin === 0) {
          return 1.0;
      }else{
          return numPin / dev.length;
      }
      //return Object.entries(combinedDependencies).map(([name, version]) => ({ name, version: version as string }));
    } catch (error) {
      //logger.error('GH_API: getDependencies failed', error);
      return [];
    }
  
  }
  main();