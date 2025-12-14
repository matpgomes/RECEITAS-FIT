-- Seed complementar - Mais 23 receitas fit
-- Total: 30 receitas (7 existentes + 23 novas)

-- Recipe 8: Wrap de Frango com Abacate
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
  is_active
) VALUES (
  'Wrap de Frango Desfiado com Abacate',
  'Wrap leve e nutritivo, perfeito para o almoço. Rico em proteínas e gorduras boas!',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
  20,
  2,
  450,
  280,
  '[
    {"item": "Peito de frango cozido", "quantity": "200g", "notes": "desfiado"},
    {"item": "Tortilha integral", "quantity": "2 unidades", "notes": "pode usar wrap fit"},
    {"item": "Abacate", "quantity": "1 unidade", "notes": "amassado"},
    {"item": "Tomate", "quantity": "1 unidade", "notes": "fatiado"},
    {"item": "Alface", "quantity": "4 folhas", "notes": null},
    {"item": "Iogurte grego", "quantity": "3 colheres", "notes": null},
    {"item": "Limão", "quantity": "1/2 unidade", "notes": "para o suco"},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta, cominho"}
  ]',
  'Desfie o frango e tempere com sal, pimenta e cominho. Amasse o abacate com limão. Aqueça as tortilhas. Espalhe o abacate, adicione alface, tomate, frango e finalize com iogurte grego. Enrole bem apertado.',
  '[
    {"step": 1, "title": "Prepare o frango", "description": "Desfie o frango cozido e tempere com sal, pimenta e cominho.", "time_minutes": 5},
    {"step": 2, "title": "Faça o guacamole", "description": "Amasse o abacate com suco de limão até formar um creme.", "time_minutes": 5},
    {"step": 3, "title": "Monte o wrap", "description": "Espalhe o abacate na tortilha, adicione alface, tomate e frango.", "time_minutes": 5},
    {"step": 4, "title": "Finalize", "description": "Adicione iogurte grego e enrole bem apertado.", "time_minutes": 5}
  ]',
  'Almoço',
  ARRAY['fit', 'proteína', 'gordura boa', 'prático'],
  ARRAY['glúten', 'laticínios'],
  TRUE
);

-- Recipe 9: Chips de Batata Doce no Forno
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
  is_active
) VALUES (
  'Chips de Batata Doce Crocante',
  'Snack saudável e crocante! Muito melhor que batata frita tradicional.',
  'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800',
  40,
  4,
  320,
  135,
  '[
    {"item": "Batata doce", "quantity": "2 unidades médias", "notes": "cortadas bem finas"},
    {"item": "Azeite", "quantity": "2 colheres de sopa", "notes": null},
    {"item": "Páprica doce", "quantity": "1 colher de chá", "notes": null},
    {"item": "Alecrim seco", "quantity": "1 colher de chá", "notes": null},
    {"item": "Sal marinho", "quantity": "a gosto", "notes": null}
  ]',
  'Pré-aqueça o forno a 200°C. Corte a batata doce em fatias bem finas (use mandolina se tiver). Misture com azeite e temperos. Disponha em assadeira forrada com papel manteiga sem sobrepor. Asse por 30-35 minutos, virando na metade.',
  '[
    {"step": 1, "title": "Corte as batatas", "description": "Corte as batatas doce em fatias bem finas e uniformes (2-3mm).", "time_minutes": 10},
    {"step": 2, "title": "Tempere", "description": "Misture as fatias com azeite, páprica, alecrim e sal.", "time_minutes": 5},
    {"step": 3, "title": "Asse", "description": "Disponha em assadeira sem sobrepor e asse a 200°C por 15 minutos.", "time_minutes": 15},
    {"step": 4, "title": "Vire e finalize", "description": "Vire as fatias e asse por mais 15-20 minutos até ficarem crocantes.", "time_minutes": 20}
  ]',
  'Lanches',
  ARRAY['fit', 'crocante', 'snack', 'sem glúten'],
  ARRAY[],
  TRUE
);

-- Recipe 10: Mousse de Chocolate Fit
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
  is_active
) VALUES (
  'Mousse de Chocolate com Abacate',
  'Sobremesa cremosa e saudável! Sim, tem abacate e você não vai sentir!',
  'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800',
  10,
  4,
  380,
  165,
  '[
    {"item": "Abacate maduro", "quantity": "2 unidades", "notes": "bem maduro"},
    {"item": "Cacau em pó 100%", "quantity": "1/3 xícara", "notes": null},
    {"item": "Adoçante", "quantity": "1/3 xícara", "notes": "xilitol ou eritritol"},
    {"item": "Leite de coco", "quantity": "1/4 xícara", "notes": null},
    {"item": "Essência de baunilha", "quantity": "1 colher de chá", "notes": null},
    {"item": "Cacau nibs", "quantity": "2 colheres", "notes": "para decorar"}
  ]',
  'Bata todos os ingredientes no liquidificador até ficar bem cremoso e homogêneo. Prove e ajuste o adoçante se necessário. Distribua em tacinhas e leve à geladeira por pelo menos 2 horas. Decore com cacau nibs.',
  '[
    {"step": 1, "title": "Bata tudo", "description": "No liquidificador, bata abacate, cacau, adoçante, leite de coco e baunilha até cremoso.", "time_minutes": 5},
    {"step": 2, "title": "Ajuste o sabor", "description": "Prove e ajuste o adoçante se necessário.", "time_minutes": 2},
    {"step": 3, "title": "Gelar", "description": "Distribua em tacinhas e leve à geladeira por 2 horas.", "time_minutes": 120}
  ]',
  'Sobremesas',
  ARRAY['fit', 'chocolate', 'sem açúcar', 'vegano'],
  ARRAY[],
  TRUE
);

-- Recipe 11: Bowl de Açaí Fit
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
  is_active
) VALUES (
  'Bowl de Açaí Proteico',
  'Açaí cremoso sem xarope! Com proteína e toppings saudáveis.',
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800',
  10,
  2,
  520,
  280,
  '[
    {"item": "Polpa de açaí congelada", "quantity": "200g", "notes": "sem açúcar"},
    {"item": "Banana congelada", "quantity": "1 unidade", "notes": null},
    {"item": "Whey protein", "quantity": "1 scoop", "notes": "sabor neutro ou cacau"},
    {"item": "Leite vegetal", "quantity": "100ml", "notes": "apenas para soltar"},
    {"item": "Granola fit", "quantity": "3 colheres", "notes": null},
    {"item": "Banana fatiada", "quantity": "1/2 unidade", "notes": null},
    {"item": "Pasta de amendoim", "quantity": "1 colher", "notes": null},
    {"item": "Frutas vermelhas", "quantity": "a gosto", "notes": null}
  ]',
  'Bata a polpa de açaí, banana congelada e whey com um pouco de leite até ficar cremoso (consistência de sorvete). Despeje em uma tigela e decore com granola, banana, pasta de amendoim e frutas vermelhas.',
  '[
    {"step": 1, "title": "Bata o açaí", "description": "No liquidificador, bata açaí, banana e whey com pouco leite até cremoso.", "time_minutes": 5},
    {"step": 2, "title": "Monte o bowl", "description": "Despeje em tigela e decore com granola, frutas e pasta de amendoim.", "time_minutes": 5}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'proteína', 'energético', 'sem lactose'],
  ARRAY[],
  TRUE
);

-- Recipe 12: Hambúrguer de Grão de Bico
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
  is_active
) VALUES (
  'Hambúrguer Vegano de Grão de Bico',
  'Hambúrguer plant-based delicioso! Rico em proteínas e fibras.',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
  30,
  4,
  410,
  215,
  '[
    {"item": "Grão de bico cozido", "quantity": "2 xícaras", "notes": null},
    {"item": "Aveia em flocos", "quantity": "1/2 xícara", "notes": null},
    {"item": "Cebola", "quantity": "1 unidade pequena", "notes": "picada"},
    {"item": "Alho", "quantity": "2 dentes", "notes": "amassados"},
    {"item": "Cominho", "quantity": "1 colher de chá", "notes": null},
    {"item": "Páprica", "quantity": "1 colher de chá", "notes": null},
    {"item": "Salsinha", "quantity": "1/4 xícara", "notes": "picada"},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Amasse o grão de bico com um garfo (deixe alguns pedaços). Adicione aveia, cebola, alho, temperos e salsinha. Misture bem. Molde 4 hambúrgueres. Grelhe em frigideira com um fio de azeite por 5 minutos de cada lado.',
  '[
    {"step": 1, "title": "Prepare a massa", "description": "Amasse o grão de bico e misture com aveia, cebola, alho e temperos.", "time_minutes": 10},
    {"step": 2, "title": "Molde os hambúrgueres", "description": "Divida em 4 porções e molde hambúrgueres de tamanho uniforme.", "time_minutes": 5},
    {"step": 3, "title": "Grelhe", "description": "Aqueça frigideira com azeite e grelhe por 5 min de cada lado.", "time_minutes": 15}
  ]',
  'Almoço',
  ARRAY['fit', 'vegano', 'proteína vegetal', 'sem glúten'],
  ARRAY['aveia'],
  TRUE
);

-- Recipe 13: Iogurte com Chia e Frutas
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
  is_active
) VALUES (
  'Parfait de Iogurte com Chia',
  'Café da manhã prático em potinho! Prepare na noite anterior.',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
  10,
  2,
  340,
  190,
  '[
    {"item": "Iogurte grego natural", "quantity": "2 potes", "notes": "desnatado"},
    {"item": "Sementes de chia", "quantity": "3 colheres de sopa", "notes": null},
    {"item": "Frutas vermelhas", "quantity": "1 xícara", "notes": null},
    {"item": "Granola fit", "quantity": "4 colheres", "notes": null},
    {"item": "Mel", "quantity": "1 colher de sopa", "notes": "opcional"}
  ]',
  'Em potes de vidro, faça camadas alternando iogurte, chia, frutas e granola. Finalize com um fio de mel. Tampe e leve à geladeira por pelo menos 4 horas (ideal overnight). A chia vai hidratar e formar um gel.',
  '[
    {"step": 1, "title": "Monte as camadas", "description": "Em potes, alterne camadas de iogurte, chia, frutas e granola.", "time_minutes": 10},
    {"step": 2, "title": "Gelar", "description": "Tampe e leve à geladeira por pelo menos 4 horas.", "time_minutes": 240}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'prático', 'proteína', 'overnight'],
  ARRAY['laticínios'],
  TRUE
);

-- Recipe 14: Salmão Grelhado com Aspargos
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
  is_active
) VALUES (
  'Salmão Grelhado com Aspargos ao Alho',
  'Jantar sofisticado e nutritivo! Rico em ômega-3.',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  25,
  2,
  580,
  340,
  '[
    {"item": "Filé de salmão", "quantity": "2 unidades (300g)", "notes": "com pele"},
    {"item": "Aspargos", "quantity": "1 maço (250g)", "notes": null},
    {"item": "Alho", "quantity": "4 dentes", "notes": "laminados"},
    {"item": "Azeite", "quantity": "2 colheres de sopa", "notes": null},
    {"item": "Limão", "quantity": "1 unidade", "notes": null},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Tempere o salmão com sal, pimenta e limão. Grelhe com a pele para baixo por 4 minutos, vire e grelhe mais 3 minutos. Retire e reserve. Na mesma frigideira, refogue aspargos com alho e azeite por 5 minutos. Sirva o salmão sobre os aspargos.',
  '[
    {"step": 1, "title": "Tempere o salmão", "description": "Tempere os filés com sal, pimenta e suco de limão.", "time_minutes": 5},
    {"step": 2, "title": "Grelhe o salmão", "description": "Grelhe com pele para baixo por 4 min, vire e grelhe mais 3 min.", "time_minutes": 10},
    {"step": 3, "title": "Refogue os aspargos", "description": "Na mesma frigideira, refogue aspargos com alho por 5 minutos.", "time_minutes": 10}
  ]',
  'Jantar',
  ARRAY['fit', 'proteína', 'omega 3', 'low carb'],
  ARRAY['peixe'],
  TRUE
);

-- Recipe 15: Bolinho de Arroz Integral
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
  is_active
) VALUES (
  'Bolinho de Arroz Integral Assado',
  'Aproveite sobras de arroz! Bolinhos crocantes e saudáveis.',
  'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800',
  30,
  6,
  290,
  160,
  '[
    {"item": "Arroz integral cozido", "quantity": "2 xícaras", "notes": "sobras"},
    {"item": "Ovos", "quantity": "2 unidades", "notes": null},
    {"item": "Cenoura ralada", "quantity": "1 xícara", "notes": null},
    {"item": "Queijo cottage", "quantity": "1/2 xícara", "notes": null},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Salsinha", "quantity": "1/4 xícara", "notes": "picada"},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta"}
  ]',
  'Misture todos os ingredientes em uma tigela. Molde bolinhos pequenos e disponha em assadeira forrada com papel manteiga. Pincele com azeite. Asse a 200°C por 25 minutos, virando na metade.',
  '[
    {"step": 1, "title": "Prepare a massa", "description": "Misture arroz, ovos, cenoura, queijo, cebola, salsinha e temperos.", "time_minutes": 10},
    {"step": 2, "title": "Molde os bolinhos", "description": "Molde bolinhos do tamanho de uma colher e disponha em assadeira.", "time_minutes": 10},
    {"step": 3, "title": "Asse", "description": "Pincele com azeite e asse a 200°C por 25 minutos, virando na metade.", "time_minutes": 25}
  ]',
  'Lanches',
  ARRAY['fit', 'aproveitamento', 'assado', 'proteína'],
  ARRAY['ovos', 'laticínios'],
  TRUE
);

-- Recipe 16: Creme de Abóbora com Gengibre
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
  is_active
) VALUES (
  'Creme de Abóbora com Gengibre e Cúrcuma',
  'Sopa reconfortante e anti-inflamatória! Perfeita para o inverno.',
  'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800',
  35,
  4,
  310,
  145,
  '[
    {"item": "Abóbora", "quantity": "600g", "notes": "descascada e cortada"},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Gengibre fresco", "quantity": "2cm", "notes": "ralado"},
    {"item": "Cúrcuma em pó", "quantity": "1 colher de chá", "notes": null},
    {"item": "Caldo de legumes", "quantity": "3 xícaras", "notes": null},
    {"item": "Leite de coco", "quantity": "1/2 xícara", "notes": "light"},
    {"item": "Azeite", "quantity": "1 colher de sopa", "notes": null},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Refogue a cebola e gengibre no azeite. Adicione a abóbora e cúrcuma, refogue por 5 minutos. Adicione o caldo, tampe e cozinhe por 20 minutos. Bata no liquidificador com leite de coco até ficar cremoso. Ajuste temperos.',
  '[
    {"step": 1, "title": "Refogue a base", "description": "Refogue cebola e gengibre no azeite por 3 minutos.", "time_minutes": 5},
    {"step": 2, "title": "Cozinhe a abóbora", "description": "Adicione abóbora, cúrcuma e caldo. Cozinhe por 20 minutos.", "time_minutes": 25},
    {"step": 3, "title": "Bata", "description": "Bata no liquidificador com leite de coco até cremoso.", "time_minutes": 5}
  ]',
  'Jantar',
  ARRAY['fit', 'vegano', 'anti-inflamatório', 'sem glúten'],
  ARRAY[],
  TRUE
);

-- Recipe 17: Pizza Fit de Couve-flor
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
  is_active
) VALUES (
  'Pizza de Massa de Couve-flor',
  'Pizza low carb deliciosa! Você não vai acreditar que é couve-flor.',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  45,
  2,
  680,
  320,
  '[
    {"item": "Couve-flor", "quantity": "1 unidade média", "notes": "processada"},
    {"item": "Ovos", "quantity": "2 unidades", "notes": null},
    {"item": "Queijo mussarela light", "quantity": "1 xícara", "notes": "ralada"},
    {"item": "Orégano", "quantity": "1 colher de chá", "notes": null},
    {"item": "Molho de tomate caseiro", "quantity": "1/2 xícara", "notes": null},
    {"item": "Toppings fit", "quantity": "a gosto", "notes": "tomate, rúcula, frango"}
  ]',
  'Processe a couve-flor, cozinhe no microondas por 8 min e esprema bem a água. Misture com ovos, 3/4 do queijo e orégano. Modele disco de pizza em assadeira forrada. Asse a 200°C por 20 min. Adicione molho e toppings, asse mais 10 min.',
  '[
    {"step": 1, "title": "Prepare a couve-flor", "description": "Processe e cozinhe no microondas por 8 min. Esprema MUITO a água.", "time_minutes": 15},
    {"step": 2, "title": "Faça a massa", "description": "Misture com ovos, queijo e orégano. Modele disco de pizza.", "time_minutes": 10},
    {"step": 3, "title": "Pré-asse", "description": "Asse a massa vazia a 200°C por 20 minutos.", "time_minutes": 20},
    {"step": 4, "title": "Finalize", "description": "Adicione molho e toppings, asse mais 10 minutos.", "time_minutes": 10}
  ]',
  'Jantar',
  ARRAY['fit', 'low carb', 'sem glúten', 'criativo'],
  ARRAY['ovos', 'laticínios'],
  TRUE
);

-- Recipe 18: Tapioca Fit Recheada
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
  is_active
) VALUES (
  'Tapioca Proteica com Frango',
  'Tapioca turbinada com proteína! Café da manhã nordestino fit.',
  'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
  15,
  2,
  380,
  220,
  '[
    {"item": "Goma de tapioca", "quantity": "4 colheres de sopa", "notes": null},
    {"item": "Ovos", "quantity": "2 unidades", "notes": null},
    {"item": "Frango desfiado", "quantity": "100g", "notes": null},
    {"item": "Tomate", "quantity": "1 unidade", "notes": "picado"},
    {"item": "Queijo cottage", "quantity": "2 colheres", "notes": null},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta"}
  ]',
  'Bata os ovos e misture com a goma. Aqueça frigideira antiaderente, despeje a mistura formando um disco. Quando firmar, adicione frango, tomate e cottage. Dobre ao meio e sirva.',
  '[
    {"step": 1, "title": "Prepare a massa", "description": "Bata os ovos e misture com a goma de tapioca.", "time_minutes": 3},
    {"step": 2, "title": "Faça a tapioca", "description": "Em frigideira quente, despeje a mistura formando disco. Aguarde firmar.", "time_minutes": 5},
    {"step": 3, "title": "Recheie", "description": "Adicione frango, tomate e cottage. Dobre ao meio.", "time_minutes": 5}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'proteína', 'sem glúten', 'nordestino'],
  ARRAY['ovos', 'laticínios'],
  TRUE
);

-- Recipe 19: Espaguete de Abobrinha
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
  is_active
) VALUES (
  'Espaguete de Abobrinha ao Molho Pesto',
  'Macarrão low carb delicioso! Use spiralizer ou descascador.',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
  20,
  2,
  450,
  180,
  '[
    {"item": "Abobrinhas médias", "quantity": "3 unidades", "notes": "em formato de espaguete"},
    {"item": "Manjericão fresco", "quantity": "2 xícaras", "notes": null},
    {"item": "Alho", "quantity": "2 dentes", "notes": null},
    {"item": "Castanhas", "quantity": "1/4 xícara", "notes": "pode usar amêndoas"},
    {"item": "Azeite", "quantity": "1/4 xícara", "notes": null},
    {"item": "Queijo parmesão", "quantity": "2 colheres", "notes": "opcional"},
    {"item": "Sal e pimenta", "quantity": "a gosto", "notes": null}
  ]',
  'Faça o pesto: bata manjericão, alho, castanhas, azeite e parmesão no processador. Corte as abobrinhas em formato de espaguete. Aqueça em frigideira por 3-4 minutos (não cozinhe demais). Misture com o pesto e sirva.',
  '[
    {"step": 1, "title": "Faça o pesto", "description": "Bata manjericão, alho, castanhas, azeite e parmesão no processador.", "time_minutes": 5},
    {"step": 2, "title": "Prepare o espaguete", "description": "Corte abobrinhas em formato de espaguete com spiralizer.", "time_minutes": 10},
    {"step": 3, "title": "Refogue levemente", "description": "Aqueça o espaguete de abobrinha em frigideira por 3-4 minutos.", "time_minutes": 5},
    {"step": 4, "title": "Finalize", "description": "Misture com o pesto e sirva imediatamente.", "time_minutes": 2}
  ]',
  'Jantar',
  ARRAY['fit', 'low carb', 'sem glúten', 'vegetariano'],
  ARRAY['laticínios', 'castanhas'],
  TRUE
);

-- Recipe 20: Muffin de Banana Fit
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
  is_active
) VALUES (
  'Muffin de Banana com Nozes',
  'Muffin fofinho e saudável! Perfeito para lanches da semana.',
  'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800',
  35,
  12,
  320,
  165,
  '[
    {"item": "Bananas maduras", "quantity": "3 unidades", "notes": "bem maduras"},
    {"item": "Farinha de aveia", "quantity": "2 xícaras", "notes": null},
    {"item": "Ovos", "quantity": "2 unidades", "notes": null},
    {"item": "Adoçante", "quantity": "1/2 xícara", "notes": "demerara ou coco"},
    {"item": "Óleo de coco", "quantity": "1/4 xícara", "notes": "derretido"},
    {"item": "Nozes picadas", "quantity": "1/2 xícara", "notes": null},
    {"item": "Fermento", "quantity": "1 colher de sopa", "notes": null},
    {"item": "Canela", "quantity": "1 colher de chá", "notes": null}
  ]',
  'Amasse as bananas. Misture com ovos, adoçante e óleo. Adicione aveia, fermento e canela. Acrescente as nozes. Distribua em forminhas de muffin. Asse a 180°C por 25 minutos.',
  '[
    {"step": 1, "title": "Prepare os molhados", "description": "Amasse bananas e misture com ovos, adoçante e óleo de coco.", "time_minutes": 5},
    {"step": 2, "title": "Adicione os secos", "description": "Misture aveia, fermento e canela. Adicione nozes picadas.", "time_minutes": 5},
    {"step": 3, "title": "Asse", "description": "Distribua em forminhas e asse a 180°C por 25 minutos.", "time_minutes": 25}
  ]',
  'Lanches',
  ARRAY['fit', 'banana', 'muffin', 'meal prep'],
  ARRAY['ovos', 'aveia', 'nozes'],
  TRUE
);

-- Recipe 21: Risoto de Quinoa
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
  is_active
) VALUES (
  'Risoto de Quinoa com Cogumelos',
  'Risoto fit sem arroz! Cremoso e cheio de proteínas.',
  'https://images.unsplash.com/photo-1476124369491-b79cbc00ee4b?w=800',
  35,
  4,
  520,
  285,
  '[
    {"item": "Quinoa", "quantity": "1 xícara", "notes": null},
    {"item": "Cogumelos Paris", "quantity": "300g", "notes": "fatiados"},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Alho", "quantity": "3 dentes", "notes": "picados"},
    {"item": "Caldo de legumes", "quantity": "3 xícaras", "notes": "quente"},
    {"item": "Vinho branco", "quantity": "1/2 xícara", "notes": "opcional"},
    {"item": "Queijo parmesão", "quantity": "1/4 xícara", "notes": "ralado"},
    {"item": "Azeite", "quantity": "2 colheres de sopa", "notes": null},
    {"item": "Salsinha", "quantity": "a gosto", "notes": null}
  ]',
  'Refogue cebola e alho no azeite. Adicione quinoa e vinho, deixe evaporar. Adicione caldo aos poucos, mexendo sempre. Quando a quinoa estiver quase pronta, adicione cogumelos. Finalize com parmesão e salsinha.',
  '[
    {"step": 1, "title": "Refogue a base", "description": "Refogue cebola e alho no azeite. Adicione quinoa e torre levemente.", "time_minutes": 5},
    {"step": 2, "title": "Adicione vinho", "description": "Adicione vinho e deixe evaporar.", "time_minutes": 3},
    {"step": 3, "title": "Cozinhe", "description": "Adicione caldo aos poucos, mexendo sempre, por 15 minutos.", "time_minutes": 15},
    {"step": 4, "title": "Finalize", "description": "Adicione cogumelos, parmesão e salsinha. Ajuste temperos.", "time_minutes": 10}
  ]',
  'Almoço',
  ARRAY['fit', 'proteína vegetal', 'cremoso', 'sofisticado'],
  ARRAY['laticínios'],
  TRUE
);

-- Recipe 22: Pudim de Chia
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
  is_active
) VALUES (
  'Pudim de Chia com Manga',
  'Sobremesa cremosa e nutritiva! Prepare na noite anterior.',
  'https://images.unsplash.com/photo-1600555379765-f82335a0b1a0?w=800',
  10,
  4,
  280,
  155,
  '[
    {"item": "Leite de coco", "quantity": "2 xícaras", "notes": null},
    {"item": "Sementes de chia", "quantity": "6 colheres de sopa", "notes": null},
    {"item": "Adoçante", "quantity": "2 colheres de sopa", "notes": "ou mel"},
    {"item": "Essência de baunilha", "quantity": "1 colher de chá", "notes": null},
    {"item": "Manga madura", "quantity": "1 unidade", "notes": "em cubos"},
    {"item": "Coco ralado", "quantity": "2 colheres", "notes": "para decorar"}
  ]',
  'Misture leite de coco, chia, adoçante e baunilha. Mexa bem. Leve à geladeira por no mínimo 4 horas (ideal overnight). Sirva em taças com manga em cubos e coco ralado.',
  '[
    {"step": 1, "title": "Misture os ingredientes", "description": "Misture leite de coco, chia, adoçante e baunilha em um pote.", "time_minutes": 5},
    {"step": 2, "title": "Gelar", "description": "Mexa bem e leve à geladeira por pelo menos 4 horas.", "time_minutes": 240},
    {"step": 3, "title": "Sirva", "description": "Distribua em taças e decore com manga e coco ralado.", "time_minutes": 5}
  ]',
  'Sobremesas',
  ARRAY['fit', 'sem lactose', 'overnight', 'omega 3'],
  ARRAY[],
  TRUE
);

-- Recipe 23: Crepioca Fit
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
  is_active
) VALUES (
  'Crepioca de Queijo com Tomate',
  'Junção de crepe + tapioca! Rápido, prático e delicioso.',
  'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800',
  10,
  1,
  350,
  180,
  '[
    {"item": "Goma de tapioca", "quantity": "2 colheres de sopa", "notes": null},
    {"item": "Ovo", "quantity": "1 unidade", "notes": null},
    {"item": "Queijo minas", "quantity": "50g", "notes": "fatiado"},
    {"item": "Tomate", "quantity": "1/2 unidade", "notes": "fatiado"},
    {"item": "Orégano", "quantity": "a gosto", "notes": null}
  ]',
  'Bata o ovo com um garfo. Misture com a goma. Despeje em frigideira antiaderente quente. Quando começar a firmar, adicione queijo, tomate e orégano. Dobre ao meio e sirva.',
  '[
    {"step": 1, "title": "Prepare a massa", "description": "Bata o ovo e misture com a goma de tapioca.", "time_minutes": 2},
    {"step": 2, "title": "Faça a crepioca", "description": "Despeje em frigideira quente e espalhe formando disco fino.", "time_minutes": 3},
    {"step": 3, "title": "Recheie", "description": "Quando firmar, adicione queijo, tomate e orégano. Dobre ao meio.", "time_minutes": 5}
  ]',
  'Café da Manhã',
  ARRAY['fit', 'rápido', 'proteína', 'sem glúten'],
  ARRAY['ovos', 'laticínios'],
  TRUE
);

-- Recipe 24: Bowl de Buddha
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
  is_active
) VALUES (
  'Buddha Bowl Completo',
  'Tigela nutritiva com todos os macros! Colorida e deliciosa.',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  30,
  2,
  480,
  320,
  '[
    {"item": "Arroz integral", "quantity": "1 xícara cozida", "notes": null},
    {"item": "Grão de bico assado", "quantity": "1/2 xícara", "notes": null},
    {"item": "Batata doce", "quantity": "1 unidade", "notes": "assada em cubos"},
    {"item": "Brócolis", "quantity": "1 xícara", "notes": "cozido no vapor"},
    {"item": "Abacate", "quantity": "1/2 unidade", "notes": "fatiado"},
    {"item": "Cenoura ralada", "quantity": "1/2 xícara", "notes": null},
    {"item": "Tahine", "quantity": "2 colheres", "notes": null},
    {"item": "Limão", "quantity": "1 unidade", "notes": "para o molho"}
  ]',
  'Asse a batata doce e grão de bico a 200°C por 25 min. Cozinhe brócolis no vapor. Monte a tigela com arroz como base, adicione todos os ingredientes em setores. Regue com molho de tahine e limão.',
  '[
    {"step": 1, "title": "Asse batata e grão de bico", "description": "Asse batata doce em cubos e grão de bico a 200°C por 25 minutos.", "time_minutes": 25},
    {"step": 2, "title": "Prepare os vegetais", "description": "Cozinhe brócolis no vapor e rale a cenoura.", "time_minutes": 10},
    {"step": 3, "title": "Monte o bowl", "description": "Coloque arroz como base e adicione todos os ingredientes em setores.", "time_minutes": 5},
    {"step": 4, "title": "Finalize", "description": "Regue com molho de tahine e limão.", "time_minutes": 2}
  ]',
  'Almoço',
  ARRAY['fit', 'vegano', 'completo', 'colorido'],
  ARRAY[],
  TRUE
);

-- Recipe 25: Sorvete de Banana
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
  is_active
) VALUES (
  'Nice Cream de Banana (1 ingrediente)',
  'Sorvete saudável de apenas 1 ingrediente! Mágico e delicioso.',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
  5,
  2,
  280,
  105,
  '[
    {"item": "Bananas maduras", "quantity": "3 unidades", "notes": "congeladas em fatias"},
    {"item": "Toppings opcionais", "quantity": "a gosto", "notes": "cacau, pasta de amendoim, frutas"}
  ]',
  'Corte bananas maduras em fatias e congele por pelo menos 4 horas. Bata no processador até ficar cremoso (igual sorvete). Sirva imediatamente ou congele por 30 min para ficar mais firme. Adicione toppings a gosto.',
  '[
    {"step": 1, "title": "Congele as bananas", "description": "Corte bananas em fatias e congele por pelo menos 4 horas.", "time_minutes": 240},
    {"step": 2, "title": "Processe", "description": "Bata no processador até ficar cremoso (textura de sorvete).", "time_minutes": 5},
    {"step": 3, "title": "Sirva", "description": "Sirva imediatamente ou congele por 30 min. Adicione toppings.", "time_minutes": 2}
  ]',
  'Sobremesas',
  ARRAY['fit', 'vegano', '1 ingrediente', 'sem açúcar'],
  ARRAY[],
  TRUE
);

-- Recipe 26: Atum Selado Oriental
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
  is_active
) VALUES (
  'Atum Selado com Gergelim',
  'Prato oriental sofisticado! Atum mal passado crocante por fora.',
  'https://images.unsplash.com/photo-1580959620945-5d5c0e4d7e3c?w=800',
  20,
  2,
  490,
  310,
  '[
    {"item": "Filé de atum fresco", "quantity": "2 postas (300g)", "notes": "de qualidade"},
    {"item": "Gergelim branco e preto", "quantity": "4 colheres", "notes": "misturados"},
    {"item": "Molho shoyu", "quantity": "2 colheres", "notes": "low sodium"},
    {"item": "Gengibre ralado", "quantity": "1 colher de chá", "notes": null},
    {"item": "Óleo de gergelim", "quantity": "1 colher", "notes": null},
    {"item": "Limão", "quantity": "1 unidade", "notes": null}
  ]',
  'Marine o atum com shoyu, gengibre e limão por 10 min. Passe no gergelim pressionando bem. Aqueça frigideira muito quente com óleo de gergelim. Sele cada lado por 1-2 minutos (fica cru no centro). Corte em fatias.',
  '[
    {"step": 1, "title": "Marine o atum", "description": "Tempere com shoyu, gengibre e limão. Deixe por 10 minutos.", "time_minutes": 10},
    {"step": 2, "title": "Empane no gergelim", "description": "Passe o atum no gergelim pressionando bem para aderir.", "time_minutes": 3},
    {"step": 3, "title": "Sele", "description": "Em frigideira muito quente, sele 1-2 min cada lado.", "time_minutes": 5},
    {"step": 4, "title": "Corte", "description": "Corte em fatias finas e sirva.", "time_minutes": 2}
  ]',
  'Jantar',
  ARRAY['fit', 'proteína', 'omega 3', 'oriental'],
  ARRAY['peixe', 'soja', 'gergelim'],
  TRUE
);

-- Recipe 27: Barrinhas de Cereais Caseiras
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
  is_active
) VALUES (
  'Barrinhas de Cereal Fit Caseiras',
  'Barrinhas saudáveis para lanche! Muito melhor que industrializadas.',
  'https://images.unsplash.com/photo-1564345988484-8fbd5b928f06?w=800',
  30,
  12,
  290,
  140,
  '[
    {"item": "Aveia em flocos", "quantity": "2 xícaras", "notes": null},
    {"item": "Frutas secas", "quantity": "1 xícara", "notes": "tâmaras, uvas passas"},
    {"item": "Castanhas picadas", "quantity": "1/2 xícara", "notes": null},
    {"item": "Pasta de amendoim", "quantity": "1/3 xícara", "notes": "sem açúcar"},
    {"item": "Mel", "quantity": "1/4 xícara", "notes": null},
    {"item": "Essência de baunilha", "quantity": "1 colher de chá", "notes": null}
  ]',
  'Processe as frutas secas até formar pasta. Misture com aveia, castanhas e baunilha. Aqueça pasta de amendoim e mel até derreter. Misture tudo. Pressione em forma retangular. Leve à geladeira por 2 horas. Corte em barras.',
  '[
    {"step": 1, "title": "Prepare a base", "description": "Processe frutas secas e misture com aveia e castanhas.", "time_minutes": 10},
    {"step": 2, "title": "Faça o ligante", "description": "Aqueça pasta de amendoim e mel. Misture tudo.", "time_minutes": 5},
    {"step": 3, "title": "Modele", "description": "Pressione em forma forrada e leve à geladeira por 2 horas.", "time_minutes": 120},
    {"step": 4, "title": "Corte", "description": "Corte em barras do tamanho desejado.", "time_minutes": 5}
  ]',
  'Lanches',
  ARRAY['fit', 'meal prep', 'prático', 'energético'],
  ARRAY['aveia', 'castanhas', 'amendoim'],
  TRUE
);

-- Recipe 28: Carne Moída com Legumes
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
  is_active
) VALUES (
  'Carne Moída com Legumes Refogados',
  'Prato simples, completo e saudável! Perfeito para marmitas.',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
  25,
  4,
  510,
  290,
  '[
    {"item": "Patinho moído", "quantity": "500g", "notes": "magro"},
    {"item": "Cenoura", "quantity": "2 unidades", "notes": "em cubos"},
    {"item": "Vagem", "quantity": "1 xícara", "notes": "picada"},
    {"item": "Chuchu", "quantity": "1 unidade", "notes": "em cubos"},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Alho", "quantity": "3 dentes", "notes": "amassados"},
    {"item": "Tomate", "quantity": "2 unidades", "notes": "picados"},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta, cominho"}
  ]',
  'Refogue cebola e alho. Adicione a carne moída e cozinhe até dourar. Adicione tomate e temperos. Acrescente todos os legumes e adicione 1/2 xícara de água. Cozinhe tampado por 15 minutos.',
  '[
    {"step": 1, "title": "Refogue a carne", "description": "Refogue cebola e alho, adicione carne moída e doure bem.", "time_minutes": 10},
    {"step": 2, "title": "Adicione tomate", "description": "Adicione tomate picado e temperos. Refogue por 3 minutos.", "time_minutes": 5},
    {"step": 3, "title": "Cozinhe os legumes", "description": "Adicione legumes e 1/2 xícara de água. Cozinhe tampado por 15 min.", "time_minutes": 15}
  ]',
  'Almoço',
  ARRAY['fit', 'proteína', 'marmita', 'prático'],
  ARRAY[],
  TRUE
);

-- Recipe 29: Vitamina Verde Detox
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
  is_active
) VALUES (
  'Vitamina Verde Detox Energizante',
  'Vitamina nutritiva e desintoxicante! Perfeita pós-treino.',
  'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800',
  5,
  1,
  310,
  125,
  '[
    {"item": "Couve", "quantity": "2 folhas", "notes": "sem talo"},
    {"item": "Banana", "quantity": "1 unidade", "notes": "congelada"},
    {"item": "Maçã verde", "quantity": "1/2 unidade", "notes": null},
    {"item": "Gengibre", "quantity": "1cm", "notes": null},
    {"item": "Limão", "quantity": "1/2 unidade", "notes": "suco"},
    {"item": "Água de coco", "quantity": "200ml", "notes": null},
    {"item": "Hortelã", "quantity": "4 folhas", "notes": "opcional"}
  ]',
  'Bata todos os ingredientes no liquidificador até ficar homogêneo. Se preferir mais líquido, adicione mais água de coco. Sirva imediatamente.',
  '[
    {"step": 1, "title": "Bata tudo", "description": "Bata couve, banana, maçã, gengibre, limão e água de coco.", "time_minutes": 3},
    {"step": 2, "title": "Ajuste", "description": "Ajuste a consistência com mais água se necessário.", "time_minutes": 1},
    {"step": 3, "title": "Sirva", "description": "Sirva imediatamente bem gelado.", "time_minutes": 1}
  ]',
  'Lanches',
  ARRAY['fit', 'detox', 'pós-treino', 'vegano'],
  ARRAY[],
  TRUE
);

-- Recipe 30: Escondidinho de Frango
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
  is_active
) VALUES (
  'Escondidinho de Frango com Purê de Batata Doce',
  'Comfort food fit! Cremoso e reconfortante.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
  45,
  6,
  580,
  320,
  '[
    {"item": "Peito de frango", "quantity": "600g", "notes": "desfiado"},
    {"item": "Batata doce", "quantity": "800g", "notes": "cozidas"},
    {"item": "Leite desnatado", "quantity": "1/2 xícara", "notes": null},
    {"item": "Queijo cottage", "quantity": "1/2 xícara", "notes": null},
    {"item": "Tomate", "quantity": "3 unidades", "notes": "picados"},
    {"item": "Cebola", "quantity": "1 unidade", "notes": "picada"},
    {"item": "Alho", "quantity": "3 dentes", "notes": null},
    {"item": "Temperos", "quantity": "a gosto", "notes": "sal, pimenta, orégano"}
  ]',
  'Refogue o frango desfiado com cebola, alho e tomate. Faça purê com batata doce, leite e cottage. Monte em refratário: frango, purê por cima. Asse a 200°C por 20 minutos.',
  '[
    {"step": 1, "title": "Prepare o frango", "description": "Refogue cebola, alho, adicione frango desfiado e tomate. Tempere.", "time_minutes": 15},
    {"step": 2, "title": "Faça o purê", "description": "Amasse batata doce cozida com leite e cottage até cremoso.", "time_minutes": 10},
    {"step": 3, "title": "Monte", "description": "Em refratário, coloque frango e cubra com purê.", "time_minutes": 5},
    {"step": 4, "title": "Asse", "description": "Asse a 200°C por 20 minutos até dourar.", "time_minutes": 20}
  ]',
  'Jantar',
  ARRAY['fit', 'comfort food', 'proteína', 'cremoso'],
  ARRAY['laticínios'],
  TRUE
);
