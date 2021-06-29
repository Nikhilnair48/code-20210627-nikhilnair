function error(_message, _data, name) {
  console.log(name + ": " + _message);
  console.log(_data);
}

module.exports.error = error;
