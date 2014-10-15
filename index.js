var fs = require('fs'),
	an = require('./mystemAnalyser')
	colors = require('colors');


fs.readFile("text.json", "utf8", function(err, data) {
	if (err) throw new Error(err);

	data = JSON.parse(data);
	an.setData(data.o);

	var report = "Общее число словоупотреблений: " + an.wordUsages();
	report += "\n" + "Количество предложений: " + an.sentences();
	report += "\n" + "Количество различных словоформ: " + an.wordforms();
	report += "\n" + "Средняя длина предложения: " + an.meanSentenceLength();
	report += "\n";
	report += "\n" + "Абсолютная частота омонимичных словоформ: " + an.absoluteHomonymy();
	report += "\n" + "Относительная частота омонимичных словоформ: " + an.relativeHomonymy("percent");
	report += "\n";
	report += "\n" + "Количество уникальных лемм: " + an.uniqueLemmas();
	report += "\n" + "Количество незнакомых слов: " + an.unknownWords();

	console.log(report.green);
});