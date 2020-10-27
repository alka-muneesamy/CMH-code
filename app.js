// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const https= require("https");

const app= express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyParser.json());

//display the homepage
app.get("/",function(req,res)
{
res.sendFile(__dirname+"/index.html");
});

// vendor login
app.get("/vendorsign", function(req,res)
{
  res.sendFile(__dirname+"/vendorsign.html");

  const url= "https://api.getAddress.io/find/MK426AU?api-key=eAljQE8lIU2S5-0bU2qpRg28887";
//  const jsonData = JSON.stringify(data);
 console.log(url);
  https.get(url, function(response)
  {
   console.log(response.statusCode);
  response.on("data", function(data)
  {
   var postcodeResponse = JSON.parse(data);
   var  address1 = postcodeResponse.addresses;
   var addressKey = Object.keys(address1);
   for(var i =0; i< addressKey.length; i++)
   {
     var houseNo = addressKey[i];
     var addressArray =  address1[i];
     console.log(addressArray);
   }
   console.log(address1);
   //console.log(Object.keys(address1));

   //const address1 = postcodeResponse.addresses.line_1;
   //console.log(address1);
 });
});

});
// comment this
//app.post("/",function(req,res)
//{
//  console.log("In the post function for postcode");
//  const jsonData = JSON.stringify(data);
//  console.log(jsonData);
//  const postcode = req.body.postcode;
//  const url= "https://api.getAddress.io/find/";
//  const options = {
//    method: "POST",
//    auth: "Q2S-_YT2hEma3wO4sAQiyw28858"
//  };
//  const request =https.request(url,options, function(response)
// {
//   console.log(response.statusCode);
//   response.on("data", function(data)
//   {
//     console.log(JSON.parse(data));
//   });
// }); //
//});

//display the signup for newsletter
app.get("/newletter",function(req,res)
{
  res.sendFile(__dirname + "/signup.html");
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
