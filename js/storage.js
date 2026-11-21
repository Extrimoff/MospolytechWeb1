const orderStorageKey = "foodConstructOrder";
const apiKey = new URLSearchParams(location.search).get("api_key") ?? "demo";

const categories = [
    { id: "soup", title: "Суп", empty: "Не выбран" },
    { id: "main_course", title: "Главное блюдо", empty: "Не выбрано" },
    { id: "salad", title: "Салат или стартер", empty: "Не выбран" },
    { id: "drink", title: "Напиток", empty: "Не выбран" },
    { id: "dessert", title: "Десерт", empty: "Не выбран" }
]

const selected = {
    soup: null,
    main_course: null,
    salad: null,
    drink: null,
    dessert: null
}

const ReadOrderIds = () => {
    const stored = localStorage.getItem(orderStorageKey);

    if (stored === null)
        return {};

    try {
        const ids = JSON.parse(stored);

        if (typeof ids !== "object" || ids === null)
            return {};

        return ids;
    } catch {
        return {};
    }
}

const SaveOrderIds = () => {
    const ids = {};

    for (const category of categories)
        ids[category.id] = selected[category.id] === null ? null : selected[category.id].id;

    localStorage.setItem(orderStorageKey, JSON.stringify(ids));
}

const ClearOrder = () => {
    for (const category of categories)
        selected[category.id] = null;

    localStorage.removeItem(orderStorageKey);
}

const LoadSelected = () => {
    const ids = ReadOrderIds();

    for (const category of categories) {
        const id = Number(ids[category.id]);

        selected[category.id] = dishes.find(dish => dish.id === id && dish.category === category.id) ?? null;
    }
}

const GetOrderTotal = () => {
    let total = 0;

    for (const category of categories)
        if (selected[category.id] !== null)
            total += selected[category.id].price;

    return total;
}
