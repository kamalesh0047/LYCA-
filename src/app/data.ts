export type ProductGroup = { name: string; items: string[] }
export type Category = {
  id: string
  title: string
  shortTitle: string
  description: string
  image: string
  groups: ProductGroup[]
  note?: string
}

const images = {
  fruit: "/images/fruit.jpg",
  citrus: "/images/citrus.jpg",
  mango: "/images/mango.jpg",
  coconut: "/images/coconut.jpg",
  coffee: "/images/coffee.jpg",
  dairy: "/images/dairy.jpg",
  berries: "/images/berries.jpg",
  powder: "/images/powder.jpg",
  colors: "/images/colors.jpg",
}

export { images }

export const categories: Category[] = [
  {
    id: "juice-concentrates",
    title: "Juice Concentrates, Purees, Pulps & Pastes",
    shortTitle: "Juice & Fruit Ingredients",
    description:
      "A broad fruit and vegetable portfolio for beverage, dairy, bakery, sauce, and food manufacturing applications.",
    image: images.mango,
    groups: [
      {
        name: "Mango",
        items: [
          "Alphonso Mango Pulp",
          "Totapuri Mango Pulp / Concentrate",
          "Kesar Mango Pulp",
          "Sindhura Mango Pulp",
          "Tommy Atkins Mango Puree",
          "Magdalena Mango Puree",
        ],
      },
      {
        name: "Guava",
        items: [
          "White Guava Juice Concentrate / Pulp",
          "Pink Guava Juice Concentrate / Pulp",
        ],
      },
      {
        name: "Tomato",
        items: [
          "Tomato Paste 36–38 (CB & HB)",
          "Tomato Paste 30–32 (CB & HB)",
          "Tomato Paste 28–30 (CB & HB)",
          "Dehydrated Tomato Flakes",
        ],
      },
      {
        name: "Chilli, Pepper, Ginger & Garlic",
        items: [
          "Red and Green Chilli Puree",
          "Cayenne Pepper Paste",
          "Fermented Red Chilli Paste",
          "Red and Green Ripened Chilli Paste",
          "Ginger Puree",
          "Garlic Paste",
        ],
      },
      {
        name: "Other Concentrates & Purees",
        items: [
          "Frozen Concentrated Orange Juice",
          "Apple Juice Concentrate / Puree / NFC",
          "Red Grape Juice Concentrate",
          "White Grape Juice Concentrate",
          "Sweetening Compound",
          "Low Acid White Grape Juice Concentrate",
          "Pineapple Juice Concentrate",
          "Deionized Pineapple Juice Concentrate",
          "Mixed Fruit Juice Concentrate",
          "Strawberry Puree",
          "Pomegranate Juice Concentrate",
          "Apricot Puree / Diced / Halves / Juice Concentrate",
          "Pear and Peach Juice Concentrate / Puree",
        ],
      },
    ],
    note: "Brochure packaging formats include aseptic packs, aseptic bins, cans, frozen products, and concentrates. Sizes vary by format, and availability should be confirmed for each product.",
  },
  {
    id: "coconut-products",
    title: "Coconut Products",
    shortTitle: "Coconut Products",
    description:
      "Versatile coconut ingredients for confectionery, bakery, beverage, culinary, and prepared food applications.",
    image: images.coconut,
    groups: [
      {
        name: "Coconut Range",
        items: [
          "Low-Fat Desiccated Coconut — Fine & Medium",
          "High-Fat Desiccated Coconut — Fine & Medium",
          "Desiccated Coconut Flakes",
          "Coconut Cream Powder",
          "Coconut Sugar",
          "Toasted Coconut Paste",
          "Virgin Coconut Oil",
          "Aseptic Coconut Milk & Water",
        ],
      },
    ],
  },
  {
    id: "coffee-cocoa",
    title: "Coffee & Cocoa",
    shortTitle: "Coffee & Cocoa",
    description:
      "Coffee formats and cocoa ingredients for beverages, desserts, confectionery, and manufactured food applications.",
    image: images.coffee,
    groups: [
      {
        name: "Coffee",
        items: [
          "Spray-Dried Instant Coffee",
          "Agglomerated Instant Coffee",
          "Decaffeinated Instant Coffee",
          "Instant & Micro-Ground Coffee",
          "Flavoured Instant Coffee",
          "Coffee Extract",
          "Coffee Oil",
          "Raw Caffeine",
          "Naturally Decaffeinated Green Coffee",
        ],
      },
      { name: "Cocoa", items: ["Cocoa Powder"] },
    ],
  },
  {
    id: "dairy-ingredients",
    title: "Dairy Ingredients",
    shortTitle: "Dairy Ingredients",
    description:
      "A structured range for dairy, beverage, bakery, nutrition, dessert, and prepared food applications.",
    image: images.dairy,
    groups: [
      {
        name: "Dairy Range",
        items: [
          "Whole Milk Powder",
          "Skimmed Milk Powder",
          "Fat-Filled Milk Powder",
          "Milk Stabilizers & Emulsifiers",
          "Unsalted Sweet Cream Lactic Butter",
          "Cheese Powder",
          "Curd Powder",
          "Yoghurt Powder",
          "Whey Protein Powder",
          "Soy Milk Powder",
        ],
      },
    ],
  },
  {
    id: "fruit-preparations",
    title: "Fruit Preparations",
    shortTitle: "Fruit Preparations",
    description:
      "Fruit preparations developed for integration across a wide range of finished food and beverage formats.",
    image: images.berries,
    groups: [
      {
        name: "Applications",
        items: [
          "Dairy products",
          "Ice cream",
          "Beverages",
          "Bakery products",
          "Desserts",
          "Confectionery",
        ],
      },
    ],
  },
  {
    id: "spray-dried-powders",
    title: "Spray-Dried Powders",
    shortTitle: "Spray-Dried Powders",
    description:
      "Fruit, specialty, and natural colour powders presented in an easy-to-browse ingredient collection.",
    image: images.powder,
    groups: [
      {
        name: "Fruit Powders",
        items: [
          "Ripe Mango",
          "Raw Mango",
          "Orange",
          "Tamarind",
          "Pineapple",
          "Pomegranate",
          "Ripe Papaya",
          "Raw Papaya",
          "Sweet Lime",
          "Ripe Banana",
          "Raw Banana",
          "Black Grape",
          "Guava",
          "Strawberry",
          "Apple",
          "Watermelon",
          "Cranberry",
          "Blueberry",
          "Raspberry",
        ],
      },
      {
        name: "Specialty Powders",
        items: [
          "Honey",
          "Vinegar",
          "Apple Cider Vinegar",
          "Jaggery",
          "Coconut Milk",
          "Coconut Water",
          "Amla",
        ],
      },
      {
        name: "Natural Colour Powders",
        items: ["Caramel", "Orange Annatto", "Yellow Annatto", "Beetroot"],
      },
    ],
  },
  {
    id: "food-colours",
    title: "Food Colours",
    shortTitle: "Food Colours",
    description:
      "A varied palette of plant-derived colour ingredients for food and beverage product development.",
    image: images.colors,
    groups: [
      {
        name: "Natural Colour Range",
        items: [
          "Beetroot",
          "Black Carrot",
          "Orange Carrot",
          "Safflower",
          "Spirulina",
          "Chokeberry",
          "Elderberry",
          "Black Currant",
          "Red Radish",
          "Purple Potato",
          "Dried Apple",
          "Spirulina and Safflower",
          "Hibiscus",
        ],
      },
    ],
  },
]

export const offices = [
  {
    country: "United Arab Emirates",
    city: "SPC Free Zone, Sharjah, UAE",
    phone: "+971 50 6361790",
    email: "mohamed@lycafoods.com",
  },
  {
    country: "Kuwait",
    city: "Business Plaza, Kuwait City, Kuwait",
    phone: "+965 98741141 / +965 98021009",
    email: "sales@lycafoods.com",
  },
  {
    country: "India",
    city: "Erode, Tamil Nadu, India",
    phone: "+91 95670 59898",
    email: "sales2@lycafoods.com",
  },
  {
    country: "Egypt",
    city: "Cairo, Egypt",
    phone: "+20 1096028740",
    email: "ruaa.k@lycafoods.com",
  },
  {
    country: "Tanzania",
    city: "Dar es Salaam, Tanzania",
    phone: "+255 655 100 100",
    email: "marcelina.m@lycafoods.com",
  },
  {
    country: "Sri Lanka",
    city: "Nittambuwa, Sri Lanka",
    phone: "+94 76 2407750 / +94 75 1637839",
    email: "mano.p@lycafoods.com",
  },
]
