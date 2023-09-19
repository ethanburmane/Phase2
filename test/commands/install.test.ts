// import {expect, test} from '@oclif/test'
import fs from 'node:fs'
import {readFileAsync, Install} from '../../src/commands/install'
import logger from '../../src/logger'

describe('readFileAsync', () => {
  it('should read a file successfully', async () => {
    const filePath = './package.json'
    const result = JSON.parse(await readFileAsync(filePath))
    expect(result.dependencies).toBeDefined()
  })

  it('should log an error if file reading fails', async () => {
    // Create a stub for the logger's error method
    // const loggerStub = sinon.stub(logger, 'error')

    // Call the readFileAsync function with a non-existent file path
    const nonExistentFilePath = 'non-existent-file.json'
    let error: any
    try {
      readFileAsync(nonExistentFilePath)
    } catch (error_) {
      error = error_
      await expect(
        readFileAsync(nonExistentFilePath),
      ).rejects.toThrowErrorMatchingSnapshot()
    }
  })
})

describe('run', () => {
  it('should successfully run the install command', async () => {
    const command = Install.run([])

    // Capture the output using a writable stream
    const stdout = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => {})
    const stderr = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => {})

    // Call the async run() function
    await command

    // Restore the original stdout and stderr
    stdout.mockRestore()
    stderr.mockRestore()

    // Check the captured output
    const capturedOutput = stdout.mock.calls.join('\n') // Convert to a string
    expect(capturedOutput).toContain('dependencies installed...')
  })

  // it('should handle errors when reading the file', () => {
  //   // Create a stub for the logger's error method
  //   const loggerStub = sinon.stub(logger, 'error')

  //   const result = test.stdout().command(['install'])

  //   // Assertions
  //   expect(result.stderr).to.contain('Error reading file')
  //   expect(loggerStub.calledOnce).to.be.true
  //   expect(loggerStub.calledWithMatch(sinon.match.instanceOf(Error))).to.be.true

  //   // Restore the stubbed method to its original state
  //   loggerStub.restore()
  // })

  // it('should handle errors when parsing package.json', () => {
  //   // Create a temporary package.json file with invalid JSON for testing
  //   const packagePath = 'test-package.json'
  //   const fileContent = 'invalid-json'

  //   // Write the invalid JSON to the file
  //   fs.writeFile(packagePath, fileContent, (err) => {
  //     if (err) throw err
  //   })

  //   const result:string = test.stdout().command(['install'])

  //   // Assertions
  //   expect(result).to.contain('Error parsing package.json')
  //   expect(result).to.contain('SyntaxError')
  //   expect(result).to.contain('invalid-json')

  //   // Clean up: Delete the temporary file
  //   fs.unlink(packagePath, (err) => {
  //     if (err) throw err
  //   })
  // })
})