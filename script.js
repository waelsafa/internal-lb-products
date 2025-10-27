document.addEventListener("DOMContentLoaded", function () {
  const productGrid = document.querySelector(".product-grid");
  const paginationInfo = document.getElementById("pagination-info");
  const paginationNumbers = document.getElementById("pagination-numbers");

  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const subcategoryContainer = document.getElementById("subcategory-container");
  const subcategoryGrid = document.getElementById("subcategory-grid");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");

  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 12;
  let currentFilter = 'all';
  let currentSubcategory = 'all';
  let currentSearchTerm = '';
  let categorySubcategories = {};

  function buildCategoryMapping(products) {
    const mapping = {};

    products.forEach((product) => {
      const category = product.category;
      let subcategory = null;

      // Extract subcategory from image path
      if (product.image) {
        const imagePath = product.image;

        // Extract brand from image path patterns
        if (imagePath.includes('AURICCHIO')) {
          subcategory = 'AURICCHIO';
        } else if (imagePath.includes('CENTRAL CHEESE')) {
          subcategory = 'CENTRAL CHEESE';
        } else if (imagePath.includes('MALDERA')) {
          subcategory = 'MALDERA';
        } else if (imagePath.includes('IBIS')) {
          subcategory = 'IBIS';
        } else if (imagePath.includes('LEVONI')) {
          subcategory = 'LEVONI';
        } else if (imagePath.includes('CAPUTO')) {
          subcategory = 'CAPUTO';
        } else if (imagePath.includes('DE CECCO')) {
          subcategory = 'DE CECCO';
        } else if (imagePath.includes('PAGANI')) {
          subcategory = 'PAGANI';
        } else if (imagePath.includes('RUSTICHELLA')) {
          subcategory = 'RUSTICHELLA D\'ABRUZZO';
        } else if (imagePath.includes('SCOTTI')) {
          subcategory = 'SCOTTI';
        } else if (imagePath.includes('BOSCHETTO')) {
          subcategory = 'BOSCHETTO';
        } else if (imagePath.includes('CANNAMELA')) {
          subcategory = 'CANNAMELA';
        } else if (imagePath.includes('DELIZIE DI CALABRIA')) {
          subcategory = 'DELIZIE DI CALABRIA';
        } else if (imagePath.includes('LEONARDI')) {
          subcategory = 'LEONARDI';
        } else if (imagePath.includes('PONTI')) {
          subcategory = 'PONTI';
        } else if (imagePath.includes('BELLI')) {
          subcategory = 'BELLI';
        } else if (imagePath.includes('MARIO FONGO')) {
          subcategory = 'MARIO FONGO';
        } else if (imagePath.includes('NOVI')) {
          subcategory = 'NOVI';
        } else if (imagePath.includes('PANEALBA') || imagePath.includes('CAMPIELLO')) {
          subcategory = 'PANEALBA - CAMPIELLO';
        } else if (imagePath.includes('ANGELO PARODI')) {
          subcategory = 'ANGELO PARODI';
        } else if (imagePath.includes('CALLIPO')) {
          subcategory = 'CALLIPO';
        } else if (imagePath.includes('ZAROTTI')) {
          subcategory = 'ZAROTTI';
        } else if (imagePath.includes('D\'AMICO') || imagePath.includes('DAMICO')) {
          subcategory = 'D\'AMICO';
        } else if (imagePath.includes('URBANI')) {
          subcategory = 'URBANI';
        } else if (imagePath.includes('CIRIO')) {
          subcategory = 'CIRIO';
        } else if (imagePath.includes('COCICOME')) {
          subcategory = 'COCICOME';
        } else if (imagePath.includes('SAVINI TARTUFI')) {
          subcategory = 'SAVINI TARTUFI';
        } else if (imagePath.includes('BERLUCCHI')) {
          subcategory = 'BERLUCCHI';
        } else if (imagePath.includes('TOMMASI')) {
          subcategory = 'TOMMASI';
        } else if (imagePath.includes('BERSANO')) {
          subcategory = 'BERSANO';
        } else if (imagePath.includes('SANTA MARGHERITA')) {
          subcategory = 'SANTA MARGHERITA';
        } else if (imagePath.includes('GRANDUCATO')) {
          subcategory = 'GRANDUCATO';
        } else if (imagePath.includes('TENUTA SAN GUIDO')) {
          subcategory = 'TENUTA SAN GUIDO';
        } else if (imagePath.includes('PALUANI')) {
          subcategory = 'PALUANI';
        } else if (imagePath.includes('SPERLARI')) {
          subcategory = 'SPERLARI';
        } else if (imagePath.includes('FLAMIGNI')) {
          subcategory = 'FLAMIGNI';
        } else if (imagePath.includes('FIASCONARO')) {
          subcategory = 'FIASCONARO';
        } else if (imagePath.includes('D&G')) {
          subcategory = 'D&G';
        }
      }

      // Skip products without subcategory
      if (!subcategory) {
        return;
      }

      if (!mapping[category]) {
        mapping[category] = new Set();
      }
      mapping[category].add(subcategory);
    });

    // Convert sets to sorted arrays
    Object.keys(mapping).forEach(category => {
      mapping[category] = Array.from(mapping[category]).sort();
    });

    return mapping;
  }

  async function fetchProducts() {
    try {
      // Show loading state
      productGrid.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading our finest products...</p>
        </div>
      `;

      const response = await fetch('_data/products.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();

      allProducts = products;
      filteredProducts = products;

      // Build category-subcategory mapping from actual data
      categorySubcategories = buildCategoryMapping(products);

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
        return '';
      }

      return `
        <div class="product-card fade-in" style="animation-delay: ${index * 0.1}s;">
        <img 
          src="${product.image}?nf_resize=fit&w=400&h=400&quality=80" 
          alt="${product.title}" 
          loading="lazy" 
          width="400" 
          height="400"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw"
        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiIGZpbGw9IiNmNGY0ZjQiLz48cGF0aCBkPSJNMTYwIDEwMGMtMTYuNTcgMC0zMCAxMy40My0zMCAzMHMxMy40MyAzMCAzMCAzMCAzMC0xMy40MyAzMC0zMC0xMy40My0zMC0zMC0zMHptMCA0MGMtNS0LLjUyIDAtMTAtNC40OC0xMC0xMHM0LjQ4LTEwIDEwLTEwIDEwIDQuNDggMTAgMTAtNC40OCAxMC0xMCAxMHptMC02MGMtMzMuMTQgMC02MCAyNi44Ni02MCA2MHMyNi44NiA2MCA2MCA2MCA2MC0yNi44NiA2MC02MC0yNi44Ni02MC02MC02MHptMCAxMDBjLTIyLjA5IDAtNDAtMTcuOTEtNDAtNDBzMTcuOTEtNDAgNDAtNDAgNDAgMTcuOTEgNDAgNDAtMTcuOTEgNDAtNDAgNDB6IiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+'" />
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
  function filterProducts(filterValue, subcategoryValue = 'all', searchTerm = '') {
    currentFilter = filterValue;
    currentSubcategory = subcategoryValue;
    currentSearchTerm = searchTerm;

    let products = allProducts;

    // Apply search filter first
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      products = products.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply category filter
    if (filterValue === 'all') {
      filteredProducts = products;
      hideSubcategories();
    } else {
      // Filter by category first
      let categoryFiltered = products.filter(product => product.category === filterValue);

      // Then filter by subcategory if specified
      if (subcategoryValue === 'all') {
        filteredProducts = categoryFiltered;
      } else {
        filteredProducts = categoryFiltered.filter(product => {
          // Extract subcategory from image path
          let productSubcategory = null;
          if (product.image) {
            const imagePath = product.image;

            if (imagePath.includes('AURICCHIO')) {
              productSubcategory = 'AURICCHIO';
            } else if (imagePath.includes('CENTRAL CHEESE')) {
              productSubcategory = 'CENTRAL CHEESE';
            } else if (imagePath.includes('MALDERA')) {
              productSubcategory = 'MALDERA';
            } else if (imagePath.includes('IBIS')) {
              productSubcategory = 'IBIS';
            } else if (imagePath.includes('LEVONI')) {
              productSubcategory = 'LEVONI';
            } else if (imagePath.includes('CAPUTO')) {
              productSubcategory = 'CAPUTO';
            } else if (imagePath.includes('DE CECCO')) {
              productSubcategory = 'DE CECCO';
            } else if (imagePath.includes('PAGANI')) {
              productSubcategory = 'PAGANI';
            } else if (imagePath.includes('RUSTICHELLA')) {
              productSubcategory = 'RUSTICHELLA D\'ABRUZZO';
            } else if (imagePath.includes('SCOTTI')) {
              productSubcategory = 'SCOTTI';
            } else if (imagePath.includes('BOSCHETTO')) {
              productSubcategory = 'BOSCHETTO';
            } else if (imagePath.includes('CANNAMELA')) {
              productSubcategory = 'CANNAMELA';
            } else if (imagePath.includes('DELIZIE DI CALABRIA')) {
              productSubcategory = 'DELIZIE DI CALABRIA';
            } else if (imagePath.includes('LEONARDI')) {
              productSubcategory = 'LEONARDI';
            } else if (imagePath.includes('PONTI')) {
              productSubcategory = 'PONTI';
            } else if (imagePath.includes('BELLI')) {
              productSubcategory = 'BELLI';
            } else if (imagePath.includes('MARIO FONGO')) {
              productSubcategory = 'MARIO FONGO';
            } else if (imagePath.includes('NOVI')) {
              productSubcategory = 'NOVI';
            } else if (imagePath.includes('PANEALBA') || imagePath.includes('CAMPIELLO')) {
              productSubcategory = 'PANEALBA - CAMPIELLO';
            } else if (imagePath.includes('ANGELO PARODI')) {
              productSubcategory = 'ANGELO PARODI';
            } else if (imagePath.includes('CALLIPO')) {
              productSubcategory = 'CALLIPO';
            } else if (imagePath.includes('ZAROTTI')) {
              productSubcategory = 'ZAROTTI';
            } else if (imagePath.includes('D\'AMICO') || imagePath.includes('DAMICO')) {
              productSubcategory = 'D\'AMICO';
            } else if (imagePath.includes('URBANI')) {
              productSubcategory = 'URBANI';
            } else if (imagePath.includes('CIRIO')) {
              productSubcategory = 'CIRIO';
            } else if (imagePath.includes('COCICOME')) {
              productSubcategory = 'COCICOME';
            } else if (imagePath.includes('SAVINI TARTUFI')) {
              productSubcategory = 'SAVINI TARTUFI';
            } else if (imagePath.includes('BERLUCCHI')) {
              productSubcategory = 'BERLUCCHI';
            } else if (imagePath.includes('TOMMASI')) {
              productSubcategory = 'TOMMASI';
            } else if (imagePath.includes('BERSANO')) {
              productSubcategory = 'BERSANO';
            } else if (imagePath.includes('SANTA MARGHERITA')) {
              productSubcategory = 'SANTA MARGHERITA';
            } else if (imagePath.includes('GRANDUCATO')) {
              productSubcategory = 'GRANDUCATO';
            } else if (imagePath.includes('TENUTA SAN GUIDO')) {
              productSubcategory = 'TENUTA SAN GUIDO';
            } else if (imagePath.includes('PALUANI')) {
              productSubcategory = 'PALUANI';
            } else if (imagePath.includes('SPERLARI')) {
              productSubcategory = 'SPERLARI';
            } else if (imagePath.includes('FLAMIGNI')) {
              productSubcategory = 'FLAMIGNI';
            } else if (imagePath.includes('FIASCONARO')) {
              productSubcategory = 'FIASCONARO';
            } else if (imagePath.includes('D&G')) {
              productSubcategory = 'D&G';
            }
          }

          return productSubcategory === subcategoryValue;
        });
      }

      showSubcategories(filterValue);
    }

    currentPage = 1;
    displayProducts();
    updatePagination();
  }
  function showSubcategories(category) {
    const subcategories = categorySubcategories[category];

    // Debug: Check if we have the mapping
    if (!categorySubcategories || Object.keys(categorySubcategories).length === 0) {
      // Mapping not built yet, hide subcategories
      hideSubcategories();
      return;
    }

    if (!subcategories || subcategories.length <= 1) {
      hideSubcategories();
      return;
    }

    // Create subcategory buttons
    subcategoryGrid.innerHTML = '';

    // Add "All" button for the category
    const allButton = document.createElement('button');
    allButton.className = currentSubcategory === 'all' ? 'subcategory-button active' : 'subcategory-button';
    allButton.textContent = 'All';
    allButton.setAttribute('data-subcategory', 'all');
    subcategoryGrid.appendChild(allButton);

    // Add brand buttons
    subcategories.forEach(subcategory => {
      const button = document.createElement('button');
      button.className = currentSubcategory === subcategory ? 'subcategory-button active' : 'subcategory-button';
      button.textContent = subcategory;
      button.setAttribute('data-subcategory', subcategory);
      subcategoryGrid.appendChild(button);
    });

    // Add event listeners to subcategory buttons
    subcategoryGrid.querySelectorAll('.subcategory-button').forEach(button => {
      button.addEventListener('click', function () {
        subcategoryGrid.querySelectorAll('.subcategory-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const subcategoryValue = this.getAttribute('data-subcategory');
        filterProducts(currentFilter, subcategoryValue, currentSearchTerm);
      });
    });

    subcategoryContainer.style.display = 'block';
  }

  function hideSubcategories() {
    subcategoryContainer.style.display = 'none';
    currentSubcategory = 'all';
  }
  function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
      button.addEventListener('click', function () {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');
        filterProducts(filterValue, 'all', currentSearchTerm);
      });
    });
  }

  // Search functionality
  function initializeSearch() {
    if (!searchInput || !searchClear) {
      console.error('Search elements not found!');
      return;
    }

    // Search input event listener
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value;

      // Show/hide clear button
      if (searchTerm.length > 0) {
        searchClear.style.display = 'flex';
      } else {
        searchClear.style.display = 'none';
      }

      // Filter products with search term
      filterProducts(currentFilter, currentSubcategory, searchTerm);
    });

    // Clear search button
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.style.display = 'none';
      filterProducts(currentFilter, currentSubcategory, '');
      searchInput.focus();
    });

    // Enter key support
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        this.blur(); // Remove focus from input
      }
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
  initializeSearch();
  fetchProducts();
});
