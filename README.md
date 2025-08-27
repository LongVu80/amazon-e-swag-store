# FakeStore E‑commerce (Vanilla HTML/CSS/JS)

- initial the Catalog pulls live data from https://fakestoreapi.com/products, but then I switch to local API for easy access.
- Hover a card to show **Add**; click a card to open details modal.
- Clothing items let you choose **size** and **color**.
- Badge on **Cart** shows total quantities.
- On **Checkout**, adjust quantities, enter **eSwag available** to apply credit,
  and fill **Full name**, **Company ID/Alias**, and **HR Email**.
- Clicking **Place order** saves the order in localStorage and opens a prefilled
  email (using `mailto:`) to HR with all details + JSON.

> No backend required. Works from a local filesystem in most browsers; if CORS blocks, host on a tiny static server.
