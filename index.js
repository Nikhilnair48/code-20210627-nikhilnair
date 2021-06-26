const { Transform } = require("stream");
const fs = require("fs");
const Exception = require("./exceptions/bmi-exception");

const transform = new Transform({
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    this.push(chunk.toString());
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
