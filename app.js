window.addEventListener('DOMContentLoaded', function() {

  function DOMFragmentFromText(text) {
    var fragment = document.createDocumentFragment()
    var container = document.createElement('div')
    container.insertAdjacentHTML('beforeend', text)
    fragment.appendChild(container)
    return fragment.children[0]
  }

  function hide(element) {
    element.style.cssText = 'transition: none; opacity: 0;'
  }

  function fadeIn(element) {
    element.classList.add('fade-in')
    setTimeout(function() {
      element.classList.remove('fade-in')
    }, 300)
  }

  function route(url) {
    var contents = document.querySelector('.main-contents')
    var pagination = document.querySelector('.main-pagination')
    var paginationButtons = document.querySelectorAll('#prev, #next')

    fetch(url)
      .then(function(result) { return result.text() })
      .then(function(text) {
        var fragment = DOMFragmentFromText(text)
        pagination.outerHTML = fragment.querySelector('.main-pagination').outerHTML
        hide(contents)
        contents.outerHTML = fragment.querySelector('.main-contents').outerHTML
        fadeIn(document.querySelector('.main-contents'))
        history.pushState({}, '', url)
        attachPaginationHandlers()
      })
  }

  function attachPaginationHandlers() {
    if (!window.history || !window.fetch) {
      return
    }

    var paginationButtons = document.querySelectorAll('#prev, #next')

    ;[].slice.call(paginationButtons).forEach(function(btn) {
      btn.addEventListener('click', function(event) {
        event.preventDefault()
        route(btn.href)
      })
    })
  }

  function _search(event) {
    var value = event.which || event.keyCode
    var notChanged = (
        value === 36 || value === 37 || value === 38 || value === 39 ||
        value === 13 || value === 16 || value === 27 || value === 20 ||
        event.ctrlKey || event.shiftKey || event.metaKey
    )
    if (!notChanged) {
      route('/search/' + event.target.value)
    }
  }

  function attachSearchHandlers() {
    if (!window.history || !window.fetch) {
      return
    }

    var searchForm = document.getElementById('search')
    var searchInput = document.getElementById('q')
    var debouncedSearch = _.debounce(_search, 300)

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault()
    })

    searchInput.addEventListener('keydown', debouncedSearch)
  }

  function attachNavigationHandlers() {
    if (!window.history || !window.fetch) {
      return
    }

    var tagLinks = document.querySelectorAll('.main-navigation [href*=tagged]')

    ;[].slice.call(tagLinks).forEach(function(link) {
      link.addEventListener('click', function(event) {
        event.preventDefault()
        route(link.href)
      })
    })
  }

  attachPaginationHandlers()
  attachSearchHandlers()
  attachNavigationHandlers()

})
