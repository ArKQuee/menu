require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { resolve } = require("path");

const app = express();
const port = 3010;

// Middleware
app.use(express.static("static"));
app.use(express.json()); // Parses JSON data in requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Connection Error:", err));

// Define the MenuItem Schema
const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true }
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);

// Serve Homepage
app.get("/", (req, res) => {
    res.sendFile(resolve(__dirname, "pages/index.html"));
});

// API Routes

// GET all menu items
app.get("/menu", async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADD a new menu item
app.post("/menu", async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: "Name and price are required" });
        }
        const newItem = new MenuItem({ name, description, price });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a menu item
app.put("/menu/:id", async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a menu item
app.delete("/menu/:id", async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }
        res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
