const comboBlocks = document.querySelectorAll(".combo[data-combo]");
const orderForm = document.querySelector(".order form");

const GetComboVariants = () => {
    const variants = [];

    for (const combo of comboBlocks)
        variants.push(combo.dataset.combo.split(" "));

    return variants;
}

const GetOrderError = () => {
    const chosen = ["soup", "main_course", "salad", "drink"].filter(category => selected[category] !== null);
    const has_soup = selected.soup !== null;
    const has_main = selected.main_course !== null;
    const has_salad = selected.salad !== null;

    if (chosen.length === 0) {
        if (selected.dessert !== null)
            return "Выберите главное блюдо";

        return "Ничего не выбрано. Выберите блюда для заказа";
    }

    const is_combo = GetComboVariants().some(variant =>
        variant.length === chosen.length && variant.every(category => chosen.includes(category))
    );

    if (is_combo)
        return null;

    if (!has_soup && !has_main && !has_salad)
        return "Выберите главное блюдо";

    if (has_soup && !has_main && !has_salad)
        return "Выберите главное блюдо/салат/стартер";

    if (has_salad && !has_soup && !has_main)
        return "Выберите суп или главное блюдо";

    return "Выберите напиток";
}

const ShowNotification = (message) => {
    const old_overlay = document.querySelector(".notification-overlay");

    if (old_overlay !== null)
        old_overlay.remove();

    const overlay = document.createElement("div");
    overlay.className = "notification-overlay";

    const notification = document.createElement("div");
    notification.className = "notification";

    const text = document.createElement("p");
    text.className = "notification-text";
    text.textContent = message;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "notification-button";
    button.textContent = "Окей 👌";

    button.addEventListener("click", () => overlay.remove());

    notification.append(text, button);
    overlay.append(notification);
    document.body.append(overlay);
}

orderForm.addEventListener("submit", (event) => {
    const error = GetOrderError();

    if (error !== null) {
        event.preventDefault();
        ShowNotification(error);
        return;
    }

    if (!orderForm.reportValidity())
        event.preventDefault();
});
