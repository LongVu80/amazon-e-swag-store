// Catalog + cart (index page)
// const API = 'https://fakestoreapi.com/products';
const API = 'assets/productss.json';
const grid = document.getElementById('grid');
const cardTemplate = document.getElementById('cardTemplate');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');

const state = {
  products: [],
  filtered: [],
  current: null // product shown in modal
};

// Utilities
function fmt(n){ return `$${Number(n).toFixed(2)}`; }
function isClothing(cat){
  return /men's clothing|women's clothing/i.test(cat || '');
}
function getCart(){
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}
function setCart(items){
  localStorage.setItem('cart', JSON.stringify(items));
  updateCartBadge();
}
function updateCartBadge(){
  const cart = getCart();
  const count = cart.reduce((a,i)=>a+i.qty,0);
  document.getElementById('cartCount').textContent = String(count);
}

function buildCard(p){
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  const img = node.querySelector('.card-img');
  const title = node.querySelector('.card-title');
  const price = node.querySelector('.card-price');
  // const addBtn = node.querySelector('.add-overlay');

  img.src = p.image;
  img.alt = p.title;
  title.textContent = p.title;
  price.textContent = fmt(p.price);

  // Show modal on click
  node.addEventListener('click', (e)=>{
    // If click is on 'Add' hover button, don't open twice
    // if(e.target === addBtn) return;
    openModal(p);
  });

  // Add overlay button
  // addBtn.addEventListener('click', (e)=>{
  //   e.stopPropagation();
  //   openModal(p, { quick: true });
  // });

  return node;
}

function render(list){
  grid.innerHTML = '';
  list.forEach(p => grid.appendChild(buildCard(p)));
}

async function load(){
  try{
    const res = await fetch(API);
    const data = await res.json();
    state.products = data;
    state.filtered = data;
    render(data);
    updateCartBadge();
  }catch(err){
    grid.innerHTML = `<div class="muted">Failed to load products. ${err?.message || ''}</div>`;
  }
}

function openModal(p, opts={}){
  state.current = p;
  document.getElementById('mImg').src = p.image;
  document.getElementById('mTitle').textContent = p.title;
  document.getElementById('mCategory').textContent = p.category;
  document.getElementById('mDesc').textContent = p.description;
  document.getElementById('mPrice').textContent = fmt(p.price);

  const variantSection = document.getElementById('variantSection');
  const sizeSelect = document.getElementById('sizeSelect');
  const colorSelect = document.getElementById('colorSelect');

  if (isClothing(p.category)){
    variantSection.classList.remove('hidden');
  } else {
    variantSection.classList.add('hidden');
  }

  // Default selections
  sizeSelect.value = 'M';
  colorSelect.value = 'white';

  const addBtn = document.getElementById('mAddBtn');
  addBtn.onclick = () => {
    const item = {
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category,
      size: isClothing(p.category) ? sizeSelect.value : null,
      color: isClothing(p.category) ? colorSelect.value : null,
      qty: 1
    };
    addToCart(item);
    closeModal();
  };

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');

  // If quick add: add immediately using defaults (M, white) for clothing; no variants otherwise
  if (opts.quick){
    document.getElementById('mAddBtn').click();
  }
}

function closeModal(){
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  state.current = null;
}

modal.addEventListener('click', (e)=>{
  if (e.target === modal) closeModal();
});
modalClose.addEventListener('click', closeModal);

function addToCart(item){
  const cart = getCart();
  // Merge if same product + same variant
  const idx = cart.findIndex(i => i.id===item.id && i.size===item.size && i.color===item.color);
  if (idx >= 0) {
    cart[idx].qty += item.qty;
  } else {
    cart.push(item);
  }
  setCart(cart);
}

// Category filters
document.querySelectorAll('.chip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.chip').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.cat;
    if (cat==='all') state.filtered = state.products;
    else state.filtered = state.products.filter(p => p.category === cat);
    render(state.filtered);
  });
});

load();
