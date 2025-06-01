const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Create _data directory if it doesn't exist
const dataDir = path.join(__dirname, '_data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Read all markdown files from _products directory
const productsDir = path.join(__dirname, '_products');
const products = [];

if (fs.existsSync(productsDir)) {
  const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.md'));
  
  files.forEach(file => {
    const filePath = path.join(productsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    // Only include published products
    if (data.published !== false) {
      products.push({
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        published: data.published
      });
    }
  });
}

// Write products to JSON file
const outputPath = path.join(dataDir, 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

console.log(`Generated ${products.length} products in ${outputPath}`);
