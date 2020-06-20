const { stdin } = process;
const { fork } = require("child_process");
const fs = require("fs");

class JobMaster {
  constructor(names) {
    this.names = names;
    this.workers = [];
  }

  onMessage(worker, msg) {
    console.log(`${worker.name} return ${msg}`);
    fs.writeFileSync("./try.js", msg);
  }

  onClose(worker, code) {
    console.log(`${worker.name} close with ${code}`);
  }

  initialization() {
    this.workers = this.names.map(name => {
      const worker = fork("jobWorker.js", [name]);
      worker.name = name;
      return worker;
    });
    this.workers.forEach(worker => {
      worker.on("message", msg => this.onMessage(worker, msg));
      worker.on("close", code => this.onClose(worker, code));
    });
  }

  runCommand(data) {
    console.log(this.workers[0].name);
    this.workers[0].send({ inst: "mocha" });
  }

  stop() {
    this.workers.forEach(w => {
      w.send({ inst: "close" });
    });
  }
}

main = () => {
  stdin.setEncoding("utf8");
  const master = new JobMaster(process.argv.slice(2));
  master.initialization();
  stdin.on("data", data => master.runCommand(data));
  stdin.on("end", () => master.stop());
};

main();
