const API_URL = 'http://localhost:3000/produtos';

const CATEGORY_COLORS = {
  'Informática': { bg: 'rgba(37, 99, 235, 0.8)',  border: '#2563eb' },
  'Celulares':   { bg: 'rgba(124, 58, 237, 0.8)', border: '#7c3aed' },
  'Áudio':       { bg: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },
  'Periféricos': { bg: 'rgba(16, 185, 129, 0.8)', border: '#10b981' },
};

const DEFAULT_COLOR = { bg: 'rgba(100, 116, 139, 0.8)', border: '#64748b' };


function getColor(category, alpha = 0.8) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


function groupByCategory(produtos) {
  const groups = {};

  produtos.forEach(p => {
    if (!groups[p.category]) {
      groups[p.category] = { count: 0, totalPrice: 0, totalRating: 0 };
    }
    groups[p.category].count++;
    groups[p.category].totalPrice  += p.price;
    groups[p.category].totalRating += p.rating;
  });

  return groups;
}


function renderStats(produtos, groups) {
  const container = document.getElementById('stats-row');

  const totalProdutos  = produtos.length;
  const totalCategorias = Object.keys(groups).length;
  const precoMedio     = produtos.reduce((s, p) => s + p.price, 0) / produtos.length;
  const ratingMedio    = produtos.reduce((s, p) => s + p.rating, 0) / produtos.length;

  const stats = [
    { label: 'Total de Produtos',   value: totalProdutos,             format: v => v,                 color: '' },
    { label: 'Categorias',          value: totalCategorias,           format: v => v,                 color: 'purple' },
    { label: 'Preço Médio',         value: precoMedio,                format: formatBRL,              color: 'green' },
    { label: 'Avaliação Média',     value: ratingMedio.toFixed(1),    format: v => `⭐ ${v}`,         color: 'amber' },
  ];

  container.innerHTML = stats.map(s => `
    <div class="stat-card stat-card--${s.color}">
      <div class="stat-value">${s.format(s.value)}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
}


function renderChartPizza(groups) {
  const labels = Object.keys(groups);
  const data   = labels.map(cat => groups[cat].count);
  const bgs    = labels.map(cat => getColor(cat).bg);
  const borders= labels.map(cat => getColor(cat).border);

  new Chart(document.getElementById('chartPizza'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgs,
        borderColor: borders,
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { size: 13 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} produto${ctx.parsed !== 1 ? 's' : ''}`
          }
        }
      }
    }
  });
}


function renderChartPreco(groups) {
  const labels    = Object.keys(groups);
  const data      = labels.map(cat => +(groups[cat].totalPrice / groups[cat].count).toFixed(2));
  const bgs       = labels.map(cat => getColor(cat).bg);
  const borders   = labels.map(cat => getColor(cat).border);

  new Chart(document.getElementById('chartPreco'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Preço Médio (R$)',
        data,
        backgroundColor: bgs,
        borderColor: borders,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatBRL(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatBRL(value)
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}


function renderChartRating(groups) {
  const labels  = Object.keys(groups);
  const data    = labels.map(cat => +(groups[cat].totalRating / groups[cat].count).toFixed(2));
  const bgs     = labels.map(cat => getColor(cat).bg);
  const borders = labels.map(cat => getColor(cat).border);

  new Chart(document.getElementById('chartRating'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avaliação Média',
        data,
        backgroundColor: bgs,
        borderColor: borders,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ⭐ ${ctx.parsed.x}`
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}


function renderChartEstoque(produtos) {
  const sorted  = [...produtos].sort((a, b) => b.stock - a.stock);
  const labels  = sorted.map(p => p.title.length > 22 ? p.title.slice(0, 22) + '…' : p.title);
  const data    = sorted.map(p => p.stock);
  const bgs     = sorted.map(p => getColor(p.category).bg);
  const borders = sorted.map(p => getColor(p.category).border);

  new Chart(document.getElementById('chartEstoque'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Unidades em estoque',
        data,
        backgroundColor: bgs,
        borderColor: borders,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} unidade${ctx.parsed.y !== 1 ? 's' : ''}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 5 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  });
}


async function init() {
  const loadingEl = document.getElementById('loading-state');
  const contentEl = document.getElementById('charts-content');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const produtos = await res.json();
    const groups   = groupByCategory(produtos);

    renderStats(produtos, groups);
    renderChartPizza(groups);
    renderChartPreco(groups);
    renderChartRating(groups);
    renderChartEstoque(produtos);

    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    loadingEl.innerHTML = `
      <div style="text-align:center; padding: 3rem;">
        <p style="font-size:2rem; margin-bottom:1rem;">⚠️</p>
        <p style="font-size:1.1rem; margin-bottom:.5rem; color:#1e293b; font-weight:600;">
          Não foi possível carregar os dados.
        </p>
        <p style="color:#64748b;">
          Verifique se o JSON Server está rodando em
          <strong>http://localhost:3000</strong>.
        </p>
      </div>
    `;
  }
}

init();
