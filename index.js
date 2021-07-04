const fs = require("fs");
const readLine = require("readline");
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

/*
  processInput - reads the file at 'inputPath', performs a transformation and writes to the file at the 'outputPath' 
*/
async function processInput(inputPath, outputPath) {
  try {
    return new Promise((resolve, reject) => {
      // Init read and write stream
      const readStream = fs.createReadStream(inputPath);
      const writeStream = fs.createWriteStream(outputPath);
      const rl = readLine.createInterface({
        input: readStream,
        output: writeStream
      });

      // Parse each line
      rl.on("line", function (line) {
        // Convert each line to a JSON object (JSON.parse)
        let input = JSON.parse(line);
        let output = findBMI(input);
        // Write to output stream
        writeStream.write(JSON.stringify(output) + "\n");
      });
      rl.on("close", function () {
        writeStream.close();
        resolve({
          status: "Success"
        });
      });
    });
  } catch (error) {
    Exception.error("Error processing data.", error, "Exception");
  }
}

// Process all the data from the first argument and write to the file in the second argument
processInput("./data/sample5.txt", "./data/sample6.txt");

module.exports = {
  processInput: processInput,
  findBMI: findBMI,
  determineBMICategory: determineBMICategory,
  determineBMIHealthRisk: determineBMIHealthRisk
};
