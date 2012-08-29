var products = {"Core": "Platform", "gaia": "Gaia", "Marketplace": "Marketplace", "Boot2Gecko": "Boot2Gecko", "Other": "Other"}; 
var issueDate = {}; 
var productIssueDate = {};
var bugData = {};

$(document).ready(function () {
	$(document).on("dataupdate", dataIsInForAllDates);
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
			issueDate[dateString] = [dateString,null,null,null];
		}
		else{
			for(var i = 1; i < bugData[dateString].length; i++){
				var product = bugData[dateString][i][6];
				if(products[product] === undefined){
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
			issueDate[dateString] = [dateString, issueCount, openIssueCount, null];
			if(dateString == actualStartDate){
				issueDate[dateString][3] = openIssueCount;
			}
			for(var product in productIssueCount){
				if(productIssueDate[product] === undefined){
					productIssueDate[product] = {};
				}
				productIssueDate[product][dateString] = [dateString, productIssueCount[product], productOpenIssueCount[product], null];
		
				if(dateString == actualStartDate){
					productIssueDate[product][dateString][3] = productOpenIssueCount[product];
				}
			}
		}
		date.setDate(date.getDate()+1);
	}
	$(document).trigger("datarollupcomplete");
}