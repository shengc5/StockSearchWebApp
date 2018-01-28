var app = angular.module("myApp", ['ngMaterial']);


app.controller("myController", function ($scope, $http, $log) {
    var symbol;

    var priceObj;
    var historyObj;
    var smaObj;
    var emaObj;
    var stochObj;
    var rsiObj;
    var adxObj;
    var cciObj;
    var bbandsObj;
    var macdObj;
    var newsObj;

    var localArr;
    var localOrder;

    var boolean;
    var hisArr;
    var dateArr;
    $scope.sortOptions = ["Default", "Symbol", "Price", "Change", "ChangePercent", "Volume"];
    $scope.orderOptions = ["Ascending", "Descending"];
    

    $scope.selectedOption = " Default ";
    $scope.selectedOrder = "Ascending";
    
    $scope.sortType = "TimeStamp";
    $scope.sortReverse = false;
    
    $scope.autoRe = false;
    
    $scope.localStocks = [];
    
    for (var i = 0; i < localStorage.length; i++){
//        console.log(localStorage.getItem(localStorage.key(i)));
        $scope.localStocks.push( JSON.parse(localStorage.getItem(localStorage.key(i))));
    }
    
    var getQuoteButton = angular.element( document.querySelector( '#getQuoteButton' ) );
    var tickerSymbol = angular.element( document.querySelector( '#tickerSymbol' ) );
    var promptText = angular.element( document.querySelector( '#promptText' ) );
    var pData = angular.element(document.querySelector('#passData'));
    
    $scope.changeOrder = function() {
//        console.log($scope.selectedOrder);
        if( $scope.selectedOrder == "Ascending") {
//            console.log("cur " + $scope.selectedOrder);
            $scope.sortReverse = false;
        }else if($scope.selectedOrder == "Descending") {
//            console.log("cur " + $scope.selectedOrder);
            $scope.sortReverse = true;
        }
        
    }
    
    $scope.changeSort = function() {
//        console.log("curr type" + $scope.selectedOption);
        if($scope.selectedOption==" Default ") {
            $("#orderSelection").prop("disabled", true);
        }else {
            $("#orderSelection").prop("disabled", false);
        }
        if($scope.selectedOption == " Price ") {
            $scope.sortType = "StockPrice";
        }else if($scope.selectedOption == " Default ") {
            $scope.sortType = "TimeStamp";
        }else {
            $scope.sortType = $scope.selectedOption;
        }
    }
    
    $scope.clear = function() {
        $("#input-0").val("");
        $scope.toLeft();
        nonemptyQuery();
    }
    
    $scope.toRight = function() {
        $scope.rightShow = true;

        if(hasThisStock($scope.localStocks, pData.text().toUpperCase() )) {
            $("#favBtnIcon").removeClass("glyphicon-star-empty");
            $("#favBtnIcon").addClass("glyphicon-star gold");
        }else {
            $("#favBtnIcon").removeClass("glyphicon-star gold");
            $("#favBtnIcon").addClass("glyphicon-star-empty");  
        }
        
    }
    $scope.toRightMod = function() {
        if(! $("#getQuoteButton").hasClass("disabled")) {
            $scope.rightShow = true;

            if(hasThisStock($scope.localStocks, pData.text().toUpperCase() )) {
                $("#favBtnIcon").removeClass("glyphicon-star-empty");
                $("#favBtnIcon").addClass("glyphicon-star gold");
            }else {
                $("#favBtnIcon").removeClass("glyphicon-star gold");
                $("#favBtnIcon").addClass("glyphicon-star-empty");  
            }
        }
    }
    
    $scope.toLeft = function() {
        $scope.rightShow = false;
    }
    $scope.refresh = function() {
        for (var i = 0; i < $scope.localStocks.length; i++) {
            $.ajax({
                url:"/price?symbol="+ $scope.localStocks[i].Symbol, 
                dataType:'json',
                success: function(data) {                    
                    updateThisStock($scope.localStocks, JSON.parse(data));
                }
            });
        }
    }
    
    $("#toggle").change(function () {
        $scope.autoRefresh();
    }); 
    
    $scope.autoRefresh = function() {
        $scope.autoRe = !$scope.autoRe;
//        console.log("clicked");
        if ($scope.autoRe) {
//            console.log("starting ");
            refreshIntervalId = setInterval($scope.refresh, 5000);
        }else {
//            console.log("cut");
            clearInterval(refreshIntervalId);
        }
        
    }
    
    $scope.clickFav = function() {
        if(hasThisStock($scope.localStocks, pData.text().toUpperCase())) {
//            console.log("removingggg");
            $("#favBtnIcon").removeClass("glyphicon-star gold");
            $("#favBtnIcon").addClass("glyphicon-star-empty"); 
            removeThisStock($scope.localStocks, pData.text().toUpperCase());
            $scope.removeStorage(pData.text().toUpperCase());
        }else {
            $("#favBtnIcon").removeClass("glyphicon-star-empty");
            $("#favBtnIcon").addClass("glyphicon-star gold");
//            console.log("adding");
            addThisStock($scope.localStocks, pData.text().toUpperCase());
        }
        
        
    }
    

    function hasThisStock(arr, target) {
        for(index in arr) {
            if(arr[index].Symbol == target){
                return true;
            }
        }
        return false;
    }
    
    
    function removeThisStock(arr, target) {
        var tarIndex = 0;
        for(index in arr) {
            if(arr[index].Symbol == target){
                tarIndex = index;
                break;
            }
        }
        $scope.removeRow(tarIndex);

    }
    
    $scope.removeStorage = function(name) {
//        console.log(name);            
        
        localStorage.removeItem( name );
//        console.log("removeedded");
    }
    
    function addThisStock(arr, target) {
        var d = new Date();
        var n = d.getTime();
        toAdd = {
            "Symbol" : target,
            "StockPrice" : todayClose ,
            "Change" : change,
            "ChangePercent" : changePercent,
            "Volume" : curVolume,
            "TimeStamp" : n,
        }
        arr.push( toAdd);
        localStorage[target] = JSON.stringify(toAdd);
    }

    
    
    function updateThisStock(arr, target) {
        if(target.hasOwnProperty("Meta Data")) {
//        console.log(target);
//        console.log("updatingggggggg");
        for(index in arr) {
            if(arr[index].Symbol == target["Meta Data"][["2. Symbol"]]){
                var count = 0;
                var todayDate = "";
                var yesterDate = "";
                for (var key in target["Time Series (Daily)"]) {
                    count++;
                    if(count == 1) {
                        todayDate = key;
                    }
                    if(count == 2) {
                        yesterDate = key;
                        break;
                    }
                }
                var todayClose = parseFloat( target["Time Series (Daily)"][todayDate]["4. close"] );
                var prevClose = parseFloat( target["Time Series (Daily)"][yesterDate]["4. close"] );
                var change = Math.round((todayClose - prevClose) * 100) / 100;
                $scope.localStocks[index].StockPrice = Math.round((todayClose) * 100) / 100;
//                console.log($scope.localStocks[index].StockPrice);
                $scope.localStocks[index].Change = change;
//                console.log($scope.localStocks[index].Change);
                $scope.localStocks[index].ChangePercent = Math.round(( (1.0 * change) / (1.0 *prevClose) ) *100)/100;
//                console.log($scope.localStocks[index].ChangePercent);
                $scope.localStocks[index].Volume = parseInt( target["Time Series (Daily)"][todayDate]["5. volume"] );
//                console.log($scope.localStocks[index].Volume);
                break;
            }
        }
        $scope.$apply();
        }
    }
    
    $scope.querySearch = function(searchText) {
        if ( (typeof searchText == 'undefined') || !searchText ) {
            return [];
        }
        return $http({
            method: "GET",
            url: "/autocomplete?symbol=" + searchText,
        }).then(function success(response) {
            if(response.data )
            return (response.data);
        }, function errHandle(response) {
//            console.log("http error");
        });
    }
    
    $scope.removeRow = function(idx) {
        $scope.localStocks.splice(idx, 1);
    }
    
    function emptyQuery () {
        tickerSymbol.css("border",'2px solid red');
        tickerSymbol.css("border-radius",'3px');
        promptText.css("display", "block");
        getQuoteButton.addClass("disabled");
        getQuoteButton.removeClass("active");
    }
    function nonemptyQuery () {
        tickerSymbol.css("border",'');
        tickerSymbol.css("border-radius",'');
        promptText.css("display", "none"); 
//        getQuoteButton.addClass("active");
//        getQuoteButton.removeClass("disabled");
    }
    
    $scope.searchTextChange = function(searchText) {
//        $log.log('Text changed to ' + searchText);
        pData.text(searchText.toUpperCase());
    }
    
    $scope.selectedItemChange = function(item) {
        if(typeof item == "undefined") return;
//        $log.log('Item changed to ' + item["Symbol"]);
        pData.text(item["Symbol"].toUpperCase());
    }
    $scope.set_color = function (thisStock) {
      if (thisStock.Change > 0) {
        return { color: "green" };
      }else {
          return {color: "red"};
      }
    }
    
    
$("document").ready( function() {

    var tickerSymbol = angular.element( document.querySelector( '#tickerSymbol' ) );
    var promptText = angular.element( document.querySelector( '#promptText' ) );
    var getQuoteButton = angular.element( document.querySelector( '#getQuoteButton' ) );

    $('[data-toggle="tooltip"]').tooltip(); 


    $("#input-0").on("input", function() { 
        var content = $('#input-0').val();
        if (content.trim() == "") {
            tickerSymbol.css("border",'2px solid red');
            tickerSymbol.css("border-radius",'3px');
            promptText.css("display", "block");
            getQuoteButton.addClass("disabled");
            getQuoteButton.removeClass("active");
        }else {
            tickerSymbol.css("border",'');
            tickerSymbol.css("border-radius",'');
            promptText.css("display", "none"); 
            getQuoteButton.addClass("active");
            getQuoteButton.removeClass("disabled");
        }
    });
    
    
    
    $("#getQuoteButton").click(function() {
        if( !$("#getQuoteButton").hasClass("disabled")  ) {
            symbol = $('#passData').text().toUpperCase();
            $scope.execute(symbol);
        }
    });
    $("#currStockBtn").click(function() {
        $("#currStock").show();
        $("#history").hide();
        $("#newsList").hide();
    }); 
    $("#hisChartsBtn").click(function() {
        $("#currStock").hide();
        $("#history").show();
        $("#newsList").hide();
        drawHistoryChart($('#passData').text().toUpperCase());
    });  
    $("#newsFeedsBtn").click(function() {
        $("#currStock").hide();
        $("#history").hide();
        $("#newsList").show();
    });  
    $("#priceTab").bind("click", function(evt) {
        drawPriceVolume($('#passData').text().toUpperCase());
    });
    $("#smaTab").bind("click", function(evt) {
        drawIndi("SMA");
    });
    $("#emaTab").bind("click", function(evt) {
        drawIndi("EMA");
    });
    $("#stochTab").bind("click", function(evt) {
        drawIndi("STOCH");
    });
    $("#rsiTab").bind("click", function(evt) {
        drawIndi("RSI");
    });
    $("#adxTab").bind("click", function(evt) {
        drawIndi("ADX");
    });
    $("#cciTab").bind("click", function(evt) {
        drawIndi("CCI");
    });
    $("#bbandsTab").bind("click", function(evt) {
        drawIndi("BBANDS");
    });
    $("#macdTab").bind("click", function(evt) {
        drawIndi("MACD");
    });

    $("#fbBtn").bind("click", function(evt) {
        var obj = {},
        exportUrl = options.exporting.url;
        obj.options = JSON.stringify(options);
        obj.type = 'image/png';
        obj.async = true;

        $.ajax({
            type: 'post',
            url: exportUrl,
            data: obj,
            success: function (data) {
                callFB(exportUrl + data);
            }
        });
    });
    
});
function callFB(url) {
    
    FB.ui({
        app_id: "694434704095367", 
        method: 'feed',
        picture: url
        }, (response) => {
        if (response && !response.error_message) {
        //succeed 
            alert("Post succeeded!");
        }else{
        //fail 
            alert("Post failed");
        }
        });
}


$scope.execute = function(symbol) {
    $("#toRight").removeAttr("disabled");
    $scope.toRight();
    run(symbol);
}


function run(symbol) {
    hideBodies();
    hideErrBars();
    showProgressBars();
    $("#favBtn").prop("disabled", true);
    $("#fbBtn").prop("disabled", true);
    priceObj = "loading";
    historyObj = "loading";
    smaObj = "loading";
    emaObj = "loading";
    stochObj = "loading";
    rsiObj = "loading";
    adxObj = "loading";
    cciObj = "loading";
    bbandsObj = "loading";
    macdObj = "loading";
    newsObj = "loading";
    
    getQuote(symbol);
    if(!boolean) {
        $("#currStock").show();
        $("#history").hide();
        $("#newsList").hide();
    }
    getNews(symbol);
    getSMA(symbol);
    getEMA(symbol);
    getSTOCH(symbol);
    getRSI(symbol);
    getADX(symbol);
    getCCI(symbol);
    getBBANDS(symbol);
    getMACD(symbol);
    getHistory(symbol);
}
function hideBodies() {
    $("#tableBody").hide();
    $("#chartContainer").hide();
    $("#stockContainer").hide();
    $("#newsFeeds").hide();
}
function hideProgressBars() {
    $("#chartProg").hide();
    $("#hisProg").hide();
    $("#infoProg").hide();
    $("#newsProg").hide();
}
function showProgressBars() {
    $("#chartProg").show();
    $("#hisProg").show();
    $("#infoProg").show();
    $("#newsProg").show();
}
function hideErrBars() {
    $("#newsErr").hide();
    $("#hisErr").hide();
    $("#chartErr").hide();
    $("#infoErr").hide();
}


function drawNewsTable(symbol, data) {
    newsObj = data;
    if( !newsObj ) {
        $("#newsFeeds").hide();
        $("#newsProg").hide();
        $("#newsErr").show();       
    }else if (typeof newsObj === "undefined" || newsObj.length==0 ||newsObj.hasOwnProperty("Information") || newsObj.hasOwnProperty("Error Message")) {
        $("#newsFeeds").hide();
        $("#newsProg").hide();
        $("#newsErr").show();
    }else if(newsObj == "loading") {
        $("#newsFeeds").hide();
        $("#newsProg").show();
        $("#newsErr").hide();        
    }else {
        $("#newsProg").hide();
        $("#newsFeeds").show();
        newsObj = data["rss"]["channel"][0]["item"];
        var index = 0;
        var counter = 0;
        while (counter < 5) {
            if( newsObj[index]["link"][0].indexOf("/article")  !== -1) {
                var curDate = newsObj[index]["pubDate"].toString();
                $("#news" + counter).html("<br><a target=\"_blank\" href='" + newsObj[index]["link"] + "'>" + newsObj[index]["title"] +  "</a><br><br>" + "<b>Author: " + newsObj[index]["sa:author_name"] + "<br>Date: " + curDate.slice(0,-5) + " EDT" + "</b>");
                $("#news" + counter).show();
                counter++;
            }
            index++;
        }

    }
    
}

function drawHistoryChart(symbol) {
//    console.log("drawing his");
//    $("#hisProg").hide();
//    $("#hisErr").hide();
//    $("#stockContainer").show();
    if( !historyObj ) {
//        console.log("null his");
        $("#stockContainer").hide();
        $("#hisProg").hide();
        $("#hisErr").show();        
    }else if ( typeof historyObj === "undefined" || historyObj.length == 0 || $.isEmptyObject(historyObj) || historyObj.hasOwnProperty("Information") || historyObj.hasOwnProperty("Error Message") ){
//        console.log("err his");
        $("#stockContainer").hide();
        $("#hisProg").hide();
        $("#hisErr").show();
    }else if (historyObj == "loading") {
        $("#stockContainer").hide();
        $("#hisProg").show();
        $("#hisErr").hide();        
    
    }else {
        $("#stockContainer").show();
                $("#hisProg").hide();
        Highcharts.stockChart('stockContainer', {
            title: {
                text: symbol.toUpperCase() + ' Stock Value'
            },
            subtitle: {
                text: '<a target="_blank" href="https://www.alphavantage.co/" style="color:blue">Source: Alpha Vantage</a>',
                useHTML:true
            },
            rangeSelector: {
                buttons: [
                    {
                        type: 'week',
                        count: 1,
                        text: '1w'
                    },
                    {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }
                ],
                selected:0
            },
            series: [{
                name: 'AAPL Stock Price',
                data: hisArr,
                type: 'area',
                threshold: null,
                tooltip: {
                    valueDecimals: 2
                }
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 1000
                    },
                    chartOptions: {
                        chart: {
                            height: 300
                        },
                        navigator: {
                            enabled: false
                        }
                    }
                }]
            }
        });
    }
}



function drawIndi(indiName) {

    var title;
    var jsonObj;
    var jsonTitle = "Technical Analysis: "+ indiName;
    if(indiName=="SMA") {
        title = "Simple Moving Average (SMA)";
        jsonObj =smaObj;
    }else if (indiName=="EMA") {
        title = "Exponential Moving Average (EMA)";
        jsonObj = emaObj;
    }else if (indiName=="STOCH") {
        title = "Stochastic Oscillator (STOCH)";
        jsonObj = stochObj;
    }else if (indiName=="RSI") {
        title = "Relative Strength Index (RSI)";
        jsonObj = rsiObj;
    }else if (indiName=="ADX") {
        title = "Average Directional movement IndeX (ADX)";
        jsonObj = adxObj;
    }else if (indiName=="CCI") {
        title = "Commodity Channel Index (CCI)";
        jsonObj = cciObj;
    }else if (indiName=="BBANDS") {
        title = "Bollinger Bands (BBANDS)";
        jsonObj = bbandsObj;
    }else if (indiName=="MACD") {
        title = "Moving Average Convergence/Divergence (MACD)";
        jsonObj = macdObj;
    }
    if(!jsonObj || typeof jsonObj === "undefined" || $.isEmptyObject(jsonObj) || jsonObj.hasOwnProperty("Information") || jsonObj.hasOwnProperty("Error Message")) {
        $("#chartContainer").hide();
        $("#chartProg").hide();
        $("#chartErrText").text("Error! Failed to get " + indiName + " data");
        $("#chartErr").show();
    }else if (jsonObj =="loading"){
        $("#chartContainer").hide();
        $("#chartProg").show();
        $("#chartErr").hide();        
    }else {
        $("#chartContainer").show();
        $("#chartProg").hide();
        $("#chartErr").hide();
        var data = jsonObj[jsonTitle];
        var count = 0;
        var days = [];
        var values = [];
        var values2 = [];
        var values3 = [];
        for(var key in data) {
            count++;
            var pieces = key.split(" ");
            pieces = pieces[0].split("-");
            var dateInFormat = pieces[1] + "/" + pieces[2];
            days.unshift(dateInFormat);
            if(indiName=="BBANDS") {
                var value1 = Math.round(parseFloat(data[key]["Real Upper Band"]) *100)/100;
                values.unshift(value1);
                var value2 = Math.round(parseFloat(data[key]["Real Lower Band"]) *100)/100;
                values2.unshift(value2);                        
                var value3 = Math.round(parseFloat(data[key]["Real Middle Band"]) *100)/100;
                values3.unshift(value3);
            }else if (indiName=="MACD") {
                var value1 = Math.round(parseFloat(data[key]["MACD_Signal"]) *100)/100;
                values.unshift(value1);
                var value2 = Math.round(parseFloat(data[key]["MACD"]) *100)/100;
                values2.unshift(value2);                        
                var value3 = parseFloat(data[key]["MACD_Hist"]);
                values3.unshift(value3);                      
            }else if (indiName=="STOCH") {
                var value1 = Math.round(parseFloat(data[key]["SlowD"]) *100)/100;
                values.unshift(value1);
                var value2 = Math.round(parseFloat(data[key]["SlowK"]) *100)/100;
                values2.unshift(value2);  
            }else {
                var value = Math.round(parseFloat(data[key][indiName]) *100)/100;
                values.unshift(value);
            }
            if(count==126) break;
        };

        if(indiName=="BBANDS") {
            options = {
                exporting: {
                    url: 'https://export.highcharts.com/'
                },
                chart:{
                    type:'line',
                    zoomType: 'x'
                },
                title:{
                    text: title
                },
                subtitle: {
                    text: '<a target="_blank" href="https://www.alphavantage.co/" style="color:blue">Source: Alpha Vantage</a>',
                    useHTML:true
                },
                legend:{
                    align: 'center',
                    verticalAlign: 'bottom',
                },
                xAxis:{
                    categories:days,
                    tickInterval:5
                },
                yAxis:{
                    title:{
                        text:indiName
                    },
                    tickPixelInterval:90
                },
                series: [
                    {
                        name:symbol + " Real Middle Band",
                        data:values3,
                        color: 'red',
                        lineWidth:1
                    },{
                        name:symbol + " Real Upper Band",
                        data:values,
                        color: 'black',
                        lineWidth:1
                    },{
                        name:symbol + " Real Lower Band",
                        data:values2,
                        color: 'green',
                        lineWidth:1
                    }
                        ],

            };
            Highcharts.chart('chartContainer', options);
        }else if (indiName=="MACD") {
            options = {
                exporting: {
                    url: 'https://export.highcharts.com/'
                },
                chart:{
                    type:'line',
                    zoomType: 'x'
                },
                title:{
                    text: title
                },
                subtitle: {
                    text: '<a target="_blank" href="https://www.alphavantage.co/" style="color:blue">Source: Alpha Vantage</a>',
                    useHTML:true
                },
                legend:{
                    align: 'center',
                    verticalAlign: 'bottom',
                },
                xAxis:{
                    categories:days,
                    tickInterval:5
                },
                yAxis:{
                    title:{
                        text:indiName
                    },
                    tickPixelInterval:90
                },
                series: [
                    {
                        name:symbol + " MACD",
                        data:values2,
                        color: 'red',
                        lineWidth:1
                    },{
                        name:symbol + " MACD_Hist",
                        data:values3,
                        color: 'yellow',
                        lineWidth:1
                    },{
                        name:symbol + " MACD_Signal",
                        data:values,
                        color: 'green',
                        lineWidth:1
                    }
                ],

            };
            Highcharts.chart('chartContainer', options);
        }else if (indiName=="STOCH") {
            options = {
                exporting: {
                    url: 'https://export.highcharts.com/'
                },
                chart:{
                    type:'line',
                    zoomType: 'x'
                },
                title:{
                    text: title
                },
                subtitle: {
                    text: '<a target="_blank" href="https://www.alphavantage.co/" style="color:blue">Source: Alpha Vantage</a>',
                    useHTML:true
                },
                legend:{
                    align: 'center',
                    verticalAlign: 'bottom',
                },
                xAxis:{
                    categories:days,
                    tickInterval:5
                },
                yAxis:{
                    title:{
                        text:indiName
                    },
                    tickPixelInterval:90
                },
                series: [
                    {
                        name:symbol + " SlowK",
                        data:values2,
                        color: 'blue',
                        lineWidth:1
                    },{
                        name:symbol + " SlowD",
                        data:values,
                        color: 'red',
                        lineWidth:1
                    }],

            };
            Highcharts.chart('chartContainer', options);
        }else {
            options = {
                exporting: {
                    url: 'https://export.highcharts.com/'
                },
                chart:{
                    type:'line',
                    zoomType: 'x'
                },
                title:{
                    text: title
                },
                subtitle: {
                    text: '<a target="_blank" href="https://www.alphavantage.co/" style="color:blue">Source: Alpha Vantage</a>',
                useHTML:true
                },
                legend:{
                    align: 'center',
                    verticalAlign: 'bottom',
                },
                xAxis:{
                    categories:days,
                    tickInterval:5
                },
                yAxis:{
                    title:{
                        text:indiName
                    },
                    tickPixelInterval:90
                },
                series: [{
                    name:symbol,
                    data:values,
                    color: 'red',
                    lineWidth:1
                }],

            };
            Highcharts.chart('chartContainer', options);
        };
        $("#fbBtn").prop("disabled", false);
        
        
    }
}


function getQuote(symbol) {

    $.ajax({
            url:"/price?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
                priceObj = JSON.parse(data);
                testErr(priceObj);
                drawInfoTable(symbol);
            },
            error: function() {
                $("#tableBody").hide();
                $("#infoErr").show();
            }
                
    });
}
function testErr(objToTest) {
    if ( (!objToTest || typeof objToTest == "undefined" || $.isEmptyObject(objToTest) || objToTest.hasOwnProperty("Information") || objToTest.hasOwnProperty("Error Message")) ) {
       boolean = false;
    }else {
       boolean = true;
    }
}

function getHistory(symbol) {                
    $.ajax({
            url:"/priceFull?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("getting his");
                historyObj = JSON.parse(data);
                
                extractPriceVolume(symbol);
                drawHistoryChart(symbol);
                if( $("#priceClass").hasClass("active") ) drawPriceVolume(symbol);
                if( $("#smaClass").hasClass("active") ) drawIndi("SMA");
                if( $("#emaClass").hasClass("active") ) drawIndi("EMA");
                if( $("#stochClass").hasClass("active") ) drawIndi("STOCH");
                if( $("#rsiClass").hasClass("active") ) drawIndi("RSI");
                if( $("#adxClass").hasClass("active") ) drawIndi("ADX");
                if( $("#cciClass").hasClass("active") ) drawIndi("CCI");
                if( $("#bbandsClass").hasClass("active") ) drawIndi("BBANDS");
                if( $("#macdClass").hasClass("active") ) drawIndi("MACD");
            },
            error: function() {
                $("#stockContainer").hide();
                $("#hisProg").hide();
                $("#hisErr").show();
                
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });
}

function getSMA(symbol) {
    $.ajax({
            url:"/sma?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded sma");
                smaObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed sma");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });       
}
function getEMA(symbol) {
    $.ajax({
            url:"/ema?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//              console.log("loaded ema");
                emaObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed ema");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });  
}
function getSTOCH(symbol) {
    $.ajax({
            url:"/stoch?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded stoch");
                stochObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed stoch");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });       
}
function getRSI(symbol) {
    $.ajax({
            url:"/rsi?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded rsi");
                rsiObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed rsi");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });         
}
function getADX(symbol) {
    $.ajax({
            url:"/adx?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded adx");
                adxObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed adx");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });             
}
function getCCI(symbol) {
    $.ajax({
            url:"/cci?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded cci");
                cciObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed cci");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });  
}
function getBBANDS(symbol) {
    $.ajax({
            url:"/bbands?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded bbands");
                bbandsObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed bbands");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });  
}                        
function getMACD(symbol) {
    $.ajax({
            url:"/macd?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
//                console.log("loaded macd");
                macdObj = JSON.parse(data);
            },
            error: function() {
//                console.log("failed macd");
                $("#chartContainer").hide();
                $("#chartProg").hide();
                $("#chartErr").show();
            }
                
    });  
}           
function getNews(symbol) {
    $.ajax({
            url:"/news?symbol="+ symbol, 
            dataType:'json',
            success: function(data) {
                drawNewsTable(symbol, data);
            },
            error: function(){
//                console.log("failed news");
                $("#newsErr").show();
                $("#newsFeeds").hide();
                $("#newsProg").hide();
            }
                
    });      
}

function drawInfoTable(symbol) {
    if(!priceObj || typeof priceObj == "undefined" || $.isEmptyObject(priceObj) || priceObj.hasOwnProperty("Information") || priceObj.hasOwnProperty("Error Message")) {
        $("#tableBody").hide();
        $("#infoProg").hide();
        $("#infoErr").show();
    }else if (priceObj == "loading") {
        $("#tableBody").hide();
        $("#infoProg").show();
        $("#infoErr").hide();        
    }else {
        $("#favBtn").prop("disabled", false);
        
        $("#tableBody").show();
        $("#row1").text(symbol);
        todayDate = "";
        yesterDate = "";
        var count = 0;
        for (var key in priceObj["Time Series (Daily)"]) {
            count++;
            if(count == 1) {
                todayDate = key;
            }
            if(count == 2) {
                yesterDate = key;
                break;
            }
        }
        todayClose =  Math.round(priceObj["Time Series (Daily)"][todayDate]["4. close"] * 100) / 100; 
        $("#row2").text(todayClose);
        var prevClose = Math.round(priceObj["Time Series (Daily)"][yesterDate]["4. close"] * 100) / 100;
        change = Math.round((todayClose - prevClose) * 100) / 100;
        changePercent = Math.round(( (1.0 * change) / (1.0 *prevClose) ) *100)/100;
        if(change > 0) {
            $("#row3").css("color", "green");
            $("#row3").html(change + "(" + changePercent + "%)" + "<img style='width:15px; height:15px' src='http://cs-server.usc.edu:45678/hw/hw8/images/Up.png'>" );
        }else {
            $("#row3").css("color", "red");
            $("#row3").html(change + "(" + changePercent + "%)" + "<img style='width:15px; height:15px' src='http://cs-server.usc.edu:45678/hw/hw8/images/Down.png'>" );
        }
        var curStampPieces = priceObj["Meta Data"]["3. Last Refreshed"].split(" ");
        var curDatePieces = curStampPieces[0].split("-");
        var finalStamp = "";
        if(curStampPieces.length > 1) {
            var curTimePieces = curStampPieces[1].split(":");
            var curMonth = curDatePieces[1];
            if(curMonth > 3 && curMonth <11) {
                finalStamp = curStampPieces[0] + " " + (parseInt(curTimePieces[0]) + 1) + ":" + curTimePieces[1] +":"+curTimePieces[2]  + " EDT";

            }else {
                finalStamp = priceObj["Meta Data"]["3. Last Refreshed"] + " EST";
            }
        }else {
            finalStamp = priceObj["Meta Data"]["3. Last Refreshed"] + " 16:00:00"  + " EDT";            
        }
        $("#row4").text( finalStamp );
        var todayOpen =  Math.round(priceObj["Time Series (Daily)"][todayDate]["1. open"] * 100) / 100;
        $("#row5").text(todayOpen);
        $("#row6").text(prevClose);
        $("#row7").text(Math.round(priceObj["Time Series (Daily)"][todayDate]["3. low"] * 100) / 100  + " - "+Math.round(priceObj["Time Series (Daily)"][todayDate]["2. high"] * 100) / 100);
        curVolume = parseInt( priceObj["Time Series (Daily)"][todayDate]["5. volume"] );
        $("#row8").text(addCommas(priceObj["Time Series (Daily)"][todayDate]["5. volume"]));
        $("#infoProg").hide();
        $("#tableBody").show();
        
    }
}

function extractPriceVolume(symbol) {
    if(!historyObj) {
        $("#stockContainer").hide();
        $("#hisProg").hide();
        $("#hisErr").show();
        $("#chartContainer").hide();
        $("#chartProg").hide();
        $("#chartErr").show(); 
        return false;        
    }else if(historyObj == null || typeof historyObj ==="undefined" || $.isEmptyObject(historyObj)  || historyObj.hasOwnProperty("Information") || historyObj.hasOwnProperty("Error Message")) {
        $("#stockContainer").hide();
        $("#hisProg").hide();
        $("#hisErr").show();
        $("#chartContainer").hide();
        $("#chartProg").hide();
        $("#chartErr").show(); 
        return false;
    }else {
//        console.log("extracting");
        arr = historyObj["Time Series (Daily)"];
        count = 0;
        minV = 500;
        maxV = 0;
        sum = 0;
        days = []
        price = []
        volume = [];
        hisArr = [];
        for(var key in arr) {
            count++;
            var datePieces = key.split(" ")[0].split("-");
            var dateInFormat = datePieces[1]+"/"+datePieces[2];
            var item = arr[key];
            if(count<=126) {
                days.unshift(dateInFormat);
                sum += parseInt(item["5. volume"]);
                price.unshift( Math.round(parseFloat(item["4. close"]) * 100) / 100 );
                volume.unshift(parseInt(item["5. volume"]));

                if(parseFloat(item["4. close"]) > maxV) maxV = parseFloat(item["4. close"]);
                if(parseInt(item["4. close"]) < minV) minV = parseInt(item["4. close"]);
            }
            hisArr.unshift([new Date(key).getTime(), Math.round(parseFloat(item["4. close"]) * 100) / 100] );
            if(count ==1000) break;
        }
        avgVTick = Math.round(3* sum/126);
        avgVTick = roundDown(avgVTick, -1 * (( avgVTick.toString().length) - 1));
        avgPTick = Math.ceil((maxV - minV)/2);
        return true;
    }
}


function drawPriceVolume(symbol) {

//    console.log("calling once");
    var boo = extractPriceVolume(symbol);
    if(!boo) {
        if(historyObj == "loading") {
            $("#chartErr").hide();
            $("#chartProg").show();
            $("#chartContainer").hide();                 
        }else {
//            console.log("boo is false");
            $("#chartErrText").text("Error! Failed to get Price data");
            $("#chartErr").show();
            $("#chartProg").hide();
            $("#chartContainer").hide();               
        }
     
    }else {
//        console.log("boo is true");
        $("#chartErr").hide();
        $("#chartProg").hide();
        $("#chartContainer").show();   
        chart = new Highcharts.Chart( {
            chart:{
                renderTo:'chartContainer',
            },
            title: {
                text: symbol + ' Stock Price and Volume',
                zoomType:'x'
            },
            subtitle: {
                text: "<a target=\"_blank\" href=\"https://www.alphavantage.co/\" style=\"color:blue\">Source: Alpha Vantage</a>",
                useHTML:true
            },
            yAxis:[{
                title:{
                    text:'Stock Price'
                }, 
                 tickInterval:avgPTick, 
                 tickPixelInterval:90, 
                 min:0, 

            },{
                title:{
                    text:'Volume'
                }, 
                 opposite:true, 
                 min:0, 
                 tickPixelInterval:90,
                 tickInterval:avgVTick,
                }],
            xAxis:{
                categories:days, 
                tickInterval:5
            },
            series: [
                {
                    name:"Price",
                    type:'area',
                    yAxis:0,
                    lineColor:'blue',
                    color:Highcharts.getOptions().colors[0],
                    data:price
                }, {
                    name:"Volume",
                    type:'column',
                    yAxis:1,
                    color:'red',
                    data:volume
                }
            ]
        });
        options = {
            exporting: {
                url: 'https://export.highcharts.com/'
            },
            title: {
                text: symbol + ' Stock Price and Volume',
                zoomType:'x'
            },
            subtitle: {
                text: "<a target=\"_blank\" href=\"https://www.alphavantage.co/\" style=\"color:blue\">Source: Alpha Vantage</a>",
                useHTML:true
            },
            yAxis:[{
                title:{
                    text:'Stock Price'
                }, 
                 tickInterval:avgPTick, 
                 tickPixelInterval:90, 
                 min:0, 

                },{
                title:{
                    text:'Volume'
                }, 
                 opposite:true, 
                 min:0, 
                 tickPixelInterval:90,
                 tickInterval:avgVTick,
                }],
            xAxis:{
                categories:days, 
                tickInterval:5
            },
            series: [
                {
                    name:"Price",
                    type:'area',
                    yAxis:0,
                    lineColor:'blue',
                    color:Highcharts.getOptions().colors[0],
                    data:price
                }, {
                    name:"Volume",
                    type:'column',
                    yAxis:1,
                    color:'red',
                    data:volume
                }
            ]
            
            
        }
        $("#fbBtn").prop("disabled", false);
    }
}

function roundDown(number, decimals) {
    decimals = decimals || 0;
    return ( Math.floor( number * Math.pow(10, decimals) ) / Math.pow(10, decimals) );
} 

function addCommas(intNum) {
  return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}




    
});
//        
