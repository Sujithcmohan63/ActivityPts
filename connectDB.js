var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "acm",
    password: "acm@12345",
    database: "acmdata"
});

db.connect((err) => {
    if(err) {
        console.log("\nERROR: Error Connecting Database\n\n");
        throw err;
    }
    else
        console.log("\nOKAY: Database is connected\n\n");
});

module.exports = db;
