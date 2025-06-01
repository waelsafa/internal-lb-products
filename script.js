document.addEventListener("DOMContentLoaded", function () {
  const productGrid = document.querySelector(".product-grid");  async function fetchProducts() {
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
      
      // Add small delay for better UX
      setTimeout(() => {
        displayProducts(products);
      }, 500);
      
    } catch (error) {
      console.error("Error fetching products:", error);      productGrid.innerHTML = `
        <div class="loading">
          <p style="color: var(--forest-green);">Error loading products. Please refresh the page to try again.</p>
        </div>
      `;
    }
  }  function displayProducts(products) {
    productGrid.innerHTML = "";
    products.forEach((product, index) => {
      if (!product.title || !product.image) {
        console.warn('Skipping product due to missing title or image:', product);
        return;
      }
      
      // Format category name for display
      const categoryDisplay = product.category ? 
        product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
        'Specialty';
      
      const card = document.createElement("div");
      card.classList.add("product-card", "fade-in", product.category || "all");
      card.style.animationDelay = `${index * 0.1}s`;
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
        <div class="product-content">
          <h2>${product.title}</h2>
          <p>${product.description || ""}</p>
          <span class="category-badge">${categoryDisplay}</span>
        </div>
      `;
      productGrid.appendChild(card);
    });
    // Re-initialize filter functionality after products are loaded
    initializeFilters();
  }
  function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const cards = document.querySelectorAll(".product-card");

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Show/hide cards based on filter
        cards.forEach(card => {
          if (filterValue === 'all' || card.classList.contains(filterValue)) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
  fetchProducts(); // Load products when the page loads
});
