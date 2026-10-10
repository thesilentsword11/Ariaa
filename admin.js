/* =========================================
   ARIAA JEWELS
   ADMIN PANEL
========================================= */


/*
   Supabase client
*/

const adminClient = window.supabaseClient;


/* =========================================
   GLOBAL VARIABLES
========================================= */

let editingProductId = null;


/* =========================================
   PAGE START
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (!adminClient) {

        showLoginError(
            "Supabase is not configured yet. Please create supabase-config.js."
        );

        return;

    }


    /*
       Check whether an admin is already logged in.
    */

    const {
        data: {
            session
        }
    } = await adminClient.auth.getSession();


    if (session) {

        showAdminPanel(
            session.user
        );

    }

    else {

        showLoginScreen();

    }


    /*
       Listen for login/logout changes.
    */

    adminClient.auth.onAuthStateChange(
        (event, session) => {

            if (session) {

                showAdminPanel(
                    session.user
                );

            }

            else {

                showLoginScreen();

            }

        }
    );


    /*
       Login form
    */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginAdmin
        );

    }


    /*
       Product form
    */

    const productForm =
        document.getElementById("productForm");


    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
        );

    }


    /*
       Image preview
    */

    const imageInput =
        document.getElementById("productImageFile");


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            previewProductImage
        );

    }

});


/* =========================================
   LOGIN
========================================= */

async function loginAdmin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    const button =
        event.target.querySelector(
            "button[type='submit']"
        );


    showLoginError("");


    button.disabled = true;

    button.textContent = "SIGNING IN...";


    const {
        error
    } = await adminClient.auth.signInWithPassword({

        email: email,

        password: password

    });


    button.disabled = false;

    button.textContent = "SIGN IN";


    if (error) {

        showLoginError(
            "Incorrect email or password."
        );

        return;

    }

}


/* =========================================
   LOGIN ERROR
========================================= */

function showLoginError(message) {

    const element =
        document.getElementById(
            "loginError"
        );


    if (!element) return;


    element.textContent =
        message;

}


/* =========================================
   SHOW LOGIN SCREEN
========================================= */

function showLoginScreen() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    const adminApp =
        document.getElementById(
            "adminApp"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "flex";

    }


    if (adminApp) {

        adminApp.classList.remove(
            "visible"
        );

    }

}


/* =========================================
   SHOW ADMIN PANEL
========================================= */

async function showAdminPanel(user) {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    const adminApp =
        document.getElementById(
            "adminApp"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (adminApp) {

        adminApp.classList.add(
            "visible"
        );

    }


    const emailElement =
        document.getElementById(
            "adminEmail"
        );


    if (emailElement && user) {

        emailElement.textContent =
            user.email || "Admin";

    }


    /*
       Load products after login.
    */

    await loadProducts();

}


/* =========================================
   LOGOUT
========================================= */

async function logoutAdmin() {

    const confirmed =
        confirm(
            "Are you sure you want to log out?"
        );


    if (!confirmed) return;


    await adminClient.auth.signOut();

}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    const table =
        document.getElementById(
            "adminProducts"
        );


    if (!table) return;


    table.innerHTML = `

        <tr>

            <td
                colspan="5"
                class="table-loading"
            >
                Loading products...
            </td>

        </tr>

    `;


    const {
        data,
        error
    } = await adminClient
        .from("products")
        .select("*")
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(error);


        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-loading"
                >
                    Could not load products.
                </td>

            </tr>

        `;


        showAdminMessage(
            "Could not load products. Check your Supabase database setup.",
            "error"
        );


        return;

    }


    renderProducts(
        data || []
    );

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts(products) {

    const table =
        document.getElementById(
            "adminProducts"
        );


    if (!table) return;


    if (!products.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="table-loading"
                >

                    Your collection is empty.

                    <br><br>

                    Add your first jewelry product.

                </td>

            </tr>

        `;


        return;

    }


    table.innerHTML = "";


    products.forEach(product => {

        const row =
            document.createElement("tr");


        const image =
            product.image ||
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=500&q=80";


        const description =
            product.description ||
            "No description";


        row.innerHTML = `

            <td>

                <div
                    class="product-table-info"
                >

                    <img
                        class="product-table-image"
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(product.name)}"
                        onerror="
                            this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=500&q=80'
                        "
                    >


                    <div>

                        <div
                            class="product-table-name"
                        >
                            ${escapeHtml(product.name)}
                        </div>


                        <div
                            class="product-table-description"
                        >
                            ${escapeHtml(description)}
                        </div>

                    </div>

                </div>

            </td>


            <td>

                <span
                    class="category-badge"
                >
                    ${escapeHtml(product.category)}
                </span>

            </td>


            <td>

                <span
                    class="product-price"
                >
                    ₹${Number(product.price || 0).toLocaleString("en-IN")}
                </span>

            </td>


            <td>

                <span
                    class="
                        status-badge
                        ${
                            product.available
                            ? "available"
                            : "unavailable"
                        }
                    "
                >

                    ${
                        product.available
                        ? "Available"
                        : "Out of Stock"
                    }

                </span>

            </td>


            <td>

                <div
                    class="action-buttons"
                >

                    <button
                        class="action-button edit"
                        onclick="editProduct(${product.id})"
                    >
                        EDIT
                    </button>


                    <button
                        class="action-button delete"
                        onclick="deleteProduct(${product.id})"
                    >
                        DELETE
                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================
   ADD / EDIT PRODUCT
========================================= */

async function saveProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const category =
        document
            .getElementById("productCategory")
            .value;


    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );


    /*
       Image file selected from computer
    */

    const imageInput =
        document.getElementById(
            "productImageFile"
        );


    const imageFile =
        imageInput &&
        imageInput.files &&
        imageInput.files.length
            ? imageInput.files[0]
            : null;


    /*
       Existing image URL.
       Used when editing a product without
       selecting a new image.
    */

    const existingImage =
        document
            .getElementById("productImage")
            .value
            .trim();


    let image =
        existingImage;


    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();


    const available =
        document
            .getElementById("productAvailable")
            .checked;


    /* =========================================
       VALIDATION
    ========================================= */

    if (!name) {

        alert(
            "Please enter a product name."
        );

        return;

    }


    if (!category) {

        alert(
            "Please select a category."
        );

        return;

    }


    if (
        price < 0 ||
        Number.isNaN(price)
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    if (!image && !imageFile) {

        alert(
            "Please choose a product image."
        );

        return;

    }


    /*
       Check selected file
    */

    if (imageFile) {

        if (
            !imageFile.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please choose an image file."
            );

            return;

        }


        if (
            imageFile.size >
            10 * 1024 * 1024
        ) {

            alert(
                "Please choose an image smaller than 10 MB."
            );

            return;

        }

    }


    const button =
        document.getElementById(
            "saveProductButton"
        );


    button.disabled = true;


    button.textContent =
        editingProductId
        ? "UPDATING..."
        : "SAVING...";


    /* =========================================
       UPLOAD IMAGE TO SUPABASE STORAGE
       
       Bucket:
       product_image
    ========================================= */

    if (imageFile) {

        const safeName =
            imageFile.name
                .toLowerCase()
                .replace(
                    /[^a-z0-9.]+/g,
                    "-"
                )
                .replace(
                    /-+/g,
                    "-"
                );


        const filePath =
            `${Date.now()}-${safeName}`;


        button.textContent =
            "UPLOADING IMAGE...";


        const uploadResult =
            await adminClient.storage
                .from("product_image")
                .upload(
                    filePath,
                    imageFile,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            imageFile.type
                    }
                );


        if (uploadResult.error) {

            console.error(
                uploadResult.error
            );


            button.disabled = false;

            button.textContent =
                "SAVE PRODUCT";


            showAdminMessage(
                "Image upload failed: " +
                uploadResult.error.message,
                "error"
            );


            return;

        }


        /*
           Get public URL
        */

        const publicUrlResult =
            adminClient.storage
                .from("product_image")
                .getPublicUrl(
                    filePath
                );


        image =
            publicUrlResult
                .data
                .publicUrl;

    }


    /* =========================================
       PRODUCT DATA
    ========================================= */

    const productData = {

        name: name,

        price: price,

        category: category,

        image: image,

        description: description,

        available: available

    };


    let result;


    /* =========================================
       EDIT EXISTING PRODUCT
    ========================================= */

    if (editingProductId) {

        result =
            await adminClient
                .from("products")
                .update(productData)
                .eq(
                    "id",
                    editingProductId
                );

    }


    /* =========================================
       ADD NEW PRODUCT
    ========================================= */

    else {

        result =
            await adminClient
                .from("products")
                .insert([
                    productData
                ]);

    }


    button.disabled = false;

    button.textContent =
        "SAVE PRODUCT";


    if (result.error) {

        console.error(
            result.error
        );


        showAdminMessage(
            result.error.message,
            "error"
        );


        return;

    }


    showAdminMessage(
        editingProductId
            ? "Product updated successfully."
            : "Product added successfully.",
        "success"
    );


    resetProductForm();


    await loadProducts();


    showAdminSection(
        "productsSection"
    );

}


/* =========================================
   EDIT PRODUCT
========================================= */

async function editProduct(id) {

    const {
        data,
        error
    } = await adminClient
        .from("products")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (error) {

        console.error(error);


        showAdminMessage(
            "Could not load this product.",
            "error"
        );


        return;

    }


    editingProductId =
        id;


    document.getElementById(
        "productId"
    ).value = id;


    document.getElementById(
        "productName"
    ).value =
        data.name || "";


    document.getElementById(
        "productCategory"
    ).value =
        data.category || "";


    document.getElementById(
        "productPrice"
    ).value =
        data.price || 0;


    /*
       Keep existing image URL
    */

    document.getElementById(
        "productImage"
    ).value =
        data.image || "";


    /*
       Clear file picker when editing
    */

    const imageFileInput =
        document.getElementById(
            "productImageFile"
        );


    if (imageFileInput) {

        imageFileInput.value = "";

    }


    document.getElementById(
        "productDescription"
    ).value =
        data.description || "";


    document.getElementById(
        "productAvailable"
    ).checked =
        data.available !== false;


    document.getElementById(
        "formLabel"
    ).textContent =
        "EDIT PRODUCT";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Jewelry";


    document.getElementById(
        "saveProductButton"
    ).textContent =
        "UPDATE PRODUCT";


    previewProductImage();


    showAdminSection(
        "addSection"
    );

}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) return;


    const {
        error
    } = await adminClient
        .from("products")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(error);


        showAdminMessage(
            "Could not delete product.",
            "error"
        );


        return;

    }


    showAdminMessage(
        "Product deleted successfully.",
        "success"
    );


    await loadProducts();

}


/* =========================================
   RESET FORM
========================================= */

function resetProductForm() {

    editingProductId =
        null;


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {

        form.reset();

    }


    document.getElementById(
        "productAvailable"
    ).checked = true;


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "formLabel"
    ).textContent =
        "NEW PRODUCT";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Jewelry";


    document.getElementById(
        "saveProductButton"
    ).textContent =
        "SAVE PRODUCT";


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.innerHTML = `

            <span>
                Image preview will appear here
            </span>

        `;

    }

}


/* =========================================
   IMAGE PREVIEW
========================================= */

function previewProductImage() {

    const fileInput =
        document.getElementById(
            "productImageFile"
        );


    const preview =
        document.getElementById(
            "imagePreview"
        );


    const existingImage =
        document
            .getElementById(
                "productImage"
            )
            .value
            .trim();


    if (!preview) return;


    const file =
        fileInput &&
        fileInput.files &&
        fileInput.files.length
            ? fileInput.files[0]
            : null;


    /*
       Preview selected local file
    */

    if (file) {

        const objectUrl =
            URL.createObjectURL(
                file
            );


        preview.innerHTML = `

            <img
                src="${objectUrl}"
                alt="Product preview"
            >

        `;


        return;

    }


    /*
       Preview existing image URL
    */

    if (!existingImage) {

        preview.innerHTML = `

            <span>
                Image preview will appear here
            </span>

        `;

        return;

    }


    preview.innerHTML = `

        <img
            src="${escapeHtml(existingImage)}"
            alt="Product preview"
            onerror="
                this.parentElement.innerHTML =
                '<span>Could not load image</span>'
            "
        >

    `;

}


/* =========================================
   ADMIN SECTION NAVIGATION
========================================= */

function showAdminSection(
    sectionId,
    button = null
) {

    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const section =
        document.getElementById(
            sectionId
        );


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(link => {

            link.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =========================================
   ADMIN MESSAGE
========================================= */

function showAdminMessage(
    message,
    type = "success"
) {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "admin-message " +
        type;


    setTimeout(() => {

        element.className =
            "admin-message";

        element.textContent =
            "";

    }, 5000);

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   ARIAA ORDER MANAGEMENT
========================================= */

let allAdminOrders = [];

async function loadOrders() {
    const table = document.getElementById("adminOrders");
    if (!table) return;

    table.innerHTML = '<tr><td colspan="6">Loading orders...</td></tr>';

    const { data, error } = await adminClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        table.innerHTML = '<tr><td colspan="6">Could not load orders. Check your admin SELECT policy.</td></tr>';
        return;
    }

    allAdminOrders = data || [];
    renderOrders();
}

function renderOrders() {
    const table = document.getElementById("adminOrders");
    if (!table) return;

    const search = (
        document.getElementById("orderSearch")?.value || ""
    ).trim().toLowerCase();

    const status = document.getElementById("orderStatusFilter")?.value || "";

    const filtered = allAdminOrders.filter(order => {
        const matchesSearch = [
            order.order_id,
            order.customer_name,
            order.customer_phone
        ].some(value => String(value || "").toLowerCase().includes(search));

        return matchesSearch && (!status || order.order_status === status);
    });

    if (!filtered.length) {
        table.innerHTML = '<tr><td colspan="6">No matching orders found.</td></tr>';
        return;
    }

    table.innerHTML = "";

    filtered.forEach(order => {
        const row = document.createElement("tr");
        const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString("en-IN")
            : "—";

        row.innerHTML = `
            <td>
                <strong>${escapeHtml(order.order_id)}</strong>
                <br><small>${escapeHtml(order.payment_status || "pending")}</small>
            </td>
            <td>
                ${escapeHtml(order.customer_name)}
                <br><small>${escapeHtml(order.customer_phone)}</small>
            </td>
            <td>₹${Number(order.total_amount || 0).toLocaleString("en-IN")}</td>
            <td>
                <select aria-label="Order status"
                    onchange="updateOrderStatus('${escapeHtml(order.order_id)}', this.value)">
                    ${[
                        "awaiting_confirmation", "confirmed", "processing",
                        "shipped", "delivered", "cancelled"
                    ].map(s => `<option value="${s}" ${order.order_status === s ? "selected" : ""}>${s.replace(/_/g, " ")}</option>`).join("")}
                </select>
            </td>
            <td>${escapeHtml(date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-button edit"
                        onclick="editOrder('${escapeHtml(order.order_id)}')">EDIT</button>
                    <button class="action-button delete"
                        onclick="deleteOrder('${escapeHtml(order.order_id)}')">DELETE</button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const allowed = [
        "awaiting_confirmation", "confirmed", "processing",
        "shipped", "delivered", "cancelled"
    ];

    if (!allowed.includes(newStatus)) return;

    const { error } = await adminClient
        .from("orders")
        .update({
            order_status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

    if (error) {
        alert("Could not update order status: " + error.message);
        await loadOrders();
        return;
    }

    const order = allAdminOrders.find(o => o.order_id === orderId);
    if (order) {
        order.order_status = newStatus;
        order.updated_at = new Date().toISOString();
    }

    showAdminMessage("Order status updated.", "success");
    renderOrders();
}

async function editOrder(orderId) {
    const order = allAdminOrders.find(o => o.order_id === orderId);
    if (!order) return;

    const name = prompt("Customer name:", order.customer_name || "");
    if (name === null) return;

    const phone = prompt("10-digit mobile number:", order.customer_phone || "");
    if (phone === null) return;

    const email = prompt("Customer email:", order.customer_email || "");
    if (email === null) return;

    const address = prompt("Delivery address:", order.address || "");
    if (address === null) return;

    const city = prompt("City:", order.city || "");
    if (city === null) return;

    const state = prompt("State:", order.state || "");
    if (state === null) return;

    const pincode = prompt("PIN code:", order.pincode || "");
    if (pincode === null) return;

    if (!name.trim() || !/^\d{10}$/.test(phone.trim()) ||
        !address.trim() || !city.trim() || !state.trim() ||
        !/^\d{6}$/.test(pincode.trim())) {
        alert("Please enter a name, valid 10-digit mobile number, address, city, state and 6-digit PIN code.");
        return;
    }

    const { error } = await adminClient
        .from("orders")
        .update({
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_email: email.trim() || null,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

    if (error) {
        alert("Could not edit order: " + error.message);
        return;
    }

    showAdminMessage("Customer and delivery details updated.", "success");
    await loadOrders();
}

async function deleteOrder(orderId) {
    const order = allAdminOrders.find(o => o.order_id === orderId);
    if (!order) return;

    const confirmed = confirm(
        `Permanently delete order ${orderId}?\n\n` +
        "Export a report first if you need to keep a record. " +
        "This may stop the customer from tracking this order."
    );

    if (!confirmed) return;

    const { error } = await adminClient
        .from("orders")
        .delete()
        .eq("order_id", orderId);

    if (error) {
        alert("Could not delete order: " + error.message);
        return;
    }

    showAdminMessage("Order deleted.", "success");
    await loadOrders();
}

/* =========================================
   CSV REPORT EXPORT
========================================= */

function downloadOrderReport() {
    const from = document.getElementById("reportFrom").value;
    const to = document.getElementById("reportTo").value;
    const status = document.getElementById("reportStatus").value;
    const message = document.getElementById("reportMessage");

    if (from && to && from > to) {
        message.textContent = "The start date must be before the end date.";
        return;
    }

    const filtered = allAdminOrders.filter(order => {
        const date = (order.created_at || "").slice(0, 10);
        return (!from || date >= from) &&
            (!to || date <= to) &&
            (!status || order.order_status === status);
    });

    if (!filtered.length) {
        message.textContent = "No orders match those filters. Open Orders first to load the records.";
        return;
    }

    const columns = [
        ["Order ID", "order_id"],
        ["Created At", "created_at"],
        ["Customer Name", "customer_name"],
        ["Phone", "customer_phone"],
        ["Email", "customer_email"],
        ["Address", "address"],
        ["City", "city"],
        ["State", "state"],
        ["PIN Code", "pincode"],
        ["Order Status", "order_status"],
        ["Payment Status", "payment_status"],
        ["Total Amount", "total_amount"],
        ["Items", "items"]
    ];

    function csvCell(value) {
        let text = value == null ? "" :
            (typeof value === "object" ? JSON.stringify(value) : String(value));

        // Prevent spreadsheet formula execution from untrusted values.
        if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const rows = [
        columns.map(col => csvCell(col[0])).join(","),
        ...filtered.map(order =>
            columns.map(col => csvCell(order[col[1]])).join(",")
        )
    ];

    const blob = new Blob(
        ["\uFEFF" + rows.join("\r\n")],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ariaa-orders-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    message.textContent = `Downloaded ${filtered.length} order(s).`;
}

