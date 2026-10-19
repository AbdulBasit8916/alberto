document.addEventListener("DOMContentLoaded", () => {
    
    const pageLoader = document.getElementById("page-loader");
    const percentText = document.getElementById("loader-percent");
    let currentPercent = 0;
    const duration = 1800;
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const counterInterval = setInterval(() => {
        currentPercent += step;
        if (currentPercent >= 100) {
            currentPercent = 100;
            clearInterval(counterInterval);
            if (percentText) percentText.textContent = "100";
            setTimeout(() => {
                if (!pageLoader) return;
                pageLoader.style.transition = "opacity .6s ease, visibility .6s ease";
                pageLoader.style.opacity = "0";
                pageLoader.style.visibility = "hidden";
                setTimeout(() => pageLoader.style.display = "none", 650);
            }, 200);
        } else if (percentText) {
            percentText.textContent = Math.floor(currentPercent);
        }
    }, intervalTime);

    
    const navbar = document.querySelector(".navbar");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const searchButton = document.querySelector('.nav-icon[aria-label="Search"]');
    const searchWrap = document.querySelector(".search-bar-wrap");
    const searchForm = document.getElementById("site-search");
    const searchInput = document.getElementById("site-search-input");
    const searchClose = document.querySelector(".search-close");
    const wishlistButton = document.querySelector('.nav-icon[aria-label="Wishlist"]');
    const cartButton = document.querySelector(".cart-button");
    const productCards = [...document.querySelectorAll(".watch-product")];
    const filterButtons = [...document.querySelectorAll(".filter-btn")];
    const productCount = document.getElementById("productCount");

    
    let cart = JSON.parse(localStorage.getItem("horologiaCart") || "[]");
    let wishlist = JSON.parse(localStorage.getItem("horologiaWishlist") || "[]");

    const saveState = () => {
        localStorage.setItem("horologiaCart", JSON.stringify(cart));
        localStorage.setItem("horologiaWishlist", JSON.stringify(wishlist));
    };

    const money = value => Number(value || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });

    const getProduct = card => ({
        name: card.querySelector("h3")?.textContent.trim() || "Horologia Timepiece",
        price: Number((card.querySelector(".product-price")?.textContent || "0").replace(/[^0-9.]/g, "")) || 0,
        image: card.querySelector("img")?.getAttribute("src") || "",
        category: card.dataset.category || "all",
        specs: [...card.querySelectorAll(".product-bottom span")].map(x => x.textContent.trim()).join(" • ")
    });

    
    const toast = message => {
        let el = document.querySelector(".horologia-toast");
        if (!el) {
            el = document.createElement("div");
            el.className = "horologia-toast";
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove("show"), 2200);
    };

    
    const updateNavbar = () => navbar?.classList.toggle("scrolled", window.scrollY > 30);
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });

    const setMobileMenuState = open => {
        navLinks?.classList.toggle("mobile-open", open);
        if (menuToggle) {
            menuToggle.innerHTML = open
                ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }
    };

    const closeMobileMenu = () => setMobileMenuState(false);

    menuToggle?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = navLinks?.classList.contains("mobile-open") || false;
        setMobileMenuState(!isOpen);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMobileMenu();
    });

    document.addEventListener("click", event => {
        if (!navLinks?.classList.contains("mobile-open")) return;
        if (navLinks.contains(event.target) || menuToggle?.contains(event.target)) return;
        closeMobileMenu();
    });

    
    const scrollToTarget = selector => {
        const target = document.querySelector(selector);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    document.querySelectorAll('.nav-links a, .hero-buttons a, .text-link').forEach(link => {
        link.addEventListener("click", event => {
            const href = link.getAttribute("href");
            if (!href?.startsWith("#")) return;
            event.preventDefault();
            closeMobileMenu();
            if (href === "#" || href === "#home") window.scrollTo({ top: 0, behavior: "smooth" });
            else scrollToTarget(href);
        });
    });

    document.querySelector(".logo")?.addEventListener("click", event => {
        event.preventDefault();
        closeMobileMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".nav-links a").forEach(x => x.classList.remove("active"));
            link.classList.add("active");
        });
    });

    
    const applyFilter = filter => {
        let visible = 0;
        const shownCategories = new Set();

        productCards.forEach(card => {
            const category = card.dataset.category || "";
            const isAll = filter === "all";

            // In ALL view show exactly ONE watch card from each category.
            const match = isAll
                ? !shownCategories.has(category)
                : category === filter;

            if (isAll && match) shownCategories.add(category);

            card.classList.toggle("is-hidden", !match);
            if (match) visible++;

            const carousel = card.querySelector(".watch-carousel");
            if (carousel) {
                if (!isAll && match) {
                    carousel.classList.remove("all-static");
                    carousel._start?.();
                } else {
                    carousel.classList.add("all-static");
                    carousel._stop?.();
                    carousel._show?.(0);
                }
            }
        });

        if (productCount) productCount.textContent = String(visible).padStart(2, "0");
    };

    const activateFilter = filter => {
        const button = filterButtons.find(btn => btn.dataset.filter === filter);
        filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
        applyFilter(filter);
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => activateFilter(button.dataset.filter || "all"));
    });
    activateFilter("all");

    
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            document.querySelectorAll(".category-item").forEach(x => x.classList.remove("active"));
            item.classList.add("active");
            const name = item.querySelector("strong")?.textContent.trim().toLowerCase();
            const map = { luxury: "luxury", chronograph: "chronograph", field: "field", classic: "classic", smart: "smart" };
            activateFilter(map[name] || "all");
            scrollToTarget("#featured");
        });
    });

    
    const panel = document.createElement("div");
    panel.className = "store-panel-wrap";
    panel.innerHTML = `
        <div class="store-panel-backdrop"></div>
        <aside class="store-panel" aria-label="Shopping panel">
            <button class="store-panel-close" aria-label="Close panel"><i class="fa-solid fa-xmark"></i></button>
            <span class="store-panel-kicker">HOROLOGIA</span>
            <h3 class="store-panel-title">YOUR BAG</h3>
            <div class="store-panel-content"></div>
        </aside>`;
    document.body.appendChild(panel);

    const panelContent = panel.querySelector(".store-panel-content");
    const closePanel = () => panel.classList.remove("open");
    panel.querySelector(".store-panel-close").addEventListener("click", closePanel);
    panel.querySelector(".store-panel-backdrop").addEventListener("click", closePanel);

    const updateCounts = () => {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
        document.querySelectorAll(".wishlist-count").forEach(el => el.textContent = wishlist.length);
    };

    const renderCart = () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        panel.querySelector(".store-panel-title").textContent = "YOUR BAG";

        if (!cart.length) {
            panelContent.innerHTML = `
                <div class="panel-empty"><i class="fa-solid fa-bag-shopping"></i><h4>Your bag is empty</h4><p>Add a timepiece to see it here.</p><button class="panel-action" data-action="shop">EXPLORE WATCHES</button></div>`;
            return;
        }

        panelContent.innerHTML = `
            <div class="panel-items">
                ${cart.map((item, index) => `
                    <div class="panel-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="panel-item-info">
                            <strong>${item.name}</strong>
                            <span>${money(item.price)}</span>
                            <div class="qty-controls">
                                <button data-action="minus" data-index="${index}">−</button>
                                <span>${item.qty}</span>
                                <button data-action="plus" data-index="${index}">+</button>
                                <button class="remove-item" data-action="remove" data-index="${index}">Remove</button>
                            </div>
                        </div>
                    </div>`).join("")}
            </div>
            <div class="panel-total"><span>Subtotal</span><strong>${money(total)}</strong></div>
            <button class="panel-action full" data-action="checkout">CHECKOUT</button>
            <button class="panel-secondary" data-action="clear">CLEAR BAG</button>`;
    };

    const renderWishlist = () => {
        panel.querySelector(".store-panel-title").textContent = "YOUR WISHLIST";
        if (!wishlist.length) {
            panelContent.innerHTML = `<div class="panel-empty"><i class="fa-regular fa-heart"></i><h4>Your wishlist is empty</h4><p>Tap the heart on a watch to save it.</p><button class="panel-action" data-action="shop">EXPLORE WATCHES</button></div>`;
            return;
        }
        panelContent.innerHTML = `
            <div class="panel-items">
                ${wishlist.map((item, index) => `
                    <div class="panel-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="panel-item-info"><strong>${item.name}</strong><span>${money(item.price)}</span>
                        <button class="remove-item" data-action="wishlist-remove" data-index="${index}">Remove</button></div>
                    </div>`).join("")}
            </div>`;
    };

    const renderCheckout = () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        panel.querySelector(".store-panel-title").textContent = "CHECKOUT";
        panelContent.innerHTML = `
            <form class="checkout-form" id="horologia-checkout-form">
                <div class="checkout-summary">
                    <span>Order total</span>
                    <strong>${money(total)}</strong>
                </div>
                <label>Full Name<input name="name" type="text" placeholder="Your name" required></label>
                <label>Email<input name="email" type="email" placeholder="you@example.com" required></label>
                <label>Phone<input name="phone" type="tel" placeholder="03XX-XXXXXXX" required></label>
                <label>Delivery Address<textarea name="address" rows="3" placeholder="Your delivery address" required></textarea></label>
                <button class="panel-action full" type="submit">PLACE DEMO ORDER</button>
                <button class="panel-secondary" type="button" data-action="back-cart">BACK TO BAG</button>
            </form>`;

        panelContent.querySelector("#horologia-checkout-form").addEventListener("submit", event => {
            event.preventDefault();
            const form = event.currentTarget;
            const name = form.elements.name.value.trim();
            cart = [];
            saveState();
            updateCounts();
            panelContent.innerHTML = `
                <div class="panel-empty order-success">
                    <i class="fa-solid fa-circle-check"></i>
                    <h4>Order received, ${name}</h4>
                    <p>This is a demo checkout. No real payment has been processed.</p>
                    <button class="panel-action" data-action="shop">CONTINUE SHOPPING</button>
                </div>`;
            toast("Demo order placed successfully");
        });
    };

    const openCart = () => { renderCart(); panel.classList.add("open"); };
    const openWishlist = () => { renderWishlist(); panel.classList.add("open"); };

    panelContent.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const action = button.dataset.action;
        const index = Number(button.dataset.index);

        if (action === "plus") cart[index].qty++;
        if (action === "minus") cart[index].qty = Math.max(1, cart[index].qty - 1);
        if (action === "remove") cart.splice(index, 1);
        if (action === "wishlist-remove") wishlist.splice(index, 1);
        if (action === "clear") cart = [];
        if (action === "checkout") {
            renderCheckout();
            return;
        }
        if (action === "shop") {
            closePanel();
            scrollToTarget("#featured");
            return;
        }
        if (action === "back-cart") {
            renderCart();
            return;
        }

        saveState();
        updateCounts();
        action === "wishlist-remove" ? renderWishlist() : renderCart();
    });

    cartButton?.addEventListener("click", openCart);
    wishlistButton?.addEventListener("click", openWishlist);

    
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const card = button.closest(".watch-product");
        if (!card) return;
        const name = card.querySelector("h3")?.textContent.trim();
        if (wishlist.some(x => x.name === name)) {
            button.classList.add("is-liked");
            const icon = button.querySelector("i");
            if (icon) icon.className = "fa-solid fa-heart";
        }

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const product = getProduct(card);
            const exists = wishlist.some(x => x.name === product.name);
            if (exists) {
                wishlist = wishlist.filter(x => x.name !== product.name);
                button.classList.remove("is-liked");
                button.querySelector("i")?.classList.replace("fa-solid", "fa-regular");
                toast("Removed from your wishlist");
            } else {
                wishlist.push(product);
                button.classList.add("is-liked");
                const icon = button.querySelector("i");
                if (icon) icon.className = "fa-solid fa-heart";
                toast("Added to your wishlist");
            }
            saveState();
            updateCounts();
        });
    });

    
    const modal = document.createElement("div");
    modal.className = "horologia-modal";
    modal.innerHTML = `
        <div class="horologia-modal-card" role="dialog" aria-modal="true">
            <button class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-watch-image"><img alt="Watch preview"></div>
            <div class="modal-copy">
                <span class="modal-label">HOROLOGIA TIMEPIECE</span>
                <h3 class="modal-title">Watch</h3>
                <strong class="modal-price"></strong>
                <p class="modal-description"></p>
                <button class="btn btn-primary modal-add">ADD TO BAG <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    let selectedProduct = null;
    const closeModal = () => modal.classList.remove("open");
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });

    document.querySelectorAll(".quick-view").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            const card = button.closest(".watch-product");
            if (!card) return;
            selectedProduct = getProduct(card);
            modal.querySelector(".modal-label").textContent = card.querySelector(".product-category")?.textContent.trim() || "HOROLOGIA COLLECTION";
            modal.querySelector(".modal-title").textContent = selectedProduct.name;
            modal.querySelector(".modal-price").textContent = money(selectedProduct.price);
            modal.querySelector(".modal-description").textContent = `${selectedProduct.specs || "Precision movement"}. A refined Horologia timepiece designed around precision and timeless character.`;
            modal.querySelector(".modal-watch-image img").src = selectedProduct.image;
            modal.classList.add("open");
        });
    });

    modal.querySelector(".modal-add").addEventListener("click", () => {
        if (!selectedProduct) return;
        const existing = cart.find(item => item.name === selectedProduct.name);
        if (existing) existing.qty++;
        else cart.push({ ...selectedProduct, qty: 1 });
        saveState();
        updateCounts();
        closeModal();
        toast("Timepiece added to your bag");
    });

    
    document.addEventListener("click", event => {
        const add = event.target.closest("[data-add-to-bag], .add-to-bag, .add-bag, .add-to-cart");
        if (!add) return;
        const card = add.closest(".watch-product");
        if (!card) return;
        const product = getProduct(card);
        const existing = cart.find(item => item.name === product.name);
        if (existing) existing.qty++;
        else cart.push({ ...product, qty: 1 });
        saveState();
        updateCounts();
        toast("Timepiece added to your bag");
    });

    
    const closeSearch = () => {
        searchWrap?.classList.remove("open");
        searchWrap?.setAttribute("aria-hidden", "true");
        document.querySelectorAll(".watch-product").forEach(card => card.classList.remove("search-hidden"));
    };

    searchButton?.addEventListener("click", () => {
        searchWrap?.classList.toggle("open");
        const open = searchWrap?.classList.contains("open");
        searchWrap?.setAttribute("aria-hidden", open ? "false" : "true");
        if (open) setTimeout(() => searchInput?.focus(), 80);
    });

    searchClose?.addEventListener("click", closeSearch);

    searchForm?.addEventListener("submit", event => {
        event.preventDefault();
        const normalized = (searchInput?.value || "").trim().toLowerCase();
        if (!normalized) {
            toast("Type a watch name or collection");
            searchInput?.focus();
            return;
        }
        const matches = productCards.filter(card => card.textContent.toLowerCase().includes(normalized));
        if (!matches.length) {
            toast("No matching timepiece found");
            return;
        }
        activateFilter("all");
        closeSearch();
        matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
        matches[0].animate([
            { transform: "scale(1)" },
            { transform: "scale(1.025)" },
            { transform: "scale(1)" }
        ], { duration: 700 });
        toast(`${matches.length} matching timepiece${matches.length > 1 ? "s" : ""} found`);
    });


    // ALBERTO analog watch hands: follow the current Karachi local time.
    const updateWatchHands = () => {
        const now = new Date();
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).formatToParts(now);
        const part = type => Number(parts.find(item => item.type === type)?.value || 0);
        const hours = part("hour") % 12;
        const minutes = part("minute");
        const seconds = part("second");
        const hourHand = document.querySelector(".hour-hand");
        const minuteHand = document.querySelector(".minute-hand");
        const secondHand = document.querySelector(".second-hand");
        if (hourHand) hourHand.style.transform = `rotate(${hours * 30 + minutes * 0.5}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minutes * 6 + seconds * 0.1}deg)`;
        if (secondHand) secondHand.style.transform = `rotate(${seconds * 6}deg)`;
    };
    updateWatchHands();
    setInterval(updateWatchHands, 1000);

    // ALBERTO live ribbon: keep the existing clock/date/location ribbon working.
    const ribbonTime = document.getElementById("ribbon-time");
    const ribbonDate = document.getElementById("ribbon-date");
    const updateRibbonClock = () => {
        const now = new Date();
        const timeOptions = { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
        const dateOptions = { timeZone: "Asia/Karachi", weekday: "short", day: "2-digit", month: "short", year: "numeric" };
        if (ribbonTime) ribbonTime.textContent = new Intl.DateTimeFormat("en-PK", timeOptions).format(now);
        if (ribbonDate) ribbonDate.textContent = new Intl.DateTimeFormat("en-PK", dateOptions).format(now);
    };
    updateRibbonClock();
    setInterval(updateRibbonClock, 1000);

    // Basic offline chat only. Keep the existing Luxury, Best value and Chronographs prompts.
    const aiWidget = document.querySelector(".horologia-ai");
    const aiLauncher = document.querySelector(".ai-launcher");
    const aiClose = document.querySelector(".ai-close");
    const aiPanel = document.querySelector(".ai-panel");
    const aiMessages = document.getElementById("ai-messages");
    const aiForm = document.getElementById("ai-form");
    const aiInput = document.getElementById("ai-input");

    const openAIChat = () => {
        aiWidget?.classList.add("open");
        aiPanel?.setAttribute("aria-hidden", "false");
        aiInput?.focus();
    };
    const closeAIChat = () => {
        aiWidget?.classList.remove("open");
        aiPanel?.setAttribute("aria-hidden", "true");
    };
    aiLauncher?.addEventListener("click", () => {
        if (aiWidget?.classList.contains("open")) closeAIChat();
        else openAIChat();
    });
    aiClose?.addEventListener("click", closeAIChat);

    const addAIMessage = (message, sender) => {
        if (!aiMessages) return;
        const bubble = document.createElement("div");
        bubble.className = `ai-message ${sender === "user" ? "ai-user" : "ai-bot"}`;
        bubble.textContent = message;
        aiMessages.appendChild(bubble);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    };
    const answerBasicQuestion = (rawQuestion) => {
        const question = rawQuestion.trim().toLowerCase();
        if (/^(hi|hello|hey|salam|assalam ?o ?alaikum)[!. ]*$/.test(question)) return "Hello! Welcome to ALBERTO Watches.";
        if (question.includes("what is alberto") || question.includes("who are you") || question.includes("about alberto")) return "ALBERTO is a luxury watch brand. Explore our collections to find your timepiece.";
        if (question.includes("thank")) return "You're welcome! Thank you for visiting ALBERTO.";
        if (question === "bye" || question.includes("goodbye")) return "Goodbye! Have a great day.";
        if (question.includes("luxury")) {
            activateFilter("luxury");
            scrollToTarget("#featured");
            return "Here is our Luxury collection.";
        }
        if (question.includes("chronograph")) {
            activateFilter("chronograph");
            scrollToTarget("#featured");
            return "Here are our Chronograph watches.";
        }
        if (question.includes("cheapest") || question.includes("best value") || question.includes("lowest price")) {
            const pricedCards = productCards.map(card => ({ card, product: getProduct(card) })).filter(item => item.product.price > 0);
            if (pricedCards.length) {
                pricedCards.sort((a, b) => a.product.price - b.product.price);
                activateFilter("all");
                pricedCards[0].card.classList.remove("is-hidden");
                pricedCards[0].card.scrollIntoView({ behavior: "smooth", block: "center" });
                return `Our lowest-priced listed watch is ${pricedCards[0].product.name} at ${money(pricedCards[0].product.price)}.`;
            }
            return "Please explore the collection to compare watch prices.";
        }
        return "I can help with Luxury, Best value, or Chronographs. Please choose one of those options.";
    };

    aiForm?.addEventListener("submit", event => {
        event.preventDefault();
        const question = aiInput?.value.trim();
        if (!question) return;
        addAIMessage(question, "user");
        addAIMessage(answerBasicQuestion(question), "bot");
        if (aiInput) aiInput.value = "";
    });
    document.querySelectorAll("[data-ai-prompt]").forEach(button => {
        button.addEventListener("click", () => {
            const question = button.getAttribute("data-ai-prompt") || button.textContent.trim();
            addAIMessage(question, "user");
            addAIMessage(answerBasicQuestion(question), "bot");
        });
    });

    // Failsafe: hide the loader if a future visual animation does not finish.
    setTimeout(() => {
        if (!pageLoader || pageLoader.style.display === "none") return;
        pageLoader.classList.add("loader-hidden");
        pageLoader.style.opacity = "0";
        pageLoader.style.visibility = "hidden";
        setTimeout(() => { if (pageLoader) pageLoader.style.display = "none"; }, 650);
    }, 5000);

});


/* Contact form validation */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const fields = {
        name: {
            input: document.getElementById("contact-name"),
            error: document.getElementById("name-error"),
            validate: value => value.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters)."
        },
        email: {
            input: document.getElementById("contact-email"),
            error: document.getElementById("email-error"),
            validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Please enter a valid email address."
        },
        message: {
            input: document.getElementById("contact-message"),
            error: document.getElementById("message-error"),
            validate: value => value.trim().length >= 10 ? "" : "Message must be at least 10 characters."
        }
    };

    const validateField = field => {
        const message = field.validate(field.input.value);
        field.error.textContent = message;
        field.input.classList.toggle("invalid", Boolean(message));
        field.input.setAttribute("aria-invalid", message ? "true" : "false");
        return !message;
    };

    Object.values(fields).forEach(field => {
        field.input.addEventListener("blur", () => validateField(field));
        field.input.addEventListener("input", () => {
            if (field.input.classList.contains("invalid")) validateField(field);
        });
    });

    // Navbar theme switcher: remembers the visitor's choice in this browser.
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
        const allowedThemes = ["classic", "gold"];
        let savedTheme = "classic";
        try { savedTheme = localStorage.getItem("alberto-theme") || "classic"; } catch (error) {}
        if (!allowedThemes.includes(savedTheme)) savedTheme = "classic";
        document.body.dataset.theme = savedTheme;
        themeSelect.value = savedTheme;
        themeSelect.addEventListener("change", () => {
            const selectedTheme = allowedThemes.includes(themeSelect.value) ? themeSelect.value : "classic";
            document.body.dataset.theme = selectedTheme;
            try { localStorage.setItem("alberto-theme", selectedTheme); } catch (error) {}
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const valid = Object.values(fields).map(validateField).every(Boolean);
        const status = document.getElementById("form-status");
        if (!valid) {
            status.textContent = "Please correct the highlighted fields and try again.";
            const firstInvalid = form.querySelector(".invalid");
            if (firstInvalid) firstInvalid.focus();
            return;
        }
        // Show a success message in place of the form; leave the location map untouched.
        let successMessage = document.getElementById("contact-success-message");
        if (!successMessage) {
            successMessage = document.createElement("div");
            successMessage.id = "contact-success-message";
            successMessage.setAttribute("role", "status");
            successMessage.style.cssText = "padding:24px 20px;margin-top:12px;border:1px solid rgba(201,164,92,.45);color:#c9a45c;background:rgba(201,164,92,.08);font-size:16px;line-height:1.6;";
            successMessage.textContent = "Message Has Been Sent Successfully!";
            form.insertAdjacentElement("afterend", successMessage);
        }
        form.style.display = "none";
    });
});
