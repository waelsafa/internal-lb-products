const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const matter = require('gray-matter');

const app = express();
const PORT = 8080;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API endpoint to get all entries for a collection
app.get('/api/v1/entries/:collection', (req, res) => {
  const collection = req.params.collection;
  console.log(`Getting entries for collection: ${collection}`);
  
  try {
    const collectionPath = path.join(__dirname, `_${collection}`);
    
    if (!fs.existsSync(collectionPath)) {
      console.log(`Collection path not found: ${collectionPath}`);
      return res.json([]);
    }
    
    const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} files in ${collectionPath}`);
    
    const entries = files.map(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);
      
      return {
        slug: file.replace('.md', ''),
        path: `_${collection}/${file}`,
        data: parsed.data,
        content: parsed.content
      };
    });
    
    console.log(`Returning ${entries.length} entries`);
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get a single entry
app.get('/api/v1/entries/:collection/:slug', (req, res) => {
  const { collection, slug } = req.params;
  console.log(`Getting entry: ${collection}/${slug}`);
  
  try {
    const filePath = path.join(__dirname, `_${collection}`, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    const entry = {
      slug,
      path: `_${collection}/${slug}.md`,
      data: parsed.data,
      content: parsed.content
    };
    
    res.json(entry);
  } catch (error) {
    console.error('Error getting entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
