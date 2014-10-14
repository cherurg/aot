var fs = require('fs'),
	an = require('./mystemAnalyser');


fs.readFile("text.json", "utf8", function(err, data) {
	if (err) throw new Error(err);

	data = JSON.parse(data);
	an.setData(data.o);

	var report = "";
	report += "Общее число словоупотреблений: " + an.wordUsages();
	report += "\n" + "Количество предложений: " + an.sentences();
	report += "\n" + "Количество различных словоформ: " + an.wordforms();
	report += "\n" + "Средняя длина предложения: " + an.meanSentenceLength();
	report += "\n" + "Абсолютная частота омонимичных словоформ: " + an.absoluteHomonymy();
	report += "\n" + "Относительная частота омонимичных словоформ: " + an.relativeHomonymy("percent");

	console.log(report);
});