/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-console */

// API Endpoint URLs

const PACKAGE_URL =
  'https://5leegcysbh.execute-api.us-east-2.amazonaws.com/beta/package'
const PACKAGES_URL =
  'https://5leegcysbh.execute-api.us-east-2.amazonaws.com/beta/packages'
const RESET_URL =
  'https://5leegcysbh.execute-api.us-east-2.amazonaws.com/beta/reset'

// DOM Elements

const searchInput = document.getElementById('searchInput')
const searchType = document.getElementById('searchType')
const resultsList = document.getElementById('resultsList')
const resultsContainer = document.getElementById('resultsContainer')
const returnPackage = document.getElementById('returnPackage')
const returnRating = document.getElementById('returnRating')
const deletePackage = document.getElementById('deletePackage')
const downloadPackage = document.getElementById('downloadPackage')
const contentInput = document.getElementById('contentInput')
const urlInput = document.getElementById('urlInput')
const uploadButton = document.getElementById('uploadButton')
const updateInput = document.getElementById('updateInput')
const contentUpdateInputLabel = document.getElementById(
  'contentUpdateInputLabel',
)
const urlUpdateInputLabel = document.getElementById('urlUpdateInputLabel')
const contentUpdateInput = document.getElementById('contentUpdateInput')
const urlUpdateInput = document.getElementById('urlUpdateInput')
const updateUploadButton = document.getElementById('updateUploadButton')
const resetButton = document.getElementById('resetButton')
const clearResultsButton = document.getElementById('clearResultsButton')

// Helper Functions

function getNameAndVersion(inputValue) {
  const inputString = inputValue
  const pattern = /^([^,\s]+)(?:,?\s+([^,\s]+))?$/
  const match = inputString.match(pattern)
  if (match) {
    const name = match[1]
    const version = match[2] || ''
    return {name, version}
  }
  return null
}

function getNameVersionID(inputValue) {
  const inputString = inputValue
  const regex = /([^,\s]+)\s*[, ]\s*([^,\s]+)\s*[, ]\s*([^,\s]+)/
  const matches = inputString.match(regex)
  let name = null
  let version = null
  let id = null
  if (matches) {
    ;[, name, version, id] = matches
  }
  return {name, version, id}
}

function searchInputChange() {
  returnPackage.classList.add('hidden')
  returnRating.classList.add('hidden')
  deletePackage.classList.add('hidden')
  downloadPackage.classList.add('hidden')
  if (searchInput.value.length > 0) {
    if (searchType.value === 'all') {
      returnPackage.classList.remove('hidden')
    } else if (searchType.value === 'byName') {
      returnPackage.classList.remove('hidden')
      deletePackage.classList.remove('hidden')
    } else if (searchType.value === 'byID') {
      returnPackage.classList.remove('hidden')
      returnRating.classList.remove('hidden')
      deletePackage.classList.remove('hidden')
      downloadPackage.classList.remove('hidden')
    } else {
      returnPackage.classList.remove('hidden')
    }
  } else {
    returnPackage.classList.add('hidden')
    returnRating.classList.add('hidden')
    deletePackage.classList.add('hidden')
    downloadPackage.classList.add('hidden')
  }
}

function searchTypeChange() {
  if (searchType.value === 'all') {
    searchInput.placeholder =
      'Package Name, [OPTIONAL] Package Version (* for all packages)'
  } else if (searchType.value === 'byName') {
    searchInput.placeholder = 'Package Name'
  } else if (searchType.value === 'byID') {
    searchInput.placeholder = 'Package ID'
  } else {
    searchInput.placeholder = 'Keyword'
  }
  searchInputChange()
}

function clearSearchResults() {
  resultsList.innerHTML = ''
  resultsContainer.classList.add('hidden')
  clearResultsButton.classList.add('hidden')
}

function displaySearchResults(response) {
  resultsContainer.classList.remove('hidden')
  clearResultsButton.classList.remove('hidden')
  let results = null
  results = JSON.parse(response).body
  results.packages.forEach((result) => {
    const resultDiv = document.createElement('div')
    resultDiv.classList.add('home-result-div')

    const nameDiv = document.createElement('div')
    nameDiv.classList.add('home-name-container')
    const nameLabel = document.createElement('span')
    nameLabel.classList.add('home-package-name-label')
    nameLabel.innerText = 'Name:'
    nameDiv.appendChild(nameLabel)
    const name = document.createElement('span')
    name.innerText = result.Name
    nameDiv.appendChild(name)

    const versionDiv = document.createElement('div')
    versionDiv.classList.add('home-version-container')
    const versionLabel = document.createElement('span')
    versionLabel.classList.add('home-package-version-label')
    versionLabel.innerText = 'Version:'
    versionDiv.appendChild(versionLabel)
    const version = document.createElement('span')
    version.innerText = result.Version
    versionDiv.appendChild(version)

    const idDiv = document.createElement('div')
    idDiv.classList.add('home-id-container')
    const idLabel = document.createElement('span')
    idLabel.classList.add('home-package-id-label')
    idLabel.innerText = 'ID:'
    idDiv.appendChild(idLabel)

    const id = document.createElement('span')
    id.innerText = result.ID
    idDiv.appendChild(id)

    resultDiv.appendChild(nameDiv)
    resultDiv.appendChild(versionDiv)
    resultDiv.appendChild(idDiv)

    resultsList.appendChild(resultDiv)
  })
}

function displayID(packageName, packageVersion, packageID) {
  resultsContainer.classList.remove('hidden')
  clearResultsButton.classList.remove('hidden')
  const resultDiv = document.createElement('div')
  resultDiv.classList.add('home-result-div')

  const nameDiv = document.createElement('div')
  nameDiv.classList.add('home-name-container')
  const nameLabel = document.createElement('span')
  nameLabel.classList.add('home-package-name-label')
  nameLabel.innerText = 'Name:'
  nameDiv.appendChild(nameLabel)
  const name = document.createElement('span')
  name.innerText = packageName
  nameDiv.appendChild(name)

  const versionDiv = document.createElement('div')
  versionDiv.classList.add('home-version-container')
  const versionLabel = document.createElement('span')
  versionLabel.classList.add('home-package-version-label')
  versionLabel.innerText = 'Version:'
  versionDiv.appendChild(versionLabel)
  const version = document.createElement('span')
  version.innerText = packageVersion
  versionDiv.appendChild(version)

  const idDiv = document.createElement('div')
  idDiv.classList.add('home-id-container')
  const idLabel = document.createElement('span')
  idLabel.classList.add('home-package-id-label')
  idLabel.innerText = 'ID:'
  idDiv.appendChild(idLabel)
  const id = document.createElement('span')
  id.innerText = packageID
  idDiv.appendChild(id)

  resultDiv.appendChild(nameDiv)
  resultDiv.appendChild(versionDiv)
  resultDiv.appendChild(idDiv)

  resultsList.appendChild(resultDiv)
}

function displayHistory(response) {
  resultsContainer.classList.remove('hidden')
  clearResultsButton.classList.remove('hidden')
  let results = null
  results = JSON.parse(response).body
  results.forEach((result) => {
    const resultDiv = document.createElement('div')
    resultDiv.classList.add('home-result-div')

    const nameDiv = document.createElement('div')
    nameDiv.classList.add('home-name-container')
    const nameLabel = document.createElement('span')
    nameLabel.classList.add('home-package-name-label')
    nameLabel.innerText = 'Name:'
    nameDiv.appendChild(nameLabel)
    const name = document.createElement('span')
    name.innerText = result.PackageMetaData.Name
    nameDiv.appendChild(name)

    const versionDiv = document.createElement('div')
    versionDiv.classList.add('home-version-container')
    const versionLabel = document.createElement('span')
    versionLabel.classList.add('home-package-version-label')
    versionLabel.innerText = 'Version:'
    versionDiv.appendChild(versionLabel)
    const version = document.createElement('span')
    version.innerText = result.PackageMetaData.Version
    versionDiv.appendChild(version)

    const idDiv = document.createElement('div')
    idDiv.classList.add('home-id-container')
    const idLabel = document.createElement('span')
    idLabel.classList.add('home-package-id-label')
    idLabel.innerText = 'ID:'
    idDiv.appendChild(idLabel)

    const id = document.createElement('span')
    id.innerText = result.PackageMetaData.ID
    idDiv.appendChild(id)

    resultDiv.appendChild(nameDiv)
    resultDiv.appendChild(versionDiv)
    resultDiv.appendChild(idDiv)

    resultsList.appendChild(resultDiv)
  })
}

function displayRegExResults(response) {
  resultsContainer.classList.remove('hidden')
  clearResultsButton.classList.remove('hidden')
  let results = null
  results = JSON.parse(response).body
  results.forEach((result) => {
    const resultDiv = document.createElement('div')
    resultDiv.classList.add('home-result-div')

    const nameDiv = document.createElement('div')
    nameDiv.classList.add('home-name-container')
    const nameLabel = document.createElement('span')
    nameLabel.classList.add('home-package-name-label')
    nameLabel.innerText = 'Name:'
    nameDiv.appendChild(nameLabel)
    const name = document.createElement('span')
    name.innerText = result.Name
    nameDiv.appendChild(name)

    const versionDiv = document.createElement('div')
    versionDiv.classList.add('home-version-container')
    const versionLabel = document.createElement('span')
    versionLabel.classList.add('home-package-version-label')
    versionLabel.innerText = 'Version:'
    versionDiv.appendChild(versionLabel)
    const version = document.createElement('span')
    version.innerText = result.Version
    versionDiv.appendChild(version)

    const idDiv = document.createElement('div')
    idDiv.classList.add('home-id-container')
    const idLabel = document.createElement('span')
    idLabel.classList.add('home-package-id-label')
    idLabel.innerText = 'ID:'
    idDiv.appendChild(idLabel)

    const id = document.createElement('span')
    id.innerText = result.ID
    idDiv.appendChild(id)

    resultDiv.appendChild(nameDiv)
    resultDiv.appendChild(versionDiv)
    resultDiv.appendChild(idDiv)

    resultsList.appendChild(resultDiv)
  })
}

function displayRating(packageID, response) {
  resultsContainer.classList.remove('hidden')
  clearResultsButton.classList.remove('hidden')
  const results = JSON.parse(response).body
  console.log('results: ', results)
  const resultDiv = document.createElement('div')
  resultDiv.classList.add('home-result-div')
  const IDDiv = document.createElement('div')
  IDDiv.classList.add('home-rate-id-cont')
  const IDLabel = document.createElement('span')
  IDLabel.classList.add('home-rate-id-label')
  IDLabel.innerText = 'ID:'
  IDDiv.appendChild(IDLabel)
  const ID = document.createElement('span')
  ID.innerText = packageID
  ID.classList.add('home-rate-id')
  IDDiv.appendChild(ID)

  const busFactorDiv = document.createElement('div')
  busFactorDiv.classList.add('home-bus-factor-cont')
  const busFactorLabel = document.createElement('span')
  busFactorLabel.classList.add('home-bus-factor-label')
  busFactorLabel.innerText = 'Bus Factor:'
  busFactorDiv.appendChild(busFactorLabel)
  const busFactor = document.createElement('span')
  busFactor.classList.add('home-bus-factor')
  busFactor.innerText = results.BusFactor
  busFactorDiv.appendChild(busFactor)

  const correctnessDiv = document.createElement('div')
  correctnessDiv.classList.add('home-correctness-cont')
  const correctnessLabel = document.createElement('span')
  correctnessLabel.classList.add('home-correctness-label')
  correctnessLabel.innerText = 'Correctness:'
  correctnessDiv.appendChild(correctnessLabel)
  const correctness = document.createElement('span')
  correctness.classList.add('home-correctness')
  correctness.innerText = results.Correctness
  correctnessDiv.appendChild(correctness)

  const rampUpDiv = document.createElement('div')
  rampUpDiv.classList.add('home-ramp-up-cont')
  const rampUpLabel = document.createElement('span')
  rampUpLabel.classList.add('home-ramp-up-label')
  rampUpLabel.innerText = 'Ramp Up:'
  rampUpDiv.appendChild(rampUpLabel)
  const rampUp = document.createElement('span')
  rampUp.classList.add('home-ramp-up')
  rampUp.innerText = results.RampUp
  rampUpDiv.appendChild(rampUp)

  const responsiveMaintainerDiv = document.createElement('div')
  responsiveMaintainerDiv.classList.add('home-resp-maintain-cont')
  const responsiveMaintainerLabel = document.createElement('span')
  responsiveMaintainerLabel.classList.add('home-resp-maintain-label')
  responsiveMaintainerLabel.innerText = 'Responsive Maintainer:'
  responsiveMaintainerDiv.appendChild(responsiveMaintainerLabel)
  const responsiveMaintainer = document.createElement('span')
  responsiveMaintainer.classList.add('home-resp-maintain')
  responsiveMaintainer.innerText = results.ResponsiveMaintainer
  responsiveMaintainerDiv.appendChild(responsiveMaintainer)

  const licenseDiv = document.createElement('div')
  licenseDiv.classList.add('home-license-cont')
  const licenseLabel = document.createElement('span')
  licenseLabel.classList.add('home-license-label')
  licenseLabel.innerText = 'License:'
  licenseDiv.appendChild(licenseLabel)
  const license = document.createElement('span')
  license.classList.add('home-license')
  license.innerText = results.LicenseScore
  licenseDiv.appendChild(license)

  const goodPinningDiv = document.createElement('div')
  goodPinningDiv.classList.add('home-good-pinning-cont')
  const goodPinningLabel = document.createElement('span')
  goodPinningLabel.classList.add('home-good-pinning-label')
  goodPinningLabel.innerText = 'Good Pinning Practice:'
  goodPinningDiv.appendChild(goodPinningLabel)
  const goodPinning = document.createElement('span')
  goodPinning.classList.add('home-good-pinning')
  goodPinning.innerText = results.GoodPinningPractice
  goodPinningDiv.appendChild(goodPinning)

  const pullRequestDiv = document.createElement('div')
  pullRequestDiv.classList.add('home-pull-request-cont')
  const pullRequestLabel = document.createElement('span')
  pullRequestLabel.classList.add('home-pull-request-label')
  pullRequestLabel.innerText = 'Pull Request:'
  pullRequestDiv.appendChild(pullRequestLabel)
  const pullRequest = document.createElement('span')
  pullRequest.classList.add('home-pull-request')
  pullRequest.innerText = results.PullRequest
  pullRequestDiv.appendChild(pullRequest)

  const netScoreDiv = document.createElement('div')
  netScoreDiv.classList.add('home-net-score-cont')
  const netScoreLabel = document.createElement('span')
  netScoreLabel.classList.add('home-net-score-label')
  netScoreLabel.innerText = 'Net Score:'
  netScoreDiv.appendChild(netScoreLabel)
  const netScore = document.createElement('span')
  netScore.classList.add('home-net-score')
  netScore.innerText = results.NetScore
  netScoreDiv.appendChild(netScore)

  resultDiv.appendChild(IDDiv)
  resultDiv.appendChild(busFactorDiv)
  resultDiv.appendChild(correctnessDiv)
  resultDiv.appendChild(rampUpDiv)
  resultDiv.appendChild(responsiveMaintainerDiv)
  resultDiv.appendChild(licenseDiv)
  resultDiv.appendChild(goodPinningDiv)
  resultDiv.appendChild(pullRequestDiv)
  resultDiv.appendChild(netScoreDiv)

  resultsList.appendChild(resultDiv)
}

function updateInputChange() {
  if (updateInput.value.length > 0) {
    contentUpdateInputLabel.classList.remove('hidden')
    contentUpdateInput.classList.remove('hidden')
    urlUpdateInputLabel.classList.remove('hidden')
    urlUpdateInput.classList.remove('hidden')
  } else {
    contentUpdateInputLabel.classList.add('hidden')
    contentUpdateInput.classList.add('hidden')
    urlUpdateInputLabel.classList.add('hidden')
    urlUpdateInput.classList.add('hidden')
  }
}

function updateUploadChange() {
  if (contentUpdateInput.files.length > 0 || urlUpdateInput.value.length > 0) {
    updateUploadButton.classList.remove('hidden')
  } else {
    updateUploadButton.classList.add('hidden')
  }
}

function uploadChange() {
  if (contentInput.files.length > 0 || urlInput.value.length > 0) {
    uploadButton.classList.remove('hidden')
  } else {
    uploadButton.classList.add('hidden')
  }
}

// Ingestion Endpoint

async function uploadPackage() {
  const ingestion = new XMLHttpRequest()
  ingestion.open('POST', PACKAGE_URL, true)
  ingestion.setRequestHeader('Content-Type', 'application/json')
  ingestion.onreadystatechange = function () {
    if (ingestion.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(ingestion.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 201) {
        urlInput.value = ''
        contentInput.value = ''
        uploadButton.classList.add('hidden')
        alert('Package successfully uploaded')
        console.log(JSON.parse(ingestion.responseText))
      } else {
        const errorMessage = response.body.error
        alert(`Error uploading package\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${ingestion.responseText}`)
      }
    }
  }
  if (contentInput.files.length === 0) {
    const url = urlInput.value
    const data = {
      body: {
        URL: url,
      },
    }
    ingestion.send(JSON.stringify(data))
  } else {
    const content = contentInput.files[0]
    const reader = new FileReader()
    reader.onload = function () {
      function base64FromZip(buffer) {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i += 1) {
          binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
      }
      const buffer = reader.result
      const base64String = base64FromZip(buffer)
      const data = {
        body: {
          Content: base64String,
        },
      }
      ingestion.send(JSON.stringify(data))
    }
    reader.readAsArrayBuffer(content)
  }
}

// Search Endpoint

function searchPackages() {
  const search = new XMLHttpRequest()
  if (searchType.value === 'all') {
    search.open('POST', PACKAGES_URL, true)
  } else if (searchType.value === 'byName') {
    search.open('GET', `${PACKAGE_URL}/byName/${searchInput.value}`, true)
  } else if (searchType.value === 'byID') {
    search.open('GET', `${PACKAGE_URL}/${searchInput.value}`, true)
  } else {
    search.open('POST', `${PACKAGE_URL}/byRegEx`, true)
  }
  search.setRequestHeader('Content-Type', 'application/json')
  search.onreadystatechange = function () {
    if (search.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(search.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        console.log(JSON.parse(search.responseText))
        searchInputChange()
        if (searchType.value === 'byID') {
          const name = response.body.metadata.Name
          const version = response.body.metadata.Version
          const id = response.body.metadata.ID
          displayID(name, version, id)
        } else if (searchType.value === 'byName') {
          displayHistory(search.responseText)
        } else if (searchType.value === 'all') {
          displaySearchResults(search.responseText)
        } else {
          displayRegExResults(search.responseText)
        }
      } else {
        const errorMessage = response.body.error
        alert(`${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${search.responseText}`)
      }
    }
  }
  if (searchType.value === 'all') {
    const {name, version} = getNameAndVersion(searchInput.value)
    let data = {}
    if (name === '*') {
      data = {
        body: [{Name: '*'}],
      }
    } else {
      data = {
        body: [
          {
            Name: name,
            Version: version,
          },
        ],
      }
    }
    search.send(JSON.stringify(data))
  } else if (searchType.value === 'byName') {
    const name = searchInput.value
    const data = {
      Name: name,
    }
    search.send(JSON.stringify(data))
  } else if (searchType.value === 'byID') {
    search.send()
  } else {
    const regex = searchInput.value
    const data = {
      RegEx: regex,
    }
    search.send(JSON.stringify(data))
  }
}

// Rating Endpoint (needs tested)

function ratePackage() {
  const rate = new XMLHttpRequest()
  const id = searchInput.value
  rate.open('GET', `${PACKAGE_URL}/${id}/rate`, true)
  rate.setRequestHeader('Content-Type', 'application/json')
  rate.onreadystatechange = function () {
    if (rate.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(rate.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        console.log(JSON.parse(rate.responseText))
        displayRating(id, rate.responseText)
      } else {
        const errorMessage = response.body.error
        alert(`Error rating package\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${rate.responseText}`)
      }
    }
  }
  const data = {
    ID: id,
  }
  rate.send(JSON.stringify(data))
}

// Delete Endpoint (needs tested)

function deletePackageEvent() {
  const del = new XMLHttpRequest()
  if (searchType.value === 'byName') {
    del.open('DELETE', `${PACKAGE_URL}/byName/${searchInput.value}`, true)
  } else {
    del.open('DELETE', `${PACKAGE_URL}/${searchInput.value}`, true)
  }
  del.setRequestHeader('Content-Type', 'application/json')
  del.onreadystatechange = function () {
    if (del.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(del.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        console.log(JSON.parse(del.responseText))
        alert('Package successfully deleted')
      } else {
        const errorMessage = response.body.error
        alert(`Error deleting package\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${del.responseText}`)
      }
    }
  }

  if (searchType.value === 'byName') {
    const name = searchInput.value
    const data = {
      Name: name,
    }
    del.send(JSON.stringify(data))
  } else {
    const id = searchInput.value
    const data = {
      ID: id,
    }
    del.send(JSON.stringify(data))
  }
}

// Download Endpoint

function downloadContentHelper(content, name) {
  const file = `${name}.zip`
  const byteCharacters = atob(content)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], {type: 'application/zip'})
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = file
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadPackageContent() {
  const download = new XMLHttpRequest()
  download.open('GET', `${PACKAGE_URL}/${searchInput.value}`, true)
  download.setRequestHeader('Content-Type', 'application/json')
  download.onreadystatechange = function () {
    if (download.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(download.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        console.log(JSON.parse(download.responseText))
        downloadContentHelper(
          response.body.data.Content,
          response.body.metadata.Name,
        )
      } else {
        const errorMessage = response.body.error
        alert(`Error downloading package\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${download.responseText}`)
      }
    }
  }

  const id = searchInput.value
  const data = {
    ID: id,
  }
  download.send(JSON.stringify(data))
}

// Update Endpoint (needs testing)

function updatePackage() {
  const update = new XMLHttpRequest()
  const {name, version, id} = getNameVersionID(updateInput.value)
  if (name === null || version === null || id === null) {
    alert('Invalid input')
    return
  }
  update.open('PUT', `${PACKAGE_URL}/${id}`, true)
  update.setRequestHeader('Content-Type', 'application/json')
  update.onreadystatechange = function () {
    if (update.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(update.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        urlUpdateInput.value = ''
        contentUpdateInput.value = ''
        updateUploadButton.classList.add('hidden')
        urlUpdateInputLabel.classList.add('hidden')
        urlUpdateInput.classList.add('hidden')
        contentUpdateInputLabel.classList.add('hidden')
        contentUpdateInput.classList.add('hidden')
        alert('Package successfully updated')
        console.log(JSON.parse(update.responseText))
      } else {
        const errorMessage = response.body.error
        alert(`Error updating package\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${update.responseText}`)
      }
    }
  }

  if (contentUpdateInput.files.length === 0) {
    const updateUrl = urlUpdateInput.value
    const data = {
      metadata: {
        Name: name,
        Version: version,
        ID: id,
      },
      body: {
        URL: updateUrl,
      },
    }
    update.send(JSON.stringify(data))
  } else {
    const content = contentUpdateInput.files[0]
    const reader = new FileReader()
    reader.onload = function () {
      function base64FromZip(buffer) {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i += 1) {
          binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
      }
      const buffer = reader.result
      const base64String = base64FromZip(buffer)
      const data = {
        body: {
          Content: base64String,
        },
      }
      update.send(JSON.stringify(data))
    }
    reader.readAsArrayBuffer(content)
  }
}

// Reset Endpoint

function resetRegistry() {
  const reset = new XMLHttpRequest()
  reset.open('DELETE', RESET_URL, true)
  reset.setRequestHeader('Content-Type', 'application/json')
  reset.onreadystatechange = function () {
    if (reset.readyState === XMLHttpRequest.DONE) {
      const response = JSON.parse(reset.responseText)
      const status = parseInt(response.statusCode, 10)
      if (status === 200) {
        alert('Registry successfully reset')
        console.log(JSON.parse(reset.responseText))
      } else {
        const errorMessage = response.body.error
        alert(`Error resetting registry\n\n${errorMessage} (${status})`)
        console.log(`${status} ERROR: ${reset.responseText}`)
      }
    }
  }
  reset.send()
}

function confirmReset() {
  const confirmation = confirm('Are you sure you want to reset?')
  if (confirmation) {
    resetRegistry()
  }
}

function confirmDelete() {
  const confirmation = confirm('Are you sure you want to delete this package?')
  if (confirmation) {
    deletePackageEvent()
  }
}

// Event Listeners

searchType.addEventListener('change', searchTypeChange)
searchInput.addEventListener('input', searchInputChange)
contentInput.addEventListener('change', uploadChange)
urlInput.addEventListener('input', uploadChange)
uploadButton.addEventListener('click', uploadPackage)
resetButton.addEventListener('click', confirmReset)
returnPackage.addEventListener('click', searchPackages)
returnRating.addEventListener('click', ratePackage)
deletePackage.addEventListener('click', confirmDelete)
downloadPackage.addEventListener('click', downloadPackageContent)
updateInput.addEventListener('input', updateInputChange)
contentUpdateInput.addEventListener('change', updateUploadChange)
urlUpdateInput.addEventListener('input', updateUploadChange)
clearResultsButton.addEventListener('click', clearSearchResults)
updateUploadButton.addEventListener('click', updatePackage)
