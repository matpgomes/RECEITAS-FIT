-- Seed data for recipes
-- Recipe 1: Brownie Fit de Cacau
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Brownie Fit de Cacau',
  'Brownie delicioso e saudável, sem culpa! Feito com cacau 100% e adoçante natural.',
  'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800',
  35,
  8,
  350,
  120,
  '[
    {"item": "Cacau em pó 100%", "quantity": "1/2 xícara", "notes": null},
    {"item": "Farinha de aveia", "quantity": "1 xícara", "notes": "pode bater a aveia no liquidificador"},
    {"item": "Ovos", "quantity": "3 unidades", "notes": null},
    {"item": "Adoçante culinário", "quantity": "1/2 xícara", "notes": "xilitol ou eritritol"},
    {"item": "Óleo de coco", "quantity": "3 colheres de sopa", "notes": "pode usar manteiga ghee"},
    {"item": "Fermento em pó", "quantity": "1 colher de chá", "notes": null},
    {"item": "Essência de baunilha", "quantity": "1 colher de chá", "notes": "opcional"}
  ]',
  'Pré-aqueça o forno a 180°C. Em uma tigela, misture os ovos com o adoçante até ficar homogêneo. Adicione o óleo de coco derretido e a essência de baunilha. Em outra tigela, misture o cacau, a farinha de aveia e o fermento. Junte os ingredientes secos aos molhados, mexendo delicadamente. Despeje em uma forma untada (20x20cm) e leve ao forno por 25-30 minutos. Deixe esfriar antes de cortar.',
  '[
    {"step": 1, "title": "Prepare os ingredientes secos", "description": "Em uma tigela, misture o cacau em pó, a farinha de aveia e o fermento. Reserve.", "time_minutes": 5},
    {"step": 2, "title": "Bata os ingredientes molhados", "description": "Em outra tigela, bata os ovos com o adoçante até ficar cremoso. Adicione o óleo de coco derretido e a baunilha.", "time_minutes": 5},
    {"step": 3, "title": "Una tudo", "description": "Adicione os ingredientes secos aos molhados e misture delicadamente até incorporar.", "time_minutes": 5},
    {"step": 4, "title": "Asse", "description": "Despeje em forma untada e asse a 180°C por 25-30 minutos. Faça o teste do palito.", "time_minutes": 30}
  ]',
  'Sobremesas',
  ARRAY['fit', 'chocolate', 'sem açúcar', 'low carb'],
  ARRAY['ovos', 'aveia'],
  TRUE,
  CURRENT_DATE
);

-- Recipe 2: Frango Grelhado com Legumes
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Frango Grelhado com Legumes Coloridos',
  'Prato completo e nutritivo, perfeito para o almoço. Rico em proteínas e fibras.',
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
  30,
  4,
  520,
  280,
  '[
    {"item": "Peito de frango", "quantity": "4 filés (600g)", "notes": "sem pele"},
    {"item": "Abobrinha", "quantity": "2 unidades médias", "notes": "cortada em rodelas"},
    {"item": "Berinjela", "quantity": "1 unidade média", "notes": "cortada em cubos"},
    {"item": "Pimentão vermelho", "quantity": "1 unidade", "notes": "cortado em tiras"},
    {"item": "Tomate cereja", "quantity": "200g", "notes": "cortados ao meio"},
    {"item": "Alho", "quantity": "4 dentes", "notes": "amassados"},
    {"item": "Azeite de oliva", "quantity": "2 colheres de sopa", "notes": "extra virgem"},
    {"item": "Limão", "quantity": "1 unidade", "notes": "para o suco"},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta, orégano, alecrim"}
  ]',
  'Tempere o frango com limão, alho, sal e pimenta. Deixe marinar por 15 minutos. Enquanto isso, corte todos os legumes. Aqueça uma frigideira antiaderente e grelhe o frango por 6-8 minutos de cada lado. Reserve. Na mesma frigideira, refogue os legumes com um fio de azeite e temperos por 10 minutos. Sirva o frango sobre os legumes.',
  '[
    {"step": 1, "title": "Marine o frango", "description": "Tempere os filés com limão, alho amassado, sal, pimenta e deixe marinar por 15 minutos.", "time_minutes": 15},
    {"step": 2, "title": "Prepare os legumes", "description": "Corte a abobrinha, berinjela, pimentão e tomates. Reserve.", "time_minutes": 10},
    {"step": 3, "title": "Grelhe o frango", "description": "Em frigideira bem quente, grelhe os filés por 6-8 min de cada lado até dourar.", "time_minutes": 15},
    {"step": 4, "title": "Refogue os legumes", "description": "Na mesma frigideira, adicione azeite e refogue os legumes com temperos por 10 min.", "time_minutes": 10}
  ]',
  'Almoço',
  ARRAY['fit', 'proteína', 'low carb', 'sem glúten'],
  ARRAY[],
  TRUE,
  CURRENT_DATE + INTERVAL '1 day'
);

-- Recipe 3: Panqueca de Banana
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Panqueca de Banana Fit (3 ingredientes)',
  'Café da manhã rápido e saudável com apenas 3 ingredientes! Sem farinha, sem açúcar.',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  15,
  2,
  280,
  150,
  '[
    {"item": "Banana madura", "quantity": "1 unidade grande", "notes": "bem madura"},
    {"item": "Ovos", "quantity": "2 unidades", "notes": null},
    {"item": "Canela em pó", "quantity": "1 colher de chá", "notes": "opcional"}
  ]',
  'Amasse a banana com um garfo até formar um purê. Adicione os ovos e a canela, mexendo bem até incorporar. Aqueça uma frigideira antiaderente em fogo médio. Despeje porções da massa e deixe dourar de cada lado (2-3 minutos). Sirva com frutas frescas ou pasta de amendoim.',
  '[
    {"step": 1, "title": "Prepare a massa", "description": "Amasse bem a banana com um garfo até virar purê. Adicione os ovos e canela e misture.", "time_minutes": 5},
    {"step": 2, "title": "Aqueça a frigideira", "description": "Aqueça uma frigideira antiaderente em fogo médio. Não precisa adicionar óleo.", "time_minutes": 2},
    {"step": 3, "title": "Faça as panquecas", "description": "Despeje porções da massa e deixe cozinhar por 2-3 minutos de cada lado até dourar.", "time_minutes": 10}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'rápido', '3 ingredientes', 'sem farinha'],
  ARRAY['ovos', 'banana'],
  TRUE,
  CURRENT_DATE + INTERVAL '2 days'
);

-- Recipe 4: Salada de Quinoa
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Salada Completa de Quinoa e Grão de Bico',
  'Salada nutritiva e completa, rica em proteínas vegetais. Perfeita para levar na marmita!',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  25,
  4,
  380,
  245,
  '[
    {"item": "Quinoa", "quantity": "1 xícara", "notes": "já cozida rende 3 xícaras"},
    {"item": "Grão de bico cozido", "quantity": "1 xícara", "notes": "pode usar de lata"},
    {"item": "Tomate", "quantity": "2 unidades", "notes": "picados em cubos"},
    {"item": "Pepino", "quantity": "1 unidade", "notes": "picado em cubos"},
    {"item": "Cebola roxa", "quantity": "1/2 unidade", "notes": "picada finamente"},
    {"item": "Hortelã fresca", "quantity": "1/4 xícara", "notes": "picada"},
    {"item": "Limão", "quantity": "2 unidades", "notes": "para o suco"},
    {"item": "Azeite", "quantity": "3 colheres de sopa", "notes": null},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Cozinhe a quinoa conforme instruções da embalagem e deixe esfriar. Em uma tigela grande, misture a quinoa, grão de bico, tomate, pepino, cebola e hortelã. Em um bowl pequeno, misture o suco de limão, azeite, sal e pimenta. Despeje o molho sobre a salada e misture bem. Leve à geladeira por 30 minutos antes de servir.',
  '[
    {"step": 1, "title": "Cozinhe a quinoa", "description": "Cozinhe a quinoa em água fervente (proporção 1:2) por 15 minutos. Deixe esfriar.", "time_minutes": 20},
    {"step": 2, "title": "Prepare os vegetais", "description": "Corte o tomate, pepino e cebola em cubos pequenos. Pique a hortelã.", "time_minutes": 10},
    {"step": 3, "title": "Monte a salada", "description": "Em uma tigela, misture quinoa, grão de bico e todos os vegetais.", "time_minutes": 5},
    {"step": 4, "title": "Faça o molho", "description": "Misture suco de limão, azeite, sal e pimenta. Despeje sobre a salada e misture.", "time_minutes": 5}
  ]',
  'Almoço',
  ARRAY['fit', 'vegetariano', 'proteína vegetal', 'marmita'],
  ARRAY[],
  TRUE,
  CURRENT_DATE + INTERVAL '3 days'
);

-- Recipe 5: Omelete de Forno
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Omelete de Forno com Vegetais',
  'Omelete prático e saudável assado no forno. Rende várias porções!',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  30,
  6,
  320,
  180,
  '[
    {"item": "Ovos", "quantity": "8 unidades", "notes": null},
    {"item": "Leite desnatado", "quantity": "1/2 xícara", "notes": null},
    {"item": "Espinafre", "quantity": "2 xícaras", "notes": "picado"},
    {"item": "Tomate", "quantity": "2 unidades", "notes": "picados"},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Queijo cottage", "quantity": "1/2 xícara", "notes": "ou ricota"},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta, orégano"}
  ]',
  'Pré-aqueça o forno a 180°C. Bata os ovos com o leite e temperos. Refogue rapidamente a cebola, espinafre e tomate. Misture os vegetais aos ovos batidos, adicione o queijo. Despeje em forma retangular untada e asse por 25-30 minutos até firmar.',
  '[
    {"step": 1, "title": "Prepare os ovos", "description": "Bata os ovos com o leite, sal, pimenta e orégano.", "time_minutes": 5},
    {"step": 2, "title": "Refogue os vegetais", "description": "Em uma frigideira, refogue a cebola, espinafre e tomate por 5 minutos.", "time_minutes": 10},
    {"step": 3, "title": "Monte o omelete", "description": "Misture os vegetais refogados aos ovos batidos. Adicione o queijo cottage.", "time_minutes": 5},
    {"step": 4, "title": "Asse", "description": "Despeje em forma untada e asse a 180°C por 25-30 minutos até dourar.", "time_minutes": 30}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'proteína', 'vegetais', 'prático'],
  ARRAY['ovos', 'leite'],
  TRUE,
  CURRENT_DATE + INTERVAL '4 days'
);

-- Recipe 6: Smoothie Bowl
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Smoothie Bowl de Frutas Vermelhas',
  'Café da manhã refrescante e cheio de antioxidantes!',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
  10,
  2,
  420,
  220,
  '[
    {"item": "Frutas vermelhas congeladas", "quantity": "2 xícaras", "notes": "morango, mirtilo, framboesa"},
    {"item": "Banana congelada", "quantity": "1 unidade", "notes": null},
    {"item": "Leite vegetal", "quantity": "1/2 xícara", "notes": "amêndoas ou coco"},
    {"item": "Granola fit", "quantity": "2 colheres", "notes": "para topping"},
    {"item": "Frutas frescas", "quantity": "a gosto", "notes": "para decorar"},
    {"item": "Sementes", "quantity": "1 colher", "notes": "chia ou linhaça"}
  ]',
  'Bata no liquidificador as frutas vermelhas, banana e leite até ficar cremoso. A consistência deve ser mais grossa que um smoothie normal. Despeje em uma tigela e decore com granola, frutas frescas e sementes.',
  '[
    {"step": 1, "title": "Bata os ingredientes", "description": "No liquidificador, bata as frutas vermelhas congeladas, banana e leite até cremoso.", "time_minutes": 5},
    {"step": 2, "title": "Sirva e decore", "description": "Despeje em uma tigela e decore com granola, frutas frescas e sementes.", "time_minutes": 5}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'rápido', 'antioxidante', 'sem lactose'],
  ARRAY[],
  TRUE,
  CURRENT_DATE + INTERVAL '5 days'
);

-- Recipe 7: Peixe ao Molho de Limão
INSERT INTO public.recipes (
  title,
  description,
  image_url,
  prep_time_minutes,
  serves_people,
  calories_normal,
  calories_fit,
  ingredients,
  preparation_full,
  preparation_steps,
  category,
  tags,
  allergens,
  is_active,
  featured_date
) VALUES (
  'Peixe Assado ao Molho de Limão Siciliano',
  'Peixe suculento com molho cítrico refrescante. Leve e sofisticado!',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
  35,
  4,
  480,
  260,
  '[
    {"item": "Filé de peixe branco", "quantity": "4 filés (600g)", "notes": "tilápia ou pescada"},
    {"item": "Limão siciliano", "quantity": "2 unidades", "notes": "raspas e suco"},
    {"item": "Alho", "quantity": "3 dentes", "notes": "amassados"},
    {"item": "Azeite", "quantity": "3 colheres de sopa", "notes": null},
    {"item": "Vinho branco", "quantity": "1/2 xícara", "notes": "opcional"},
    {"item": "Alcaparras", "quantity": "2 colheres", "notes": "opcional"},
    {"item": "Salsinha", "quantity": "1/4 xícara", "notes": "picada"},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Tempere os filés com sal, pimenta e metade do limão. Em uma assadeira, disponha os filés. Misture azeite, alho, raspas de limão, vinho e alcaparras. Despeje sobre o peixe. Asse a 200°C por 20 minutos. Finalize com salsinha fresca.',
  '[
    {"step": 1, "title": "Tempere o peixe", "description": "Tempere os filés com sal, pimenta e suco de 1 limão. Deixe marinar por 10 min.", "time_minutes": 10},
    {"step": 2, "title": "Prepare o molho", "description": "Misture azeite, alho, raspas de limão, vinho e alcaparras.", "time_minutes": 5},
    {"step": 3, "title": "Asse", "description": "Disponha os filés em assadeira, despeje o molho e asse a 200°C por 20 minutos.", "time_minutes": 20},
    {"step": 4, "title": "Finalize", "description": "Retire do forno e polvilhe salsinha fresca.", "time_minutes": 2}
  ]',
  'Jantar',
  ARRAY['fit', 'proteína', 'omega 3', 'sofisticado'],
  ARRAY['peixe'],
  TRUE,
  CURRENT_DATE + INTERVAL '6 days'
);
