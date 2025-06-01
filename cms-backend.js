const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 8001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Get all entries for a collection
app.get('/api/collections/:collection/entries', async (req, res) => {
  try {
    const collection = req.params.collection;
    const folderPath = path.join(__dirname, `_${collection}`);
    
    const files = await fs.readdir(folderPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const entries = await Promise.all(markdownFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);
      
      return {
        slug: path.basename(file, '.md'),
        path: `_${collection}/${file}`,
        raw: content,
        data: parsed.data,
        content: parsed.content
      };
    }));
    
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single entry
app.get('/api/collections/:collection/entries/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const filePath = path.join(__dirname, `_${collection}`, `${slug}.md`);
    
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = matter(content);
    
    res.json({
      slug,
      path: `_${collection}/${slug}.md`,
      raw: content,
      data: parsed.data,
      content: parsed.content
    });
  } catch (error) {
    console.error('Error getting entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update entry
app.put('/api/collections/:collection/entries/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const { data, content = '' } = req.body;
    
    // Create frontmatter content
    const frontmatter = Object.keys(data).map(key => {
      const value = data[key];
      if (typeof value === 'string') {
        return `${key}: "${value}"`;
      } else if (typeof value === 'boolean') {
        return `${key}: ${value}`;
      } else {
        return `${key}: ${JSON.stringify(value)}`;
      }
    }).join('\n');
    
    const fileContent = `---\n${frontmatter}\n---\n${content}`;
    
    const folderPath = path.join(__dirname, `_${collection}`);
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, `${slug}.md`);
    await fs.writeFile(filePath, fileContent);
    
    console.log(`✅ Saved: ${filePath}`);
    
    // Rebuild the JSON data
    exec('node build.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error.message}`);
      } else {
        console.log('✅ Rebuilt products.json');
      }
    });
    
    res.json({ message: 'Entry saved successfully', slug });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete entry
app.delete('/api/collections/:collection/entries/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const filePath = path.join(__dirname, `_${collection}`, `${slug}.md`);
    
    await fs.unlink(filePath);
    console.log(`🗑️  Deleted: ${filePath}`);
    
    // Rebuild the JSON data
    exec('node build.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error.message}`);
      } else {
        console.log('✅ Rebuilt products.json');
      }
    });
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CMS Backend running on http://localhost:${PORT}`);
  console.log('📝 Ready to receive CMS requests...');
});
