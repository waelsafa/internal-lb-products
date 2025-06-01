document.addEventListener("DOMContentLoaded", function () {
  const productGrid = document.querySelector(".product-grid");
  async function fetchProducts() {
    try {
      const response = await fetch('/_data/products.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
  }

  function displayProducts(products) {
    productGrid.innerHTML = "";
    products.forEach((product) => {
      if (!product.title || !product.image) {
        console.warn('Skipping product due to missing title or image:', product);
        return;
      }
      const card = document.createElement("div");

      card.classList.add("product-card", product.category || "all");
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <h2>${product.title}</h2>
        <p>${product.description || ""}</p>
      `;
      productGrid.appendChild(card);
    });
    // Re-initialize filter functionality after products are loaded
    initializeFilters();
  }

  function initializeFilters() {
    const checkboxes = document.querySelectorAll('.sidebar-filters input[type="checkbox"]');
    const allCheckbox = document.querySelector('.sidebar-filters input[value="all"]');
    const cards = document.querySelectorAll(".product-card"); // Re-select cards

    function applyFilters() {
      const checkedCategories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (allCheckbox.checked || checkedCategories.length === 0) {
        checkboxes.forEach(cb => {
          if (cb.value !== 'all') cb.checked = false;
        });
        if(!allCheckbox.checked && checkedCategories.length === 0) allCheckbox.checked = true;

        cards.forEach(card => card.style.display = "block");
        return;
      }
      
      allCheckbox.checked = false; // Uncheck "All" if other filters are active

      cards.forEach(card => {
        const matchesFilter = checkedCategories.some(category =>
          card.classList.contains(category)
        );
        card.style.display = matchesFilter ? "block" : "none";
      });
    }

    checkboxes.forEach(checkbox => {
      checkbox.removeEventListener('change', filterChangeHandler); // Remove old listener
      checkbox.addEventListener('change', filterChangeHandler); // Add new listener
    });
    
    applyFilters(); // Apply filters on initialization
  }

  function filterChangeHandler() {
    const allCheckbox = document.querySelector('.sidebar-filters input[value="all"]');
    if (this.value === 'all' && this.checked) {
      // Uncheck all other boxes
      document.querySelectorAll('.sidebar-filters input[type="checkbox"]').forEach(cb => {
        if (cb.value !== 'all') cb.checked = false;
      });
    } else if (this.checked) {
      // If any other checkbox is checked, uncheck "All"
      allCheckbox.checked = false;
    }
    // Re-query cards and apply filters
    const cards = document.querySelectorAll(".product-card");
    applyCurrentFilters(cards);
  }
  
  function applyCurrentFilters(cardsToFilter) {
      const checkboxes = document.querySelectorAll('.sidebar-filters input[type="checkbox"]');
      const allCheckbox = document.querySelector('.sidebar-filters input[value="all"]');
      const checkedCategories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (allCheckbox.checked || checkedCategories.length === 0) {
         if(!allCheckbox.checked && checkedCategories.length === 0) {
            allCheckbox.checked = true;
         } else if (allCheckbox.checked) {
            checkboxes.forEach(cb => {
                if (cb.value !== 'all') cb.checked = false;
            });
         }
        cardsToFilter.forEach(card => card.style.display = "block");
        return;
      }
      
      allCheckbox.checked = false;

      cardsToFilter.forEach(card => {
        const matchesFilter = checkedCategories.some(category =>
          card.classList.contains(category)
        );
        card.style.display = matchesFilter ? "block" : "none";
      });
  }

  fetchProducts(); // Load products when the page loads
});
