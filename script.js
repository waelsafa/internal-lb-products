document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".filters button");
  const cards = document.querySelectorAll(".product-card");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      cards.forEach((card) => {
        if (filter === "all" || card.classList.contains(filter)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Sidebar filter functionality
  const sidebar = document.querySelector('.sidebar-filters');
  if (sidebar) {
    const checkboxes = sidebar.querySelectorAll('input[type="checkbox"]');
    const allCheckbox = sidebar.querySelector('input[value="all"]');
    
    function applyFilters() {
      const checked = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      // Handle the All checkbox
      if (allCheckbox.checked) {
        // If "All" is checked, uncheck other filters
        checkboxes.forEach(cb => {
          if (cb.value !== 'all') {
            cb.checked = false;
          }
        });
        // Show all products
        cards.forEach(card => {
          card.style.display = "block";
        });
        return;
      }
      
      // If no filters are selected, check "All" by default
      if (checked.length === 0) {
        allCheckbox.checked = true;
        cards.forEach(card => {
          card.style.display = "block";
        });
        return;
      }
      
      // Show only products that match selected filters
      cards.forEach(card => {
        const matchesFilter = checked.some(category => 
          card.classList.contains(category)
        );
        card.style.display = matchesFilter ? "block" : "none";
      });
    }
    
    // Add event listeners to checkboxes
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        // If this is the "All" checkbox and it was just checked
        if (this.value === 'all' && this.checked) {
          // Will be handled in applyFilters
        } else if (this.checked) {
          // If any other checkbox is checked, uncheck "All"
          allCheckbox.checked = false;
        }
        
        applyFilters();
      });
    });
    
    // Initialize filters on page load
    applyFilters();
  }
});
