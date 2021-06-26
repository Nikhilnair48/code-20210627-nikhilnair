const StreamArray = require("stream-json/streamers/StreamArray");
const { Transform, Readable } = require("stream");
const fs = require("fs");
const Exception = require("./exceptions/bmi-exception");

// Helper function to determine BMI category
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

// Helper function to determine health risk
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

/*
  findBMI - given an object containing gender, height and weight, determine the BMI, 
  BMI category and health risk
  Sample object: { "Gender": "Male", "HeightCm": 171, "WeightKg": 96 }
*/
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

// While handling large streams of data (ex: 20000 JSON objects), the open bracket, ("["), commas separating objects
// and closed brackets ("]") will have to be added - unless done manually.
// for the first object, the boolean will permit us to add the open bracket
// for consequent objects, a comma will be added in the Transform stream
let firstObjectRead = false;

// Transform stream - given a JSON, invoke findBMI and push the updated chunk onto the stream
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

/*
  processInput - reads the file at 'inputPath', performs a transformation and writes to the file at the 'outputPath' 
*/
function processInput(inputPath, outputPath) {
  try {
    // Init read and write stream
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    // Init json parser - particularly necessary for read
    const jsonParser = StreamArray.withParser();

    // Read from file and pipe to the JSON parser
    readStream.pipe(jsonParser.input).on("error", (error) => {
      Exception.error("Error parsing json.", error, "TransformException");
    });
    // Once the chunks are parsed, pass them to the transform stream, and write the output
    jsonParser.pipe(transform).pipe(writeStream, (error) => {
      Exception.error("Error on write stream.", error, "WriteStreamException");
    });

    // Once the writes are done, ensure to add the closing bracket for the list of objects
    writeStream.on("finish", function () {
      fs.appendFileSync(outputPath, "]");
    });
  } catch (error) {
    Exception.error("Error processing data.", error, "Exception");
  }
}

// Process all the data from the first argument and write to the file in the second argument
processInput("./data/sample1.json", "./data/sample2.json");

module.exports = {
  processInput: processInput,
  findBMI: findBMI,
  determineBMICategory: determineBMICategory,
  determineBMIHealthRisk: determineBMIHealthRisk
};
