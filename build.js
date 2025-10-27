const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const productsDir = path.join(__dirname, '_products');
const outputPath = path.join(__dirname, '_data', 'products.json');

// Read all markdown files
const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.md'));

console.log(`Found ${files.length} markdown files`);

const products = [];

files.forEach(file => {
  const filePath = path.join(productsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  
  // Only include published products
  if (data.published) {
    products.push({
      title: data.title,
      description: data.description,
      image: data.image,
      category: data.category,
      subcategory: data.subcategory,
      tags: data.tags || [],
      id: data.id
    });
  }
});

// Sort by category first, then by ID within each category
products.sort((a, b) => {
  // First, sort by category alphabetically
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }
  
  // Within the same category, sort by subcategory
  if (a.subcategory !== b.subcategory) {
    return a.subcategory.localeCompare(b.subcategory);
  }
  
  // Within the same subcategory, sort by ID number
  const aNum = parseInt(a.id.split('-').pop());
  const bNum = parseInt(b.id.split('-').pop());
  return aNum - bNum;
});

// Write to JSON file
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');

console.log(`✅ Built products.json with ${products.length} products`);

// Show breakdown by category
const byCategory = products.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {});

console.log('\nBreakdown by category:');
Object.entries(byCategory).sort().forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});
