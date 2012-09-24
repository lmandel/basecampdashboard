function parseCSVData(data){
	var csvData = [];
	var numCols = 9;
	if(featuresOnly){
		numCols = 10;
	}
	
	var rows = _splitDataIntoRows(data);
	
	var ioffset = 0;
	for(var i = 0; _rowHasData(rows[i]); i++){
		csvData[i+ioffset] = [];
		var cols = _splitRowIntoCols(rows[i]);
		
		var joffset = 0;
		for(var j = 0; j < numCols; j++){
			var cell = cols[j+joffset];
			if(cell.charAt(0) === "\""){
				while(cell.charAt(cell.length-1) != "\"" || cols[j+joffset+1].charAt(0) == "\""){
					joffset++;
					cell = cell + "," + cols[j+joffset];
				}
				cell = _unquoteValue(cell);
			}
			csvData[i+ioffset][j] = cell;
		}
		if(featuresOnly && csvData[i+ioffset][9] == "n"){
			csvData.pop();
			ioffset--;
		}
	}
	return csvData;
}

function _splitDataIntoRows(data){
	return data.split(/\r\n|\n/);
}

function _rowHasData(row){
	return (typeof row !== undefined && row != "");
}

function _splitRowIntoCols(row){
	return row.split(',');
}

function _unquoteValue(value){
	var returnValue = value.substring(1, value.length-1);
	return returnValue.replace("\"\"", "\"", "g");
}
