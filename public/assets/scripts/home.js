const API_URL = 'http://localhost:3000/produtos';
const grid = document.getElementById('cards-grid');
const filtersContainer = document.getElementById('filters');



function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? '½' : '';
  return '★'.repeat(full) + half;
}



function createCard(produto) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = `details.html?id=${produto.id}`;

  a.innerHTML = `
    <img
      class="card-img"
      src="${produto.image}"
      alt="${produto.title}"
      loading="lazy"
      onerror="this.src='https://placehold.co/400x300?text=Sem+Imagem'"
    />
    <div class="card-body">
      <span class="card-category">${produto.category}</span>
      <h2 class="card-title">${produto.title}</h2>
      <p class="card-desc">${produto.description}</p>
      <div class="card-footer">
        <span class="card-price">${formatPrice(produto.price)}</span>
        <span class="card-rating" title="Avaliação: ${produto.rating}">
          ${renderStars(produto.rating)} ${produto.rating}
        </span>
      </div>
    </div>
  `;

  return a;
}



function renderCards(produtos) {
  grid.innerHTML = '';

  if (produtos.length === 0) {
    grid.innerHTML = '<p class="empty-msg">Nenhum produto encontrado nesta categoria.</p>';
    return;
  }

  produtos.forEach(p => grid.appendChild(createCard(p)));
}


function buildFilters(produtos) {
  const categories = ['Todos', ...new Set(produtos.map(p => p.category))];

  filtersContainer.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'Todos' ? ' active' : '');
    btn.dataset.category = cat;
    btn.textContent = cat;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtered = cat === 'Todos' ? produtos : produtos.filter(p => p.category === cat);
      renderCards(filtered);
    });

    filtersContainer.appendChild(btn);
  });
}


async function init() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const produtos = await response.json();

    buildFilters(produtos);
    renderCards(produtos);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    grid.innerHTML = `
      <div class="empty-msg">
        <p>⚠️ Não foi possível carregar os produtos.</p>
        <p>Verifique se o JSON Server está rodando em <strong>http://localhost:3000</strong>.</p>
      </div>
    `;
  }
}

init();
