var products = {"Core": "Platform", "gaia": "Gaia", "Marketplace": "Marketplace", "Other": "Other"}; 
var otherProducts = [];
var totalIssueRollupByDate = {}; 
var productIssueRollupByDate = {};
var bugData = {};
var latestDataDate = null;

$(document).ready(function () {
	$(document).on("dataupdate", dataIsInForAllDates);
	$(document).on("alldatain", findLatestDataDate);
	$(document).on("alldatain", rollupData);
	
	getData();
});

function dataIsInForAllDates(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while(date.getTime() < today.getTime()){
		var dateString = getDateAsString(date);
		if(bugData[dateString] === undefined){
			return false;
		}
		date.setDate(date.getDate()+1);
	}
	$(document).trigger("alldatain");
}

function getData(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while (date.getTime() < today.getTime()){
		var dateString = getDateAsString(date);
		getDataForDate(dateString);
		date.setDate(date.getDate()+1);
	}
}

function getDateAsString(date){
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	if (month < 10){
		month = "0" + month;
	}
	var day = date.getDate();
	if(day < 10){
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}

function getDataForDate(date){
	var urlbase = "data/";
	var url = urlbase + date + ".csv";
	$.ajax({
		  url: url,
		  crossDomain:true, 
		  dataType: 'text',
		  success: function(data){
		    parseDataForDate(date, data);
		  },
		  error: function(jqXHR, textStatus, errorThrown){
			setEmptyDataForDate(date);
		  }
	});
}

function parseDataForDate(date, data){
	var csvData = parseCSVData(data);
	bugData[date] = csvData;
	
	$(document).trigger("dataupdate");
}

function setEmptyDataForDate(date){
	bugData[date] = [];
	$(document).trigger("dataupdate");
}

function rollupData(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while (date.getTime() < today.getTime()){
		var dateString = getDateAsString(date);
		
		var issueCount = 0;
		var openIssueCount = 0;
		var productIssueCount = {};
		var productOpenIssueCount = {};
		if(bugData[dateString].length == 0){
			totalIssueRollupByDate[dateString] = [dateString,null,null];
			
			if(showTrack){
				totalIssueRollupByDate[dateString].push(null);
			}
		}
		else{
			for(var i = 1; i < bugData[dateString].length; i++){
				var product = bugData[dateString][i][6];
				if(products[product] === undefined){
					if(otherProducts.indexOf(product) == -1){
						otherProducts.push(product);
					}
					product = "Other";
				}
		
				issueCount++;
				if(productIssueCount[product] === undefined){
					productIssueCount[product] = 0;
				}
				productIssueCount[product]++;
		
				if(bugData[dateString][i][4] == "open"){
					openIssueCount++;
					if(productOpenIssueCount[product] === undefined){
						productOpenIssueCount[product] = 0;
					}
					productOpenIssueCount[product]++;
				}
		
			}
			totalIssueRollupByDate[dateString] = [dateString, issueCount, openIssueCount];
			if(showTrack){
				totalIssueRollupByDate[dateString].push(null);
			}
			
			if(showTrack && dateString == actualStartDate){
				totalIssueRollupByDate[dateString][3] = openIssueCount;
			}
			for(var product in productIssueCount){
				if(productIssueRollupByDate[product] === undefined){
					productIssueRollupByDate[product] = {};
				}
				productIssueRollupByDate[product][dateString] = [dateString, productIssueCount[product], productOpenIssueCount[product]];
				if(showTrack){
					productIssueRollupByDate[product][dateString].push(null);
				}
		
				if(showTrack && dateString == actualStartDate){
					productIssueRollupByDate[product][dateString][3] = productOpenIssueCount[product];
				}
			}
		}
		date.setDate(date.getDate()+1);
	}
	$(document).trigger("datarollupcomplete");
}

function findLatestDataDate(){
	var oldestDate = new Date(startDate);
	var date = new Date(Date.now());
	var dateString = null;
	while(date > oldestDate){
		dateString = getDateAsString(date);
		if(bugData[dateString].length != 0){
			date.setDate(date.getDate() + 1);
			dateString = getDateAsString(date);
			break;
		}
		date.setDate(date.getDate() - 1);
	}
	if(dateString == null){
		dateString = startDate;
	}
	latestDataDate = dateString;
}