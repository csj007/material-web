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

  const weight1List = [];
  const weight2List = [];

  for (const row of rows) {
    const nameInput = row.querySelector("input[type='text']");
    const weightInput = row.querySelector("input[type='number']");
    const name = nameInput.value.trim();
    const weight = parseFloat(weightInput.value);

    if (!name || isNaN(weight)) continue;

    rawMaterials.push({ name: name, weight: weight });
    weight1List.push(weight);

    let finalCode = name;
    if (name in nameToCode) {
      finalCode = nameToCode[name];
    }
    codedMaterials.push({ name: finalCode, weight: weight });
    weight2List.push(weight);
  }

  const totalWeight1 = parseFloat(sumWithPrecision(weight1List, 4));
  const totalWeight2 = parseFloat(sumWithPrecision(weight2List, 4));

  const table1 = createMaterialTable(rawMaterials, totalWeight1, "原料名称");
  const table2 = createMaterialTable(codedMaterials, totalWeight2, "原料编号");

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = table1 + "<br>" + table2;
}

// 精度求和函数
function sumWithPrecision(numbers, decimals = 4) {
  return numbers.reduce((total, num) => total + Number(num.toFixed(decimals)), 0).toFixed(decimals);
}

function createMaterialTable(materials, totalWeight, title) {
  if (materials.length === 0) return `<p style="color:red;">该部分暂无数据</p>`;

  const names = materials.map(m => m.name);
  const weights = materials.map(m => `${m.weight} 克`);

  // 总和保留两位小数
  const formattedTotal = `${totalWeight.toFixed(4)} 克`;

  const table = `
    <table class="material-table" style="width:100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          <th colspan="${materials.length + 1}" style="text-align:center; background-color:#3498db; color:white; padding: 10px;">${title}</th>
        </tr>
        <tr>
          ${names.map(name => `<th style="border:1px solid #ddd; padding: 8px;">${name}</th>`).join("")}
          <th style="border:1px solid #ddd; padding: 8px;">总和</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          ${weights.map(weight => `<td style="border:1px solid #ddd; padding: 8px; text-align:center;">${weight}</td>`).join("")}
          <td style="border:1px solid #ddd; padding: 8px; text-align:center; font-weight:bold;">${formattedTotal}</td>
        </tr>
      </tbody>
    </table>
  `;

  return table;
}

// 页面加载完成后初始化
window.onload = async () => {
  await loadMaterials();
};
