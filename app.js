function RouterModule() {
  return Backbone.Router.extend({
    initialize: function (options) {
      this.renderRule = options.renderRule
      this.onRoute = options.onRoute
    },

    routes: {
      '': 'home',
      'about-me': 'aboutMe',
      'tagged/:tag': 'tagged',
      'search/(:q)': 'search',
      'post/*path': 'post',
      'page/:number': 'page'
    },

    home: function() {
      if (this.renderRule()) {
        fetch('/')
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    },

    aboutMe: function() {
      if (this.renderRule()) {
        fetch('/about-me')
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    },

    tagged: function(tag) {
      if (this.renderRule()) {
        fetch('/tagged/' + tag)
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    },

    search: function(q) {
      if (this.renderRule()) {
        fetch('/search/' + (q || ''))
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    },

    post: function(path) {
      if (this.renderRule()) {
        fetch('/post/' + path)
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    },

    page: function(pageNumber) {
      if (this.renderRule()) {
        fetch('/page/' + pageNumber)
          .then(function(result) { return result.text() })
          .then(function(text) {
            if (typeof this.onRoute === 'function') {
              this.onRoute(text)
            }
          }.bind(this))
      }
    }
  })
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
  POST_TITLE: '.main-article:not(.main-article--permalink) .permalink, .read_more',

  skippedFirstRender: false,

  bindLinksToRouter: function(nodes) {
    ;[].slice.call(nodes).forEach(function(node) {
      node.addEventListener('click', function(event) {
        event.preventDefault()
        var protocol = document.location.protocol
        var host = document.location.host
        var route = node.href.replace(protocol + '//' + host + '/', '')
        this.router.navigate(route, { trigger: true })
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
      this.router.navigate('search/' + event.target.value, { trigger: true })
    }
  },

  onRoute: function(result) {
    var contents = document.querySelector(this.CONTENT)
    var pagination = document.querySelector(this.PAGINATION)
    var fragment = Utils.DOMFragmentFromText(result)

    Utils.hide(contents)
    contents.outerHTML = fragment.querySelector(this.CONTENT).outerHTML
    Utils.fadeIn(document.querySelector(this.CONTENT))
    this.bindLinksToRouter(document.querySelectorAll(this.POST_TITLE))

    pagination.outerHTML = fragment.querySelector(this.PAGINATION).outerHTML
    this.bindLinksToRouter(document.querySelectorAll(this.PAGINATION_LINKS))
  },

  init: function() {
    if (!window.history || !window.fetch) {
      return
    }

    var Router = RouterModule()

    this.router = new Router({
        renderRule: function () {
            if (this.skippedFirstRender) {
                return true
            } else {
                this.skippedFirstRender = true
                return false
            }
        }.bind(this),

        onRoute: this.onRoute.bind(this)
    })

    this.router.on('route', function(route) {
      console.log('routing:', route)
    })

    Backbone.history.start({ pushState: true })

    this.bindLinksToRouter(document.querySelectorAll(this.TITLE))
    this.bindLinksToRouter(document.querySelectorAll(this.POST_TITLE))
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
