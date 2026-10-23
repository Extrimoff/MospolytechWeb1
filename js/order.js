const selected = {
    soup: null,
    main_course: null,
    drink: null
}

const categories = [
    { id: "soup", title: "Суп", empty: "Блюдо не выбрано" },
    { id: "main_course", title: "Главное блюдо", empty: "Блюдо не выбрано" },
    { id: "drink", title: "Напиток", empty: "Напиток не выбран" }
]

const AddDish = (_this) => {
    const card = _this.closest(".dish");
    const dish = dishes.find(item => item.keyword === card.dataset.dish);

    selected[dish.category] = dish;

    for (const item of document.querySelectorAll(".dish"))
        item.classList.remove("selected");
    card.classList.add("selected");

    document.querySelector(`#hidden-${dish.category}`).value = dish.keyword;

    RenderOrder();
}

const RenderOrder = () => {
    const order_block = document.querySelector("#order-content");
    const total_block = document.querySelector("#order-total");

    if (Object.values(selected).every(dish => dish === null)) {
        order_block.innerHTML = `<p class="order-empty">Ничего не выбрано</p>`;
        total_block.innerHTML = ``;
        return;
    }

    let content = ``;
    let total = 0;

    for (const category of categories) {
        const dish = selected[category.id];

        content += `<div class="order-category">
            <h4>${category.title}</h4>`;

        if (dish === null)
            content += `<p class="order-empty_category">${category.empty}</p>`;
        else {
            content += `<p class="order-dish"><span>${dish.name}</span><span>${dish.price} ₽</span></p>`;
            total += dish.price;
        }

        content += `</div>`;
    }

    order_block.innerHTML = content;
    total_block.innerHTML = `<div class="order-total">
        <span>Стоимость заказа</span>
        <span>${total} ₽</span>
    </div>`;
}

const ResetOrder = () => {
    for (const category of categories) {
        selected[category.id] = null;
        document.querySelector(`#hidden-${category.id}`).value = "";
    }

    for (const item of document.querySelectorAll(".dish"))
        item.classList.remove("selected");

    RenderOrder();
}

document.addEventListener('DOMContentLoaded', () => {
    RenderOrder();
})
