document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".hero-slider");
  const slides = document.querySelectorAll(".slide");
  const prevButton = document.querySelector(".slider-prev");
  const nextButton = document.querySelector(".slider-next");
  let currentSlide = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  const indicatorsContainer = document.createElement("div");
  indicatorsContainer.className = "slide-indicators";
  slides.forEach((_, index) => {
    const indicator = document.createElement("div");
    indicator.className = `indicator ${index === 0 ? "active" : ""}`;
    indicator.addEventListener("click", () => {
      goToSlide(index);
      resetInterval();
    });
    indicatorsContainer.appendChild(indicator);
  });
  slider.appendChild(indicatorsContainer);

  function updateIndicators() {
    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentSlide);
    });
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${(i - index) * 100}%)`;
      slide.classList.toggle("active", i === index);
    });
    updateIndicators();
  }

  function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", () => {
    const touchDiff = touchStartX - touchEndX;
    if (Math.abs(touchDiff) > 50) {
      if (touchDiff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetInterval();
    }
  });

  let slideInterval = setInterval(nextSlide, 5000);

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  prevButton.addEventListener("click", () => {
    prevSlide();
    resetInterval();
  });

  nextButton.addEventListener("click", () => {
    nextSlide();
    resetInterval();
  });

  showSlide(0);
  const catalogBtn = document.querySelector(".catalog-btn");
  catalogBtn.addEventListener("mouseenter", () => {
    catalogBtn.style.transform = "translateY(-2px)";
  });
  catalogBtn.addEventListener("mouseleave", () => {
    catalogBtn.style.transform = "translateY(0)";
  });

  const navActions = document.querySelectorAll(".nav-action");

  navActions.forEach((action) => {
    action.addEventListener("mouseenter", () => {
      const icon = action.querySelector("i");
      icon.style.transform = "scale(1.1)";
      icon.style.transition = "transform 0.3s ease";
    });

    action.addEventListener("mouseleave", () => {
      const icon = action.querySelector("i");
      icon.style.transform = "scale(1)";
    });
  });

  let allProducts = [];
  let filteredProducts = [];
  let allCategories = [];
  let currentPage = 1;
  const productsPerPage = 10;
  let currentCategory = "all";

  function showSkeletonCards(count = productsPerPage) {
    const productsGrid = document.getElementById("productsGrid");
    productsGrid.innerHTML = "";
    for (let i = 0; i < count; i++) {
      productsGrid.innerHTML += `
        <div class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      `;
    }
  }

  async function fetchProducts() {
    showSkeletonCards(productsPerPage); 
    try {
      const response = await fetch("https://dummyjson.com/products?limit=200");
      const data = await response.json();
      allProducts = data.products;
      filteredProducts = allProducts;
      allCategories = Array.from(new Set(allProducts.map((p) => p.category)));
      renderCategoryFilters();
      setTimeout(() => {
        displayProducts();
      }, 600); 
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  function renderCategoryFilters() {
    const categoriesMenu = document.querySelector(".categories-menu ul");
    categoriesMenu.innerHTML = "";
   
    const allBtn = document.createElement("li");
    allBtn.innerHTML = `<a href="#" data-category="all" class="category-filter active"><span style="color:#7000FF;font-weight:600">Barchasi</span></a>`;
    categoriesMenu.appendChild(allBtn);
    allCategories.forEach((cat) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" data-category="${cat}" class="category-filter">${
        cat.charAt(0).toUpperCase() + cat.slice(1)
      }</a>`;
      categoriesMenu.appendChild(li);
    });
    document.querySelectorAll(".category-filter").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        document
          .querySelectorAll(".category-filter")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        currentCategory = this.getAttribute("data-category");
        currentPage = 1;
        if (currentCategory === "all") {
          filteredProducts = allProducts;
        } else {
          filteredProducts = allProducts.filter(
            (p) => p.category === currentCategory
          );
        }
        displayProducts();
      });
    });
  }

  function displayProducts() {
    showSkeletonCards(productsPerPage); 
    setTimeout(() => {
      const productsGrid = document.getElementById("productsGrid");
      const startIndex = 0;
      const endIndex = currentPage * productsPerPage;
      const productsToShow = filteredProducts.slice(startIndex, endIndex);

      productsGrid.innerHTML = "";

      productsToShow.forEach((product) => {
        const discountPrice = product.price * 0.8;
        const card = `
          <div class="product-card" data-id="${
            product.id
          }" style="cursor:pointer">
            <img src="${product.images[0]}" alt="${
          product.title
        }" class="product-image">
            <div class="product-info">
              <h3 class="product-title">${product.title}</h3>
              <div class="product-price">
                <span class="main-price">${discountPrice.toFixed(2)} $</span>
                <span class="product-discount">${product.price} $</span>
              </div>
              <div class="product-rating">
                ${getStars(product.rating)}
                <span class="rating-number">${product.rating}</span>
              </div>
            </div>
          </div>
        `;
        productsGrid.innerHTML += card;
      });
      document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          window.location.href = `detail.html?id=${id}`;
        });
      });
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      if (endIndex >= filteredProducts.length) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "inline-flex";
      }
    }, 600);
  }
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  loadMoreBtn.addEventListener("click", async () => {
    loadMoreBtn.classList.add("loading");
    await new Promise((resolve) => setTimeout(resolve, 800));
    currentPage++;
    displayProducts();
    loadMoreBtn.classList.remove("loading");
  });

  fetchProducts();
});

document.addEventListener("DOMContentLoaded", function () {
  const backToTopBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  function getStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    let starsHtml = "";
    for (let i = 0; i < fullStars; i++)
      starsHtml += '<i class="fas fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++)
      starsHtml += '<i class="far fa-star"></i>';
    return starsHtml;
  }

  async function fetchProducts() {
    try {
      const response = await fetch("https://dummyjson.com/products");
      const data = await response.json();
      displayProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  function displayProducts(products) {
    const productsGrid = document.getElementById("productsGrid");
    productsGrid.innerHTML = "";

    products.forEach((product) => {
      const discountPrice = product.price * 0.8;
      const card = `
              <div class="product-card" data-id="${
                product.id
              }" style="cursor:pointer">
                  <img src="${product.images[0]}" alt="${
        product.title
      }" class="product-image">
                  <div class="product-info">
                      <h3 class="product-title">${product.title}</h3>
                      <div class="product-price">
                          <span class="main-price">${discountPrice.toFixed(
                            2
                          )} $</span>
                          <span class="product-discount">${
                            product.price
                          } $</span>
                      </div>
                      <div class="product-rating">
                          ${getStars(product.rating)}
                          <span class="rating-number">${product.rating}</span>
                      </div>
                  </div>
              </div>
          `;
      productsGrid.innerHTML += card;
    });
    document.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        window.location.href = `detail.html?id=${id}`;
      });
    });
  }
  fetchProducts();
});

document.addEventListener("mousemove", function (e) {
  const topNav = document.querySelector(".top-nav");
  if (e.clientY < 60) {
    topNav.style.opacity = "1";
    topNav.style.pointerEvents = "auto";
  } else {
    topNav.style.opacity = "0";
    topNav.style.pointerEvents = "none";
  }
});

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let starsHtml = "";
  for (let i = 0; i < fullStars; i++)
    starsHtml += '<i class="fas fa-star"></i>';
  if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
  for (let i = 0; i < emptyStars; i++)
    starsHtml += '<i class="far fa-star"></i>';
  return starsHtml;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

let allProducts = [];

async function loadDetail() {
  const id = getIdFromUrl();
  if (!id) return;
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  const product = await res.json();

  const discountPrice = (product.price * 0.8).toFixed(2);

  let gallery = "";
  product.images.forEach((img, idx) => {
    gallery += `<img src="${img}" class="${
      idx === 0 ? "active" : ""
    }" data-img="${img}">`;
  });

  document.getElementById("detail").innerHTML = `
    <img src="${product.images[0]}" class="detail-image" id="mainImage">
    <div class="detail-info">
        <div class="detail-title">${product.title}</div>
        <div class="detail-desc">${product.description}</div>
        <div class="detail-price">
            ${discountPrice} $
            <span class="detail-discount">${product.price} $</span>
        </div>
        <div class="detail-rating">
            ${getStars(product.rating)}
            <span style="color:#62656a;font-size:16px;margin-left:6px">${
              product.rating
            }</span>
        </div>
        <div class="detail-gallery">
            ${gallery}
        </div>
        <div style="margin-top:18px;">
            <b>Brand:</b> ${product.brand}<br>
            <b>Kategoriya:</b> ${product.category}<br>
            <b>Stok:</b> ${product.stock} dona
        </div>
    </div>
  `;

  document.querySelectorAll(".detail-gallery img").forEach((img) => {
    img.addEventListener("click", function () {
      document.getElementById("mainImage").src = this.getAttribute("data-img");
      document
        .querySelectorAll(".detail-gallery img")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });
}



function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadDetail() {
  const id = getIdFromUrl();
  if (!id) return;
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  const product = await res.json();

  const discountPrice = (product.price * 0.8).toFixed(2);

  let gallery = "";
  product.images.forEach((img, idx) => {
    gallery += `<img src="${img}" class="${
      idx === 0 ? "active" : ""
    }" data-idx="${idx}">`;
  });

  document.getElementById("detail").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
      <div style="position:relative;display:flex;align-items:center;">
        <button class="carousel-btn left" style="position:absolute;left:-32px;top:50%;transform:translateY(-50%);background:#fff;border:none;border-radius:50%;width:36px;height:36px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:18px;cursor:pointer;z-index:2;"><i class="fas fa-chevron-left"></i></button>
        <img src="${product.images[0]}" class="detail-image" id="mainImage">
        <button class="carousel-btn right" style="position:absolute;right:-32px;top:50%;transform:translateY(-50%);background:#fff;border:none;border-radius:50%;width:36px;height:36px;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-size:18px;cursor:pointer;z-index:2;"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="detail-gallery" style="justify-content:center;">
        ${gallery}
      </div>
    </div>
    <div class="detail-info">
        <div class="detail-title">${product.title}</div>
        <div class="detail-desc">${product.description}</div>
        <div class="detail-price">
            ${discountPrice} $
            <span class="detail-discount">${product.price} $</span>
        </div>
        <div class="detail-rating">
            ${getStars(product.rating)}
            <span style="color:#62656a;font-size:16px;margin-left:6px">${
              product.rating
            }</span>
        </div>
        <div style="margin-top:18px;">
            <b>Brand:</b> ${product.brand}<br>
            <b>Kategoriya:</b> ${product.category}<br>
            <b>Stok:</b> ${product.stock} dona
        </div>
    </div>
  `;

  let currentIdx = 0;
  const images = product.images;
  const mainImage = document.getElementById("mainImage");
  const galleryImgs = document.querySelectorAll(".detail-gallery img");
  const leftBtn = document.querySelector(".carousel-btn.left");
  const rightBtn = document.querySelector(".carousel-btn.right");

  function showImage(idx) {
    currentIdx = idx;
    mainImage.src = images[idx];
    galleryImgs.forEach((img) => img.classList.remove("active"));
    if (galleryImgs[idx]) galleryImgs[idx].classList.add("active");
  }

  leftBtn.addEventListener("click", () => {
    let idx = currentIdx - 1;
    if (idx < 0) idx = images.length - 1;
    showImage(idx);
  });

  rightBtn.addEventListener("click", () => {
    let idx = currentIdx + 1;
    if (idx >= images.length) idx = 0;
    showImage(idx);
  });

  galleryImgs.forEach((img) => {
    img.addEventListener("click", function () {
      showImage(Number(this.getAttribute("data-idx")));
    });
  });
  let autoSlide = setInterval(() => {
    let idx = currentIdx + 1;
    if (idx >= images.length) idx = 0;
    showImage(idx);
  }, 3000);

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      let idx = currentIdx + 1;
      if (idx >= images.length) idx = 0;
      showImage(idx);
    }, 3000);
  }
}

loadDetail();

loadDetail();

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let starsHtml = "";
  for (let i = 0; i < fullStars; i++)
    starsHtml += '<i class="fas fa-star"></i>';
  if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
  for (let i = 0; i < emptyStars; i++)
    starsHtml += '<i class="far fa-star"></i>';
  return starsHtml;
}


