/* =========================================
   ARIAA JEWELS
   ADMIN PANEL
========================================= */

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


    const {
        data: {
            session
        }
    } = await adminClient.auth.getSession();


    if (session) {

        showAdminPanel(session.user);

    } else {

        showLoginScreen();

    }


    adminClient.auth.onAuthStateChange(
        (event, session) => {

            if (session) {

                showAdminPanel(session.user);

            } else {

                showLoginScreen();

            }

        }
    );


    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginAdmin
        );

    }


    const productForm =
        document.getElementById("productForm");


    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
        );

    }


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


    const imageFileInput =
        document.getElementById(
            "productImageFile"
        );


    const imageFile =
        imageFileInput &&
        imageFileInput.files
            ? imageFileInput.files[0]
            : null;


    const existingImage =
        document
            .getElementById("productImage")
            .value
            .trim();


    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();


    const available =
        document
            .getElementById("productAvailable")
            .checked;


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


    if (
        !editingProductId &&
        !imageFile &&
        !existingImage
    ) {

        alert(
            "Please choose a product image."
        );

        return;

    }


    if (imageFile) {

        if (
            !imageFile.type.startsWith("image/")
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
            ? (
                imageFile
                    ? "UPLOADING..."
                    : "UPDATING..."
            )
            : "UPLOADING...";


    try {

        let image =
            existingImage;


        /* =====================================
           UPLOAD IMAGE TO SUPABASE STORAGE
        ===================================== */

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

                throw uploadResult.error;

            }


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


        if (!image) {

            throw new Error(
                "Could not determine the product image URL."
            );

        }


        /* =====================================
           PRODUCT DATA
        ===================================== */

        const productData = {

            name: name,

            price: price,

            category: category,

            image: image,

            description: description,

            available: available

        };


        let result;


        /* =====================================
           UPDATE EXISTING PRODUCT
        ===================================== */

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


        /* =====================================
           INSERT NEW PRODUCT
        ===================================== */

        else {

            result =
                await adminClient
                    .from("products")
                    .insert([
                        productData
                    ]);

        }


        if (result.error) {

            throw result.error;

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


    catch (error) {

        console.error(error);


        showAdminMessage(
            error.message ||
            "Could not save product.",
            "error"
        );

    }


    finally {

        button.disabled = false;

        button.textContent =
            "SAVE PRODUCT";

    }

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
    ).value =
        id;


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


    document.getElementById(
        "productImage"
    ).value =
        data.image || "";


    document.getElementById(
        "productImageFile"
    ).value =
        "";


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
        fileInput.files
            ? fileInput.files[0]
            : null;


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


    if (existingImage) {

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


        return;

    }


    preview.innerHTML = `

        <span>
            Image preview will appear here
        </span>

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
        .querySelectorAll(".admin-section")
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


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
        .querySelectorAll(".sidebar-link")
        .forEach(
            link => {

                link.classList.remove(
                    "active"
                );

            }
        );


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


    setTimeout(
        () => {

            element.className =
                "admin-message";

            element.textContent =
                "";

        },
        5000
    );

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
