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
			if (el.analysis && el.analysis[0]) {	//не у каждого элемента в data есть analysis и не каждый analysis 
				//имеет ненулевую длину
				return el.analysis[0].lex;
			}
		})
		.filter(function (el) {
			return !!el;	//проверяю на undefined
		})
		.value();

	return uniqueElements(arr);
});

var unknownWords = us.memoize(function () {
	var num = us.reduce(my.data, function (memo, el) {
		if (el.analysis && el.analysis.length === 0) {
			return memo + 1;
		}

		return memo;
	}, 0);

	return num;
});

var partOfSpeechPercent = us.memoize(function () {
	splitDataGR();

	function speechPart(name) {
		return {
			count: 0,
			name: name,
			toString: function () {
				return this.name + ": " + this.count + ", " + ((this.count/wordUsages()*10000)|0)/100 + "%";
			}
		}
	}

	var percents = {
		A: speechPart("Прилагательное"),
		ADV: speechPart("Наречие"),
		ADVPRO: speechPart("Местоименное наречие"),
		ANUM: speechPart("Числительное-прилагательное"),
		APRO: speechPart("Местоимение-прилагательное"),
		COM: speechPart("Часть композита - сложного слова"),
		CONJ: speechPart("Союз"),
		INTJ: speechPart("Междометие"),
		NUM: speechPart("Числительное"),
		PART: speechPart("Частица"),
		PR: speechPart("Предлог"),
		S: speechPart("Существительное"),
		SPRO: speechPart("Местоимение-существительное"),
		V: speechPart("Глагол"),
		деепр: speechPart("Деепричастие"),
		прич: speechPart("Причастие")
	};

	us.each(my.data, function (d) {
		if (!hasAnalysisProp(d) || d.analysis.length === 0) {
			return;
		}	

		var an = d.analysis[0].gr; //если омонимия, то берем первый вариант
		us.each(us.keys(percents), function (partOfSpeech) {
			if (-1 !== an.indexOf(partOfSpeech)) {
				if (partOfSpeech !== "V") {
					percents[partOfSpeech].count++;
					return;
				}

				if (-1 !== an.indexOf("деепр")) {
					percents["деепр"].count++;	
				} else if (-1 !== an.indexOf("прич")) {
					percents["прич"].count++;
				} else {
					percents["V"].count++;
				}
			}
		});
	});

	var values = us.values(percents);
	values.toString = function () {
		var str = "";
		us.each(values, function (val, i) {
			str += val;
			if (i !== values.length - 1) {
				str += "\n";
			}
		});

		return str;
	}

	return values;
});

function hasAnalysisProp(d) {
	return d.analysis && us.isArray(d.analysis);	
}

function splitDataGR() {
	if (my.splited) {
		return;
	}

	us.each(my.data, function (el, ind) {
		//если нет анализа или он не массив, то тут нам делать нечего.
		if (!hasAnalysisProp(el)) {
			return;
		}

		//разбиваем результат анализа по запятым
		us.each(el.analysis, function (an) {
			//убираем знак = из строки, заменяем на запятую.
			var eqInd = an.gr.indexOf("=");
			if (eqInd !== -1) {
				an.gr = an.gr.slice(0, eqInd) + "," + an.gr.slice(eqInd + 1);
			}

			an.gr = an.gr.split(",");
			//удаляем пустые элементы
			an.gr = us.filter(an.gr, function (symb) {
				return symb !== '';
			});	
		});
	});

	//чтобы не делать работу несколько раз.
	my.splited = true;
}

var lexicalRichness = us.memoize(function () {
	return uniqueLemmas()/wordUsages();
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
exports.unknownWords = unknownWords;
exports.partOfSpeechPercent = partOfSpeechPercent;
exports.lexicalRichness = lexicalRichness;