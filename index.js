var fs = require('fs'),
	an = require('./mystemAnalyser')
	colors = require('colors');


fs.readFile("text.json", "utf8", function(err, data) {
	if (err) throw new Error(err);

	data = JSON.parse(data);
	an.setData(data.o);

	var report = "Общее число словоупотреблений: ".green + an.wordUsages();
	report += "\n" + "Количество предложений: ".green + an.sentences();
	report += "\n" + "Количество различных словоформ: ".green + an.wordforms();
	report += "\n" + "Средняя длина предложения: ".green + an.meanSentenceLength();
	report += "\n";
	report += "\n" + "Абсолютная частота омонимичных словоформ: ".green + an.absoluteHomonymy();
	report += "\n" + "Относительная частота омонимичных словоформ: ".green + an.relativeHomonymy("percent");
	report += "\n" + "Количество слов разных частей речи:\n".green + an.partOfSpeechPercent();
 	report += "\n";
	report += "\n" + "Количество уникальных лемм: ".green + an.uniqueLemmas();
	report += "\n" + "Количество незнакомых слов: ".green + an.unknownWords();
	report += "\n" + "Коэффициент лексического богатсва: ".green + an.lexicalRichness();

	console.log(report);
});