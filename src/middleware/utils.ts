/* eslint-disable no-console */
import * as fs from 'node:fs'
import * as url from 'node:url'
import {exec} from 'node:child_process'
import {getGithubLinkFromNpm} from '../services/gh-service'
import logger from '../logger'
import axios from 'axios'
import * as path from 'path'

export function round(value: number, decimals: number): number {
  logger.info(`Rounding ${value} to ${decimals} decimal places`)

  // rounds number to specified decimal places
  return Number(value.toFixed(decimals))
}

export function identifyLink(link: string) {
  logger.info(`Identifying link type for ${link}`)

  // link pattern for github
  const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/

  // link pattern for npm
  const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[\w.-]+/

  if (githubPattern.test(link)) {
    return 'github'
  }

  if (npmPattern.test(link)) {
    return 'npm'
  }

  return null
}

export async function getLinesOfCode(filePath: string): Promise<number> {
  logger.info(`Getting lines of code for ${filePath}`)

  return new Promise((resolve, reject) => {
    let lineCount = 0

    // open file stream
    const stream = fs.createReadStream(filePath, {encoding: 'utf8'})

    // count the lines of code in file stream
    stream.on('data', (chunk: string) => {
      // Use the corrected regular expression to match newlines
      lineCount += (chunk.match(/(\r\n|\n|\r)/g) || []).length
    })

    stream.on('end', () => {
      resolve(lineCount + 1) // Add 1 to account for the last line without a newline character
      logger.debug(`Lines of code: ${lineCount}`)
    })

    stream.on('error', (err: any) => {
      reject(err)
    })
  })
}

export function parseGHRepoName(repoUrl: string): string | null {
  logger.info(`Parsing GitHub repository name from ${repoUrl}`)

  // Parse the URL
  const parsedUrl = url.parse(repoUrl)

  // Check if the URL is from github.com and has a valid path
  if (
    parsedUrl.hostname === 'github.com' &&
    parsedUrl.path &&
    parsedUrl.path.length > 1 // Ensure there's a path after the hostname
  ) {
    // Extract the repository name (removing leading slash if present)

    const pathComponents = parsedUrl.path.split('/')
    const repoName = pathComponents.pop() // Get the last path component

    return repoName || null
  }

  return null // Not a valid GitHub repository URL
}

export function cloneRepo(ghUrl: string, localPath: string, repoUrl: string) {
  logger.info(`Cloning GitHub repository from ${ghUrl}`)

  // clone repo
  return new Promise<void>((resolve, reject) => {
    exec(`git clone ${repoUrl} ${localPath}`, (error) => {
      if (error) {
        logger.error(`Error cloning repo: ${error}`)
        reject(error)
      } else {
        logger.debug(`Cloned repo to ${localPath}`)
        resolve()
      }
    })
  })
}

export function countLinesOfCode(dirPath: string): number {
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
                console.error(`Error reading file ${itemPath}`);
            }
        }
    });
    logger.info(`Completed line count in directory: ${dirPath}`);
    return lineCount;
}

export function calcRepoLines(
  repoPath: string,
  callback: (totalLines: number) => void,
) {
  logger.info(`Calculating lines of code for ${repoPath}`)
  const excludePatterns = [
    'node_modules', // Exclude the node_modules directory
    'dist', // Exclude the dist directory
    '.*\\.spec\\.ts', // Exclude TypeScript test files with .spec.ts extension
  ]
  // Construct the exclude arguments for cloc
  const excludeArgs = excludePatterns
    .map((pattern) => `--exclude-dir=${pattern}`)
    .join(' ')
  // Define the cloc command with the exclude arguments
  const clocCommand = `cloc ${repoPath} ${excludeArgs}`
  let totalLines = 0

  // Execute the cloc command
  exec(clocCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }

    if (stderr) {
      console.error(`Error: ${stderr}`)
      return
    }

    const lines = stdout.split('\n')
    for (const line of lines) {
      if (line.startsWith('SUM:')) {
        const parts = line.trim().split(/\s+/)
        totalLines = Number.parseInt(parts.at(-1)!, 10)
        callback(totalLines)
        return
      }
    }
  })

  return () => totalLines
}

export async function evaluateLink(link: string) {
  logger.info(`Evaluating link ${link}`)

  // checks whether the link is a github link or npm link
  const linkType = identifyLink(link)
  if (linkType === 'github') {
    return link
  }

  if (linkType === 'npm') {
    return getGithubLinkFromNpm(link)
  }

  return null
}


export function isPinned(version: string): boolean {
  // Regex for an exact version (major.minor.patch)
  const exactVersionRegex = /^\d+\.\d+\.\d+$/;

  // Regex for major.minor.x or major.minor.*
  const majorMinorWildcardRegex = /^\d+\.\d+\.(x|\*)$/;

  return exactVersionRegex.test(version) || majorMinorWildcardRegex.test(version);
}
