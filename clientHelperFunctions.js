// basicBoard: JSON object
let printBoard = function (basicBoard) {
	
	let board = JSON.parse(JSON.stringify(basicBoard).replace(/-1/g, '" "').replace(/0/g, '"O"').replace(/1/g, '"X"'));
	let boardString = '- - - - - - -\n';
	boardString += '| ' + board["A"][0] + ' | ' + board["A"][1] + ' | ' + board["A"][2] + ' |\n';
	boardString += '- - - - - - -\n';
	boardString += '| ' + board["B"][0] + ' | ' + board["B"][1] + ' | ' + board["B"][2] + ' |\n';
	boardString += '- - - - - - -\n';
	boardString += '| ' + board["C"][0] + ' | ' + board["C"][1] + ' | ' + board["C"][2] + ' |\n';
	boardString += '- - - - - - -\n';
	
	
	console.log(boardString);
}

module.exports = {
	print: printBoard
}