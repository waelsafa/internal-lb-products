const fs = require('fs');
const path = require('path');

const mediaDir = './media';
const outputFile = './_data/products.json';
const markdownDir = './_products';

// Clear existing products
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

// Clear existing markdown files
if (fs.existsSync(markdownDir)) {
  fs.rmSync(markdownDir, { recursive: true, force: true });
}
fs.mkdirSync(markdownDir, { recursive: true });

let products = [];

function getMainCategoryFromPath(folderPath) {
  const lowerPath = folderPath.toLowerCase();
  
  // Separate cheese and cold cuts
  if (lowerPath.includes('cheese') || lowerPath.includes('auricchio') || lowerPath.includes('central cheese')) {
    return 'cheese';
  }
  
  if (lowerPath.includes('cold cuts') || lowerPath.includes('levoni') || lowerPath.includes('ibis') || lowerPath.includes('maldera')) {
    return 'cold-cuts';
  }
  
  // Combine antipasti and truffle products
  if (lowerPath.includes('antipasti') || lowerPath.includes('truffle')) {
    return 'antipasti';
  }
  
  if (lowerPath.includes('fish')) {
    return 'fish-products';
  }
  
  if (lowerPath.includes('sauces') || lowerPath.includes('condiments')) {
    return 'sauces-condiments';
  }
  
  if (lowerPath.includes('sweets') || lowerPath.includes('snacks')) {
    return 'sweets-snacks';
  }
  
  if (lowerPath.includes('pasta') || lowerPath.includes('rice') || lowerPath.includes('flour')) {
    return 'pasta-rice-flour';
  }
  
  // Default fallback
  return 'sauces-condiments';
}

function getBrandFromPath(folderPath, filename) {
  const pathParts = folderPath.split(path.sep);
  
  // Look for brand folders
  for (let i = pathParts.length - 1; i >= 0; i--) {
    const part = pathParts[i].toLowerCase();
    
    // Known brand patterns
    if (part.includes('auricchio')) return 'Auricchio';
    if (part.includes('levoni')) return 'Levoni';
    if (part.includes('central cheese')) return 'Central Cheese';
    if (part.includes('ibis')) return 'Ibis';
    if (part.includes('maldera')) return 'Maldera';
    if (part.includes('callipo')) return 'Callipo';
    if (part.includes('parodi')) return 'Angelo Parodi';
    if (part.includes('boschi')) return 'Boschi 1961';
    if (part.includes('il boschetto')) return 'Il Boschetto';
    
    // Check for brand codes in folder names
    if (part.match(/^[a-z]{2,3}\d{4}/)) return part.toUpperCase();
  }
  
  // Look for brand in filename
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('auricchio')) return 'Auricchio';
  if (lowerFilename.includes('levoni')) return 'Levoni';
  if (lowerFilename.includes('callipo')) return 'Callipo';
  if (lowerFilename.includes('parodi')) return 'Angelo Parodi';
  if (lowerFilename.includes('boschi')) return 'Boschi 1961';
  
  return 'Unknown Brand';
}

function generateProductName(filename) {
  let name = filename
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
  
  return name;
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function scanDirectory(dir, relativePath = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const itemRelativePath = path.join(relativePath, item);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip dry and fresh folders to avoid duplicates
      if (item.toLowerCase().includes('dry') || item.toLowerCase().includes('fresh')) {
        console.log(`Skipping directory: ${itemRelativePath} (contains 'dry' or 'fresh')`);
        return;
      }
      
      scanDirectory(fullPath, itemRelativePath);
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
      const category = getMainCategoryFromPath(relativePath);
      const brand = getBrandFromPath(relativePath, item);
      const name = generateProductName(item);
      const id = generateSlug(name);
      
      const product = {
        id,
        name,
        image: `media/${itemRelativePath.replace(/\\/g, '/')}`,
        category,
        brand,
        subCategory: `${category}-${brand.toLowerCase().replace(/\s+/g, '-')}`,
        description: getCategoryDescription(category)
      };
      
      products.push(product);
      
      // Create markdown file
      const markdownContent = `---
id: ${id}
name: "${name}"
image: "${product.image}"
category: "${category}"
brand: "${brand}"
description: "${product.description}"
---

# ${name}

![${name}](${product.image})

**Category:** ${category}
**Brand:** ${brand}

${product.description}
`;
      
      const markdownPath = path.join(markdownDir, `${id}.md`);
      fs.writeFileSync(markdownPath, markdownContent);
    }
  });
}

function getCategoryDescription(category) {
  const descriptions = {
    'cheese': 'Premium artisanal Italian cheeses, carefully selected for their exceptional quality and authentic taste.',
    'cold-cuts': 'Fine Italian cold cuts and cured meats, crafted using traditional methods and the finest ingredients.',
    'antipasti': 'Delicious Italian appetizers and specialty products, perfect for starting any meal.',
    'fish-products': 'Premium Italian seafood products, including tuna, sardines, and other Mediterranean specialties.',
    'sauces-condiments': 'Authentic Italian sauces, condiments, and flavor enhancers to elevate your culinary creations.',
    'sweets-snacks': 'Traditional Italian sweets, snacks, and confections made with time-honored recipes.',
    'pasta-rice-flour': 'High-quality Italian pasta, rice, and flour products made from the finest grains.'
  };
  
  return descriptions[category] || 'Premium Italian food products selected for their exceptional quality and authentic taste.';
}

// Start scanning
console.log('Scanning media directory...');
scanDirectory(mediaDir);

// Sort products by name
products.sort((a, b) => a.name.localeCompare(b.name));

// Write products.json
fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));

console.log(`\nScan complete!`);
console.log(`Total products found: ${products.length}`);

// Show category breakdown
const categoryBreakdown = {};
const brandBreakdown = {};

products.forEach(product => {
  categoryBreakdown[product.category] = (categoryBreakdown[product.category] || 0) + 1;
  brandBreakdown[product.brand] = (brandBreakdown[product.brand] || 0) + 1;
});

console.log('\nCategory breakdown:');
Object.entries(categoryBreakdown).forEach(([category, count]) => {
  console.log(`  ${category}: ${count} products`);
});

console.log('\nBrand breakdown:');
Object.entries(brandBreakdown).forEach(([brand, count]) => {
  console.log(`  ${brand}: ${count} products`);
});

// Check for duplicates in dry/fresh folders
console.log('\nChecking for dry/fresh folders...');
function checkForDryFreshFolders(dir, relativePath = '') {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        if (item.toLowerCase().includes('dry') || item.toLowerCase().includes('fresh')) {
          console.log(`Found dry/fresh folder: ${itemRelativePath}`);
          
          // List contents to check for new images
          const contents = fs.readdirSync(fullPath);
          const imageFiles = contents.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
          
          if (imageFiles.length > 0) {
            console.log(`  Contains ${imageFiles.length} images:`);
            imageFiles.forEach(img => console.log(`    - ${img}`));
          }
        } else {
          checkForDryFreshFolders(fullPath, itemRelativePath);
        }
      }
    });
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
}

checkForDryFreshFolders(mediaDir);
