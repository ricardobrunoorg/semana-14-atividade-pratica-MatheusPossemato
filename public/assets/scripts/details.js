const API_URL = 'http://localhost:3000/produtos';
const container = document.getElementById('details-content');


function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? '½' : '';
  return '★'.repeat(full) + half;
}


function renderDetails(produto) {
  document.title = `TechStore | ${produto.title}`;

  const tagsHTML = (produto.tags || [])
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  container.innerHTML = `
    <div class="details-card">
      <img
        class="details-img"
        src="${produto.image}"
        alt="${produto.title}"
        onerror="this.src='https://placehold.co/900x350?text=Sem+Imagem'"
      />
      <div class="details-body">
        <p class="details-category">${produto.category}</p>
        <h1 class="details-title">${produto.title}</h1>
        <p class="details-price">${formatPrice(produto.price)}</p>
        <p class="details-description">${produto.description}</p>

        <div class="details-meta">
          <div class="meta-badge">
            <strong>Avaliação</strong>
            <span>${renderStars(produto.rating)} ${produto.rating} / 5</span>
          </div>
          <div class="meta-badge">
            <strong>Estoque</strong>
            <span>${produto.stock} unidades</span>
          </div>
          <div class="meta-badge">
            <strong>Categoria</strong>
            <span>${produto.category}</span>
          </div>
        </div>

        ${tagsHTML ? `<div class="tags-list">${tagsHTML}</div>` : ''}
      </div>
    </div>
  `;
}


function renderError(msg) {
  container.innerHTML = `
    <div class="error-state">
      <h2>Produto não encontrado</h2>
      <p>${msg}</p>
      <a href="index.html" class="btn-primary">Voltar para a Home</a>
    </div>
  `;
}


async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderError('Nenhum ID de produto foi informado na URL.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      renderError(`Produto com ID ${id} não foi encontrado no servidor.`);
      return;
    }

    const produto = await response.json();
    renderDetails(produto);
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    renderError('Verifique se o JSON Server está rodando em <strong>http://localhost:3000</strong>.');
  }
}

init();
