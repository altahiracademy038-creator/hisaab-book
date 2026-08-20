import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";
import session from "express-session";

const app = express();

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, "data", "customers.json");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
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

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/signup", function(req, res) {

    res.render("signup");

});


// Signup form submit
app.post("/signup", function(req, res) {

    const { name, email, password } = req.body;

    let users = readData();

    // Check email already exists
    let existingUser = users.find(function(user) {

        return user.email === email;

    });


    if (existingUser) {

        res.redirect("/login")

    }


    // Create new user
    let newUser = {

        id: Date.now().toString(),

        name: name,

        email: email,

        password: password

    };


    // Add user
    users.push(newUser);


    // Save users
    writeData(users);


    res.redirect("/")

});



// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Login form submit
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  let users = readData();
  // Demo user
  const user = users.find(function(entity){
    return entity.email == email
  })
 
  if (!user) {
    res.redirect("/signup")
  }

  if (email === user.email && password == user.password) {
    // User login ho gaya
    req.session.user = {
      email: email,
    };

    res.redirect("/");
  } else {
    console.log(email,password);
    
    res.send("Invalid email or password");
  }
});

// Dashboard
app.get("/dashboard", (req, res) => {
  // Check login
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`Welcome ${req.session.user.email}`);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Logout error");
    }

    res.redirect("/login");
  });
});

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

// -------------------------
// Delete User
// -------------------------

app.post("/customer/:id",function(req,res){
  let data = readData()

  let user = req.params.id

  let d_user =  data.find(function(data_2){
   return data_2.id === user
  } )
  console.log(d_user);
  
  let updated_user = data.filter(function(data_3){
    return data_3.id !== d_user.id
  })
 console.log(updated_user);
 writeData(updated_user)

 res.redirect("/")

})

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

