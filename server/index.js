const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

app.use(express.static("../public"));

function addStats(title, goodTitle) {
  fs.readFile("./stats.json", "utf-8", (err, data) => {
    if (!err) {
      const arr = JSON.parse(data);

      let now = new Date();

      arr.push({
        title: title,
        good: goodTitle,
        date: `${now.getDate()}.${now.getMonth()}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      });

      fs.writeFile("./stats.json", JSON.stringify(arr), (err) => {});
    }
  });
}

app.get("/data", (req, res) => {
  fs.readFile("./goods.json", "utf-8", (err, data) => {
    if (!err) {
      res.setHeader("Content-Type", "Application/json");
      res.end(data);
    } else {
      console.log(err);
      end(JSON.stringify(err));
    }
  });
});

app.get("/cart", (req, res) => {
  fs.readFile("./cart.json", "utf-8", (err, data) => {
    if (!err) {
      res.setHeader("Content-Type", "Application/json");
      res.end(data);
    } else {
      console.log(err);
      end(JSON.stringify(err));
    }
  });
});

app.post("/cartAdd", bodyParser.json(), (req, res) => {
  addStats('add', req.body.title);

  fs.readFile("./cart.json", "utf-8", (err, data) => {
    if (!err) {
      const goods = JSON.parse(data);

      if (goods.length !== 0) {
        let prod = goods.find((item) => item.id === req.body.id);
        if (!prod) {
          goods.push(req.body);
        } else prod.quantity++;
      } else {
        goods.push(req.body);
      }

      fs.writeFile("./cart.json", JSON.stringify(goods), (err) => {
        if (!err) {
          res.setHeader("Content-Type", "Application/json");
          res.end(JSON.stringify(goods));
        } else {
          console.log(err);
          end(JSON.stringify(err));
        }
      });
    } else {
      console.log(err);
      end(JSON.stringify(err));
    }
  });
});

app.post("/cartDel", bodyParser.json(), (req, res) => {
  addStats('delete', req.body.title);

  fs.readFile("./cart.json", "utf-8", (err, data) => {
    if (!err) {
      let goods = JSON.parse(data);

      goods = goods.filter((item) => req.body.id !== item.id);

      fs.writeFile("./cart.json", JSON.stringify(goods), (err) => {
        if (!err) {
          res.setHeader("Content-Type", "Application/json");
          res.end(JSON.stringify(goods));
        } else {
          console.log(err);
          end(JSON.stringify(err));
        }
      });
    } else {
      console.log(err);
      end(JSON.stringify(err));
    }
  });
});

app.post("/cartChangeQuantity", bodyParser.json(), (req, res) => {
  addStats('change good quantity', req.body.title);

  fs.readFile("./cart.json", "utf-8", (err, data) => {
    if (!err) {
      const goods = JSON.parse(data);

      goods.find((item) => item.id === req.body.id).quantity = Number(
        req.body.quantity
      );

      fs.writeFile("./cart.json", JSON.stringify(goods), (err) => {
        if (!err) {
          res.setHeader("Content-Type", "Application/json");
          res.end(JSON.stringify(goods));
        } else {
          console.log(err);
          end(JSON.stringify(err));
        }
      });
    } else {
      console.log(err);
      end(JSON.stringify(err));
    }
  });
});
