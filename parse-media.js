const fs = require('fs');
const path = require('path');

// Available categories from the filters
const categories = {
  'cheese-cold-cuts': ['prosciutto', 'bresaola', 'salame', 'mortadella', 'pancetta', 'coppa', 'guanciale', 'speck', 'cotto', 'cheese', 'formaggio', 'parmigiano', 'gorgonzola', 'pecorino', 'mozzarella'],
  'pasta-rice-flour': ['pasta', 'spaghetti', 'fusilli', 'penne', 'gnocchi', 'tagliatelle', 'linguine', 'fettuccine', 'orecchiette', 'paccheri', 'rigatoni', 'farfalle', 'rice', 'riso', 'flour', 'farina', 'semola', 'tipo', 'caputo', 'de cecco'],
  'coffee-tea': ['coffee', 'caffe', 'espresso', 'tea', 'te'],
  'sauces-condiments': ['sauce', 'sugo', 'pesto', 'olio', 'oil', 'olive', 'aceto', 'vinegar', 'condiment'],
  'seasonal': ['seasonal', 'natale', 'christmas', 'easter', 'pasqua'],
  'wine-liquor': ['wine', 'vino', 'champagne', 'prosecco', 'liquor', 'liqueur', 'grappa', 'limoncello'],
  'sweets-snacks': ['chocolate', 'cioccolato', 'dolce', 'biscotti', 'cookies', 'cake', 'torta', 'snack', 'candy']
};

// Function to determine category from filename
function categorizeProduct(filename, folderPath) {
  const lowerFilename = filename.toLowerCase();
  const lowerFolderPath = folderPath.toLowerCase();
  
  // Check folder structure for hints
  if (lowerFolderPath.includes('fresh products')) {
    return 'cheese-cold-cuts'; // Most fresh products are meat/cheese
  }
  
  // Check filename against category keywords
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (lowerFilename.includes(keyword) || lowerFolderPath.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default fallback based on folder structure
  if (lowerFolderPath.includes('dry products')) {
    if (lowerFolderPath.includes('caputo') || lowerFolderPath.includes('de cecco')) {
      return 'pasta-rice-flour';
    }
    return 'sauces-condiments'; // Default for dry products
  }
  
  return 'cheese-cold-cuts'; // Default fallback
}

// Function to clean and format product name
function formatProductName(filename) {
  let name = filename.replace(/\.(jpg|jpeg|png|gif)$/i, ''); // Remove extension
  name = name.replace(/\.jpg:Zone\.Identifier$/, ''); // Remove zone identifier
  name = name.replace(/^\d+\s*-\s*/, ''); // Remove leading numbers and dash
  name = name.replace(/\s*-\s*\d+.*$/, ''); // Remove trailing codes
  name = name.replace(/[_-]/g, ' '); // Replace underscores and dashes with spaces
  name = name.replace(/\s+/g, ' '); // Normalize whitespace
  name = name.trim();
  
  // Capitalize first letter of each word
  return name.replace(/\b\w/g, l => l.toUpperCase());
}

// Function to generate product description
function generateDescription(name, category) {
  const descriptions = {
    'cheese-cold-cuts': [
      `Premium ${name.toLowerCase()} carefully selected for its exceptional quality and authentic taste.`,
      `Traditional ${name.toLowerCase()} made with time-honored methods and finest ingredients.`,
      `Artisanal ${name.toLowerCase()} offering rich flavors and superior texture.`
    ],
    'pasta-rice-flour': [
      `High-quality ${name.toLowerCase()} made from the finest durum wheat for perfect texture.`,
      `Premium ${name.toLowerCase()} crafted using traditional Italian methods.`,
      `Authentic ${name.toLowerCase()} ideal for creating delicious Italian dishes.`
    ],
    'sauces-condiments': [
      `Premium ${name.toLowerCase()} made with carefully selected ingredients.`,
      `Authentic ${name.toLowerCase()} perfect for enhancing your culinary creations.`,
      `Traditional ${name.toLowerCase()} bringing genuine Italian flavors to your table.`
    ],
    'wine-liquor': [
      `Exceptional ${name.toLowerCase()} with complex flavors and refined character.`,
      `Premium ${name.toLowerCase()} perfect for special occasions and fine dining.`,
      `Carefully selected ${name.toLowerCase()} offering superior quality and taste.`
    ],
    'coffee-tea': [
      `Premium ${name.toLowerCase()} with rich aroma and exceptional flavor profile.`,
      `Carefully roasted ${name.toLowerCase()} for the perfect cup every time.`,
      `Authentic ${name.toLowerCase()} bringing traditional taste to your daily ritual.`
    ],
    'sweets-snacks': [
      `Delicious ${name.toLowerCase()} made with premium ingredients and traditional recipes.`,
      `Authentic ${name.toLowerCase()} perfect for indulgent moments.`,
      `Traditional ${name.toLowerCase()} crafted with care and attention to detail.`
    ],
    'seasonal': [
      `Special ${name.toLowerCase()} available for a limited time during the season.`,
      `Premium seasonal ${name.toLowerCase()} celebrating traditional flavors.`,
      `Authentic ${name.toLowerCase()} perfect for seasonal celebrations.`
    ]
  };
  
  const categoryDescriptions = descriptions[category] || descriptions['cheese-cold-cuts'];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Function to recursively find all image files
function findAllImages(dir, basePath = '') {
  const images = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      images.push(...findAllImages(fullPath, path.join(basePath, item)));
    } else if (stat.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(item) && !item.includes('Zone.Identifier')) {
      images.push({
        filename: item,
        fullPath: fullPath,
        relativePath: path.join(basePath, item),
        folderPath: basePath
      });
    }
  }
  
  return images;
}

// Main function to parse media and generate products
function parseMediaFolder() {
  const mediaPath = path.join(__dirname, 'media');
  const outputPath = path.join(__dirname, '_data', 'products.json');
  const productsDir = path.join(__dirname, '_products');
  
  // Find all images
  console.log('Scanning media folder for images...');
  const images = findAllImages(mediaPath);
  console.log(`Found ${images.length} images`);
  
  // Generate products
  const products = [];
  const usedNames = new Set();
  
  for (const image of images) {
    const productName = formatProductName(image.filename);
    
    // Skip if we already have a product with similar name
    if (usedNames.has(productName.toLowerCase())) {
      continue;
    }
    usedNames.add(productName.toLowerCase());
    
    const category = categorizeProduct(image.filename, image.folderPath);
    const description = generateDescription(productName, category);
    
    // Create product object
    const product = {
      id: productName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      name: productName,
      image: `media/${image.relativePath.replace(/\\/g, '/')}`,
      category: category,
      description: description
    };
    
    products.push(product);
    
    // Create markdown file
    const markdownContent = `---
title: "${product.name}"
image: "${product.image}"
category: "${product.category}"
description: "${product.description}"
---

# ${product.name}

${product.description}

**Category:** ${product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
`;
    
    const markdownPath = path.join(productsDir, `${product.id}.md`);
    fs.writeFileSync(markdownPath, markdownContent);
  }
  
  // Sort products by category and name
  products.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
  
  // Write products.json
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  
  console.log(`Generated ${products.length} products`);
  console.log(`Created products.json at ${outputPath}`);
  console.log(`Created ${products.length} markdown files in ${productsDir}`);
  
  // Show category breakdown
  const categoryCount = {};
  products.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
  });
  
  console.log('\nCategory breakdown:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
  });
}

// Run the parser
if (require.main === module) {
  parseMediaFolder();
}

module.exports = { parseMediaFolder };
