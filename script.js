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

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '输入或选择原料名称';
  input.className = 'material-input';
  input.dataset.index = index;

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.step = '0.1';
  amountInput.placeholder = '输入用量';
  amountInput.className = 'amount-input';
  amountInput.dataset.index = index;

  // 输入联想功能
  input.addEventListener('input', function () {
    const typed = this.value.toLowerCase();
    const suggestions = materials
      .filter(m => m.name.toLowerCase().includes(typed))
      .map(m => m.name);

    showSuggestions(this, suggestions);
  });

  // 点击建议项
  function showSuggestions(inputEl, suggestions) {
    const index = inputEl.dataset.index;
    const rect = inputEl.getBoundingClientRect();
    const suggestionBox = document.getElementById('suggestion-box');

    if (suggestions.length === 0) {
      suggestionBox.style.display = 'none';
      return;
    }

    suggestionBox.innerHTML = '';
    suggestions.forEach(name => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = name;
      div.onclick = function () {
        inputEl.value = name;
        suggestionBox.style.display = 'none';
        entries[index].name = name;
      };
      suggestionBox.appendChild(div);
    });

    suggestionBox.style.display = 'block';
    suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
    suggestionBox.style.left = `${rect.left + window.scrollX}px`;
  }

  // 输入变化时更新数据
  input.addEventListener('input', function () {
    entries[index].name = this.value;
  });

  amountInput.addEventListener('input', function () {
    entries[index].amount = this.value;
  });

  entries.push({ name: '', amount: '0.0' });
  div.appendChild(input);
  div.appendChild(amountInput);
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
