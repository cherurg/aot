var us = require('underscore');
us.mixin({
	extendDeep: function extendDeep(child, parent) {
		var i,
			toStr = Object.prototype.toString,
			astr = "[object Array]";

		child = child || ((toStr.call(parent) === astr) ? [] : {});

		for (i in parent) {
			if (parent.hasOwnProperty(i)) {
				if (typeof parent[i] === "object") {
					child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
					extendDeep(child[i], parent[i]);
				} else {
					child[i] = parent[i];
				}
			}
		}
		return child;
	}
});

var my = {};

function setData(data) {
	my.data = us.extendDeep(my.data, data);
}

function getData() {
	return my.data;
}

var sentenceEndSymbol = '\\s';
var wordUsages = us.memoize(function () {

	my.usagesCounter = 0;
	if (!my.sentencesCounter) {
		my.sentencesCounter = 0;
	}

	us.each(my.data, function (el) {
		if (el.text !== sentenceEndSymbol) {
			my.usagesCounter++;
		} else {
			my.sentencesCounter++;
		}
	});

	return my.usagesCounter;
});

var sentences = us.memoize(function () {

	if (my.sentencesCounter) {
		return my.sentencesCounter;
	}

	wordUsages();

	return my.sentencesCounter;
});

function uniqueElements(arr) {
	var set = {};
	us.each(arr, function (el) {
		set[el] = true;
	});

	return us.size(set);	
}

var wordforms = us.memoize(function () {
	var arr = us.map(my.data, function (el) {
		return el.text;
	});

	return uniqueElements(arr);
});

var meanSentenceLength = us.memoize(function () {

	var mean = [0];
	us.each(my.data, function (el) {
		if (el.text !== sentenceEndSymbol) {
			mean[mean.length - 1]++;
		} else {
			mean.push(0);
		}
	});

	return us.reduce(mean, function (memo, el) {
		return memo + el / mean.length;
	}, 0);
});

var absoluteHomonymy = us.memoize(function () {
	var counter = 0;
	us.each(my.data, function (el) {
		if (el.analysis && el.analysis.length > 1) {
			counter++;
		}
	});

	return counter;
});

var relativeHomonymy = us.memoize(function (format) {
	var frequency = absoluteHomonymy() / wordforms();

	if (format === "percent") {
		frequency = ((frequency * 10000)|0)/ 100 + "%";
	}

	return frequency;
});

var uniqueLemmas = us.memoize(function () {
	var arr = us.chain(my.data)
		.map(function (el) {
			if (el.analysis && el.analysis[0]) {
				return el.analysis[0].lex;
			}
		})
		.filter(function (el) {
			return !!el;	
		})
		.value();

	return uniqueElements(arr);
});

exports.setData = setData;
exports.getData = getData;
exports.wordUsages = wordUsages;
exports.sentences = sentences;
exports.wordforms = wordforms;
exports.meanSentenceLength = meanSentenceLength;
exports.absoluteHomonymy = absoluteHomonymy;
exports.relativeHomonymy = relativeHomonymy;
exports.uniqueLemmas = uniqueLemmas;