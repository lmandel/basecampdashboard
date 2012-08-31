function parseCSVData(data){
	var csvData = [];
	var rows = _splitDataIntoRows(data);
	
	for(var i = 0; _rowHasData(rows[i]); i++){
		csvData[i] = [];
		var cols = _splitRowIntoCols(rows[i]);
		
		var offset = 0;
		for(var j = 0; j < 9; j++){
			var cell = cols[j+offset];
			if(cell.charAt(0) === "\""){
				while(cell.charAt(cell.length-1) != "\"" || cols[j+offset+1].charAt(0) == "\""){
					offset++;
					cell = cell + "," + cols[j+offset];
				}
				cell = _unquoteValue(cell);
			}
			csvData[i][j] = cell;
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
