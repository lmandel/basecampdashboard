$(document).ready(function () {
	$(document).on("dataupdate", dataIsInForAllDates);
	
	getData();
});

function dataIsInForAllDates(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while(date.getTime() < today.getTime()){
		var dateString = getDateAsString(date);
		if(issueDate[dateString] === undefined){
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
	
	var issueCount = 0;
	var openIssueCount = 0;
	var productIssueCount = {};
	var productOpenIssueCount = {};
	
	for(var i = 1; i < csvData.length; i++){
		var product = csvData[i][6];
		if(products[product] === undefined){
			product = "Other";
		}
		
		issueCount++;
		if(productIssueCount[product] === undefined){
			productIssueCount[product] = 0;
		}
		productIssueCount[product]++;
		
		if(csvData[i][4] == "open"){
			openIssueCount++;
			if(productOpenIssueCount[product] === undefined){
				productOpenIssueCount[product] = 0;
			}
			productOpenIssueCount[product]++;
		}
		
	}
	issueDate[date] = [date, issueCount, openIssueCount, null];
	if(date == actualStartDate){
		issueDate[date][3] = openIssueCount;
	}
	for(var product in productIssueCount){
		if(productIssueDate[product] === undefined){
			productIssueDate[product] = {};
		}
		productIssueDate[product][date] = [date, productIssueCount[product], productOpenIssueCount[product], null];
		
		if(date == actualStartDate){
			productIssueDate[product][date][3] = productOpenIssueCount[product];
		}
	}
	
	$(document).trigger("dataupdate");
}

function setEmptyDataForDate(date){
	issueDate[date] = [date,null,null,null];
	$(document).trigger("dataupdate");
}