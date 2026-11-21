const sections = [
    { category: "soup", block: "#dishes-soup" },
    { category: "main_course", block: "#dishes-main" },
    { category: "salad", block: "#dishes-salad" },
    { category: "drink", block: "#dishes-drink" },
    { category: "dessert", block: "#dishes-dessert" }
]

const SortDishes = () => {
    dishes.sort((a, b) => a.name.localeCompare(b.name));
}

const RenderDishes = () => {
    SortDishes();

    for (const section of sections) {
        let content = ``;

        for (const dish of dishes)
            if (dish.category === section.category)
                content += `
            <div class="dish" data-dish="${dish.keyword}" data-kind="${dish.kind}">
                <img class="dish-photo" src="${dish.image}" alt="${dish.name}" loading="lazy">
                <p class="dish-price">${dish.price} ₽</p>
                <p class="dish-name">${dish.name}</p>
                <p class="dish-weight">${dish.count}</p>
                <button class="dish-add" type="button">Добавить</button>
            </div>`;

        const section_block = document.querySelector(section.block);
        section_block.innerHTML = content;
    }
}

const FilterDishes = (filter_button) => {
    const filters_block = filter_button.closest(".filters");
    const section = sections.find(item => item.category === filters_block.dataset.category);
    const dishes_block = document.querySelector(section.block);
    const is_active = filter_button.classList.contains("active");

    for (const button of filters_block.querySelectorAll(".filter"))
        button.classList.remove("active");

    for (const dish of dishes_block.querySelectorAll(".dish"))
        dish.classList.toggle("hidden", !is_active && dish.dataset.kind !== filter_button.dataset.kind);

    if (!is_active)
        filter_button.classList.add("active");
}

document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('click', (event) => {
        const filter_button = event.target.closest(".filter");

        if (filter_button !== null) {
            FilterDishes(filter_button);
            return;
        }

        const add_button = event.target.closest(".dish-add");

        if (add_button !== null)
            AddDish(add_button);
    })

    try {
        await loadDishes();
        RenderDishes();
    } catch (error) {
        console.error(error);
        ShowNotification("Не удалось загрузить блюда");
    }
})
