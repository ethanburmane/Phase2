import { calculateDependency,
        calculateRampUpTime,
        calculateReviewPercentage,
        calculateLicenseCompliance
        } from "../src/middleware/metric-calculations";
import axios from 'axios'
import{ calculateNetScore} from '../src/middleware/net-score'
async function main() {
    const githubRepos = [
        'https://github.com/django/django',
        'https://github.com/facebook/react',
        'https://github.com/vuejs/vue',
        'https://github.com/angular/angular',
        'https://github.com/nodejs/node',
        //'https://github.com/tensorflow/tensorflow',
        'https://github.com/kubernetes/kubernetes',
        'https://github.com/twbs/bootstrap',
        'https://github.com/rails/rails',
        'https://github.com/pallets/flask'
    ];

    const npmRepos = [
        'https://www.npmjs.com/package/lodash',
        'https://www.npmjs.com/package/express',
        'https://www.npmjs.com/package/moment',
        'https://www.npmjs.com/package/react-router',
        'https://www.npmjs.com/package/axios',
        'https://www.npmjs.com/package/next',
        'https://www.npmjs.com/package/mongoose',
        'https://www.npmjs.com/package/socket.io',
        'https://www.npmjs.com/package/redux',
        'https://www.npmjs.com/package/chalk'
    ];

    const allRepos = [...githubRepos, ...npmRepos];
    //create dictonary of repos score objects with key being the repo url
    const scoresDictionary = {};
    
    for (const repo of allRepos) {
        let score = await calculateNetScore(repo);
        scoresDictionary[repo] = score; // Store each score with the repo URL as the key
    }

    // After the loop, print out all scores
    for (const [repo, score] of Object.entries(scoresDictionary)) {
        console.log(`Score for ${repo}:`, score);
    }
}
    
    //let licensescore = await calculateLicenseCompliance('https://github.com/django/django')
    //console.log(`NetScore: ${netscore}`)


main()