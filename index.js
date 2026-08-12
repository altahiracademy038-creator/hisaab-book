// import express from "express"
// import fs from "fs"
// import { fileURLToPath } from "url";
// import path from "path"

// const app = express()

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const dataFile = path.join(__dirname, "data", "customers.json");

// app.set("view engine", "ejs")

// app.use(express.static(path.join(__dirname, "public")))

// app.get("/", function(req, res) {
//     fs.readdir("./files", (err, data) => {
//         res.render("home",{ files: data });
//     });
// });

// app.get("/create",function(req,res){
//   let date = new Date()
//   let today_date = String(date.getDate()).padStart(2,0)
//   let month = String(date.getMonth()).padStart(2,0)
//   let year = date.getFullYear()

//   console.log(`${today_date}-${month}-${year}`);

//   fs.writeFile(`./files/${today_date}-${month}-${year}.txt`,"hello world",function(err){console.log(err);
//   })
  
// })

// app.get("/delete/:id",function(req,res){
//     fs.unlink(`./files/${req.params.id}`,function(err){
//         if (err) {
//             res.send("err")
            
//         }else{
//             res.render("delete")
//         }
// })
// })

// app.listen(3000,function(){console.log("server is running")})




import express from "express"
// const express = require("express");
import fs from "fs"
// const fs = require("fs"
import path from "path"
// const path = require("path");
import { fileURLToPath } from "url";

const app = express();

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, "data", "customers.json");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// -------------------------
// File Handling Functions
// -------------------------

function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf-8");

    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

// -------------------------
// Home
// -------------------------

app.get("/", (req, res) => {
  const customers = readData();

  res.render("index", {
    customers,
  });
});

// -------------------------
// Add Customer
// -------------------------

app.post("/customers", (req, res) => {
  const customers = readData();

  const customer = {
    id: Date.now().toString(),
    name: req.body.name,
    phone: req.body.phone,
    entries: [],
  };

  customers.push(customer);

  writeData(customers);

  res.redirect("/");
});

// -------------------------
// Customer Page
// -------------------------

app.get("/customers/:id", (req, res) => {
  const customers = readData();

  const customer = customers.find((customer) => customer.id === req.params.id);

  if (!customer) {
    return res.status(404).send("Customer not found");
  }

  const total = customer.entries.reduce((sum, entry) => {
    if (entry.type === "udhaar") {
      return sum + entry.amount;
    }

    return sum - entry.amount;
  }, 0);

  res.render("customer", {
    customer,
    total,
  });
});

// -------------------------
// Add Transaction
// -------------------------

app.post("/customers/:id/entries", (req, res) => {
  const customers = readData();

  const customer = customers.find((customer) => customer.id === req.params.id);

  if (!customer) {
    return res.status(404).send("Customer not found");
  }

  const entry = {
    id: Date.now().toString(),
    type: req.body.type,
    amount: Number(req.body.amount),
    description: req.body.description,
    date: new Date().toLocaleDateString(),
  };

  customer.entries.push(entry);

  writeData(customers);

  res.redirect(`/customers/${customer.id}`);
});

// -------------------------
// Delete Transaction
// -------------------------

app.post("/customers/:customerId/entries/:entryId/delete", (req, res) => {
  const customers = readData();

  const customer = customers.find(
    (customer) => customer.id === req.params.customerId,
  );

  if (!customer) {
    return res.status(404).send("Customer not found");
  }

  customer.entries = customer.entries.filter(
    (entry) => entry.id !== req.params.entryId,
  );

  writeData(customers);

  res.redirect(`/customers/${customer.id}`);
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

