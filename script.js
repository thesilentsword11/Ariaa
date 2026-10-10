let products = [];

let cart = [];

let currentCategory = "All";


/* =================================
   LOAD PRODUCTS FROM SUPABASE
================================= */

async function loadProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        console.error("Products container not found.");
        return;
    }

    container.innerHTML = `
        <div class="loading-products">
            Loading our collection...
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(
                "Product loading error:",
                error
            );

            container.innerHTML = `
                <div class="loading-products">
                    Unable to load our collection.
                    <br><br>
                    Please try again later.
                </div>
            `;

            return;
        }

        products = data || [];

        displayProducts(
            currentCategory
        );

    }
    catch (error) {

        console.error(
            "Unexpected product loading error:",
            error
        );

        container.innerHTML = `
            <div class="loading-products">
                Unable to load our collection.
                <br><br>
                Please try again later.
            </div>
        `;

    }

}


/* =================================
   DISPLAY PRODUCTS
================================= */

function displayProducts(
    category = "All"
) {

    currentCategory =
        category;

    const container =
        document.getElementById(
            "products"
        );

    if (!container) {
        return;
    }

    let list = products;

    if (
        category !== "All"
    ) {

        list =
            products.filter(
                product =>
                    product.category ===
                    category
            );

    }

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <div class="loading-products">
                No products found.
            </div>
        `;

        return;

    }

    list.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "product";

            card.innerHTML = `

                <div class="product-image">

                    <img
                        src="${escapeHtml(product.image || "")}"
                        alt="${escapeHtml(product.name)}"
                        onerror="
                            this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80'
                        "
                    >

                </div>

                <div class="product-info">

                    <small>
                        ${escapeHtml(product.category)}
                    </small>

                    <h3>
                        ${escapeHtml(product.name)}
                    </h3>

                    <p class="price">
                        ₹${Number(
                            product.price
                        ).toLocaleString("en-IN")}
                    </p>

                    <button
                        onclick="addToCart(${product.id})"
                        class="add-button"
                        ${
                            !product.available
                            ? "disabled"
                            : ""
                        }
                    >

                        ${
                            product.available
                            ? "ADD TO JEWEL BOX"
                            : "OUT OF STOCK"
                        }

                    </button>

                </div>

            `;

            container.appendChild(
                card
            );

        }
    );

}


/* =================================
   FILTER PRODUCTS
================================= */

function filterProducts(
    category,
    button
) {

    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );

    if (button) {

        button.classList.add(
            "active"
        );

    }

    displayProducts(
        category
    );

}


/* =================================
   ADD TO CART
================================= */

function addToCart(id) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!product) {

        return;

    }

    if (!product.available) {

        return;

    }

    const existing =
        cart.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (existing) {

        existing.quantity++;

    }

    else {

        cart.push({

            ...product,

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
        document.getElementById(
            "cartItems"
        );

    const cartCount =
        document.getElementById(
            "cartCount"
        );

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );

    if (!cartItems) {
        return;
    }

    const count =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item.quantity,
            0
        );

    if (cartCount) {

        cartCount.textContent =
            count;

    }

    const mobileCartCount = document.getElementById("mobileCartCount");
    if (mobileCartCount) {
        mobileCartCount.textContent = count;
    }

    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>
                    ♢
                </div>

                <h3>
                    Your Jewel Box Is Empty
                </h3>

                <p>
                    Discover something beautiful
                    and add your favorite pieces here.
                </p>

            </div>

        `;

        if (cartTotal) {

            cartTotal.textContent =
                "₹0";

        }

        return;

    }

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(
        item => {

            total +=
                Number(item.price) *
                item.quantity;

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "cart-item";

            row.innerHTML = `

                <img
                    src="${escapeHtml(item.image || "")}"
                    alt="${escapeHtml(item.name)}"
                >

                <div>

                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                    <p>
                        ₹${Number(
                            item.price
                        ).toLocaleString("en-IN")}
                    </p>

                    <div class="quantity">

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

                    <button
                        class="remove"
                        onclick="removeFromCart(${item.id})"
                    >
                        REMOVE
                    </button>

                </div>

            `;

            cartItems.appendChild(
                row
            );

        }
    );

    if (cartTotal) {

        cartTotal.textContent =
            "₹" +
            total.toLocaleString(
                "en-IN"
            );

    }

}


/* =================================
   CHANGE QUANTITY
================================= */

function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(id)
        );

    if (!item) {

        return;

    }

    item.quantity +=
        amount;

    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                product =>
                    Number(product.id) !==
                    Number(id)
            );

    }

    updateCart();

}


/* =================================
   REMOVE FROM CART
================================= */

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );

    updateCart();

}


/* =================================
   OPEN JEWEL BOX
================================= */

function openJewelBox() {

    const jewelBox =
        document.getElementById(
            "jewelBox"
        );

    const overlay =
        document.getElementById(
            "overlay"
        );

    if (jewelBox) {

        jewelBox.classList.add(
            "open"
        );

    }

    if (overlay) {

        overlay.classList.add(
            "show"
        );

    }

}


/* =================================
   CLOSE JEWEL BOX
================================= */

function closeJewelBox() {

    const jewelBox =
        document.getElementById(
            "jewelBox"
        );

    const overlay =
        document.getElementById(
            "overlay"
        );

    if (jewelBox) {

        jewelBox.classList.remove(
            "open"
        );

    }

    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }

}


/* =================================
   OPEN CHECKOUT
================================= */

function checkout() {

    if (
        cart.length === 0
    ) {

        alert(
            "Your Jewel Box is empty."
        );

        return;

    }

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    if (
        !checkoutItems ||
        !checkoutTotal
    ) {

        console.error(
            "Checkout elements not found."
        );

        return;

    }

    checkoutItems.innerHTML =
        "";

    let total = 0;

    cart.forEach(
        item => {

            const itemTotal =
                Number(item.price) *
                item.quantity;

            total +=
                itemTotal;

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "checkout-item";

            row.innerHTML = `

                <span>
                    ${escapeHtml(item.name)}
                    × ${item.quantity}
                </span>

                <strong>
                    ₹${itemTotal.toLocaleString("en-IN")}
                </strong>

            `;

            checkoutItems.appendChild(
                row
            );

        }
    );

    checkoutTotal.textContent =
        "₹" +
        total.toLocaleString(
            "en-IN"
        );

    closeJewelBox();

    const checkoutOverlay =
        document.getElementById(
            "checkoutOverlay"
        );

    if (checkoutOverlay) {

        checkoutOverlay.classList.add(
            "show"
        );

    }

}


/* =================================
   CLOSE CHECKOUT
================================= */

function closeCheckout() {

    const checkoutOverlay =
        document.getElementById(
            "checkoutOverlay"
        );

    if (checkoutOverlay) {

        checkoutOverlay.classList.remove(
            "show"
        );

    }

}


/* =================================
   GENERATE ORDER ID
================================= */

function generateOrderId() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const random =
        Math.random()
            .toString(36)
            .substring(
                2,
                6
            )
            .toUpperCase();

    return `ARIAA-${year}${month}${day}-${random}`;

}


/* =================================
   PLACE ORDER
================================= */

async function placeOrder(
    event
) {

    event.preventDefault();

    if (
        cart.length === 0
    ) {

        alert(
            "Your Jewel Box is empty."
        );

        return;

    }

    const button =
        document.getElementById(
            "placeOrderButton"
        );

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "PLACING ORDER...";

    }

    try {

        const customerName =
            document
                .getElementById(
                    "customerName"
                )
                .value
                .trim();

        const customerPhone =
            document
                .getElementById(
                    "customerPhone"
                )
                .value
                .trim();

        const customerEmail =
            document
                .getElementById(
                    "customerEmail"
                )
                .value
                .trim();

        const customerAddress =
            document
                .getElementById(
                    "customerAddress"
                )
                .value
                .trim();

        const customerCity =
            document
                .getElementById(
                    "customerCity"
                )
                .value
                .trim();

        const customerState =
            document
                .getElementById(
                    "customerState"
                )
                .value
                .trim();

        const customerPincode =
            document
                .getElementById(
                    "customerPincode"
                )
                .value
                .trim();


        /* =============================
           VALIDATE MOBILE
        ============================= */

        if (
            !/^[0-9]{10}$/.test(
                customerPhone
            )
        ) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return;

        }


        /* =============================
           VALIDATE PINCODE
        ============================= */

        if (
            !/^[0-9]{6}$/.test(
                customerPincode
            )
        ) {

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
            cart.map(
                item => {

                    const itemTotal =
                        Number(item.price) *
                        item.quantity;

                    total +=
                        itemTotal;

                    return {

                        product_id:
                            item.id,

                        name:
                            item.name,

                        price:
                            Number(
                                item.price
                            ),

                        quantity:
                            item.quantity,

                        image:
                            item.image || ""

                    };

                }
            );


        /* =============================
           GENERATE ORDER ID
        ============================= */

        const orderId =
            generateOrderId();


        /* =============================
           SAVE ORDER TO SUPABASE
        ============================= */

        const {
            error
        } = await supabaseClient
            .from("orders")
            .insert({

                order_id:
                    orderId,

                customer_name:
                    customerName,

                customer_phone:
                    customerPhone,

                customer_email:
                    customerEmail ||
                    null,

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
           DATABASE ERROR
        ============================= */

        if (error) {

            console.error(
                "Order creation error:",
                error
            );

            throw error;

        }


        /* =============================
           SHOW ORDER ID
        ============================= */

        const confirmationOrderId =
            document.getElementById(
                "confirmationOrderId"
            );

        if (
            confirmationOrderId
        ) {

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

        if (
            confirmationOverlay
        ) {

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
           RESET FORM
        ============================= */

        const checkoutForm =
            document.getElementById(
                "checkoutForm"
            );

        if (
            checkoutForm
        ) {

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

            button.disabled =
                false;

            button.textContent =
                "PLACE ORDER";

        }

    }

}


/* =================================
   COPY ORDER ID
================================= */

function copyOrderId() {

    const orderIdElement =
        document.getElementById(
            "confirmationOrderId"
        );

    const copyButton =
        document.querySelector(
            ".copy-order-button"
        );

    if (!orderIdElement) {

        alert(
            "Order ID not found."
        );

        return;

    }

    const orderId =
        orderIdElement.textContent.trim();

    if (!orderId) {

        alert(
            "Order ID is empty."
        );

        return;

    }


    /* =================================
       METHOD 1 — MODERN CLIPBOARD
    ================================= */

    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
        "function"
    ) {

        navigator.clipboard
            .writeText(orderId)
            .then(
                function() {

                    copyButtonSuccess(
                        copyButton
                    );

                }
            )
            .catch(
                function() {

                    copyOrderIdFallback(
                        orderId,
                        copyButton
                    );

                }
            );

        return;

    }


    /* =================================
       METHOD 2 — FALLBACK
    ================================= */

    copyOrderIdFallback(
        orderId,
        copyButton
    );

}


/* =================================
   FALLBACK COPY
================================= */

function copyOrderIdFallback(
    orderId,
    copyButton
) {

    const textArea =
        document.createElement(
            "textarea"
        );

    textArea.value =
        orderId;

    textArea.setAttribute(
        "readonly",
        ""
    );

    textArea.style.position =
        "fixed";

    textArea.style.top =
        "0";

    textArea.style.left =
        "-9999px";

    textArea.style.width =
        "1px";

    textArea.style.height =
        "1px";

    textArea.style.opacity =
        "0";

    document.body.appendChild(
        textArea
    );

    textArea.focus();

    textArea.select();

    textArea.setSelectionRange(
        0,
        textArea.value.length
    );

    let copied = false;

    try {

        copied =
            document.execCommand(
                "copy"
            );

    }
    catch (error) {

        console.error(
            "Fallback copy failed:",
            error
        );

        copied = false;

    }

    document.body.removeChild(
        textArea
    );


    if (copied) {

        copyButtonSuccess(
            copyButton
        );

    }
    else {

        alert(
            "Please copy your Order ID manually:\n\n" +
            orderId
        );

    }

}


/* =================================
   COPY BUTTON SUCCESS
================================= */

function copyButtonSuccess(
    button
) {

    if (!button) {

        return;

    }

    const originalText =
        button.textContent;

    button.textContent =
        "COPIED ✓";

    button.disabled =
        true;

    setTimeout(
        function() {

            button.textContent =
                originalText;

            button.disabled =
                false;

        },
        1800
    );

}


/* =================================
   CLOSE CONFIRMATION
================================= */

function closeConfirmation() {

    const confirmationOverlay =
        document.getElementById(
            "confirmationOverlay"
        );

    if (
        confirmationOverlay
    ) {

        confirmationOverlay.classList.remove(
            "show"
        );

    }

}


/* =================================
   SIMPLE HTML ESCAPING
================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =================================
   CLOSE JEWEL BOX USING OVERLAY
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "overlay"
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
   CLOSE CHECKOUT OUTSIDE BOX
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "checkoutOverlay"
            );

        if (
            overlay &&
            event.target === overlay
        ) {

            closeCheckout();

        }

    }
);


/* =================================
   CLOSE CONFIRMATION OUTSIDE BOX
================================= */

document.addEventListener(
    "click",
    function(event) {

        const overlay =
            document.getElementById(
                "confirmationOverlay"
            );

        if (
            overlay &&
            event.target === overlay
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

        if (
            event.key === "Escape"
        ) {

            closeJewelBox();

            closeCheckout();

            closeConfirmation();

        }

    }
);


/* =================================
   START WEBSITE
================================= */

loadProducts();

updateCart();
