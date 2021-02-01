if(document.body.clientWidth < 768) {

  const menu = document.querySelector(".gg_menu ul");
  const menuBack = document.querySelector(".gg_menu-back");
  const menuItems = document.querySelectorAll("li");
  const menuToggle = document.querySelector(".header__menu-toggle");
  const menuClose = document.querySelector(".gg_menu-close");

  let position = 0;

  menuClose.addEventListener("click", () => {
    document.querySelector(".gg_menu").classList.toggle("menu__show")

    let shown = document.querySelectorAll(".menu__show");

      shown.forEach((el, key) => {
        el.scrollTop = 0;
        el.classList.remove('menu__show')
      })

      menu.style.transform = `translateX(0%)`;
      position = 0;
  })

  menuToggle.addEventListener("click", () => {
    document.querySelector(".gg_menu").classList.toggle("menu__show")
  })
  
  
  menuItems.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();

      document.querySelector('.menu__contain').scrollTop = 0;
  
      let child = el.querySelector("ul");
  
      if (child && !child.classList.contains("menu__show")) {
        e.preventDefault();
        child.classList.add("menu__show");
  
        position++;
        menu.style.transform = `translateX(-${100 * position}%)`;
  
        if (position > 0) {
          menuBack.classList.add("menu__show");
          document.querySelector('.menu__contain').style.overflowY = "hidden";
        }
      }
    });
  });
  
  menuBack.addEventListener("click", (e) => {
    let shown = document.querySelectorAll(".menu__show");
    shown[shown.length - 1].classList.remove("menu__show");

    setTimeout(function() {
      shown.forEach(el => {
        el.scrollTop = 0;
      })
    }, 300)
  
    position--;
    menu.style.transform = `translateX(-${100 * position}%)`;
  
    if (position == 0) {
      menuBack.classList.remove("menu__show");
      document.querySelector('.menu__contain').style.overflowY = "scroll";
    }
  });
  
  }

  // FALLBACK FOR NATIVE (loading="lazy") LAZY IMAGE LOADING

// target <img>s with data-src attribute
var lazyimages = document.querySelectorAll('img[data-src]');

// IntersectionObserver IS supported AND native lazy loading is NOT (newer but not newest browsers)
if ('IntersectionObserver' in window && !('loading' in HTMLImageElement.prototype)) {
    // lazy load images
    var imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var image = entry.target;
                image.src = image.dataset.src;
                image.removeAttribute('data-src');
                imageObserver.unobserve(image);
            }
        });
    }, {rootMargin:'500px 0px'}); // 500px buffer

    lazyimages.forEach(function(image) {
        imageObserver.observe(image);
    });
}
// native lazy loading IS supported OR IntersectionObserver is NOT (very new or very old browsers)
else {
    // replace src value with data-src value
    for (var i = 0; i < lazyimages.length; i++) {
        lazyimages[i].src = lazyimages[i].dataset.src;
        lazyimages[i].removeAttribute('data-src');
    }
}

// Footer dropdowns
var footerToggles = document.querySelectorAll('.footer-menu.block');

footerToggles.forEach(function(el) {
  el.addEventListener('click', function() {
    el.querySelector('.footer-menu__list').classList.toggle('show')
  })
})


// Render Search Results
var searchInput = document.querySelector(".search__input");
var searchResults = document.querySelector(".search__results");
var productList = document.querySelector(".search__results-products");
var categoryList = document.querySelector(".search__results-categories");

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var update = debounce(function () {
  var query = searchInput.value;
  var count = 0;
  var catCount = 0;

  fetch("https://search.codegoblin.dev/search?q=" + query)
    .then((res) => res.json())
    .then((data) => {
      count = data.hits.total.value;
      productList.innerHTML = "";

      if (count > 0 && query != "") {
        data.hits.hits.forEach((el) => {
          var stock;
          var stockClass;
          var compare = "";

          if (el._source.tags.includes("pre-orders") && query != "") {
            stock = "Pre-order";
            stockClass = "preorder";
          } else if (el._source.inventory <= 0) {
            stock = "Stock Coming";
            stockClass = "none";
          } else if (el._source.inventory > 0) {
            stock = el._source.inventory + " In Stock";
            stockClass = "available";
          }

          if (el._source.compare_price > 0) {
            compare = "£" + el._source.compare_price.toFixed(2);
          }
          
          var currency = "{{ cart.currency.iso_code }}"
          var price = ""
          
          if(currency != "EUR") {
          price = '<div style="display: flex; align-items: center; margin-top: 1px;"><div class="price">£' +
            el._source.price.toFixed(2) +
            '<span class="search__result-compare">' +
            compare +
            '</span></div>'
          }

          var html =
            '<li class="search__result"><a href="/products/' +
            el._source.handle +
            '" class="search__result-link"><img src="' +
            el._source.image +
            '" alt="" class="search__result-image"><div>' +
            '<h4 class="search__result-title">'+ el._source.title +
            '</h4>' + price + '<div style="padding-left: 0.5em;" class="search__result-price"><span class="product__stock ' +
            stockClass +
            '">' +
            stock +
            "</span></div></div></div></a></li>";

          var parser = new DOMParser();
          var dom = parser.parseFromString(html, "text/html");
          var root = dom.querySelector("li");

          productList.appendChild(root);
        });

        // Count
        if (count > 5) {
          var countEl = document.createElement("a");
          countEl.classList.add("search__result-count");
          countEl.innerHTML = "Show all " + count + " results";
          countEl.href = "/search?q=" + query;

          productList.appendChild(countEl);
        }
      } else {
        productList.innerHTML = "No Results Found";
      }
    });

  fetch("https://search.codegoblin.dev/search-category?q=" + query)
    .then((res) => res.json())
    .then((data) => {
      catCount = data.hits.total.value;
      categoryList.innerHTML = "";

      if (catCount > 0 && query != "") {
        data.hits.hits.forEach((el) => {
          const a = document.createElement("a");
          a.href = "/collections/" + el._source.handle;
          a.classList.add('search__results-link')

          const newItem = document.createElement("li");
          newItem.innerHTML = el._source.title;
          newItem.classList.add('search__results-category')
          a.appendChild(newItem);

          categoryList.appendChild(a);
        });
      } else {
        categoryList.innerHTML = "No Results Found";
      }
    });

  if (query != "") {
    searchResults.style.display = "block";
  } else {
    searchResults.style.display = "";
  }
}, 300);

searchInput.addEventListener("keyup", update);
