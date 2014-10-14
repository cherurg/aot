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

var wordforms = us.memoize(function () {

	var wordformsSet = {};
	us.each(my.data, function (el) {
		wordformsSet[el.text] = true;
	});

	my.wordforms = us.size(wordformsSet);

	return my.wordforms;
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
	var frequency = absoluteHomonymy() / wordUsages();

	if (format === "percent") {
		frequency = Math.floor(frequency * 10000) / 100 + "%";
	}

	return frequency;
});

exports.setData = setData;
exports.getData = getData;
exports.wordUsages = wordUsages;
exports.sentences = sentences;
exports.wordforms = wordforms;
exports.meanSentenceLength = meanSentenceLength;
exports.absoluteHomonymy = absoluteHomonymy;
exports.relativeHomonymy = relativeHomonymy;