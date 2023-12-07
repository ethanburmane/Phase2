import logger from '../src/logger';
import * as utils from '../src/middleware/utils';
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

 

function countLinesOfCode(dirPath: string): number {
  const codeExtensions = new Set([
    '.js', '.py', '.java', '.cs', '.php', 
    '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx',
    '.ts', '.rb', '.swift', '.c', 
    '.m', '.mm', '.scala', '.sh', '.bash',
    '.go', '.kt', '.kts', '.r', '.pl', 
    '.rs', '.dart', '.lua', '.txt', '.env', 
    '.config', '.xml', 'Makefile', '.md'
  ]);
  
  const ignoreDirs = new Set(['node_modules', 'data', 'vendor', 'build', 'test','tests', 'docs', 'assets']);
  
  logger.info(`Starting line count in directory: ${dirPath}`);
  let lineCount: number = 0;
  const contents: string[] = fs.readdirSync(dirPath);

  contents.forEach((item: string) => {
      const itemPath: string = path.join(dirPath, item);
      const itemStats = fs.statSync(itemPath);

      if (itemStats.isDirectory()) {
          // Check if the directory should be ignored
          if (!ignoreDirs.has(item)) {
              //console.log(`Traversing directory: ${itemPath}`);
              lineCount += countLinesOfCode(itemPath);
          }
      } else if (codeExtensions.has(path.extname(itemPath))) {
            try {
                const fileContent: string = fs.readFileSync(itemPath, 'utf-8');
                const fileLineCount: number = fileContent.split('\n').length;
                console.log(`Counted ${fileLineCount} lines in file: ${itemPath}`);
                lineCount += fileLineCount;
            } catch (error) {
                console.error(`Error reading file ${itemPath}: ${error.message}`);
            }
        }
    });
    logger.info(`Completed line count in directory: ${dirPath}`);
    return lineCount;
}


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

    if (repoName) {
        localPath = path.join(localPath, repoName);
    }

    try {
        
        if (!fs.existsSync(localPath)) {
            console.log(`Creating directory: ${localPath}`);
            fs.mkdirSync(localPath, { recursive: true });
            console.log(`Attempting to clone repository into: ${localPath}`);
            execSync(`git clone ${link} ${localPath}`, { stdio: 'inherit' });
          } else {
            console.log(`Directory already exists: ${localPath}`);
            // Check if the directory is empty
            const files: string[] = fs.readdirSync(localPath);
            if (files.length === 0) {
                console.log(`Directory is empty. Cloning repository into: ${localPath}`);
                execSync(`git clone ${link} ${localPath}`, { stdio: 'inherit' });
            }
        }

        

        console.log(`Starting line count in: ${localPath}`);
        let linesOfCode: number = countLinesOfCode(localPath);

        console.log(`Total lines of code in the repository: ${linesOfCode}`);

        return linesOfCode;
    } catch (error: any) {
        console.error(`An error occurred: ${error.message}`);
        return 0;
    }
}

async function main(): Promise<void> {
    let url: string = 'https://github.com/facebook/react';
    console.log(`Starting ramp-up time calculation for: ${url}`);
    let linesOfCode: number = await calculateRampUpTime(url);
    console.log(`Result: ${linesOfCode} lines of code`);
}

main();
