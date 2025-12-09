const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new Database('inventory.db');

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    sku TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Populate with 20 sample products if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, category, price, quantity, sku)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    ['Rossignol Experience 88 Ti Skis', 'All-mountain skis with titanal construction, 172cm', 'Skis', 699.99, 12, 'SKI-001'],
    ['Atomic Hawx Ultra 130 Boots', 'High-performance alpine ski boots, size 27.5', 'Boots', 549.99, 8, 'BOOT-002'],
    ['Black Diamond Carbon Pro Poles', 'Lightweight carbon fiber ski poles, 125cm', 'Poles', 129.99, 25, 'POLE-003'],
    ['Oakley Flight Deck Goggles', 'Prizm lens snow goggles with anti-fog coating', 'Goggles', 189.99, 18, 'GOG-004'],
    ['Smith Vantage MIPS Helmet', 'Premium ski helmet with MIPS protection, size L', 'Helmets', 249.99, 15, 'HLM-005'],
    ['Salomon QST 92 Skis', 'Freeride all-mountain skis, 180cm', 'Skis', 599.99, 10, 'SKI-006'],
    ['Lange RX 120 Boots', 'Race-inspired ski boots for advanced skiers, size 26', 'Boots', 499.99, 7, 'BOOT-007'],
    ['K2 Mindbender 99 Ti Skis', 'Versatile all-mountain skis with titanal, 177cm', 'Skis', 649.99, 9, 'SKI-008'],
    ['POC Fovea Clarity Goggles', 'Cylindrical lens goggles with Clarity technology', 'Goggles', 169.99, 22, 'GOG-009'],
    ['Giro Range MIPS Helmet', 'Adjustable ventilation ski helmet, size M', 'Helmets', 199.99, 14, 'HLM-010'],
    ['Leki Supreme Shark Poles', 'Aluminum ski poles with trigger system, 120cm', 'Poles', 89.99, 30, 'POLE-011'],
    ['Volkl Mantra M6 Skis', 'High-performance all-mountain skis, 177cm', 'Skis', 799.99, 6, 'SKI-012'],
    ['Tecnica Mach1 MV 120 Boots', 'Mid-volume performance boots, size 28', 'Boots', 529.99, 9, 'BOOT-013'],
    ['Anon M4 Goggles', 'Cylindrical toric lens with magnetic face mask', 'Goggles', 299.99, 11, 'GOG-014'],
    ['Sweet Protection Switcher MIPS Helmet', 'Lightweight freeride helmet, size L', 'Helmets', 229.99, 13, 'HLM-015'],
    ['Scott Prospect Poles', 'Composite ski poles with ergonomic grips, 130cm', 'Poles', 69.99, 35, 'POLE-016'],
    ['Nordica Enforcer 94 Skis', 'All-mountain carving skis, 177cm', 'Skis', 679.99, 8, 'SKI-017'],
    ['Dalbello Panterra 120 Boots', 'Four-buckle overlap ski boots, size 27', 'Boots', 479.99, 10, 'BOOT-018'],
    ['Dragon X2 Goggles', 'Frameless design with quick lens change system', 'Goggles', 179.99, 16, 'GOG-019'],
    ['Uvex Legend MIPS Helmet', 'Comfortable all-mountain helmet, size M', 'Helmets', 179.99, 19, 'HLM-020']
  ];

  const insertMany = db.transaction((products) => {
    for (const product of products) {
      insert.run(...product);
    }
  });

  insertMany(sampleProducts);
  console.log('Database populated with 20 sample products');
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, category, price, quantity, sku } = req.body;
    
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, price, quantity, sku)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, description, category, price, quantity, sku);
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, description, category, price, quantity, sku } = req.body;
    
    const stmt = db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, category = ?, price = ?, quantity = ?, sku = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(name, description, category, price, quantity, sku, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
