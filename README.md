# Alpine Gear Pro - Inventory Management System

A modern web application for managing inventory of downhill skiing equipment. Built with Node.js, Express, SQLite, and vanilla JavaScript with a clean, modern UI.

![Alpine Gear Pro](https://github.com/user-attachments/assets/22133f56-ddc5-4e0f-9252-7cad91fffe16)

## Features

- 📊 **Dashboard Statistics**: View total products, inventory value, and low stock items at a glance
- 🔍 **Search & Filter**: Search products by name, description, or SKU; filter by category (Skis, Boots, Poles, Goggles, Helmets)
- ➕ **Add Products**: Easily add new skiing equipment to your inventory
- ✏️ **Edit Products**: Update product details including name, description, price, and quantity
- 📦 **Quick Quantity Updates**: Fast quantity adjustment feature for efficient stock management
- 🗑️ **Delete Products**: Remove products from inventory
- 💾 **SQLite Database**: Pre-populated with 20 sample skiing products
- 🎨 **Modern UI**: Responsive design with gradient themes and intuitive controls
- 🏔️ **Skiing-Themed**: Specifically designed for downhill skiing equipment retailers

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **UI Design**: Modern gradient design with responsive layout

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testi
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Database

The application automatically creates an SQLite database (`inventory.db`) on first run, pre-populated with 20 skiing equipment products including:
- High-performance skis (Rossignol, Atomic, K2, Volkl, Nordica, Salomon)
- Ski boots (Atomic, Lange, Tecnica, Dalbello)
- Ski poles (Black Diamond, Leki, Scott)
- Ski goggles (Oakley, POC, Anon, Dragon)
- Ski helmets (Smith, Giro, Sweet Protection, Uvex)

## Product Categories

The system supports the following product categories:
- **Skis**: All-mountain, freeride, and carving skis
- **Boots**: Alpine ski boots for various skill levels
- **Poles**: Carbon fiber and aluminum ski poles
- **Goggles**: Snow goggles with various lens technologies
- **Helmets**: MIPS-equipped safety helmets

## API Endpoints

The application provides a RESTful API:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Usage

### Browsing Products
- View all products in the main table
- Use the search box to find specific items
- Filter by category using the dropdown menu
- Color-coded quantity badges show stock levels (red = low, orange = medium, green = good)

### Adding Products
1. Click the "+ ADD NEW PRODUCT" button
2. Fill in the product details (name, description, category, SKU, price, quantity)
3. Click "Save Product"

### Editing Products
1. Click the "✏️ Edit" button on any product
2. Modify the product details in the modal
3. Click "Save Product" to update

### Quick Quantity Update
1. Click the "📦 Qty" button on any product
2. Enter the new quantity
3. Click "Update" to save

### Deleting Products
1. Click the "🗑️ Delete" button on any product
2. Confirm the deletion in the dialog

## Development

The project structure:
```
testi/
├── server.js           # Express server and API routes
├── public/
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Styling and responsive design
│   └── app.js          # Frontend JavaScript logic
├── package.json        # Node.js dependencies
├── inventory.db        # SQLite database (auto-generated)
└── README.md          # This file
```

## License

ISC