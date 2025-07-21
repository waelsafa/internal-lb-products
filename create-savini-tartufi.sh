#!/bin/bash

# Script to create SAVINI TARTUFI product entries

echo "🍄 Creating SAVINI TARTUFI product entries..."

cd /home/admwael/misc/internal-lb-products

# Create a counter for product numbering
counter=600

# Array of SAVINI TARTUFI products based on the image files
declare -A products=(
    ["AA03CS50180_affettato di tartufo estivo.jpg"]="SAVINI TARTUFI Affettato di Tartufo Estivo"
    ["BA03CS03080_condimento a base di burro e acciughe con tartufo.jpg"]="SAVINI TARTUFI Condimento a Base di Burro e Acciughe con Tartufo"
    ["CP03CS03090EP_crema con parmigiano reggiano e tartufo.jpg"]="SAVINI TARTUFI Crema con Parmigiano Reggiano e Tartufo"
    ["CZ03CS03180_crema di zucca al tartufo.jpg"]="SAVINI TARTUFI Crema di Zucca al Tartufo"
    ["DG03CS03180_carbonara al tartufo.jpg"]="SAVINI TARTUFI Carbonara al Tartufo"
    ["DZC03CS03060_polvere al tartufo.jpg"]="SAVINI TARTUFI Polvere al Tartufo"
    ["ID03CS03100GI_sale al tartufo.jpg"]="SAVINI TARTUFI Sale al Tartufo"
    ["MM06CS05120_condimento a base di miele al tartufo bianco.jpg"]="SAVINI TARTUFI Condimento a Base di Miele al Tartufo Bianco"
    ["OO01CS00250_condimento a base di olio di olivia al tartufo bianco (1).jpg"]="SAVINI TARTUFI Condimento a Base di Olio di Olivia al Tartufo Bianco"
    ["OO04CS00250_condimento a base di olio di olivia al tartufo nero.jpg"]="SAVINI TARTUFI Condimento a Base di Olio di Olivia al Tartufo Nero"
    ["SF03CS50500_salsa al tartufo estivo.jpg"]="SAVINI TARTUFI Salsa al Tartufo Estivo"
    ["SL03CS05180_bruschetta con tartufo.jpg"]="SAVINI TARTUFI Bruschetta con Tartufo"
    ["ST03CS03180-500  salsa del tartufaio.jpg"]="SAVINI TARTUFI Salsa del Tartufaio"
    ["SV03CS05090_pesto al basilico con tartufo.jpg"]="SAVINI TARTUFI Pesto al Basilico con Tartufo"
    ["V25060_tartufo estivo essiccato.jpg"]="SAVINI TARTUFI Tartufo Estivo Essiccato"
    ["V25061 - sale rosa dell'Himalaya (1).jpg"]="SAVINI TARTUFI Sale Rosa dell'Himalaya"
    ["V25064_grattugia per tartufo.jpg"]="SAVINI TARTUFI Grattugia per Tartufo"
    ["V2604 truffle chips.jpg"]="SAVINI TARTUFI Truffle Chips"
)

# Create markdown files for each product
for image_file in "${!products[@]}"; do
    if [ "$image_file" != ".DS_Store" ]; then
        product_name="${products[$image_file]}"
        filename=$(printf "%03d-%s.md" $counter "$(echo "$product_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')")
        
        cat > "_products/$filename" << EOF
---
title: "$product_name"
category: "antipasti"
subcategory: "SAVINI TARTUFI"
image: "media/antipasti/SAVINI TARTUFI PICS/$image_file"
id: "antipasti-savini-tartufi-$counter"
---

$product_name

SAVINI TARTUFI
EOF
        
        echo "✅ Created $filename"
        ((counter++))
    fi
done

echo "🎯 All SAVINI TARTUFI products created!"
