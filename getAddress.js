// jshine esversion:6
module.exports = getAddress;

function getAddress(addressString)
{
     let newAddress= addressString[0].split(",");
     let finalAddress = {  line1:newAddress[0],
                       line2 :newAddress[1],
                       locality:newAddress[4],
                       city: newAddress[5],
                       county:newAddress[6]};
    return(finalAddress);
  }
