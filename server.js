// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // 提供静态文件（index.html, script.js 等）

// 提供 materials.json 的读取接口
app.get("/materials.json", (req, res) => {
  res.sendFile(path.join(__dirname, "materials.json"));
});

// 保存材料数据接口
app.post("/api/save", (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ message: "数据格式错误" });
  }

  const filePath = path.join(__dirname, "materials.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("写入失败:", err);
      return res.status(500).json({ message: "保存失败" });
    }
    res.json({ message: "保存成功" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
