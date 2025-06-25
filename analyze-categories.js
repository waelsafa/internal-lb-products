const fs = require('fs');

// Read the products.json file
const products = JSON.parse(fs.readFileSync('_data/products.json', 'utf8'));

// Create category-subcategory mapping
const categoryMap = {};

products.forEach(product => {
  const category = product.category;
  const subcategory = product.subcategory;
  
  if (!categoryMap[category]) {
    categoryMap[category] = new Set();
  }
  categoryMap[category].add(subcategory);
});

// Convert sets to arrays and sort
const result = {};
Object.keys(categoryMap).forEach(category => {
  result[category] = Array.from(categoryMap[category]).sort();
});

console.log('Category-Subcategory Structure:');
console.log(JSON.stringify(result, null, 2));
