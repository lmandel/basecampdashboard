var header = ['Date', 'Basecamp Scope', 'Open Basecamp+ Issues', 'Track'];
var actualStartDate = "2012-07-14";
var actualEndDate = "2012-08-31";
var startDate = "2012-07-15";
var today = new Date(Date.now());
var issueDate = {}; 

function createBurndownChart(){
	var date = new Date(startDate);
	while (date.getTime() < today.getTime()){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		if (month < 10){
			month = "0" + month;
		}
		var day = date.getDate();
		if(day < 10){
			day = "0" + day;
		}
		var dateString = year + "-" + month + "-" + day;
		getDataForDate(dateString);
		date.setDate(date.getDate()+1);
	}
}

function drawBurndownChart() {
	if(dataIsInForAllDates()){
		var data = [];
		data[0] = ['Date', 'Total Scope', 'Open basecamp+', 'Track'];
		
		var date = new Date(startDate);
		var endDate = new Date(actualEndDate);
		endDate.setDate(endDate.getDate()+2);
		var i = 1;
		while(date.getTime() < endDate.getTime()){
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			if (month < 10){
				month = "0" + month;
			}
			var day = date.getDate();
			if(day < 10){
				day = "0" + day;
			}
			var dateString = year + "-" + month + "-" + day;
			
			if(issueDate[dateString] === undefined){
				data[i] = [dateString, null, null, null];
				if(dateString == actualEndDate){
					data[i] = [actualEndDate, null, null, 0];
				}
			}
			else{
				data[i] = issueDate[dateString];
				
			}
			date.setDate(date.getDate()+1);
			i++;
		}
        var chartData = google.visualization.arrayToDataTable(data);
        //chartData.addRow(["2012-08-31", null, null, 0]);
        
        var options = {
          title: 'Basecamp Burndown', interpolateNulls: true
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        chart.draw(chartData, options);
	}
}

function dataIsInForAllDates(){
	var date = new Date(startDate);
	//while(date.getTime() < today.getTime()){
	//	if(issueDate[date] === undefined){
	//		return false;
	//	}
	//	date.setDate(date.getDate()+1);
	//}
	return true;
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
		    //alert('Uh oh. I couldn\'t find any bug/issue data for ' + url + '. ' + errorThrown);
		  }
		});
}

function parseDataForDate(date, data){
	var lines = data.split(/\r\n|\n/);

	var issueCount = 0;
	var openIssueCount = 0;
	
	for(var i = 1; typeof lines[i] != 'undefined'; i++){
		var lineData = lines[i].split(',');
		if(lineData[4] == "open"){
			openIssueCount++;
		}
		issueCount++;
	}
	issueDate[date] = [date, issueCount, openIssueCount, null];
	
	if(date == actualStartDate){
		issueDate[date][3] = openIssueCount;
	}
	drawBurndownChart();
}