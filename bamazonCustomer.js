// Require mysql and inquirer 
var mysql = require ('mysql');
var inquirer = require('inquirer');

// Connect to mysql database
var connection = mysql.createConnection({
host: "localhost",
port:3306,
user:"root",
password:"root",
database: "bamazon"
});
connection.connect(function(err){
    if(err) throw err;
    showAllProducts();
});



// Call up inquirer to prompt the user input
function productInfo(){
    inquirer.prompt([
        {
            type: "input",
            message:"What is the Item ID of the product you would like to buy?",
            name: "product",
            filter: Number
        },
        {
            type: "input",
            name: "quantity",
            message: "How many units of this product would you like to buy?",
            filter: Number
        }
    ]).then(function (res){
        var item2 = res.proudct;
        var quantity2 = res.quantity;
        connection.query("SELECT * FROM products WHERE ?", { item_id: item2 },
        function(err, response){
            if (err) throw err;
            if (response.length===0){
                console.log('ERROR: Select a valid Item ID from the products list.');
                showAllProducts();
            }else {
                // Response if the quantity requested by the user is in stock
                var productRes = response[0];
                if (quantity2 <= productRes.stock_quantity){
                    console.log('Your product is in stock ... placing your order!');
                 // Update the inventory 
                 var updateInventory = 'UPDATE products SET stock_quantity = ' + (productRes.stock_quantity - quantity2) + 'WHERE item_id = ' + item2;
                 connection.query(updateInventory, function(err,data){
                     if (err) throw err;
                     console.log('Your order has been placed! your total is $'+ productRes.price * quantity2);
                     console.log('Thank you for shopping with us!');
                     console.log("--------------------------------/n");
                     keepShopping();
                 })
                }else{
                    console.log("Sorry, item's not in stock to place your order.\n" + "Please change your order.\n" + "Your item was " + productRes.product_name + "and it has " + productRes.stock_quantity +" left in stock.");
                    keepShopping();
                }
            }
        })
    
    })
}
// function showing products after initial connection upon startup - then calls up Inquirer productInfo function after listing products
function showAllProducts(){
    connection.query("SELECT * FROM products", function (err,res){
        for (var i = 0; i <res.length; i++){
            console.log('\nItem ID: ' + res[i].item_id + " | " + 'Product Name: '+ res[i].product_name + " | " + 'Department: '+ res[i].department_name+ " | " + 'Price: '+ res[i].price.toString()+ " | " + 'Quantity In Stock: ' + res[i].stock_quantity.toString());
        }
        console.log("---------------------------------------------");
        productInfo();
    });
}
// Function showing products after initial connection upon startup - then calls up Inquirer productInfo function after listing products
function showAllProducts(){
    connection.query("SELECT * FROM products", function (err,res){
        for (var i = 0; i <res.length; i++){
            console.log('\nItem ID: ' + res[i].item_id + " | " + 'Product Name: ' + res[i].product_name + " | " + 'Departmen: ' + res[i].department_name + " | " + 'Price: ' + res[i].price.toString() +" | " + 'Quantity In Stock: ' + res[i].stock_quantity.toString());
        }
        console.log("-----------------------------------------------");
        productInfo();
    });
}
// Inquirer prompt asking if user wants to keep shopping - calls showAllProducts if yes; if no, connection ends
function keepShopping(){
    inquirer.prompt([
        {
            type: "confirm?",
            message: "Would you like to keep shopping?",
            name: "confirm"
        }
    ]).then(function (res){
        if(res.confirm){
            console.log("-----------------------------------------");
        }else{
            console.log("Thank you for shopping at Bamazon!");
            connection.end();
        }
    });
}