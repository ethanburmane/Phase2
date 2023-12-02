import logger from '../src/logger'
import * as utils from '../src/middleware/utils'
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import axios from 'axios';

export async function CloneReadme(url: string) {
  try {
    // Get the README file content from the GitHub API.
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GIT_TOKEN}`,
        Accept: 'application/vnd.github.VERSION.raw', // Use the raw content type
      },
    });

    // Return the README file content as a string.
    return response.data;
  } catch (error: any) {
    throw new Error(error.response ? error.response.data : error.message);
  }
}

function countFilesInDirectory(dirPath: string) {
    let fileCount = 0;
  
    // Read the contents of the directory
    const contents = fs.readdirSync(dirPath);
  
    contents.forEach((item) => {
      const itemPath = path.join(dirPath, item);
  
      // Check if it's a directory
      if (fs.statSync(itemPath).isDirectory()) {
        // If it's a directory, recursively count files in it
        fileCount += countFilesInDirectory(itemPath);
      } else {
        // If it's a file, increment the file count
        fileCount++;
      }
    });
  
    return fileCount;
  }
async function get_num_files(url, location) {
    
    let fileCount = 0;
    const repoPath = location//path.join(__dirname, location); // Specify the directory where you want to clone the repository
    console.log('repoPath', repoPath);

    if (!fs.existsSync(repoPath)) {
        fs.mkdirSync(repoPath);
    }

    try {
        const files = fs.readdirSync(repoPath);
    
        // Check if the directory is not empty
        if (files.length > 0) {
        // Clear the directory by removing all files and subdirectories
            for (const file of files) {
                console.log('removing file');
                const filePath = path.join(repoPath, file);
                const stat = fs.statSync(filePath);
        
                if (stat.isDirectory()) {
                // Remove subdirectories and their contents
                fs.rmSync(filePath, { recursive: true });
                } else {
                // Remove files
                    fs.unlinkSync(filePath);
                }
            }
        }
    
        // Clone the repository
        execSync(`git clone ${url} ${repoPath}`);
        console.log("repo cloned");
        const fileCount = countFilesInDirectory(repoPath);
        console.log("fileCount", fileCount);
        
        //report the number of files in the directory
        
    } catch (error : any) {
        console.error(`An error occurred: ${error.message}`)
    }

    return fileCount;
}


// Ramp-up Time Calculations
export async function calculateRampUpTime(url: string) {
  logger.info('Calculating Ramp Up Time')

  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
  }


  console.log('link', link)
  let ReadMeLen = 0

  // get data using ./services/gh-service.ts
  if (link) {
    // clones the repo into ./cloned-repos
    
    let localPath = 'dist/middleware/cloned-repos'
    const parts: string[] = url.split('/');
    const repoName: string = parts[parts.length - 1] || parts[parts.length - 2]

    console.log('repoName', repoName)
    // format local path name
    if (repoName) {
      localPath = path.join(localPath, repoName)
    }

    // add .git to end of url
    if (!link.endsWith('.git')) {
        // Append '.git' if not present
        link += '.git'
    }

    const README = await CloneReadme(link)
    
    ReadMeLen = README.length
    console.log('ReadMe cloned len: ', ReadMeLen)


    const num_files = await get_num_files(url, localPath)
    console.log('num_files', num_files);
    return num_files
  
  } else {
    return () => 0
  }
}


















async function main() {
    let url = 'https://github.com/django/django'
    let rs = await calculateRampUpTime(url)
}

main();