function fetchPage(url) {
  return fetch(url).then(function(result) {
    return result.text()
  })
}

function RouteCacheStoreModule() {
  var Store = {}

  function cache(route) {
    route = route
      .replace(/^\//, '')
      .replace(/\/$/, '')

    if (Store[route]) {
      console.log('found cache for:', route)
      return Promise.resolve(Store[route])
    }

    console.log('cache not found, fetching:', route)

    return fetchPage('/' + route).then(function(text) {
      Store[route] = text
      return text
    })
  }

  return {
    cache: cache
  }
}

function RouterModule() {
  return Backbone.Router.extend({
    initialize: function (options) {
      this.renderRule = options.renderRule
      this.onRoute = options.onRoute
      this.routeStore = options.routeStore
    },

    routes: {
      '': 'home',
      'about-me': 'aboutMe',
      'tagged/*path': 'tagged',
      'search/*path': 'search',
      'post/*path': 'post',
      'page/:number': 'page',
      'ask': 'ask',
      '*notfound': 'notFound'
    },

    _onRoute: function(route) {
      if (this.renderRule(route)) {
        this.routeStore.cache(route).then(function(text) {
          if (typeof this.onRoute === 'function') {
            this.onRoute(text, route)
          }
        }.bind(this))
      }
    },

    notFound: function(route) {
      this._onRoute(route)
    },

    home: function() {
      this._onRoute('/')
    },

    aboutMe: function() {
      this._onRoute('/about-me')
    },

    tagged: function(path) {
      this._onRoute('/tagged/' + path)
    },

    search: function(path) {
      this._onRoute('/search/' + (path || ''))
    },

    post: function(path) {
      this._onRoute('/post/' + path)
    },

    page: function(pageNumber) {
      this._onRoute('/page/' + pageNumber)
    },

    ask: function() {
      this._onRoute('/ask')
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
  },

  getTumblrIframe: function() {
    return (
      document.getElementsByName('desktop-logged-in-controls')[0] ||
      document.getElementsByClassName('tmblr-iframe')[0] ||
      document.querySelector('iframe[src*="dashboard/iframe"]')
    )
  },

  getChangedTumblrIframe: function(callback) {
    var tumblrIframe = Utils.getTumblrIframe()

    // Detect the replacement of Tumblr iframe, and when it becomes stable do stuff
    var intervalLimit = 15
    var interval = setInterval(function() {
      var newTumblrIframe = Utils.getTumblrIframe()
      /*
       * Tumblr iframe is being replaced with another in the first render for an
       * unknown reason, after some unknown time, at least for the time of writing
       * this.
       *
       * So check periodically, if it becomes different than the first one, and
       * do any operations then.
       *
       * If the iframe stays the same in the future, this code
       * will still do the operations with the last found iframe.
       */
      if (tumblrIframe !== newTumblrIframe || intervalLimit-- < 0) {
        // Iframe is ready
        clearInterval(interval)
        requestAnimationFrame(callback.bind(null, newTumblrIframe))
      }
    }, 500)
  },

  getPostID: function() {
    return document.getElementById('post-id').value
  }
}

var App = {
  CONTENT: '.main-contents',
  TOP_PAGINATION: '.main-pagination--top',
  BOTTOM_PAGINATION: '.main-pagination--bottom',
  PAGINATION_LINKS: '.main-pagination a',
  BOTTOM_PAGINATION_LINKS: '.main-pagination--bottom a',
  NAVIGATION_LINKS: '.main-navigation a',
  TITLE: '.main-title a',
  POST_TITLE: '.main-article:not(.main-article--permalink) .permalink, .read_more',
  DISCUSS_SCRIPT_ID: 'disqus_embed',

  skippedFirstRender: false,

  bindLinksToRouter: function(nodes) {
    ;[].slice.call(nodes).forEach(function(node) {
      node.addEventListener('click', function(event) {
        if (!event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey && event.which !== 2) {
          event.preventDefault()
          var origin = document.location.origin
          var route = node.href.replace(origin + '/', '')
          this.router.navigate(route, { trigger: true })
        }
      }.bind(this))
    }.bind(this))
  },

  onSearch: function(event) {
    var value = event.which || event.keyCode
    var notChanged = (
        value === 36 || value === 37 || value === 38 || value === 39 ||
        value === 16 || value === 27 || value === 20 ||
        event.ctrlKey || event.shiftKey || event.metaKey
    )
    if (!notChanged) {
      this.router.navigate('search/' + event.target.value, { trigger: true })
    }
  },

  onRoute: function(result, route) {
    var fragment = Utils.DOMFragmentFromText(result)

    // Get content section
    var contents = document.querySelector(this.CONTENT)
    // Refresh content section
    Utils.hide(contents)
    contents.outerHTML = fragment.querySelector(this.CONTENT).outerHTML
    Utils.fadeIn(document.querySelector(this.CONTENT))
    this.bindLinksToRouter(document.querySelectorAll(this.POST_TITLE))

    // Get pagination sections
    var topPagination = document.querySelector(this.TOP_PAGINATION)
    var bottomPagination = document.querySelector(this.BOTTOM_PAGINATION)
    // Refresh pagination sections
    topPagination.outerHTML = fragment.querySelector(this.TOP_PAGINATION).outerHTML
    bottomPagination.outerHTML = fragment.querySelector(this.BOTTOM_PAGINATION).outerHTML
    this.bindLinksToRouter(document.querySelectorAll(this.PAGINATION_LINKS))
    this.bindBottomPaginationLinksClickHandlers()

    // Reset search input's value if it's not search route any more
    if (!/^\/search/.test(route)) {
      document.getElementById('q').value = ''
    }

    // Disqus
    if (/^\/post\//.test(route)) {
      this.renderDisqus(route)
    }

    // Cache related pages
    this.cacheRoutes(route)

    // Update page title
    document.title = fragment.querySelector('title').innerText

    // Tumblr iframe
    var tumblrIframe = Utils.getTumblrIframe()
    if (tumblrIframe) {
      this.renderTumblrIframe(tumblrIframe, route)
    } else {
      console.info('no tumblr iframe')
    }
  },

  cacheRoutes(route) {
    this.RouteCacheStore.cache(route)

    if (/page\/\d+(\/|)$/.test(route)) {
      var currentPage = parseInt(route.match(/page\/(\d+)(\/|)$/)[1], 10) || 0
      this.RouteCacheStore.cache(route.replace(/\d+(\/|)$/, '') + (currentPage + 1))
      if (currentPage > 1) {
        this.RouteCacheStore.cache(route.replace(/\d+(\/|)$/, '') + (currentPage - 1))
      }

    } else if (route == '/' || /^\/search/.test(route) || /^\/tagged/.test(route)) {
      this.RouteCacheStore.cache(route.replace(/\/$/, '') + '/page/2')
    }
  },

  renderDisqus(route) {
    var previousEmbed = document.getElementById(this.DISCUSS_SCRIPT_ID)
    if (previousEmbed) {
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = route.match(/\/post\/(.+)\//)[1]
          this.page.url = document.location.href
          this.page.title = document.title
        }
      })

    } else {
      var dsq = document.createElement('script')
      var disqus_shortname = '{text:Disqus Shortname}'
      dsq.type = 'text/javascript'
      dsq.async = true
      dsq.id = this.DISCUSS_SCRIPT_ID
      dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js'
      var target = (
        document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0]
      )
      target.appendChild(dsq)
    }
  },

  renderTumblrIframe: function(tumblrIframe, route) {
    var iframeSrc = decodeURIComponent(tumblrIframe.src)
    var iframeSrcRoot = iframeSrc.split('?')[0]
    var iframeSrcQuery = iframeSrc.split('?')[1]
    var iframeQueryParts = iframeSrcQuery.split('&')
    var newSrc = [iframeSrcRoot, iframeQueryParts.map(function(part) {
      var pid = ''
      if (/src=/.test(part)) {
        if (/post/.test(route)) {
          pid = 'pid=' + Utils.getPostID()
        }
        return pid + '&src=' + encodeURIComponent(document.location.origin + route)
      }
      if (/pid=/.test(part) && !/^\/post/.test(route)) {
        return ''
      }
      return part
    }).join('&')].join('?')

    if (tumblrIframe.src !== newSrc) {
      tumblrIframe.contentWindow.location.replace(newSrc)
    }
  },

  bindBottomPaginationLinksClickHandlers() {
    ;[].slice.call(document.querySelectorAll(this.BOTTOM_PAGINATION_LINKS))
      .forEach(function(el) {
        el.addEventListener('click', function() {
          document.location.hash = 'top'
        })
      })
  },

  init: function() {
    if (!window.history || !window.fetch) {
      return
    }

    var Router = RouterModule()
    this.RouteCacheStore = RouteCacheStoreModule()

    this.router = new Router({

      // Predicate fn to decide if router should work
      renderRule: function (route) {
        // Should run router if first render already has been done.
        if (this.skippedFirstRender) {

          // If "nort" (no route) is at the end of url, hard redirect to that url
          if (/nort$/.test(route)) {
            document.location.href = route
          }

          // This isn't the first opening; run router
          return true

        // Route-dependent initialization logic
        } else {

          // First time page opening in post
          if (/^\/post\//.test(route)) {
            this.renderDisqus(route)
          }

          // Will continue with router after the first render logic above
          this.skippedFirstRender = true

          // Cache related pages
          this.cacheRoutes(route)

          // Don't run router for this time
          return false
        }
      }.bind(this),

      onRoute: this.onRoute.bind(this),

      routeStore: this.RouteCacheStore
    })

    this.router.on('route', function(route) {
      console.log('routing:', route)
    })

    Backbone.history.start({ pushState: true })

    this.bindLinksToRouter(document.querySelectorAll(this.TITLE))
    this.bindLinksToRouter(document.querySelectorAll(this.POST_TITLE))
    this.bindLinksToRouter(document.querySelectorAll(this.NAVIGATION_LINKS))
    this.bindLinksToRouter(document.querySelectorAll(this.PAGINATION_LINKS))
    this.bindBottomPaginationLinksClickHandlers()

    var searchForm = document.getElementById('search')
    var searchInput = document.getElementById('q')
    var debouncedSearch = _.debounce(this.onSearch.bind(this), 300)
    searchInput.addEventListener('keydown', debouncedSearch)
    searchForm.addEventListener('submit', function(event) { event.preventDefault() })

    // Detect if tumblrIframe is being changed and handle it
    Utils.getChangedTumblrIframe(function(newTumblrIframe) {
      // Only if a tumblrIframe is found
      if (newTumblrIframe) {
        // Add title to the iframe, for accessibility.
        newTumblrIframe.title = 'Tumblr controls'
      }
    })
  }
}

window.addEventListener('DOMContentLoaded', App.init.bind(App))
