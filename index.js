const { Transform } = require("stream");
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
    for (const index in data) {
      data[index]["BMI"] = (
        data[index].WeightKg / Math.pow(data[index].HeightCm / 100, 2)
      ).toFixed(2);
      data[index]["category"] = determineBMICategory(data[index].BMI);
      data[index]["risk"] = determineBMICategory(data[index].BMI);
    }
    return data;
  } catch (error) {
    Exception.error("Error determining BMI.", error, "BMIException");
  }
}

const transform = new Transform({
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk.toString());
    this.push(JSON.stringify(findBMI(data)));
    callback();
  }
});

function processInput(inputPath, outputPath) {
  try {
    const readStream = fs.createReadStream(inputPath, {
      objectMode: true
    });
    const writeStream = fs.createWriteStream(outputPath);
    readStream.on("error", (error) => {
      Exception.error("Error on read stream.", error, "ReadStreamException");
    });
    readStream.pipe(transform).on("error", (error) => {
      Exception.error("Error on transform.", error, "TransformException");
    });
    transform.pipe(writeStream, (error) => {
      Exception.error("Error on write stream.", error, "WriteStreamException");
    });
  } catch (error) {
    Exception.error("Error processing data.", error, "Exception");
  }
}

processInput("./data/sample1.json", "./data/sample2.json");
