var header = ['Date', 'Total Scope', 'Open', 'Track'];
var tableIgnoreCols = ['url', 'patch'];

function createBurndownChart(){
	$(document).on("datarollupcomplete", drawBurndownChart);
	$(document).on("datarollupcomplete", drawProductBurndownCharts);
	$(document).on("datarollupcomplete", calculateFindFixRates);
	$(document).on("alldatain", populateBugTable);
}

function drawBurndownChart() {
	var data = [];
	data[0] = header;
		
	var date = new Date(startDate);
	var endDate = new Date(actualEndDate);
	endDate.setDate(endDate.getDate()+2);
	var i = 1;
	while(date.getTime() < endDate.getTime()){
		var dateString = getDateAsString(date);
		
		if(totalIssueRollupByDate[dateString] === undefined){
			data[i] = [dateString, null, null, null];
			if(dateString == actualEndDate){
				data[i] = [actualEndDate, null, null, 0];
			}
		}
		else{
			data[i] = totalIssueRollupByDate[dateString];
			
		}
		date.setDate(date.getDate()+1);
		i++;
	}
    var chartData = google.visualization.arrayToDataTable(data);
    //chartData.addRow(["2012-08-31", null, null, 0]);
        
    var options = {
      title: 'Basecamp Burndown', 
      interpolateNulls: true,
      height: 398,
      width: 608,
      chartArea: {left:70,top:40,width:"85%",height:"70%"},
      legend: {position: 'in'}
    };
        
    var chartDiv = document.getElementById('chart_div');

    var chart = new google.visualization.LineChart(chartDiv);
    chart.draw(chartData, options);
}

function drawProductBurndownCharts(){
	var productChartDiv = document.getElementById("product_charting_div");
	for(var product in products){
		var div = document.createElement('div');
		div.setAttribute("class", "productBurndownChart");
		productChartDiv.appendChild(div);
	
		var data = [];
		data[0] = header;
		
		var date = new Date(startDate);
		var endDate = new Date(actualEndDate);
		endDate.setDate(endDate.getDate()+2);
		var i = 1;
		while(date.getTime() < endDate.getTime()){
			var dateString = getDateAsString(date);
			
			if(productIssueRollupByDate[product][dateString] === undefined){
				data[i] = [dateString, null, null, null];
				if(dateString == actualEndDate){
					data[i] = [actualEndDate, null, null, 0];
				}
			}
			else{
				data[i] = productIssueRollupByDate[product][dateString];
				
			}
			date.setDate(date.getDate()+1);
			i++;
		}
        var chartData = google.visualization.arrayToDataTable(data);
        //chartData.addRow(["2012-08-31", null, null, 0]);
        
        var options = {
          title: products[product] + ' Burndown', 
          interpolateNulls: true,
          height:208,
          width:298,
          legend: {position: 'none'},
          hAxis: {textPosition: 'none'},
          chartArea: {left:30,top:20,width:"95%",height:"85%"}
        };

        var chart = new google.visualization.LineChart(div);
        chart.draw(chartData, options);
	}
	
}

function calculateFindFixRates(){
	var rateDiv = document.getElementById("rate_div");
	var endDate = new Date(Date.now());
	var endDateString = getDateAsString(endDate);

	for (var product in products) {
		while(productIssueRollupByDate[product][endDateString] === undefined){
			endDate.setDate(endDate.getDate()-1);
			endDateString = getDateAsString(endDate);
		}
	    break;
	}
	var startDate = new Date();
	startDate.setDate(endDate.getDate()-7);
	var startDateString = getDateAsString(startDate);

	for(var product in products){
		var endDateTotal = productIssueRollupByDate[product][endDateString][1];
		var endDateOpen = productIssueRollupByDate[product][endDateString][2];
		var startDateTotal = productIssueRollupByDate[product][startDateString][1];
		var startDateOpen = productIssueRollupByDate[product][startDateString][2];

		var find = endDateTotal - startDateTotal;
		var fix = (endDateTotal - endDateOpen) - (startDateTotal - startDateOpen);
		
		var rate = Math.round((find/fix)*100)/100;
		
		var div = document.createElement('div');
		div.setAttribute("class", "findfixrate");
		div.innerHTML = products[product] + ": " +rate;
		rateDiv.appendChild(div);
	}
}

function populateBugTable(){
	$('#issue_table_div').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="bugTable"></table>' );
	var cols = [];
	var thedate = getDateAsString(today);
	var bugDataA= bugData[thedate];
	var bugs = $.extend([], bugDataA);
	var bugCols = bugs.shift();
	for(var i = 0; i < bugCols.length; i++){
		var col = bugCols[i];
		if(tableIgnoreCols.indexOf(col) != -1){
			cols.push({"sTitle": col,
				       "bSearchable": false,
					   "bVisible":    false});
		}
		else{
			if(col == "id"){
				cols.push({"sTitle": col,
				"fnRender": function(obj) {
					var sReturn = obj.aData[ obj.iDataColumn ];
					var url = obj.aData[2];
					sReturn = "<a href=\"" + url + "\">" + sReturn + "</a>";
					return sReturn;
				}});
			}
			else{
				cols.push({"sTitle": col});
			}
		}
	}
	
	$('#bugTable').dataTable( {
		"aaData": bugs,
		"aoColumns": cols
	} );	
}
