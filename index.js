const StreamArray = require("stream-json/streamers/StreamArray");
const { Transform, Readable } = require("stream");
const fs = require("fs");
const Exception = require("./exceptions/bmi-exception");

function determineBMICategory(bmi) {
  let category = "";
  if (bmi < 18.4) category = "Underweight";
  else if (bmi >= 18.5 && bmi < 25) category = "Normal weight";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else if (bmi >= 30 && bmi < 35) category = "Moderately obese";
  else if (bmi >= 35 && bmi < 40) category = "Severely obese";
  else if (bmi >= 40) category = "Very severely obese";
  return category;
}

function determineBMIHealthRisk(bmi) {
  try {
    let risk = "";
    if (bmi < 18.4) risk = "Malnutrition risk";
    else if (bmi >= 18.5 && bmi < 25) risk = "Low risk";
    else if (bmi >= 25 && bmi < 30) risk = "Enhanced risk";
    else if (bmi >= 30 && bmi < 35) risk = "Medium risk";
    else if (bmi >= 35 && bmi < 40) risk = "High risk";
    else if (bmi >= 40) risk = "Very high risk";
    return risk;
  } catch (error) {
    Exception.error("Error determining BMI.", error, "BMIException");
  }
}

function findBMI(data) {
  try {
    data["BMI"] = (data.WeightKg / Math.pow(data.HeightCm / 100, 2)).toFixed(2);
    data["category"] = determineBMICategory(data.BMI);
    data["risk"] = determineBMICategory(data.BMI);
    return data;
  } catch (error) {
    Exception.error("Error determining BMI.", error, "BMIException");
  }
}

let firstObjectRead = false;

const transform = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform({ key, value }, encoding, callback) {
    let separator = ",";
    if (!firstObjectRead) {
      firstObjectRead = true;
      separator = "[";
    }
    this.push(separator + JSON.stringify(findBMI(value)));
    callback();
  }
});

function processInput(inputPath, outputPath) {
  try {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const jsonParser = StreamArray.withParser();

    readStream.pipe(jsonParser.input).on("error", (error) => {
      Exception.error("Error parsing json.", error, "TransformException");
    });
    jsonParser.pipe(transform).pipe(writeStream, (error) => {
      Exception.error("Error on write stream.", error, "WriteStreamException");
    });

    writeStream.on("finish", function () {
      fs.appendFileSync(outputPath, "]");
    });
  } catch (error) {
    Exception.error("Error processing data.", error, "Exception");
  }
}

processInput("./data/sample1.json", "./data/sample2.json");

module.exports = {
  processInput: processInput,
  findBMI: findBMI
};
