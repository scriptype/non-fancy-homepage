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

  function attachPaginationHandlers() {
    if (!window.history || !window.fetch) {
      return
    }

    var paginationButtons = document.querySelectorAll('#prev, #next')
    var contents = document.querySelector('.main-contents')
    var pagination = document.querySelector('.main-pagination')

    ;[].slice.call(paginationButtons).forEach(function(btn) {
      btn.addEventListener('click', function(event) {
        event.preventDefault()
        fetch(btn.href)
          .then(function(result) { return result.text() })
          .then(function(text) {
            var fragment = DOMFragmentFromText(text)
            pagination.outerHTML = fragment.querySelector('.main-pagination').outerHTML
            hide(contents)
            contents.outerHTML = fragment.querySelector('.main-contents').outerHTML
            fadeIn(document.querySelector('.main-contents'))
            history.pushState({}, '', btn.href)
            attachPaginationHandlers()
          })
      })
    })

  }

  attachPaginationHandlers()

})
