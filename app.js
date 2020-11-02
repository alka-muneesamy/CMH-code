// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const https= require("https");
const app= express();
const address = require(__dirname + "/getAddress.js");

//define variables
let addresses = [];


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine","ejs");


//display the homepage
app.get("/",function(req,res)
{
res.render("index");
});

// vendor login
app.get("/vendorsign", function(req,res) {
  res.render("vendorsign",{addresses:addresses});
});

app.post("/vendorsign", function(req,res)
{
  inputPostcode = req.body.postcodeVal;
  inputHouse = req.body.houseNoVal;
  const url= "https://api.getAddress.io/find/" +inputPostcode +"/" + inputHouse + "?api-key=eAljQE8lIU2S5-0bU2qpRg28887";
  const request =https.get(url, function(response)
  {
     console.log(response.statusCode);
     response.on("data", function(data)
    {
       let postcodeResponse = JSON.parse(data);
       let address1 =  postcodeResponse.addresses;
       let final =address(address1);
       addresses.push(final);
       res.redirect("/vendorsign");
    });
 });
 });

//display the signup for newsletter
app.get("/newletter",function(req,res)
{
  res.render("signup");
});

app.post("/", function(req,res)
{
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  const data = {
     members : [
               {email_address: email,
                status: "subscribed",
                    merge_fields: {
	                       FNAME: firstName,
	                       LNAME: lastName }
                }
                ]
              };

  const jsonData = JSON.stringify(data);
  const url = "https:us2.api.mailchimp.com/3.0/lists/670a8496e3";
  const options = {
    method: "POST",
    auth: "alka1:89dc779348fb296eb98e4ba13113aa2c-us2"
  };
  const request =https.request(url,options, function(response)
 {

   if (response.statusCode === 200)
   {
       res.sendFile(__dirname +"/success.html");
    }
   else {
      res.sendFile(__dirname +"/failure.html");
    }
   response.on("data", function(data)
   {
     console.log(JSON.parse(data));
   });
 });
   request.write(jsonData);
   request.end();

});

app.post("/failure",function(req,res)
{
  console.log("in the failure loop");
  res.redirect("/");
  res.end();
});
//end of login for newsletter sign up



app.listen(process.env.PORT || 3000, function()
{
  console.log("Server is running on port 3000");
});
