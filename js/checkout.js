// Checkout page logic
function fmt(n){ return `$${Number(n).toFixed(2)}`; }
function getCart(){ try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } }
function setCart(items){ localStorage.setItem('cart', JSON.stringify(items)); render(); }

const cartBody = document.getElementById('cartBody');
const cartTable = document.getElementById('cartTable');
const cartEmpty = document.getElementById('cartEmpty');
const itemsCount = document.getElementById('itemsCount');
const subtotalEl = document.getElementById('subtotal');
const creditAppliedEl = document.getElementById('creditApplied');
const grandTotalEl = document.getElementById('grandTotal');
const eswagInput = document.getElementById('eswag');
const toast = document.getElementById('toast');
// const elabel = document.getElementsById('credit-row');

function render(){
  const cart = getCart();
  cartBody.innerHTML = '';
  if (!cart.length){
    cartTable.classList.add('hidden');
    cartEmpty.classList.remove('hidden');
  } else {
    cartTable.classList.remove('hidden');
    cartEmpty.classList.add('hidden');
  }

  let items = 0, sub = 0;
  cart.forEach((i, idx)=>{
    items += i.qty;
    sub += i.price * i.qty;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="cart-item">
          <img class="cart-thumb" src="${i.image}" alt="">
          <div>${i.title}</div>
        </div>
      </td>
      <td>${i.size ? 'Size: '+i.size : ''} ${i.color ? '<br>Color: '+i.color : ''}</td>
      <td>${fmt(i.price)}</td>
      <td>
        <div class="qty">
          <button aria-label="Decrease">−</button>
          <span>${i.qty}</span>
          <button aria-label="Increase">+</button>
        </div>
      </td>
      <td>${fmt(i.price * i.qty)}</td>
      <td><span class="remove" role="button" title="Remove">Remove</span></td>
    `;
    const [minusBtn, plusBtn] = tr.querySelectorAll('.qty button');
    minusBtn.addEventListener('click', ()=> changeQty(idx, -1));
    plusBtn.addEventListener('click', ()=> changeQty(idx, +1));
    tr.querySelector('.remove').addEventListener('click', ()=> removeItem(idx));
    cartBody.appendChild(tr);
  });

  itemsCount.textContent = String(items);
  subtotalEl.textContent = fmt(sub);

  const credit = Math.max(0, Number(eswagInput.value || 0));
  const applied = Math.min(credit, sub);
  creditAppliedEl.textContent = `-$${applied.toFixed(2)}`;
  grandTotalEl.textContent = fmt(sub - applied);

  // if (credit) {
  //   eswagInput.style.backgroundColor = "";
  //   // elabel.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
  // } else 
  if (credit > sub) {
    eswagInput.style.backgroundColor = "rgba(0, 200, 0, 0.2)"; // red if over subtotal
  } else {
    eswagInput.style.backgroundColor = "rgba(255, 0, 0, 0.5)"; // green if valid
    // elabel.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
  }
}

function changeQty(index, delta){
  const cart = getCart();
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index,1);
  setCart(cart);
}
function removeItem(index){
  const cart = getCart();
  cart.splice(index,1);
  setCart(cart);
}

eswagInput.addEventListener('input', render);

// Submit / "Place order"
document.getElementById('checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const companyId = document.getElementById('companyId').value.trim();
  const hrEmail = document.getElementById('hrEmail').value.trim();
  const eswag = Math.max(0, Number(eswagInput.value || 0));
  const cart = getCart();
  if (!cart.length){
    alert('Your cart is empty.');
    return;
  }
  const subtotal = cart.reduce((a,i)=>a+i.qty*i.price,0);
  const applied = Math.min(subtotal, eswag);
  const total = subtotal - applied;

  // Save order locally
  const order = {
    id: 'order_' + Date.now(),
    at: new Date().toISOString(),
    buyer: { fullName, companyId, hrEmail },
    eswagAvailable: eswag,
    subtotal, creditApplied: applied, total,
    items: cart
  };
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Optionally clear the cart
  localStorage.removeItem('cart');

  // Compose a mailto to HR
  const subject = encodeURIComponent(`Order from ${fullName} (${companyId}) - Total ${fmt(subtotal)}`);
  const bodyObj = {
    buyer: order.buyer,
    totals: { subtotal, creditApplied: applied, total },
    eswagAvailable: eswag,
    items: cart.map(i => ({
      title: i.title, price: i.price, qty: i.qty, size: i.size, color: i.color
    }))
  };
  const body = encodeURIComponent(
    `Hello HR,\n\n`+
    `An order has been placed.\n\n`+
    `Buyer: ${fullName}\nCompany ID/Alias: ${companyId}\n`+
    `eSwag available: $${eswag.toFixed(2)} (Please Verify)\n `+
    `Subtotal: ${fmt(subtotal)}\nCredit applied: -${fmt(applied)}\nTotal to pay: ${fmt(total)}\n\n`+
    `Items:\n`+
    bodyObj.items.map((i,idx)=>`${idx+1}. ${i.title} — ${fmt(i.price)} × ${i.qty}`+(i.size?` [${i.size}]`:'')+(i.color?` {${i.color}}`:'')).join('\n')+
    `\n\nRaw JSON:\n${JSON.stringify(bodyObj, null, 2)}\n`
  );

  // Fire the mailto
  const mailto = `mailto:${encodeURIComponent(hrEmail)}?subject=${subject}&body=${body}`;
  window.location.href = mailto;

  // Toast
  toast.classList.remove('hidden');
  setTimeout(()=>{
    toast.classList.add('hidden');
    window.location.href = 'index.html';
  }, 1200);
});

// Hook into the eSwag input
// const eswagInput = document.getElementById("eswag");

// // Style update function
// function validateEswag() {
//   const val = Number(eswagInput.value || 0);
//   // Grab current subtotal from the page
//   const subtotalText = document.getElementById("subtotal").textContent.replace("$","");
//   const subtotal = parseFloat(subtotalText) || 0;

//   if (!val) {
//     eswagInput.style.backgroundColor = "";
//   } else if (val > subtotal) {
//     eswagInput.style.backgroundColor = "rgba(255, 0, 0, 0.2)"; // light red
//   } else {
//     eswagInput.style.backgroundColor = "rgba(0, 200, 0, 0.2)"; // light green
//   }
// }

// // Trigger validation on input
// eswagInput.addEventListener("input", validateEswag);

// Run once on page load too
// validateEswag();

render();
