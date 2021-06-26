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
