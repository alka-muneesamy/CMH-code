// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require('mongoose');
const app = express();
const address = require(__dirname + "/getAddress.js");

let addresses = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://alkak22:Prayer@2311@cluster0.tlu9i.mongodb.net/cmhDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//create the new category and subcategory schema
const categorySchema = {
  name: String
}

const Category = mongoose.model("category", categorySchema);

//create the new subcategory categorySchema
const subCategorySchema = {
  name: String,
  category: categorySchema
}

const SubCategory = mongoose.model("subCategory", subCategorySchema);

//add data to the category list
const category1 = new Category({
  name: "Maintenance"
});
const category2 = new Category({
  name: "Health & fitness"
});

const defaultCategories = [category1, category2];

//add data to subCategory categorySchema
const subcategory1 = new SubCategory({
  name: "Plumber",
  category: category1
});

const defaultSubcategories = [subcategory1];

//display the homepage
app.get("/", function(req, res) {
  res.render("index");
});

// vendor login
app.get("/vendorsign", function(req, res) {
  console.log(addresses);
  let addr =       {addr1: addresses.line1,
                    addr2: addresses.locality,
                    city: addresses.city,
                    county: addresses.county};
  res.render("vendorsign",{ addr: addr });
});

app.post("/vendorsign", function(req, res) {
  inputPostcode = req.body.postcodeVal;
  inputHouse = req.body.houseNoVal;
  const url = "https://api.getAddress.io/find/" + inputPostcode + "/" + inputHouse + "?api-key=eAljQE8lIU2S5-0bU2qpRg28887";
  const request = https.get(url, function(response) {
    console.log(response.statusCode);
    response.on("data", function(data) {
      let postcodeResponse = JSON.parse(data);
      let address1 = postcodeResponse.addresses;
      let newAddress = address1[0].split(",");
      let finalAddress = {
        line1: newAddress[0],
        line2: newAddress[1],
        locality: newAddress[4],
        city: newAddress[5],
        county: newAddress[6]
      };
      addresses.push(finalAddress);
      // res.write(finalAddress.line1);
      // res.write(finalAddress.locality);
      // res.write(finalAddress.city);
      // res.write(finalAddress.county);
      // res.send();
      res.redirect("/vendorsign");
    });
  });
});

//display the categories screen
app.get("/categories", function(req, res) {

  Category.find({}, function(err, foundCategories) {
      if (foundCategories.length === 0) {
        Category.insertMany(defaultCategories, function(err) {
            if (err) {
              console.log("Error inserting the categories");
            } else {
              console.log("Categories inserted successfully");
            }
            res.redirect("/categories");
         });
    } else {
      res.render("categories", {categoryList: foundCategories});
    }
  });
});

app.post("/categories", function(req, res) {
  const categoryName = req.body.newCategory;

  const category = new Category({
    name: categoryName
  });
  category.save();
  res.redirect("/categories");
});

//display the subcategories screen
app.get("/subcategories", function(req,res)
{
  SubCategory.find({}, function(err, foundSubcategories) {
    if (foundSubcategories.length === 0) {
      SubCategory.insertMany(defaultSubcategories, function(err) {
         if (err) {
           console.log(err);
         } else {
           console.log("Subcategories added successfully");
         }
         res.redirect("/subcategories");
      });
    } else {
      Category.find({}, function(err, foundCategories)
      {
        if (foundCategories.length > 0)
        {
          res.render("subcategories", {foundCategories: foundCategories,
                                       foundSubcategories:foundSubcategories});

        } else {
          console.log("No categories were found!!!!");
        }
      })
    }
  })
});

app.post("/subcategories", function(req,res){

  const inputCategory = req.body.category;
  const inputSubcategory = req.body.subcategory;
  const reqval = req;
  console.log(inputCategory);
  console.log(inputSubcategory);
  // const subcategory = new SubCategory ({
  //   name: inputSubcategory,
  //   category: [inputCategory]
  // });
  // subcategory.save();
  res.redirect("/subcategories");
});

//display the signup for newsletter
app.get("/newletter", function(req, res) {
  res.render("signup");
});

app.post("/", function(req, res) {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  const jsonData = JSON.stringify(data);
  const url = "https:us2.api.mailchimp.com/3.0/lists/670a8496e3";
  const options = {
    method: "POST",
    auth: "alka1:89dc779348fb296eb98e4ba13113aa2c-us2"
  };
  const request = https.request(url, options, function(response) {

    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();

});

app.post("/failure", function(req, res) {
  console.log("in the failure loop");
  res.redirect("/");
  res.end();
});
//end of login for newsletter sign up


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully!!!");
});
