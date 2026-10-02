/* =========================================
   ARIAA JEWELS
   ADMIN PANEL
========================================= */


/*
   Supabase client

   This expects supabase-config.js to create:

   const supabaseClient = window.supabaseClient;

   We will create that file next.
*/


const supabase = window.supabaseClient;


/* =========================================
   GLOBAL VARIABLES
========================================= */

let editingProductId = null;


/* =========================================
   PAGE START
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (!supabase) {

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
    } = await supabase.auth.getSession();


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

    supabase.auth.onAuthStateChange(
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
    } = await supabase.auth.signInWithPassword({

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


    await supabase.auth.signOut();

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
    } = await supabase
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
       This is useful when editing a product
       without replacing its image.
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


    /*
       Validate product name
    */

    if (!name) {

        alert(
            "Please enter a product name."
        );

        return;

    }


    /*
       Validate category
    */

    if (!category) {

        alert(
            "Please select a category."
        );

        return;

    }


    /*
       Validate price
    */

    if (
        price < 0 ||
        Number.isNaN(price)
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    /*
       Image is required for a new product.
    */

    if (
        !image &&
        !imageFile
    ) {

        alert(
            "Please choose a product image."
        );

        return;

    }


    /*
       Validate selected image
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


        /*
           Maximum image size: 10 MB
        */

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


    /*
       =========================================
       UPLOAD IMAGE TO SUPABASE STORAGE
       =========================================

       Bucket name:
       product_image
    */

    if (imageFile) {

        /*
           Make the filename safe.
        */

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


        /*
           Add timestamp so files
           do not overwrite each other.
        */

        const filePath =
            `${Date.now()}-${safeName}`;


        button.textContent =
            "UPLOADING IMAGE...";


        /*
           Upload image
        */

        const uploadResult =
            await supabase.storage
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


        /*
           Check upload error
        */

        if (
            uploadResult.error
        ) {

            console.error(
                uploadResult.error
            );


            button.disabled =
                false;


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
            supabase.storage
                .from("product_image")
                .getPublicUrl(
                    filePath
                );


        image =
            publicUrlResult
                .data
                .publicUrl;

    }


    /*
       Product data
    */

    const productData = {

        name:
            name,

        price:
            price,

        category:
            category,

        image:
            image,

        description:
            description,

        available:
            available

    };


    let result;


    /*
       =========================================
       EDIT EXISTING PRODUCT
       =========================================
    */

    if (editingProductId) {

        result =
            await supabase
                .from("products")
                .update(
                    productData
                )
                .eq(
                    "id",
                    editingProductId
                );

    }


    /*
       =========================================
       ADD NEW PRODUCT
       =========================================
    */

    else {

        result =
            await supabase
                .from("products")
                .insert([
                    productData
                ]);

    }


    button.disabled =
        false;


    button.textContent =
        "SAVE PRODUCT";


    /*
       Check database error
    */

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


    /*
       Success message
    */

    showAdminMessage(
        editingProductId
            ? "Product updated successfully."
            : "Product added successfully.",
        "success"
    );


    /*
       Reset form
    */

    resetProductForm();


    /*
       Reload products
    */

    await loadProducts();


    /*
       Show products section
    */

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
    } = await supabase
        .from("products")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (error) {

        console.error(
            error
        );


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


    /*
       Keep existing image URL.
    */

    document.getElementById(
        "productImage"
    ).value =
        data.image || "";


    /*
       Clear file picker.
       User can choose a new image if desired.
    */

    const imageFileInput =
        document.getElementById(
            "productImageFile"
        );


    if (imageFileInput) {

        imageFileInput.value =
            "";

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


    /*
       Show existing image
    */

    previewProductImage();


    /*
       Open edit section
    */

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
    } = await supabase
        .from("products")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            error
        );


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
    ).checked =
        true;


    document.getElementById(
        "productId"
    ).value =
        "";


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


    /*
       Check whether a new file was selected.
    */

    const file =
        fileInput &&
        fileInput.files &&
        fileInput.files.length
            ? fileInput.files[0]
            : null;


    /*
       Preview newly selected image.
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
       No existing image.
    */

    if (!existingImage) {

        preview.innerHTML = `

            <span>
                Image preview will appear here
            </span>

        `;


        return;

    }


    /*
       Preview existing image URL.
    */

    preview.innerHTML = `

        <img
            src="${escapeHtml(
                existingImage
            )}"
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
        .querySelectorAll(
            ".sidebar-link"
        )
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
