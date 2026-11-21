const AddDish = (button) => {
    const card = button.closest(".dish");
    const dish = dishes.find(item => item.id === Number(card.dataset.id));

    if (dish === undefined)
        return;

    selected[dish.category] = dish;

    for (const item of card.parentElement.querySelectorAll(".dish"))
        item.classList.remove("selected");

    card.classList.add("selected");

    SaveOrderIds();
    RenderCheckoutPanel();
}

const RenderCheckoutPanel = () => {
    const panel = document.querySelector("#checkout-panel");
    const total_block = document.querySelector("#checkout-total");
    const link = document.querySelector("#checkout-link");

    if (panel === null)
        return;

    const is_empty = Object.values(selected).every(dish => dish === null);
    panel.classList.toggle("hidden", is_empty);

    if (is_empty)
        return;

    total_block.textContent = `${GetOrderTotal()} ₽`;

    const is_valid = GetOrderError() === null;
    link.classList.toggle("disabled", !is_valid);
    link.setAttribute("aria-disabled", String(!is_valid));

    if (is_valid)
        link.setAttribute("href", "./order.html");
    else
        link.removeAttribute("href");
}

const RestoreOrder = () => {
    LoadSelected();

    const ids = Object.values(selected).filter(dish => dish !== null).map(dish => dish.id);

    for (const card of document.querySelectorAll(".dish"))
        card.classList.toggle("selected", ids.includes(Number(card.dataset.id)));

    RenderCheckoutPanel();
}
