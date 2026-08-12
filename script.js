import fs from "fs";


for (let index = 0; index < 100; index++) {
  fs.writeFile("./files/" + (index + 1) + ".txt", "", function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("File created")
      
    }

  });
}
