# BMI Calculator

A BMI calculator using stream transformation in node to reduce memory usage while processing large files.

# July 4th change

## Previous assumption

- Input: expect a JSON array
  New assumption
- Input: expect a file (txt) where each input is a JSON object and is separated by new line (not a comma)

## Changes

- Updated processInput in index.js to now read each line from the input stream, parse the line to JSON, process the data (find BMI, category & risk) and write to the output stream.
- [Test] "Compute BMI with large, generated dataset" now updated to create a sample txt instead of JSON and invoke processInput on the file
