let dishes = [];

const dishesUrl = "/labs/api/dishes";

const loadDishes = async () => {
    const response = await fetch(dishesUrl, {
        method: "GET"
    });

    if (!response.ok)
        throw new Error("Не удалось загрузить блюда");

    const data = await response.json();

    dishes = data;
}
