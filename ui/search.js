const f = document.getElementById('form')
const q = document.getElementById('query')
const github = 'https://github.com/search?q='
const type = 'type=repositories'

function submitted(event) {
  event.preventDefault()
  const url = `${github}${q.value}&${type}`
  const win = window.open(url, '_blank')
  win.focus()
}

f.addEventListener('submit', submitted)
