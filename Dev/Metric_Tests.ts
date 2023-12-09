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

    // for (const repo of allRepos) {
    //     let devscore = await calculateDependency(repo);
    //     console.log(`DevScore for ${repo}: ${devscore}`);
    //     let rampUp = await calculateRampUpTime(repo);
    //     console.log(`RampUp for ${repo}: ${rampUp}`);
    //     let review = await calculateReviewPercentage(repo);
    //     console.log(`Review for ${repo}: ${review}`);
    // }
    let netscore = await calculateNetScore('https://github.com/prettier/prettier')
    //let licensescore = await calculateLicenseCompliance('https://github.com/django/django')
    //console.log(`NetScore: ${netscore}`)

}
main()