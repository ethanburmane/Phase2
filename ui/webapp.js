const postUrl =
  'https://xepn4jkrbf.execute-api.us-east-2.amazonaws.com/beta/package'
// const searchBar = document.getElementById('query')
const contentButton = document.getElementById('contentButton')
const uploadButton = document.getElementById('uploadButton')
const urlInput = document.getElementById('urlInput')

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
    console.log(url)
    const formData = new FormData()
    formData.append('url', url)

    fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData,
    })
  } else {
    const file = contentButton.files[0]
    console.log(file)
    const formData = new FormData()
    formData.append('file', file)

    fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData,
    })
  }
}

// search packages in database

// TODO: implement delete and reset

// event listeners
document.getElementById('search').addEventListener('submit', submitQuery)
contentButton.addEventListener('change', fileUploadChange)
urlInput.addEventListener('change', urlUploadChange)
uploadButton.addEventListener('click', uploadPackage)
