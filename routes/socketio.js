var io;

module.exports = function(setupIo) {
  if (setupIo) {
    io = setupIo;
  }
  return io;
};
