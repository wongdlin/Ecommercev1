const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../src/img"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Handle MySQL connection errors
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Exit server if database fails
  }
  console.log("✅ Connected to MySQL");
});

// ✅ Ensure JWT Secret is set
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env file");
  process.exit(1);
}

app.post("/register", async (req, res) => {
  const { name, email, password, checkpassword } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length > 0)
        return res.status(400).json({ error: "Email already in use" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sql = "INSERT INTO users (name, email, password) VALUES (?,?,?)";
      db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User registered successfully" });
      });
    }
  );
});

app.post("/admin-login", (req, res) => {
  console.log("entered admin");
  const { email, password } = req.body;

  const sql = "SELECT * FROM admins WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database Error" });
    if (result.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result[0];

    // ✅ Properly compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err)
        return res.status(500).json({ error: "Error comparing passwords" });
      if (!isMatch)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database Error" });
    if (result.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result[0];

    // ✅ Properly compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err)
        return res.status(500).json({ error: "Error comparing passwords" });
      if (!isMatch)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    });
  });
});

app.post("/cart", (req, res) => {
  const { userId, cart } = req.body;
  const cartJSON = JSON.stringify(cart);

  db.query(
    "INSERT INTO cart (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = ?",
    [userId, cartJSON, cartJSON],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Cart updated successfully" });
    }
  );
});

app.get("/cart/:userId", (req, res) => {
  const { userId } = req.params;

  db.query(
    "SELECT cart_data FROM cart WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        res.json({ cart: JSON.parse(results[0].cart_data) });
      } else {
        res.json({ cart: [] });
      }
    }
  );
});

app.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ error: "Invalid token" });
    }

    if (decoded.role === "admin") {
      res.json({ message: "Welcome to admin dashboard", admin: decoded });
    } else {
      res.json({ message: "Welcome to dashboard", user: decoded });
    }
  });
});

app.get("/", (req, res) => {
  return res.json("From Backend Side");
});

app.get("/product", (req, res) => {
  const sql = "SELECT * FROM product WHERE is_active=1";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// ✅ Store cart in the database (for logged-in users) or localStorage (for guests)
app.post("/cart/add", (req, res) => {
  const { userId, productId, qty } = req.body;
  // ✅ Fetch product details from DB (latest price & stock)
  db.query(
    "SELECT id, price, stock, title FROM product WHERE id = ?",
    [productId],
    (err, productRows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database Error" });
      }

      if (!productRows.length) {
        return res.status(404).json({ error: "Product Not Found" });
      }

      const product = productRows[0];

      // ✅ If user is logged in, update cart in DB
      if (userId) {
        db.query(
          "SELECT cart_data FROM cart WHERE user_id = ?",
          [userId],
          (err, rows) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ error: "Database Error" });
            }

            let cartItems = rows.length ? JSON.parse(rows[0].cart_data) : [];
            let existingItem = cartItems.find((item) => item.id === productId);
            let newQty = existingItem ? existingItem.qty + qty : qty;

            if (newQty > product.stock) {
              return res
                .status(400)
                .json({ error: `Only ${product.stock} items available!` });
            }

            if (existingItem) {
              existingItem.qty = newQty;
            } else {
              cartItems.push({ id: productId, qty, title: product.title });
            }

            let totalPrice = cartItems.reduce((total, item) => {
              let product = productRows.find((p) => p.id === item.id);
              return total + (product ? product.price * item.qty : 0);
            }, 0);

            // ✅ Save updated cart to database
            db.query(
              "INSERT INTO cart (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = ?",
              [userId, JSON.stringify(cartItems), JSON.stringify(cartItems)],
              (err) => {
                if (err) {
                  console.error("Database error:", err);
                  return res
                    .status(500)
                    .json({ error: "Failed to update cart" });
                }

                res.json({ success: true, cart: cartItems, totalPrice });
              }
            );
          }
        );
      } else {
        // ✅ Guest users: Store in localStorage (handled in frontend)
        res.json({ success: true, product, isGuest: true });
      }
    }
  );
});

app.get("/product/:id", (req, res) => {
  const productId = req.params.id;

  db.query(
    "SELECT * FROM product WHERE id = ? AND is_active=1",
    [productId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Product Not Found" });
      }
      res.json(result[0]);
    }
  );
});

app.post("/add-product", upload.single("image"), (req, res) => {
  const { title, price, stock, is_active } = req.body;
  const imageUrl = `src/img/${req.file.filename}`;
  const sql =
    "INSERT INTO product (title,price, stock, image, is_active) VALUES (?,?,?,?,?)";

  db.query(sql, [title, price, stock, imageUrl, is_active], (err, result) => {
    if (err) {
      console.error("Error inserting product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  });
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//admin

app.get("/admin/orders", (req, res) => {
  db.query(
    `SELECT 
        orders.id AS orderId, 
        orders.total_price, 
        orders.created_at, 
        orders.status,
        users.id AS customerId, 
        users.name AS customerName, 
        users.email,
        addresses.street,
        addresses.city,
        addresses.state,
        addresses.postcode,
        addresses.country,
        CONCAT('[', GROUP_CONCAT(
          JSON_OBJECT(
            'productId', order_items.product_id,
            'productName', product.title,
            'quantity', order_items.quantity
          )
        ), ']') AS items 
      FROM orders 
      JOIN users ON orders.user_id = users.id
      JOIN addresses ON orders.user_id = addresses.user_id 
      JOIN order_items ON order_items.order_id = orders.id 
      JOIN product ON order_items.product_id = product.id 
      WHERE orders.is_active = 1 
      AND addresses.is_default = 1
      GROUP BY orders.id
      ORDER BY orders.created_at DESC`,
    (err, result) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result);
    }
  );
});

app.get("/admin/productslist", (req, res) => {
  db.query("SELECT * FROM product", (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

app.get("/admin/productslist/:id", (req, res) => {
  const productId = req.params.id;
  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  db.query("SELECT * FROM product WHERE id = ?", [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result[0]);
  });
});

app.put("/admin/productslist/:id", upload.single("image"), (req, res) => {
  const productId = req.params.id;
  const { title, price, stock, is_active } = req.body;
  const imagePath = req.file ? `src/img/${req.file.filename}` : null;

  let sql = "UPDATE product SET";
  let values = [];
  let updates = [];

  if (title) {
    updates.push("title=?");
    values.push(title);
  }

  if (price) {
    updates.push("price=?");
    values.push(price);
  }

  if (stock) {
    updates.push("stock=?");
    values.push(stock);
  }

  if (is_active != null) {
    updates.push("is_active=?");
    values.push(is_active);
  }

  if (imagePath) {
    updates.push("image=?");
    values.push(imagePath);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  sql += " " + updates.join(", ") + " WHERE id=?";
  values.push(productId);

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.json({ message: "Product updated successfully", product: result });
  });
});

app.get("/admin/customerlist", (req, res) => {
  db.query(
    `SELECT 
    users.id, 
    users.name, 
    users.email,
    COALESCE(addresses.street, '') AS street,
    COALESCE(addresses.city, '') AS city,
    COALESCE(addresses.state, '') AS state,
    COALESCE(addresses.postcode, '') AS postcode,
    COALESCE(addresses.country, '') AS country
    FROM users
    LEFT JOIN addresses ON users.id = addresses.user_id AND addresses.is_default = 1`,
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result);
    }
  );
});

app.delete("/admin/customerlist/:id", (req, res) => {
  const customerId = req.params.id;
  db.query(
    "UPDATE users SET is_active = 0 WHERE id = ?",
    [customerId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Customer deleted" });
    }
  );
});

// Update order status
app.put("/admin/orders/:id", (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Order status updated" });
    }
  );
});

// Delete order
app.delete("/admin/orders/:id", (req, res) => {
  const orderId = req.params.id;
  db.query("UPDATE orders SET is_active = 0 WHERE id = ?", [orderId], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Order deleted" });
  });
});

app.get("/get-default-address/:id", (req, res) => {
  console.log("default address");
  const userId = req.params.id;
  db.query(
    "SELECT street, city, state, postcode, country FROM addresses WHERE user_id = ? AND is_default = 1",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error", details: err });
      }
      if (result.length === 0) {
        console.error("No address found:", userId);
        return res.status(404).json({ error: "No records" });
      }
      console.log("Address found:", result[0]);
      res.json(result[0]);
    }
  );
});

app.post("/add-address", (req, res) => {
  const { userId, street, city, state, postcode, country } = req.body;

  if (!userId || !street || !city || !state || !postcode || !country) {
    return res.status(400).json({ error: "All address fields are required" });
  }

  const addressQuery = `
  INSERT INTO addresses (user_id, street, city, state, postcode, country, is_default)
  VALUES (?, ?, ?, ?, ?, ?, 1)
  ON DUPLICATE KEY UPDATE 
  street = VALUES(street), city = VALUES(city), state = VALUES(state), 
  postcode = VALUES(postcode), country = VALUES(country), is_default = 1
`;

  db.query(
    addressQuery,
    [userId, street, city, state, postcode, country],
    (err, result) => {
      if (err) {
        console.error("Address Update Error:", err);
        return res.status(500).json({ error: "Failed to update address" });
      }
      res.json({ success: true, message: "Address updated successfully" });
    }
  );
});

app.post("/checkout", (req, res) => {
  const { userId, cartItems, totalPrice } = req.body;

  if (!userId || cartItems.length === 0) {
    return res.status(400).json({ error: "Invalid checkout request" });
  }

  // Start a transaction to ensure data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ error: "Database transaction error" });
    }

    // Insert new order
    db.query(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [userId, totalPrice],
      (err, result) => {
        if (err) {
          console.error("Order insert error:", err);
          return db.rollback(() =>
            res.status(500).json({ error: "Database error" })
          );
        }

        const orderId = result.insertId;
        const orderItems = cartItems.map((item) => [
          orderId,
          item.id,
          item.qty,
          item.price,
        ]);

        // Insert order items
        db.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
          [orderItems],
          (err) => {
            if (err) {
              console.error("Order items insert error:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Error saving order items" })
              );
            }

            // Update stock for each product
            const updateStockPromises = cartItems.map((item) => {
              return new Promise((resolve, reject) => {
                db.query(
                  "UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?",
                  [item.qty, item.id, item.qty],
                  (err, result) => {
                    if (err) {
                      console.error(
                        `Stock update error for product ${item.id}:`,
                        err
                      );
                      return reject(err);
                    }
                    if (result.affectedRows === 0) {
                      console.warn(`Stock insufficient for product ${item.id}`);
                      return reject(
                        new Error(`Not enough stock for product ID: ${item.id}`)
                      );
                    }
                    resolve();
                  }
                );
              });
            });

            // Execute stock updates
            Promise.all(updateStockPromises)
              .then(() => {
                db.commit((err) => {
                  if (err) {
                    console.error("Transaction commit error:", err);
                    return db.rollback(() =>
                      res
                        .status(500)
                        .json({ error: "Transaction commit failed" })
                    );
                  }
                  res.json({ message: "Order placed successfully!" });
                });
              })
              .catch((err) => {
                console.error("Stock update failed:", err);
                db.rollback(() =>
                  res
                    .status(400)
                    .json({ error: err.message || "Stock update error" })
                );
              });
          }
        );
      }
    );
  });
});

app.get("/admin/sales-summary", async (req, res) => {
  try {
    const query = (sql) => {
      return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) reject(err);
          else resolve(results); // Extract first row
        });
      });
    };

    const yearlyResult = await query(`
      SELECT COALESCE(SUM(total_price), 0) AS totalSalesYear 
      FROM orders 
      WHERE YEAR(created_at) = YEAR(CURDATE())
    `);

    const monthlyResult = await query(`
      SELECT COALESCE(SUM(total_price), 0) AS totalSalesMonth 
      FROM orders 
      WHERE YEAR(created_at) = YEAR(CURDATE()) 
      AND MONTH(created_at) = MONTH(CURDATE())
    `);

    const dailyResult = await query(`
      SELECT COALESCE(SUM(total_price), 0) AS totalSalesDay 
      FROM orders 
      WHERE DATE(created_at) = CURDATE()
    `);

    const allMonthResult = await query (`
      SELECT COALESCE(SUM(total_price), 0) AS totalSales, 
      DATE_FORMAT(created_at, '%M') AS totalSalesMonth 
      FROM orders 
      WHERE YEAR(created_at) = YEAR(CURDATE()) 
      GROUP BY MONTH(created_at);
    `);

    res.json({
      totalSalesYear: yearlyResult[0].totalSalesYear || 0,
      totalSalesMonth: monthlyResult[0].totalSalesMonth || 0,
      totalSalesDay: dailyResult[0].totalSalesDay || 0,
      salesByMonth: allMonthResult || [],
    });
  } catch (err) {
    console.error("Error fetching sales summary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8081, () => {
  console.log("✅ Server is running on port 8081");
});
