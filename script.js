/* =================================
   ARIAA JEWELS
   MAIN WEBSITE SCRIPT
================================= */


/* =================================
   GLOBAL VARIABLES
================================= */

let products = [];
let cart = [];
let currentCategory = "All";


/* =================================
   LOAD PRODUCTS
================================= */

async function loadProducts() {

    try {

        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Error loading products:", error);
            return;
        }

        products = data || [];

        displayProducts(products);

        updateCart();

    }
    catch (error) {

        console.error(
            "Unexpected product loading error:",
            error
        );

    }

}


/* =================================
   DISPLAY PRODUCTS
================================= */

function displayProducts(productList) {

    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = "";

    if (!productList || productList.length === 0) {

        productGrid.innerHTML = `
            <div class="empty-products">
                <p>No products available.</p>
            </div>
        `;

        return;
    }

    productList.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.name)}"
                    onerror="this.style.display='none'"
                >
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${escapeHtml(product.category)}
                </span>

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <p class="product-description">
                    ${escapeHtml(product.description || "")}
                </p>

                <div class="product-bottom">

                    <strong class="product-price">
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    <button
                        class="gold-button"
                        onclick="addToCart(${product.id})"
                    >
                        ADD TO JEWEL BOX
                    </button>

                </div>

            </div>
        `;

        productGrid.appendChild(card);

    });

}


/* =================================
   FILTER PRODUCTS
================================= */

function filterProducts(category) {

    currentCategory = category;

    const buttons =
        document.querySelectorAll(".filter-button");

    buttons.forEach(button => {

        button.classList.remove("active");

        if (
            button.textContent.trim().toLowerCase() ===
            category.toLowerCase()
        ) {
            button.classList.add("active");
        }

    });

    if (category === "All") {

        displayProducts(products);

        return;
    }

    const filtered =
        products.filter(product =>
            product.category &&
            product.category.toLowerCase() ===
            category.toLowerCase()
        );

    displayProducts(filtered);

}


/* =================================
   ADD TO CART
================================= */

function addToCart(productId) {

    const product =
        products.find(item =>
            Number(item.id) === Number(productId)
        );

    if (!product) {

        alert("Product could not be found.");

        return;
    }

    const existingItem =
        cart.find(item =>
            Number(item.id) === Number(productId)
        );

    if (existingItem) {

        existingItem.quantity += 1;

    }
    else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        });

    }

    updateCart();

    openJewelBox();

}


/* =================================
   UPDATE CART
================================= */

function updateCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");

    if (!cartItems) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {

        const itemTotal =
            Number(item.price) * item.quantity;

        total += itemTotal;

        itemCount += item.quantity;

        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="cart-item-image">

                <img
                    src="${escapeHtml(item.image || "")}"
                    alt="${escapeHtml(item.name)}"
                >

            </div>

            <div class="cart-item-details">

                <h4>
                    ${escapeHtml(item.name)}
                </h4>

                <p>
                    ₹${Number(item.price).toLocaleString("en-IN")}
                </p>

                <div class="cart-quantity">

                    <button
                        onclick="changeQuantity(${item.id}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(${item.id}, 1)"
                    >
                        +
                    </button>

                </div>

            </div>

            <button
                class="remove-cart-item"
                onclick="removeFromCart(${item.id})"
                aria-label="Remove item"
            >
                ×
            </button>
        `;

        cartItems.appendChild(cartItem);

    });

    if (cartCount) {

        cartCount.textContent =
            itemCount;

    }

    if (cartTotal) {

        cartTotal.textContent =
            "₹" + total.toLocaleString("en-IN");

    }

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your Jewel Box is empty.</p>
                <span>Add some beautiful pieces to continue.</span>
            </div>
        `;

    }

}


/* =================================
   CHANGE QUANTITY
================================= */

function changeQuantity(productId, change) {

    const item =
        cart.find(item =>
            Number(item.id) === Number(productId)
        );

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {

        cart =
            cart.filter(item =>
                Number(item.id) !== Number(productId)
            );

    }

    updateCart();

}


/* =================================
   REMOVE FROM CART
================================= */

function removeFromCart(productId) {

    cart =
        cart.filter(item =>
            Number(item.id) !== Number(productId)
        );

    updateCart();

}


/* =================================
   OPEN JEWEL BOX
================================= */

function openJewelBox() {

    const jewelBox =
        document.getElementById("jewelBox");

    const overlay =
        document.getElementById("jewelBoxOverlay");

    if (jewelBox) {

        jewelBox.classList.add("open");

    }

    if (overlay) {

        overlay.classList.add("show");

    }

}


/* =================================
   CLOSE JEWEL BOX
================================= */

function closeJewelBox() {

    const jewelBox =
        document.getElementById("jewelBox");

    const overlay =
        document.getElementById("jewelBoxOverlay");

    if (jewelBox) {

        jewelBox.classList.remove("open");

    }

    if (overlay) {

        overlay.classList.remove("show");

    }

}


/* =================================
   OPEN CHECKOUT
================================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your Jewel Box is empty.");

        return;
    }

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    if (!checkoutItems || !checkoutTotal) {

        console.error(
            "Checkout elements were not found."
        );

        return;
    }

    checkoutItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        const itemTotal =
            Number(item.price) * item.quantity;

        total += itemTotal;

        const row =
            document.createElement("div");

        row.className = "checkout-item";

        row.innerHTML = `
            <span>
                ${escapeHtml(item.name)} × ${item.quantity}
            </span>

            <strong>
                ₹${itemTotal.toLocaleString("en-IN")}
            </strong>
        `;

        checkoutItems.appendChild(row);

    });

    checkoutTotal.textContent =
        "₹" + total.toLocaleString("en-IN");

    const checkoutOverlay =
        document.getElementById("checkoutOverlay");

    if (checkoutOverlay) {

        checkoutOverlay.classList.add("show");

    }

}


/* =================================
   CLOSE CHECKOUT
================================= */

function closeCheckout() {

    const checkoutOverlay =
        document.getElementById("checkoutOverlay");

    if (checkoutOverlay) {

        checkoutOverlay.classList.remove("show");

    }

}


/* =================================
   GENERATE ORDER ID
================================= */

function generateOrderId() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    const random =
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

    return `ARIAA-${year}${month}${day}-${random}`;

}


/* =================================
   PLACE ORDER
================================= */

async function placeOrder(event) {

    event.preventDefault();

    if (cart.length === 0) {

        alert("Your Jewel Box is empty.");

        return;
    }

    const button =
        document.getElementById("placeOrderButton");

    if (button) {

        button.disabled = true;

        button.textContent =
            "PLACING ORDER...";

    }

    try {

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();

        const customerPhone =
            document
                .getElementById("customerPhone")
                .value
                .trim();

        const customerEmail =
            document
                .getElementById("customerEmail")
                .value
                .trim();

        const customerAddress =
            document
                .getElementById("customerAddress")
                .value
                .trim();

        const customerCity =
            document
                .getElementById("customerCity")
                .value
                .trim();

        const customerState =
            document
                .getElementById("customerState")
                .value
                .trim();

        const customerPincode =
            document
                .getElementById("customerPincode")
                .value
                .trim();


        /* =============================
           VALIDATE PHONE
        ============================= */

        if (!/^[0-9]{10}$/.test(customerPhone)) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        /* =============================
           VALIDATE PINCODE
        ============================= */

        if (!/^[0-9]{6}$/.test(customerPincode)) {

            alert(
                "Please enter a valid 6-digit PIN code."
            );

            return;
        }


        /* =============================
           CALCULATE TOTAL
        ============================= */

        let total = 0;


        /* =============================
           PREPARE ORDER ITEMS
        ============================= */

        const orderItems =
            cart.map(item => {

                const itemTotal =
                    Number(item.price) *
                    item.quantity;

                total += itemTotal;

                return {

                    product_id: item.id,

                    name: item.name,

                    price: Number(item.price),

                    quantity: item.quantity,

                    image: item.image || ""

                };

            });


        /* =============================
           GENERATE ORDER ID
        ============================= */

        const orderId =
            generateOrderId();


        /* =============================
           INSERT ORDER
        ============================= */

        const { error } =
            await supabaseClient
                .from("orders")
                .insert({

                    order_id: orderId,

                    customer_name:
                        customerName,

                    customer_phone:
                        customerPhone,

                    customer_email:
                        customerEmail || null,

                    address:
                        customerAddress,

                    city:
                        customerCity,

                    state:
                        customerState,

                    pincode:
                        customerPincode,

                    items:
                        orderItems,

                    total_amount:
                        total,

                    payment_status:
                        "pending",

                    order_status:
                        "awaiting_confirmation"

                });


        /* =============================
           HANDLE DATABASE ERROR
        ============================= */

        if (error) {

            console.error(
                "Order creation error:",
                error
            );

            throw error;

        }


        /* =============================
           SHOW CONFIRMATION
        ============================= */

        const confirmationOrderId =
            document.getElementById(
                "confirmationOrderId"
            );

        if (confirmationOrderId) {

            confirmationOrderId.textContent =
                orderId;

        }


        /* =============================
           CLOSE CHECKOUT
        ============================= */

        closeCheckout();


        /* =============================
           SHOW CONFIRMATION
        ============================= */

        const confirmationOverlay =
            document.getElementById(
                "confirmationOverlay"
            );

        if (confirmationOverlay) {

            confirmationOverlay.classList.add(
                "show"
            );

        }


        /* =============================
           CLEAR CART
        ============================= */

        cart = [];

        updateCart();


        /* =============================
           RESET CHECKOUT FORM
        ============================= */

        const checkoutForm =
            document.getElementById(
                "checkoutForm"
            );

        if (checkoutForm) {

            checkoutForm.reset();

        }

    }
    catch (error) {

        console.error(
            "Place order error:",
            error
        );

        alert(
            "We could not place your order right now. Please try again."
        );

    }
    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "PLACE ORDER";

        }

    }

}


/* =================================
   CLOSE CONFIRMATION
================================= */

function closeConfirmation() {

    const confirmationOverlay =
        document.getElementById(
            "confirmationOverlay"
        );

    if (confirmationOverlay) {

        confirmationOverlay.classList.remove(
            "show"
        );

    }

}


/* =================================
   ESCAPE HTML
================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =================================
   CLOSE CART WHEN OVERLAY CLICKED
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "jewelBoxOverlay"
            );

        if (
            overlay &&
            event.target === overlay
        ) {

            closeJewelBox();

        }

    }
);


/* =================================
   CLOSE CHECKOUT WHEN CLICKING OUTSIDE
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "checkoutOverlay"
            );

        const box =
            document.querySelector(
                ".checkout-box"
            );

        if (
            overlay &&
            event.target === overlay &&
            box
        ) {

            closeCheckout();

        }

    }
);


/* =================================
   CLOSE CONFIRMATION WHEN CLICKING OUTSIDE
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "confirmationOverlay"
            );

        const box =
            document.querySelector(
                ".confirmation-box"
            );

        if (
            overlay &&
            event.target === overlay &&
            box
        ) {

            closeConfirmation();

        }

    }
);


/* =================================
   ESC KEY
================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }

        closeJewelBox();

        closeCheckout();

        closeConfirmation();

    }
);


/* =================================
   START WEBSITE
================================= */

loadProducts();

updateCart();
