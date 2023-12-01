/* eslint-disable no-console */
const postUrl =
  'https://xepn4jkrbf.execute-api.us-east-2.amazonaws.com/beta/package'
const searchBar = document.getElementById('query')
const contentButton = document.getElementById('contentButton')
const uploadButton = document.getElementById('uploadButton')
const urlInput = document.getElementById('urlInput')
const resetButton = document.getElementById('resetButton')

// change this
function submitQuery(event) {
  event.preventDefault()
  const url = `${'https://github.com/search?q='}
    ${document.getElementById('query').value}
    &${'type=repositories'}`
  const win = window.open(url, '_blank')
  win.focus()
}

// function searchPackages() {

// show upload button when package content is selected
function fileUploadChange() {
  if (contentButton.files.length > 0) {
    uploadButton.classList.remove('hidden')
  } else {
    uploadButton.classList.add('hidden')
  }
}

// show upload button when url is input
function urlUploadChange() {
  if (urlInput.value.length > 0) {
    uploadButton.classList.remove('hidden')
  } else {
    uploadButton.classList.add('hidden')
  }
}

// upload package content
function uploadPackage() {
  if (contentButton.files.length === 0) {
    const url = urlInput.value
    const formData = new FormData()
    formData.append('url', url)
    console.log(url)

    fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData,
    })
  } else {
    const file = contentButton.files[0]
    const formData = new FormData()
    formData.append('file', file)
    console.log(file)

    fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData,
    })
  }
}

function resetRegistry() {
  fetch(postUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// TODO: implement delete and reset

// event listeners
searchBar.addEventListener('submit', submitQuery)
contentButton.addEventListener('change', fileUploadChange)
urlInput.addEventListener('input', urlUploadChange)
uploadButton.addEventListener('click', uploadPackage)
resetButton.addEventListener('click', resetRegistry)
