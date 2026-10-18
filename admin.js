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
       Campus priority location form
    */
    const campusForm = document.getElementById("campusForm");
    if (campusForm) {
        campusForm.addEventListener("submit", saveCampusLocation);
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
    await loadCampusLocations();

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
   MANUAL UPI PAYMENT SETTINGS
   QR uploads go directly to the existing product_image bucket.
========================================= */
let paymentQrPreviewObjectUrl = null;
async function loadPaymentSettings() {
    const message = document.getElementById("paymentSettingsMessage");
    try {
        const { data, error } = await adminClient.from("payment_settings").select("id, upi_id, qr_image_url").eq("id", 1).maybeSingle();
        if (error) throw error;
        document.getElementById("paymentUpiId").value = data?.upi_id || "";
        document.getElementById("paymentQrUrl").value = data?.qr_image_url || "";
        updatePaymentQrPreview();
        const name = document.getElementById("paymentQrFileName");
        if (name && !document.getElementById("paymentQrFile")?.files?.length) name.textContent = data?.qr_image_url ? "A saved QR is active. Choose a new image only if you want to replace it." : "No QR image saved yet. Choose a QR image above.";
        if (message) message.textContent = "Payment settings loaded.";
    } catch (error) {
        if (message) message.textContent = "Could not load payment settings. Run manual-upi-payment-migration.sql and check admin table permissions.";
        console.error("Payment settings load error:", error);
    }
}
function updatePaymentQrPreview() {
    const url = (document.getElementById("paymentQrUrl")?.value || "").trim();
    const img = document.getElementById("paymentQrPreview");
    const placeholder = document.getElementById("paymentQrPreviewPlaceholder");
    if (!img || !placeholder) return;
    if (url) { img.src = url; img.hidden = false; placeholder.hidden = true; img.onerror = () => { img.hidden = true; placeholder.hidden = false; placeholder.textContent = "Saved QR could not be previewed. Upload a new image if needed."; }; }
    else { img.removeAttribute("src"); img.hidden = true; placeholder.hidden = false; placeholder.textContent = "Upload a QR image to preview it here."; }
}
document.addEventListener("DOMContentLoaded", () => {
    const qrFile = document.getElementById("paymentQrFile");
    if (qrFile) qrFile.addEventListener("change", () => {
        const file = qrFile.files?.[0];
        const label = document.getElementById("paymentQrFileName");
        const img = document.getElementById("paymentQrPreview");
        const placeholder = document.getElementById("paymentQrPreviewPlaceholder");
        if (!file) return;
        if (!file.type.startsWith("image/")) { qrFile.value = ""; if (label) label.textContent = "Please choose an image file."; return; }
        if (file.size > 5 * 1024 * 1024) { qrFile.value = ""; if (label) label.textContent = "Image is over 5 MB. Choose a smaller QR image."; return; }
        if (label) label.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB · will upload when you save`;
        if (paymentQrPreviewObjectUrl) URL.revokeObjectURL(paymentQrPreviewObjectUrl);
        paymentQrPreviewObjectUrl = URL.createObjectURL(file);
        if (img && placeholder) { img.src = paymentQrPreviewObjectUrl; img.hidden = false; placeholder.hidden = true; }
    });
    const form = document.getElementById("paymentSettingsForm");
    if (form) form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = document.getElementById("savePaymentSettingsButton");
        const message = document.getElementById("paymentSettingsMessage");
        const upiId = document.getElementById("paymentUpiId").value.trim();
        const qrFile = document.getElementById("paymentQrFile")?.files?.[0] || null;
        let qrUrl = (document.getElementById("paymentQrUrl").value || "").trim();
        if (!upiId || !/^[^\s@]+@[^\s@]+$/.test(upiId)) { if (message) message.textContent = "Enter a valid UPI ID, such as name@bank."; return; }
        if (qrFile && (!qrFile.type.startsWith("image/") || qrFile.size > 5 * 1024 * 1024)) { if (message) message.textContent = "Choose an image under 5 MB."; return; }
        button.disabled = true; button.textContent = qrFile ? "UPLOADING QR..." : "SAVING...";
        if (message) message.textContent = "Saving payment settings…";
        try {
            if (qrFile) {
                const safeName = qrFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").slice(-100);
                const filePath = `payment-qr/${Date.now()}-${safeName || "upi-qr.png"}`;
                const { error: uploadError } = await adminClient.storage.from("product_image").upload(filePath, qrFile, { cacheControl: "3600", upsert: false, contentType: qrFile.type });
                if (uploadError) throw new Error("QR upload failed: " + uploadError.message + ". Check that the product_image bucket exists and admin upload permission is enabled.");
                const publicResult = adminClient.storage.from("product_image").getPublicUrl(filePath);
                qrUrl = publicResult?.data?.publicUrl || "";
                if (!qrUrl) throw new Error("Upload succeeded but Supabase did not return a public URL. Check bucket visibility.");
            }
            const { error } = await adminClient.from("payment_settings").upsert({ id: 1, upi_id: upiId, qr_image_url: qrUrl || null, updated_at: new Date().toISOString() }, { onConflict: "id" });
            if (error) throw error;
            document.getElementById("paymentQrUrl").value = qrUrl;
            if (qrFile) qrFile.value = "";
            if (message) message.textContent = "✓ SAVED SUCCESSFULLY — new checkouts will use this UPI ID and QR.";
            const name = document.getElementById("paymentQrFileName");
            if (name) name.textContent = qrUrl ? "Saved QR is active. Choose another image any time to replace it." : "No QR image saved.";
            updatePaymentQrPreview();
        } catch (error) { console.error("Save payment settings error:", error); if (message) message.textContent = "Could not save settings: " + error.message; }
        finally { button.disabled = false; button.textContent = "SAVE PAYMENT SETTINGS"; }
    });
});

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
    const campusFilter = document.getElementById("orderCampusFilter")?.value || "";

    const filtered = allAdminOrders.filter(order => {
        const matchesSearch = [
            order.order_id,
            order.customer_name,
            order.customer_phone,
            order.campus_name,
            order.campus_city,
            order.campus_nearby_area
        ].some(value => String(value || "").toLowerCase().includes(search));
        const hasCampus = Boolean(order.campus_location_id || order.campus_name);
        const matchesCampus = !campusFilter ||
            (campusFilter === "campus" && hasCampus) ||
            (campusFilter === "regular" && !hasCampus);

        return matchesSearch && matchesCampus && (!status || order.order_status === status);
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
                <br><small>${escapeHtml((order.payment_method || "not set").toUpperCase())}</small>
                <br><span class="payment-status-pill ${order.payment_status === "paid" ? "is-paid" : order.payment_status === "payment_rejected" ? "is-rejected" : "is-pending"}">${escapeHtml(order.payment_status === "paid" ? (order.payment_method === "cod" ? "COD COLLECTED ✓" : "PAYMENT VERIFIED ✓") : order.payment_status === "payment_rejected" ? "PAYMENT REJECTED" : order.payment_status === "pay_on_delivery" ? "PAY ON DELIVERY" : "AWAITING VERIFICATION")}</span>
                ${order.upi_transaction_id ? `<div class="upi-review-detail"><b>UPI transaction / reference</b><span>${escapeHtml(order.upi_transaction_id)}</span></div>` : order.payment_method === "upi" ? `<div class="upi-review-detail missing-ref">No transaction reference provided</div>` : ""}
                ${order.payment_verified_at && order.payment_status === "paid" ? `<small class="verified-time">Verified ${escapeHtml(new Date(order.payment_verified_at).toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short"}))}</small>` : ""}
            </td>
            <td>
                ${escapeHtml(order.customer_name)}
                <br><small>${escapeHtml(order.customer_phone)}</small>
                ${order.campus_name ? `<br><small class="campus-order-tag">Campus: ${escapeHtml(order.campus_name)}${order.campus_city ? `, ${escapeHtml(order.campus_city)}` : ""}</small>` : ""}
                ${order.campus_nearby_area ? `<br><small>${escapeHtml(order.campus_nearby_area)} · ${Number(order.campus_radius_km || 0)} km radius</small>` : ""}
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
                    ${order.payment_method === "upi" ? `<button class="action-button edit" onclick="updatePaymentVerification('${escapeHtml(order.order_id)}','paid')">VERIFY PAYMENT</button><button class="action-button delete" onclick="updatePaymentVerification('${escapeHtml(order.order_id)}','payment_rejected')">REJECT</button>` : order.payment_method === "cod" ? `<button class="action-button edit" onclick="updatePaymentVerification('${escapeHtml(order.order_id)}','paid')">MARK COLLECTED</button>` : ""}
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

async function updatePaymentVerification(orderId, newStatus) {
    if (!['paid', 'payment_rejected'].includes(newStatus)) return;
    const order = allAdminOrders.find(item => item.order_id === orderId);
    if (!order) return;
    const promptText = newStatus === 'paid' ? (order.payment_method === 'cod' ? 'Confirm you received the COD amount in full?' : 'Confirm you checked your payment app/bank and received the full order amount?') : 'Reject this UPI payment reference?';
    if (!confirm(promptText)) return;
    const verifiedAt = newStatus === 'paid' ? new Date().toISOString() : null;
    const { data, error } = await adminClient.from('orders').update({ payment_status: newStatus, payment_verified_at: verifiedAt, updated_at: new Date().toISOString() }).eq('order_id', orderId).select('order_id,payment_status,payment_verified_at').maybeSingle();
    if (error || !data) { alert('Payment status was NOT confirmed as saved. ' + (error?.message || 'No updated row returned. Check the admin UPDATE policy.')); console.error('Payment verification update failed:', error); return; }
    order.payment_status = data.payment_status;
    order.payment_verified_at = data.payment_verified_at;
    renderOrders();
    const message = document.getElementById('ordersMessage');
    if (message) { message.className = 'admin-message success payment-action-confirmation'; message.textContent = newStatus === 'paid' ? (order.payment_method === 'cod' ? '✓ SAVED: COD marked collected for order ' : '✓ PAYMENT VERIFIED AND SAVED for order ') + orderId + (data.payment_verified_at ? ' · ' + new Date(data.payment_verified_at).toLocaleString('en-IN', {dateStyle:'medium',timeStyle:'short'}) : '') : '✓ PAYMENT REJECTED AND SAVED for order ' + orderId; }
    const row = document.querySelector(`#adminOrders tr`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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


function getFilteredReportOrders() {
    const from = document.getElementById("reportFrom")?.value || "";
    const to = document.getElementById("reportTo")?.value || "";
    const status = document.getElementById("reportStatus")?.value || "";

    if (from && to && from > to) {
        throw new Error("Start date must be before end date.");
    }

    return allAdminOrders.filter(order => {
        const date = (order.created_at || "").slice(0, 10);

        return (!from || date >= from) &&
            (!to || date <= to) &&
            (!status || order.order_status === status);
    });
}

function reportEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function reportMoney(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function reportItems(items) {
    if (!Array.isArray(items) || !items.length) {
        return "No item details";
    }

    return items.map(item => {
        const name = reportEscape(item.name || "Jewelry item");
        const qty = Number(item.quantity || 1);
        const price = reportMoney(item.price);

        return `${name} × ${qty} (${price} each)`;
    }).join("<br>");
}

function downloadOrderReport(type = "detailed") {
    const message = document.getElementById("reportMessage");

    try {
        const orders = getFilteredReportOrders();

        if (!orders.length) {
            message.textContent =
                "No orders match these filters. Open Orders and refresh first.";
            return;
        }

        const totalValue = orders.reduce(
            (sum, order) => sum + Number(order.total_amount || 0), 0
        );

        const paidOrders = orders.filter(
            order => order.payment_status === "paid"
        );

        const pendingPayments = orders.filter(
            order => order.payment_status === "pending"
        );

        const statuses = [
            "awaiting_confirmation", "confirmed", "processing",
            "shipped", "delivered", "cancelled"
        ];

        const statusSummary = statuses.map(status => {
            const count = orders.filter(
                order => order.order_status === status
            ).length;

            return `<tr><td>${reportEscape(status.replace(/_/g, " "))}</td>
                <td>${count}</td></tr>`;
        }).join("");

        const rows = orders.map(order => `
            <tr>
                <td>${reportEscape(order.order_id)}</td>
                <td>${reportEscape(
                    order.created_at
                        ? new Date(order.created_at).toLocaleString("en-IN")
                        : "—"
                )}</td>
                <td>${reportEscape(order.customer_name)}<br>
                    ${reportEscape(order.customer_phone)}<br>
                    ${reportEscape(order.customer_email || "")}</td>
                <td>${reportEscape(order.address)}<br>
                    ${reportEscape(order.city)}, ${reportEscape(order.state)}
                    — ${reportEscape(order.pincode)}</td>
                <td>${reportItems(order.items)}</td>
                <td>${reportMoney(order.total_amount)}</td>
                <td>${reportEscape(order.payment_status)}</td>
                <td>${reportEscape(
                    (order.order_status || "").replace(/_/g, " ")
                )}</td>
            </tr>
        `).join("");

        const isDetailed = type === "detailed";

        const content = isDetailed ? `
            <h2>Detailed Order Register</h2>
            <p>Includes customer, delivery, item, and payment details.</p>
            <table>
                <thead><tr>
                    <th>Order ID</th><th>Date</th><th>Customer</th>
                    <th>Delivery Address</th><th>Items</th><th>Total</th>
                    <th>Payment</th><th>Order Status</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        ` : `
            <h2>Order Summary</h2>
            <div class="metrics">
                <div><strong>${orders.length}</strong><span>Total Orders</span></div>
                <div><strong>${reportMoney(totalValue)}</strong><span>Total Order Value</span></div>
                <div><strong>${paidOrders.length}</strong><span>Paid Orders</span></div>
                <div><strong>${pendingPayments.length}</strong><span>Pending Payments</span></div>
            </div>
            <h3>Order Status Breakdown</h3>
            <table>
                <thead><tr><th>Status</th><th>Orders</th></tr></thead>
                <tbody>${statusSummary}</tbody>
            </table>
            <h3>Order List</h3>
            <table>
                <thead><tr>
                    <th>Order ID</th><th>Date</th><th>Customer</th>
                    <th>Total</th><th>Payment</th><th>Status</th>
                </tr></thead>
                <tbody>
                ${orders.map(order => `<tr>
                    <td>${reportEscape(order.order_id)}</td>
                    <td>${reportEscape(
                        order.created_at
                            ? new Date(order.created_at).toLocaleDateString("en-IN")
                            : "—"
                    )}</td>
                    <td>${reportEscape(order.customer_name)}</td>
                    <td>${reportMoney(order.total_amount)}</td>
                    <td>${reportEscape(order.payment_status)}</td>
                    <td>${reportEscape((order.order_status || "").replace(/_/g, " "))}</td>
                </tr>`).join("")}
                </tbody>
            </table>
        `;

        const popup = window.open("", "_blank");

        if (!popup) {
            message.textContent =
                "Allow pop-ups for your admin website, then try again.";
            return;
        }

        popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Ariaa Jewels - ${isDetailed ? "Detailed" : "Summary"} Report</title>
<style>
    body { font-family: Arial, sans-serif; color: #30251d; margin: 28px; }
    header { border-bottom: 3px solid #b9955b; padding-bottom: 14px; }
    h1 { letter-spacing: 4px; margin-bottom: 4px; }
    h1, h2, h3 { color: #79582f; }
    .sub { color: #75695e; font-size: 12px; }
    .metrics { display: flex; flex-wrap: wrap; gap: 12px; margin: 22px 0; }
    .metrics div { border: 1px solid #d9c6a4; padding: 14px; flex: 1; min-width: 120px; }
    .metrics strong, .metrics span { display: block; }
    .metrics strong { font-size: 19px; margin-bottom: 6px; }
    .metrics span { font-size: 11px; color: #75695e; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0 24px; }
    th { background: #f1e6d3; color: #513b25; }
    th, td { border: 1px solid #d8cbb8; padding: 7px; text-align: left; font-size: 10px; overflow-wrap: anywhere; }
    tr { break-inside: avoid; }
    footer { margin-top: 24px; border-top: 1px solid #d8cbb8; padding-top: 10px; font-size: 10px; }
    .print-button { padding: 10px 18px; background: #8b693e; color: white; border: 0; cursor: pointer; }
    @page { size: landscape; margin: 12mm; }
    @media print { .print-button { display: none; } body { margin: 0; } }
</style>
</head>
<body>
<header>
    <h1>ARIAA JEWELS</h1>
    <div>ORDER & SALES REPORT</div>
    <p class="sub">
        ${isDetailed ? "Detailed Order Register" : "Order Summary"} |
        Generated: ${reportEscape(new Date().toLocaleString("en-IN"))}
    </p>
    <p class="sub">Orders included: ${orders.length} |
        Total order value: ${reportMoney(totalValue)}</p>
</header>
${content}
<footer>ARIAA JEWELS — Confidential business report. Keep customer information secure.</footer>
<button class="print-button" onclick="window.print()">PRINT / SAVE AS PDF</button>
<script>
    window.onload = () => setTimeout(() => window.print(), 300);
<\/script>
</body>
</html>`);

        popup.document.close();
        message.textContent =
            "Report prepared. Choose Save as PDF in the print dialog.";

    } catch (error) {
        message.textContent = error.message || "Could not create report.";
    }
}

function downloadOrderCSV() {
    try {
        const orders = getFilteredReportOrders();

        if (!orders.length) {
            document.getElementById("reportMessage").textContent =
                "No orders match these filters.";
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
            ["Campus / College", "campus_name"],
            ["Campus City", "campus_city"],
            ["Nearby Area", "campus_nearby_area"],
            ["Campus Radius (km)", "campus_radius_km"],
            ["Payment Status", "payment_status"],
            ["Total Amount", "total_amount"],
            ["Items", "items"]
        ];

        const cell = value => {
            let text = value == null ? "" :
                (typeof value === "object" ? JSON.stringify(value) : String(value));

            if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;

            return '"' + text.replace(/"/g, '""') + '"';
        };

        const csv = [
            columns.map(col => cell(col[0])).join(","),
            ...orders.map(order =>
                columns.map(col => cell(order[col[1]])).join(",")
            )
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
            `ariaa-orders-${new Date().toISOString().slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        document.getElementById("reportMessage").textContent =
            `Downloaded ${orders.length} order(s) as CSV.`;

    } catch (error) {
        document.getElementById("reportMessage").textContent =
            error.message || "Could not export CSV.";
    }
}




/* =========================================
   CAMPUS PRIORITY LOCATION MANAGER
   Supabase table: campus_locations
========================================= */

function showCampusMessage(message, type = "success") {
    const el = document.getElementById("campusMessage");
    if (!el) return;
    el.textContent = message;
    el.className = `admin-message ${type}`;
}

function resetCampusForm() {
    const form = document.getElementById("campusForm");
    if (form) form.reset();
    document.getElementById("campusId").value = "";
    document.getElementById("campusRadius").value = "3";
    document.getElementById("campusActive").checked = true;
    document.getElementById("campusFormTitle").textContent = "Add a campus or nearby area";
    document.getElementById("saveCampusButton").textContent = "SAVE LOCATION";
    const message = document.getElementById("campusMessage");
    if (message) {
        message.textContent = "";
        message.className = "admin-message";
    }
}

async function loadCampusLocations() {
    const tbody = document.getElementById("campusLocations");
    if (!tbody || !adminClient) return;

    tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Loading campus locations...</td></tr>';

    const { data, error } = await adminClient
        .from("campus_locations")
        .select("id, campus_name, city, nearby_area, radius_km, is_active, created_at")
        .order("city", { ascending: true })
        .order("campus_name", { ascending: true });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-loading">Could not load locations. Run the supplied SQL setup in Supabase, then refresh. (${escapeCampusText(error.message)})</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-loading">No locations yet. Add your first college or nearby area.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(location => `
        <tr>
            <td>
                <div class="campus-location-name">${escapeCampusText(location.campus_name)}</div>
                <small>${escapeCampusText(location.nearby_area || "College / campus")}</small>
            </td>
            <td>${escapeCampusText(location.city)}</td>
            <td>${Number(location.radius_km || 0)} km</td>
            <td><span class="status-badge ${location.is_active ? "available" : "unavailable"}">${location.is_active ? "Active" : "Hidden"}</span></td>
            <td>
                <div class="action-buttons campus-actions">
                    <button type="button" class="action-button edit" onclick="editCampusLocation('${location.id}')">EDIT</button>
                    <button type="button" class="action-button delete" onclick="deleteCampusLocation('${location.id}')">DELETE</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function escapeCampusText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function saveCampusLocation(event) {
    event.preventDefault();
    if (!adminClient) return;

    const id = document.getElementById("campusId").value.trim();
    const campus_name = document.getElementById("campusName").value.trim();
    const city = document.getElementById("campusCity").value.trim();
    const nearby_area = document.getElementById("campusArea").value.trim() || null;
    const radius_km = Number(document.getElementById("campusRadius").value);
    const is_active = document.getElementById("campusActive").checked;

    if (!campus_name || !city || !Number.isFinite(radius_km) || radius_km < 0 || radius_km > 100) {
        showCampusMessage("Enter a college/location, city, and a valid radius between 0 and 100 km.", "error");
        return;
    }

    const button = document.getElementById("saveCampusButton");
    button.disabled = true;
    button.textContent = id ? "UPDATING..." : "SAVING...";

    const record = { campus_name, city, nearby_area, radius_km, is_active };
    const result = id
        ? await adminClient.from("campus_locations").update(record).eq("id", id)
        : await adminClient.from("campus_locations").insert(record);

    button.disabled = false;
    button.textContent = id ? "UPDATE LOCATION" : "SAVE LOCATION";

    if (result.error) {
        showCampusMessage(`Could not save location: ${result.error.message}. Check that the SQL setup has been run in Supabase.`, "error");
        return;
    }

    showCampusMessage(id ? "Campus location updated." : "Campus location added.");
    resetCampusForm();
    await loadCampusLocations();
}

async function editCampusLocation(id) {
    const { data, error } = await adminClient
        .from("campus_locations")
        .select("id, campus_name, city, nearby_area, radius_km, is_active")
        .eq("id", id)
        .single();

    if (error || !data) {
        showCampusMessage(`Could not open this location: ${error?.message || "Record not found."}`, "error");
        return;
    }

    document.getElementById("campusId").value = data.id;
    document.getElementById("campusName").value = data.campus_name || "";
    document.getElementById("campusCity").value = data.city || "";
    document.getElementById("campusArea").value = data.nearby_area || "";
    document.getElementById("campusRadius").value = data.radius_km ?? 3;
    document.getElementById("campusActive").checked = Boolean(data.is_active);
    document.getElementById("campusFormTitle").textContent = "Edit campus or nearby area";
    document.getElementById("saveCampusButton").textContent = "UPDATE LOCATION";
    document.getElementById("campusForm").scrollIntoView({ behavior: "smooth", block: "start" });
    showCampusMessage("Edit the details and select Update Location when finished.");
}

async function deleteCampusLocation(id) {
    const confirmed = confirm("Delete this campus/area? It will no longer be available as a priority delivery option.");
    if (!confirmed) return;

    const { error } = await adminClient
        .from("campus_locations")
        .delete()
        .eq("id", id);

    if (error) {
        showCampusMessage(`Could not delete location: ${error.message}`, "error");
        return;
    }

    showCampusMessage("Campus location deleted.");
    await loadCampusLocations();
}
