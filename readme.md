项目根目录运行：npm install mongoose dotenv
创建.env文件（放在根目录）
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tag: { type: String, required: true, unique: true },
});

const Material = mongoose.model("Material", MaterialSchema);

// 静态文件服务
app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.json());

// 提供药品列表
app.get("/materials.json", async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: "获取药品列表失败" });
  }
});

// 保存材料数据
app.post("/api/save", async (req, res) => {
  const data = req.body;
  try {
    if (Array.isArray(data)) {
      for (const item of data) {
        const { name, tag } = item;
        await Material.findOneAndUpdate(
          { name },
          { name, tag },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      res.json({ message: "保存成功" });
    } else {
      res.status(400).json({ message: "数据格式错误" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "保存失败" });
  }
});

// 删除材料数据
app.post("/api/delete", async (req, res) => {
  const { name } = req.body;
  try {
    await Material.findOneAndDelete({ name });
    res.json({ message: "删除成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "删除失败" });
  }
});

// 修改材料数据
app.post("/api/edit", async (req, res) => {
  const { oldName, newName, newTag } = req.body;
  try {
    await Material.findOneAndDelete({ name: oldName });
    await Material.create({ name: newName, tag: newTag });
    res.json({ message: "修改成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "修改失败" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

