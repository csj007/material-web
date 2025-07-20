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

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'material-input';
  input.dataset.index = index;
  input.placeholder = '原料名称';
  input.onfocus = function () {
    showSuggestions(input);
  };

  const suggestions = document.createElement('div');
  suggestions.className = 'material-suggestions';
  suggestions.dataset.index = index;
  suggestions.dataset.parent = index;

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.step = '0.1';
  amountInput.placeholder = '输入用量';
  amountInput.className = 'amount-input';
  amountInput.dataset.index = index;

  // 初始化建议框
  showSuggestions(input, true);

  // 点击建议项
  function showSuggestions(inputEl, force = false) {
    const suggestionsEl = document.querySelector(`[data-parent="${inputEl.dataset.index}"]`);
    if (!force && suggestionsEl.style.display === 'none') {
      suggestionsEl.style.display = 'block';
    } else if (force) {
      suggestionsEl.innerHTML = '';
      materials.forEach(m => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = m.name;
        item.onclick = function () {
          inputEl.value = m.name;
          inputEl.dispatchEvent(new Event('input'));
          suggestionsEl.style.display = 'none';
        };
        suggestionsEl.appendChild(item);
      });
      suggestionsEl.style.display = 'block';
    }
  }

  // 点击空白收起下拉框
  document.addEventListener('click', function (e) {
    if (!e.target.matches('.material-input')) {
      document.querySelectorAll('.material-suggestions').forEach(el => {
        el.style.display = 'none';
      });
    }
  });

  // 输入变化
  input.addEventListener('input', function () {
    entries[index].name = this.value;
  });

  amountInput.addEventListener('input', function () {
    entries[index].amount = this.value;
  });

  entries.push({ name: '', amount: '0.0' });
  div.appendChild(input);
  div.appendChild(amountInput);
  div.appendChild(suggestions);
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
