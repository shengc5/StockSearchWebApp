var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var path = require("path");
var request = require("request");
var parseString = require('xml2js').parseString;


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


function getValidSymbol(stockSymbol, callback) {
    request('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input='+stockSymbol, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            var possibleSymbols = JSON.parse(body);
            return callback(null, possibleSymbols);
        }else {
            return callback(err, null); 
        }
    });
}


app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});

app.use(express.static("./"));

app.use(cors());

app.get('/autocomplete', function(req,res) {
    var stockSymbol = req.query.symbol;
    if(stockSymbol) {
        getValidSymbol(stockSymbol, function(err,data) {
            if(!err) {
                console.log(data);
                res.json(data);
            }else {
                console.log(err);
            }
        });

    }else {
        console.log("page");
    }
});


function callSeekingAlphaApi(stockSymbol, callback) {
    var newsUrl = "https://seekingalpha.com/api/sa/combined/";
    request(newsUrl + stockSymbol + ".xml", function(err,res,body) {
        if (!err && res.statusCode == 200) {
            parseString(body, function (err, result) {
                console.log("xml to json done");
                return callback(null, result);
            });
        }else {
            return callback(err, null); 
        }
    });
    
}


function callAlphaVantageApi(stockSymbol, indiName, callback) {
    var indiUrlOne = "https://www.alphavantage.co/query?function="
    var indiUrlTwo = "&symbol=";
    var indiUrlThree = "&interval=daily&time_period=10&series_type=open";
    var indiUrlFour = "&apikey=M1C20NEAB4VLU91B";
    if(indiName=="TIME_SERIES_DAILY&outputsize=full") {
        indiUrlThree = "";
    }else if (indiName=="STOCH") {
        indiUrlThree = "&slowkmatype=1&slowdmatype=1&interval=daily&time_period=10&series_type=open";
    }else if (indiName=="BBANDS") {
        indiUrlThree = "&nbdevup=3&nbdevdn=3&time_period=5&interval=daily&series_type=open";
    }
    request(indiUrlOne+indiName+indiUrlTwo+stockSymbol.toUpperCase()+indiUrlThree+indiUrlFour, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            return callback(null, body);
        }else {
            return callback(err, null); 
        }
    });   
}


app.get('/price', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "TIME_SERIES_DAILY", function(err,data) {
        if(!err) {
            if(data == null) console.log("price null");
            if(data == "") console.log("price empty");
            res.json(data);
        }else {
            console.log("err: price");
        }
    });
});
app.get('/priceFull', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "TIME_SERIES_DAILY&outputsize=full", function(err,data) {
        if(!err) {
            if(data == null) console.log("priceFull null");
            if(data == "") console.log("priceFull empty");
            res.json(data);
        }else {
            console.log("err: his");
        }
    });  
    
    
});
app.get('/sma', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "SMA", function(err,data) {
        if(!err) {
            if(data == null) console.log("sma null");
            if(data == "") console.log("sma empty");
            res.json(data);
        }else {
            console.log("err: sma");
        }
    });    
    
    
});
app.get('/ema', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "EMA", function(err,data) {
        if(!err) {
            if(data == null) console.log("ema null");
            if(data == "") console.log("ema empty");
            res.json(data);
        }else {
            console.log("err: ema");
        }
    });    
    
    
});
app.get('/stoch', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "STOCH", function(err,data) {
        if(!err) {
            if(data == null) console.log("stoch null");
            if(data == "") console.log("stoch empty");
            res.json(data);
        }else {
            console.log("err: sto");
        }
    });    
    
    
});
app.get('/rsi', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "RSI", function(err,data) {
        if(!err) {
            if(data == null) console.log("rsi null");
            if(data == "") console.log("rsi empty");
            res.json(data);
        }else {
            console.log("err: rsi");
        }
    });    
    
    
});
app.get('/adx', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "ADX", function(err,data) {
        if(!err) {
            if(data == null) console.log("adx null");
            if(data == "") console.log("adx empty");
            res.json(data);
        }else {
            console.log("err: adx");
        }
    });    
    
    
});
app.get('/cci', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "CCI", function(err,data) {
        if(!err) {
            if(data == null) console.log("cci null");
            if(data == "") console.log("cci empty");
            res.json(data);
        }else {
            console.log("err: cci");
        }
    });    
    
    
});
app.get('/bbands', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "BBANDS", function(err,data) {
        if(!err) {
            if(data == null) console.log("bbands null");
            if(data == "") console.log("bbands empty");
            res.json(data);
        }else {
            console.log("err: bbands");
        }
    });    
    
    
});
app.get('/macd', function(req,res) {
    var stockSymbol = req.query.symbol;
    callAlphaVantageApi(stockSymbol, "MACD", function(err,data) {
        if(!err) {
            if(data == null) console.log("macd null");
            if(data == "") console.log("macd empty");
            res.json(data);
        }else {
            console.log("err: macd");
        }
    });    
    
    
});
app.get('/news', function(req,res) {
    var stockSymbol = req.query.symbol;
    callSeekingAlphaApi(stockSymbol,function(err,data) {
        if(!err) {
            if(data == null) console.log("news null");
            if(data == "") console.log("news empty");
            res.send(data);
        }else {
            console.log("err: news");
        }
    });    
});



function isEmpty(obj) {
    if(obj===null) return false;
    return Object.keys(obj).length === 0;
}


app.listen(3000);

console.log("Express app running on port 3000");

module.exports = app;