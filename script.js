let materials = [];
let entries = [];

// 加载原料文件
fetch('materials.json')
  .then(res => res.json())
  .then(data => {
    materials = data;
    addEntry(); // 默认添加一个原料框
  });

function addEntry() {
  const container = document.getElementById('entries');
  const index = entries.length;

  const div = document.createElement('div');
  div.className = 'entry';
  div.dataset.index = index;

  const select = document.createElement('select');
  select.oninput = function () {
    entries[index].name = this.value;
  };

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.1';
  input.placeholder = '输入用量';
  input.oninput = function () {
    entries[index].amount = this.value;
  };

  // 填充下拉框
  materials.forEach(m => {
    const option = document.createElement('option');
    option.value = m.name;
    option.text = m.name;
    select.appendChild(option);
  });

  // 设置默认值
  const defaultMaterial = materials[0];
  select.value = defaultMaterial ? defaultMaterial.name : '';
  input.value = '0.0';

  // 输入联想功能
  select.addEventListener('input', function () {
    const typed = this.value.toLowerCase();
    const options = Array.from(this.options).filter(o => o.text.toLowerCase().includes(typed));
    this.innerHTML = '';
    options.forEach(o => this.appendChild(o.cloneNode(true)));
  });

  entries.push({ name: defaultMaterial ? defaultMaterial.name : '', amount: '0.0' });
  div.appendChild(select);
  div.appendChild(input);
  container.appendChild(div);
}

function submitData() {
  let result = "原料使用记录:\n";
  entries.forEach(entry => {
    const material = materials.find(m => m.name === entry.name);
    if (material) {
      result += `-${material.tag} - ${material.name}: ${entry.amount} 克\n`;
    } else {
      result += `-${entry.name}: ${entry.amount} 克\n`;
    }
  });

  document.getElementById('result').innerText = result;
}
