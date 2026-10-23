const sections = [
    { category: "soup", block: "#dishes-soup" },
    { category: "main_course", block: "#dishes-main" },
    { category: "drink", block: "#dishes-drink" }
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
            <div class="dish" data-dish="${dish.keyword}">
                <img class="dish-photo" src="${dish.image}" alt="${dish.name}">
                <p class="dish-price">${dish.price} ₽</p>
                <p class="dish-name">${dish.name}</p>
                <p class="dish-weight">${dish.count}</p>
                <button class="dish-add" type="button" onclick="AddDish(this)">Добавить</button>
            </div>`;

        const section_block = document.querySelector(section.block);
        section_block.insertAdjacentHTML('beforeend', content);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    RenderDishes();
})
