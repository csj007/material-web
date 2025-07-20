let counter = 0;
let allNames = [];
let nameToCode = {};

// 从 JSON 文件加载数据
async function loadMaterials() {
  try {
    const response = await fetch('materials.json');
    const data = await response.json();

    for (const item of data) {
      const name = Object.keys(item)[0];
      const code = item[name];
      nameToCode[name] = code;
      allNames.push(name);
    }
  } catch (err) {
    console.error("加载材料数据失败:", err);
  }
}

// 添加原料行
function addMaterial() {
  const container = document.getElementById("materialContainer");
  const row = document.createElement("div");
  row.className = "material-row";

  const dataListId = `materials-${counter}`;
  counter++;

  const datalist = document.createElement("datalist");
  datalist.id = dataListId;
  for (const name of allNames) {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  }
  document.body.appendChild(datalist);

  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("list", dataListId);
  input.placeholder = "原料名称（可手动输入）";
  input.style.width = "200px";

  input.addEventListener("input", function () {
    const userInput = this.value.trim().toLowerCase();
    const options = document.querySelectorAll(`#${this.getAttribute("list")} option`);
    for (let i = 0; i < options.length; i++) {
      if (options[i].value.toLowerCase() === userInput) {
        this.value = options[i].value;
        break;
      }
    }
  });

  const weightInput = document.createElement("input");
  weightInput.type = "number";
  weightInput.placeholder = "请输入克数";
  weightInput.step = "0.01";
  weightInput.required = true;

  const delBtn = document.createElement("button");
  delBtn.innerText = "删除";
  delBtn.onclick = function () {
    container.removeChild(row);
  };

  row.appendChild(input);
  row.appendChild(weightInput);
  row.appendChild(delBtn);

  container.appendChild(row);
}

// 提交记录
function submitRecord() {
  const rows = document.querySelectorAll(".material-row");
  const result = [];

  for (const row of rows) {
    const nameInput = row.querySelector("input[type='text']");
    const weightInput = row.querySelector("input[type='number']");
    const name = nameInput.value.trim();
    const weight = parseFloat(weightInput.value);

    if (!name || isNaN(weight)) continue;

    let finalName = name;
    if (name in nameToCode) {
      finalName = nameToCode[name];
    }

    result.push(`${finalName}: ${weight}`);
  }

  const outputDiv = document.getElementById("output");
  outputDiv.innerText = result.join("\n");
}

// 页面加载完成后初始化
window.onload = async () => {
  await loadMaterials();
};
