const { exec } = require("child_process");

class JobWorker {
  constructor(name) {
    this.name = name;
  }

  onMessage(msg) {
    console.log(`worker ${this.name} got ${msg.inst}`);
    if (msg.inst == "close") {
      process.removeAllListeners("message");
      return;
    }
    if (msg.inst.trim() == "mocha") {
      exec(
        "mocha --reporter=json ~/nodejs_file/geometry-unphydra/test/",
        (err, result) => {
          if (err) throw err;
          process.send(result);
        }
      );
    }
  }

  initialize() {
    process.on("message", message => this.onMessage(message));
    console.log(`starting ${this.name} with pid ${process.pid}`);
  }
}

main = () => {
  const [, , name] = process.argv;
  const worker = new JobWorker(name);
  worker.initialize();
};

main();
