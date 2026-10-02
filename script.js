let products = [];

let cart = [];

let currentCategory = "All";


/* =================================
   LOAD PRODUCTS FROM SUPABASE
================================= */

async function loadProducts() {

    const container =
        document.getElementById("products");


    container.innerHTML = `
        <div class="loading-products">
            Loading our collection...
        </div>
    `;


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


    button.classList.add(
        "active"
    );


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


    document.getElementById(
        "cartCount"
    ).textContent =
        count;


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


        document.getElementById(
            "cartTotal"
        ).textContent =
            "₹0";


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


    document.getElementById(
        "cartTotal"
    ).textContent =
        "₹" +
        total.toLocaleString(
            "en-IN"
        );

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
   REMOVE
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

    document
        .getElementById(
            "jewelBox"
        )
        .classList.add(
            "open"
        );


    document
        .getElementById(
            "overlay"
        )
        .classList.add(
            "show"
        );

}



/* =================================
   CLOSE JEWEL BOX
================================= */

function closeJewelBox() {

    document
        .getElementById(
            "jewelBox"
        )
        .classList.remove(
            "open"
        );


    document
        .getElementById(
            "overlay"
        )
        .classList.remove(
            "show"
        );

}



/* =================================
   WHATSAPP CHECKOUT
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


    let message =
        "Hello Ariaa Jewels!%0A%0A" +
        "I would like to order:%0A";


    cart.forEach(
        item => {

            message +=
                "%0A• " +
                encodeURIComponent(
                    item.name
                ) +
                " × " +
                item.quantity;

        }
    );


    const total =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        );


    message +=
        "%0A%0ATotal: ₹" +
        total.toLocaleString(
            "en-IN"
        );


    /*
       CHANGE THIS TO YOUR
       WHATSAPP NUMBER.

       India example:
       919876543210
    */

    const phone =
        "919876543210";


    window.open(
        "https://wa.me/" +
        phone +
        "?text=" +
        message,
        "_blank"
    );

}



/* =================================
   SIMPLE HTML ESCAPING
================================= */

function escapeHtml(value) {

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
   START
================================= */

loadProducts();

updateCart();
