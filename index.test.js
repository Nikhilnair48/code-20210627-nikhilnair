const fs = require("fs");
const processInput = require("./index").processInput;
const findBMI = require("./index").findBMI;

test("Invoke findBMI with a sample JSON", async () => {
  const res = findBMI({ "Gender": "Male", "HeightCm": 171, "WeightKg": 96 });
  const equalTo = {
    "Gender": "Male",
    "HeightCm": 171,
    "WeightKg": 96,
    "BMI": "32.83",
    "category": "Moderately obese",
    "risk": "Moderately obese"
  };
  expect(res).toStrictEqual(equalTo);
});

async function populateData(largeDataInputPath) {
  let fileExists = await fs.existsSync(largeDataInputPath);
  // Only generate data if the file doesn't exist
  if (!fileExists) {
    await fs.appendFileSync(largeDataInputPath, "[");

    // Generate a large set of data
    const gender = ["Male", "Female"];
    for (let i = 0; i < 20000; i++) {
      let data = JSON.stringify({
        Gender: gender[parseInt(Math.random() * 2)],
        HeightCm: parseInt(Math.random() * (200 - 80) + 80),
        WeightKg: parseInt(Math.random() * (250 - 5) + 5)
      });
      if (i == 19999) data += "";
      else data += ",";

      // Write to output file
      await fs.appendFileSync(largeDataInputPath, data);
    }
    await fs.appendFileSync(largeDataInputPath, "]");
  }
}

test("Compute BMI with large, generated dataset", async () => {
  const largeDataInputPath = "./data/sample3.json";
  await populateData(largeDataInputPath);
  const res = await processInput(largeDataInputPath, "./data/sample4.json");

  // To do: validate at least one object in the output to ensure all went fine
  expect(res).toEqual({ status: "Success" });
});
