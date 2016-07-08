function Router(options) {
  this.onRoute = options.onRoute
  return this
}

Router.prototype.route = function(url) {
  fetch(url)
    .then(function(result) { return result.text() })
    .then(function(text) {
      history.pushState({}, '', url)
      if (typeof this.onRoute === 'function') {
        this.onRoute(text)
      }
    }.bind(this))
}

var Utils = {
  DOMFragmentFromText: function(text) {
    var fragment = document.createDocumentFragment()
    var container = document.createElement('div')
    container.insertAdjacentHTML('beforeend', text)
    fragment.appendChild(container)
    return fragment.children[0]
  },

  hide: function(element) {
    element.style.cssText = 'transition: none; opacity: 0;'
  },

  fadeIn: function(element) {
    element.classList.add('fade-in')
    setTimeout(function() {
      element.classList.remove('fade-in')
    }, 300)
  }
}

var App = {
  CONTENT: '.main-contents',
  PAGINATION: '.main-pagination',
  PAGINATION_LINKS: '.main-pagination a',
  NAVIGATION_LINKS: '.main-navigation a',
  TITLE: '.main-title a',

  bindLinksToRouter: function(nodes) {
    ;[].slice.call(nodes).forEach(function(node) {
      node.addEventListener('click', function(event) {
        event.preventDefault()
        this.router.route(node.href)
      }.bind(this))
    }.bind(this))
  },

  onSearch: function(event) {
    var value = event.which || event.keyCode
    var notChanged = (
        value === 36 || value === 37 || value === 38 || value === 39 ||
        value === 13 || value === 16 || value === 27 || value === 20 ||
        event.ctrlKey || event.shiftKey || event.metaKey
    )
    if (!notChanged) {
      this.router.route('/search/' + event.target.value)
    }
  },

  onRoute: function(result) {
    var contents = document.querySelector(this.CONTENT)
    var pagination = document.querySelector(this.PAGINATION)
    var fragment = Utils.DOMFragmentFromText(result)
    Utils.hide(contents)
    contents.outerHTML = fragment.querySelector(this.CONTENT).outerHTML
    Utils.fadeIn(document.querySelector(this.CONTENT))
    pagination.outerHTML = fragment.querySelector(this.PAGINATION).outerHTML
    this.bindLinksToRouter(document.querySelectorAll(this.PAGINATION_LINKS))
  },

  init: function() {
    if (!window.history || !window.fetch) {
      return
    }

    this.router = new Router({
      onRoute: this.onRoute.bind(this)
    })

    //this.bindLinksToRouter(document.querySelectorAll(this.TITLE))
    this.bindLinksToRouter(document.querySelectorAll(this.NAVIGATION_LINKS))
    this.bindLinksToRouter(document.querySelectorAll(this.PAGINATION_LINKS))

    var searchForm = document.getElementById('search')
    var searchInput = document.getElementById('q')
    var debouncedSearch = _.debounce(this.onSearch.bind(this), 300)
    searchInput.addEventListener('keydown', debouncedSearch)
    searchForm.addEventListener('submit', function(event) { event.preventDefault() })
  }
}

window.addEventListener('DOMContentLoaded', App.init.bind(App))
