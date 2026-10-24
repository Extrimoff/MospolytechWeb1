const dishes = [
    {
        keyword: "gaspacho",
        name: "Гаспачо",
        price: 195,
        category: "soup",
        kind: "veg",
        count: "350 г",
        image: "./img/soup-gaspacho.jpg"
    },
    {
        keyword: "mushroom_puree",
        name: "Грибной суп-пюре",
        price: 185,
        category: "soup",
        kind: "veg",
        count: "330 г",
        image: "./img/soup-mushroom.jpg"
    },
    {
        keyword: "norwegian_soup",
        name: "Норвежский суп",
        price: 270,
        category: "soup",
        kind: "fish",
        count: "330 г",
        image: "./img/soup-norwegian.jpg"
    },
    {
        keyword: "tomyum",
        name: "Том Ям с креветками",
        price: 365,
        category: "soup",
        kind: "fish",
        count: "350 г",
        image: "./img/soup-tomyum.jpg"
    },
    {
        keyword: "chicken_soup",
        name: "Куриный суп с лапшой",
        price: 210,
        category: "soup",
        kind: "meat",
        count: "350 г",
        image: "./img/soup-chicken.jpg"
    },
    {
        keyword: "ramen",
        name: "Рамен с курицей",
        price: 320,
        category: "soup",
        kind: "meat",
        count: "400 г",
        image: "./img/soup-ramen.jpg"
    },
    {
        keyword: "fried_potatoes_mushrooms",
        name: "Жареная картошка с грибами",
        price: 150,
        category: "main_course",
        kind: "veg",
        count: "250 г",
        image: "./img/main-potato.jpg"
    },
    {
        keyword: "lasagna",
        name: "Лазанья с овощами",
        price: 385,
        category: "main_course",
        kind: "veg",
        count: "310 г",
        image: "./img/main-lasagna.jpg"
    },
    {
        keyword: "chicken_cutlets_puree",
        name: "Котлеты из курицы с картофельным пюре",
        price: 225,
        category: "main_course",
        kind: "meat",
        count: "280 г",
        image: "./img/main-cutlets.jpg"
    },
    {
        keyword: "pepperoni_pizza",
        name: "Пицца «Пепперони»",
        price: 450,
        category: "main_course",
        kind: "meat",
        count: "450 г",
        image: "./img/main-pizza.jpg"
    },
    {
        keyword: "fish_rice",
        name: "Рыба с рисом и спаржей",
        price: 390,
        category: "main_course",
        kind: "fish",
        count: "320 г",
        image: "./img/main-fish-rice.jpg"
    },
    {
        keyword: "shrimp_pasta",
        name: "Паста с креветками",
        price: 420,
        category: "main_course",
        kind: "fish",
        count: "330 г",
        image: "./img/main-shrimp-pasta.jpg"
    },
    {
        keyword: "tuna_salad",
        name: "Салат с тунцом",
        price: 290,
        category: "salad",
        kind: "fish",
        count: "200 г",
        image: "./img/salad-tuna.jpg"
    },
    {
        keyword: "caesar_salad",
        name: "Цезарь с курицей",
        price: 320,
        category: "salad",
        kind: "meat",
        count: "220 г",
        image: "./img/salad-caesar.jpg"
    },
    {
        keyword: "caprese",
        name: "Капрезе",
        price: 250,
        category: "salad",
        kind: "veg",
        count: "180 г",
        image: "./img/salad-caprese.jpg"
    },
    {
        keyword: "egg_salad",
        name: "Салат с яйцом и овощами",
        price: 190,
        category: "salad",
        kind: "veg",
        count: "200 г",
        image: "./img/salad-egg.jpg"
    },
    {
        keyword: "french_fries",
        name: "Картофель фри",
        price: 150,
        category: "salad",
        kind: "veg",
        count: "150 г",
        image: "./img/salad-fries.jpg"
    },
    {
        keyword: "french_fries_cheese",
        name: "Картофель фри с сырным соусом",
        price: 180,
        category: "salad",
        kind: "veg",
        count: "180 г",
        image: "./img/salad-fries-cheese.jpg"
    },
    {
        keyword: "orange_juice",
        name: "Апельсиновый сок",
        price: 120,
        category: "drink",
        kind: "cold",
        count: "300 мл",
        image: "./img/drink-orange.jpg"
    },
    {
        keyword: "apple_juice",
        name: "Яблочный сок",
        price: 90,
        category: "drink",
        kind: "cold",
        count: "300 мл",
        image: "./img/drink-apple.jpg"
    },
    {
        keyword: "carrot_juice",
        name: "Морковный сок",
        price: 110,
        category: "drink",
        kind: "cold",
        count: "300 мл",
        image: "./img/drink-carrot.jpg"
    },
    {
        keyword: "black_tea",
        name: "Чай чёрный",
        price: 80,
        category: "drink",
        kind: "hot",
        count: "300 мл",
        image: "./img/drink-tea.jpg"
    },
    {
        keyword: "green_tea",
        name: "Чай зелёный",
        price: 80,
        category: "drink",
        kind: "hot",
        count: "300 мл",
        image: "./img/drink-green-tea.jpg"
    },
    {
        keyword: "cappuccino",
        name: "Капучино",
        price: 150,
        category: "drink",
        kind: "hot",
        count: "250 мл",
        image: "./img/drink-cappuccino.jpg"
    },
    {
        keyword: "baklava",
        name: "Пахлава",
        price: 120,
        category: "dessert",
        kind: "small",
        count: "90 г",
        image: "./img/dessert-baklava.jpg"
    },
    {
        keyword: "cheesecake",
        name: "Чизкейк",
        price: 220,
        category: "dessert",
        kind: "small",
        count: "120 г",
        image: "./img/dessert-cheesecake.jpg"
    },
    {
        keyword: "chocolate_cheesecake",
        name: "Шоколадный чизкейк",
        price: 240,
        category: "dessert",
        kind: "small",
        count: "130 г",
        image: "./img/dessert-chocolate-cheesecake.jpg"
    },
    {
        keyword: "chocolate_cake",
        name: "Шоколадный торт",
        price: 210,
        category: "dessert",
        kind: "medium",
        count: "180 г",
        image: "./img/dessert-chocolate-cake.jpg"
    },
    {
        keyword: "donuts_3",
        name: "Пончики с глазурью (3 шт.)",
        price: 190,
        category: "dessert",
        kind: "medium",
        count: "240 г",
        image: "./img/dessert-donuts-3.jpg"
    },
    {
        keyword: "donuts_6",
        name: "Пончики с глазурью (6 шт.)",
        price: 350,
        category: "dessert",
        kind: "large",
        count: "480 г",
        image: "./img/dessert-donuts.jpg"
    }
]
