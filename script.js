let counter = 0;
let allNames = [];
let nameToCode = {};

// 从 JSON 文件加载数据
async function loadMaterials() {
  try {
    const response = await fetch('materials.json');
    const data = await response.json();
    allNames = [];
    nameToCode = {};
    for (const item of data) {
      const name = item.name;
      const code = item.tag;
      nameToCode[name] = code;
      allNames.push(name);
    }
    updateAllDatalists();
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

function copyTable(button) {
  const tableButtons = button.closest(".table-buttons");
  const table = tableButtons.previousElementSibling;

  if (!table || !table.classList.contains("material-table")) {
    alert("无法找到表格！");
    return;
  }

  // 获取表格中的所有行
  const rows = table.querySelectorAll("tr");
  let tsvContent = "";

  rows.forEach((row) => {
    const cells = row.querySelectorAll("th, td");
    const rowValues = Array.from(cells).map(cell => {
      const text = cell.textContent.trim();
      if (text.endsWith("克")) {
        // 自动识别克数为数字
        return parseFloat(text.replace(/克/g, ""));
      }
      return text;
    });

    tsvContent += rowValues.join("\t") + "\n";
  });

  // 创建临时 textarea
  const temp = document.createElement("textarea");
  temp.value = tsvContent;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);

  alert("表格已复制为可粘贴到 Excel 的格式");
}

function copyTableAsImage(button) {
  const tableButtons = button.closest(".table-buttons");
  const table = tableButtons.previousElementSibling;

  if (!table || !table.classList.contains("material-table")) {
    alert("无法找到表格！");
    return;
  }

  html2canvas(table, {
    useCORS: true,
    allowTaint: true,
    scale: 2,
    logging: false
  }).then(canvas => {
    canvas.toBlob(blob => {
      const image = new File([blob], "原料记录.png", { type: "image/png" });
      const clipboardItem = new ClipboardItem({ [image.type]: image });

      navigator.clipboard.write([clipboardItem]).then(() => {
        alert("图片已复制到剪贴板，可以粘贴到 Word、PPT、Excel、腾讯文档等。");
      }).catch(err => {
        alert("当前浏览器不支持图片复制到剪贴板，请尝试使用 '保存图片' 按钮。");
        // 回退为保存图片
        saveTableAsImage(button);
      });
    });
  });
}

function saveTableAsImage(button) {
  const tableButtons = button.closest(".table-buttons");
  const table = tableButtons.previousElementSibling;

  if (!table || !table.classList.contains("material-table")) {
    alert("无法找到表格！");
    return;
  }

  html2canvas(table, {
    useCORS: true,
    allowTaint: true,
    scale: 2,
    logging: false
  }).then(canvas => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "原料记录.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  });
}

function updateAllDatalists() {
  const datalists = document.querySelectorAll("datalist");
  for (const datalist of datalists) {
    const id = datalist.id;
    datalist.innerHTML = "";
    for (const name of allNames) {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    }
  }
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
    <div class="table-buttons">
      <button onclick="copyTable(this)">复制表格</button>
      <button onclick="copyTableAsImage(this)">复制图片</button>
      <button onclick="saveTableAsImage(this)">下载图片</button>
    </div>
  `;

  return table;
}

function showAddMaterialModal() {
  document.getElementById("addMaterialModal").style.display = "block";
}

async function addNewMaterial() {
  const name = document.getElementById("materialName").value.trim();
  const tag = document.getElementById("materialTag").value.trim();
  const errorDiv = document.getElementById("materialError");

  if (!name || !tag) {
    errorDiv.textContent = "药品名称和编号不能为空";
    return;
  }

  // 检查是否名称或编号已存在
  if (name in nameToCode) {
    errorDiv.textContent = "药品名称已存在";
    return;
  }
  if (Object.values(nameToCode).includes(tag)) {
    errorDiv.textContent = "药品编号已存在";
    return;
  }

  // 从服务器获取当前的 materials.json
  const response = await fetch("materials.json");
  const data = await response.json();

  // 新增药品
  data.push({ name: name, tag: tag });

  // 写入新的数据回 materials.json（需要服务端支持）
  try {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      errorDiv.textContent = "";
      alert("药品已成功添加！");
      // 重新加载材料数据
      await loadMaterials();
      updateAllDatalists();
      // 关闭弹窗
      document.getElementById("addMaterialModal").style.display = "none";
    } else {
      errorDiv.textContent = "保存失败，请检查后端配置";
    }
  } catch (err) {
    errorDiv.textContent = "保存失败：" + err;
  }
}

async function showMaterialListModal() {
  try {
    const response = await fetch("/materials.json");
    const materials = await response.json();
    const container = document.getElementById("materialListContent");
    container.innerHTML = "";

    if (materials.length === 0) {
      container.innerHTML = `<p>暂无药品记录。</p>`;
      return;
    }

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th style="width:240px; padding:8px; background:#3498db; color:white;">名称</th>
      <th style="width:240px; padding:8px; background:#3498db; color:white;">编号</th>
      <th style="padding:8px; background:#3498db; color:white;">操作</th>
    `;
    table.appendChild(headerRow);

    for (const item of materials) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.style.padding = "8px";
      nameCell.innerHTML = `<input type="text" value="${item.name}" style="width:80%; padding:5px;">`;

      const tagCell = document.createElement("td");
      tagCell.style.padding = "8px";
      tagCell.innerHTML = `<input type="text" value="${item.tag}" style="width:80%; padding:5px;">`;

      const actionCell = document.createElement("td");
      actionCell.style.padding = "8px";

      const editBtn = document.createElement("button");
      editBtn.innerText = "修改";
      editBtn.onclick = async () => {
        const newName = nameCell.querySelector("input").value.trim();
        const newTag = tagCell.querySelector("input").value.trim();
        if (newName === "" || newTag === "") {
          alert("名称与编号不能为空！");
          return;
        }

        const updatedMaterials = materials.map(m => {
          if (m.name === item.name) {
            return { name: newName, tag: newTag };
          }
          return m;
        });

        await fetch("/api/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMaterials),
        });

        alert("药品信息已修改！");
        loadMaterials();
        updateAllDatalists();
        showMaterialListModal(); // 刷新列表
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "删除";
      deleteBtn.onclick = () => {
        if (confirm("确定要删除该药品吗？")) {
          const filteredMaterials = materials.filter(m => m.name !== item.name);
          fetch("/api/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filteredMaterials),
          });
          alert("药品已删除！");
          loadMaterials();
          updateAllDatalists();
          showMaterialListModal(); // 刷新列表
        }
      };

      actionCell.appendChild(editBtn);
      actionCell.appendChild(deleteBtn);

      row.appendChild(nameCell);
      row.appendChild(tagCell);
      row.appendChild(actionCell);

      table.appendChild(row);
    }

    container.appendChild(table);
    document.getElementById("materialListModal").style.display = "block";
  } catch (err) {
    alert("加载药品清单失败：" + err);
  }
}

// 页面加载完成后初始化
window.onload = async () => {
  await loadMaterials();
};
