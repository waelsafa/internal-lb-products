document.addEventListener("DOMContentLoaded", function () {
  const productGrid = document.querySelector(".product-grid");
  const paginationInfo = document.getElementById("pagination-info");
  const paginationNumbers = document.getElementById("pagination-numbers");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 12;
  let currentFilter = 'all';

  async function fetchProducts() {
    try {
      // Show loading state
      productGrid.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading our finest products...</p>
        </div>
      `;
      
      const response = await fetch('/_data/products.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      allProducts = products;
      filteredProducts = products;
      
      // Add small delay for better UX
      setTimeout(() => {
        currentPage = 1;
        displayProducts();
        updatePagination();
      }, 500);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      productGrid.innerHTML = `
        <div class="loading">
          <p style="color: var(--forest-green);">Error loading products. Please refresh the page to try again.</p>
        </div>
      `;
    }
  }
  function displayProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productGrid.innerHTML = "";
    
    if (productsToShow.length === 0) {
      productGrid.innerHTML = `
        <div class="loading">
          <p style="color: var(--text-medium);">No products found in this category.</p>
        </div>
      `;
      return;
    }

    // Create all cards first
    const cardHTML = productsToShow.map((product, index) => {
      if (!product.image) {
        console.warn('Skipping product due to missing image:', product);
        return '';
      }
      
      return `
        <div class="product-card fade-in" style="animation-delay: ${index * 0.1}s;">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIGZpbGw9IiNmNGY0ZjQiLz48cGF0aCBkPSJNMTYwIDEwMGMtMTYuNTcgMC0zMCAxMy40My0zMCAzMHMxMy40MyAzMCAzMCAzMCAzMC0xMy40MyAzMC0zMC0xMy40My0zMC0zMC0zMHptMCA0MGMtNS41MiAwLTEwLTQuNDgtMTAtMTBzNC40OC0xMCAxMC0xMCAxMCA0LjQ4IDEwIDEwLTQuNDggMTAtMTAgMTB6bTAtNjBjLTMzLjE0IDAtNjAgMjYuODYtNjAgNjBzMjYuODYgNjAgNjAgNjAgNjAtMjYuODYgNjAtNjAtMjYuODYtNjAtNjAtNjB6bTAgMTAwYy0yMi4wOSAwLTQwLTE3LjkxLTQwLTQwczE3LjkxLTQwIDQwLTQwIDQwIDE3LjkxIDQwIDQwLTE3LjkxIDQwLTQwIDQweiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg=='" />
        </div>
      `;
    }).filter(html => html !== '').join('');

    // Set all HTML at once for better masonry layout
    productGrid.innerHTML = cardHTML;
  }

  function updatePagination() {
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startProduct = totalProducts === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
    const endProduct = Math.min(currentPage * productsPerPage, totalProducts);

    // Update info
    paginationInfo.textContent = `Showing ${startProduct}-${endProduct} of ${totalProducts} products`;

    // Update navigation buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    generatePageNumbers(totalPages);
  }

  function generatePageNumbers(totalPages) {
    paginationNumbers.innerHTML = '';
    
    if (totalPages <= 1) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      addPageNumber(1);
      if (startPage > 2) {
        addEllipsis();
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      addPageNumber(i);
    }

    // Ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        addEllipsis();
      }
      addPageNumber(totalPages);
    }
  }

  function addPageNumber(page) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-number ${page === currentPage ? 'active' : ''}`;
    pageBtn.textContent = page;
    pageBtn.addEventListener('click', () => goToPage(page));
    paginationNumbers.appendChild(pageBtn);
  }

  function addEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    paginationNumbers.appendChild(ellipsis);
  }

  function goToPage(page) {
    currentPage = page;
    displayProducts();
    updatePagination();
    
    // Scroll to top of products
    productGrid.scrollIntoView({ behavior: 'smooth' });
  }

  function filterProducts(filterValue) {
    currentFilter = filterValue;
    
    if (filterValue === 'all') {
      filteredProducts = allProducts;
    } else {
      filteredProducts = allProducts.filter(product => product.category === filterValue);
    }
    
    currentPage = 1;
    displayProducts();
    updatePagination();
  }

  function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        filterProducts(filterValue);
      });
    });
  }

  // Pagination event listeners
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });

  // Initialize
  initializeFilters();
  fetchProducts();
});
