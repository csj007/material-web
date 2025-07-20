let counter = 0;
let allNames = [];
let nameToCode = {};

// 从 JSON 文件加载数据
async function loadMaterials() {
  try {
    const response = await fetch('materials.json');
    const data = await response.json();
    for (const item of data) {
      const name = item.name;
      const code = item.tag;
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
  const rawMaterials = [];
  const codedMaterials = [];

  let totalWeight1 = 0;
  let totalWeight2 = 0;

  for (const row of rows) {
    const nameInput = row.querySelector("input[type='text']");
    const weightInput = row.querySelector("input[type='number']");
    const name = nameInput.value.trim();
    const weight = parseFloat(weightInput.value);

    if (!name || isNaN(weight)) continue;

    rawMaterials.push({ name: name, weight: weight });
    totalWeight1 += weight;

    let finalCode = name;
    if (name in nameToCode) {
      finalCode = nameToCode[name];
    }
    codedMaterials.push({ name: finalCode, weight: weight });
    totalWeight2 += weight;
  }

  const table1 = createTable(rawMaterials, totalWeight1);
  const table2 = createTable(codedMaterials, totalWeight2);
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = table1 + "<br>" + table2;
}

function createTable(materials, totalWeight) {
  if (materials.length === 0) return "无记录";

  const names = materials.map(m => m.name);
  const weights = materials.map(m => `${m.weight} 克`);
  const total = `总和: ${totalWeight} 克`;

  // 构建表格上的标题行和下边的数据行
  const headerRow = `| ${names.join(" | ")} | ${total} |`;
  const headerSeparator = `|${"-".repeat(headerRow.length - 2)}|`;
  const dataRow = `| ${weights.join(" | ")} | ${totalWeight} 克 |`;

  return `
    <table style="border-collapse: collapse; border: 1px solid #ccc; margin-bottom: 15px;">
      <tr><td style="padding: 6px; border: 1px solid #ccc;">${headerRow}</td></tr>
      <tr><td style="padding: 6px; border: 1px solid #ccc;">${dataRow}</td></tr>
    </table>
  `;
}

// 页面加载完成后初始化
window.onload = async () => {
  await loadMaterials();
};
