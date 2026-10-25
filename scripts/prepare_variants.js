// scripts/prepare_variants.js
// Generates concise (2x) and key-points (5x) narration scripts for all 7 species * 12 stages = 84 stages.
// Also updates narrationData.js and exports JSON for PowerShell audio synthesis.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dumpPath = path.join(__dirname, 'narrations_dump.json');
const rawData = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));

// Species-specific concise botanical builders to produce authentic, varied scripts
const SPECIES_STAGE_CONCISE = {
  tomato: {
    SEED: {
      s2x: "The tomato seed absorbs soil moisture, activating enzymes to convert stored endosperm starch into fuel.",
      s5x: "Seed Imbibition: Water absorption awakens the dormant tomato embryo."
    },
    GERMINATION: {
      s2x: "The embryonic radicle breaches the seed coat, guided downward by gravity to anchor in the substrate.",
      s5x: "Radicle Emergence: The taproot breaches downward to anchor the seedling."
    },
    ROOT_DEVELOPMENT: {
      s2x: "The taproot plunges downward while lateral feeder roots spread outward to absorb water and vital minerals.",
      s5x: "Root Development: Taproot branches and root hairs multiply nutrient uptake."
    },
    SHOOT_EMERGENCE: {
      s2x: "The arched hypocotyl breaks through the topsoil into sunlight, straightening as photomorphogenesis begins.",
      s5x: "Shoot Emergence: The hypocotyl loop breaks surface and straightens toward light."
    },
    SEEDLING: {
      s2x: "Two cotyledons unfold horizontally and the first true pinnate leaves emerge, clad in protective glandular trichomes.",
      s5x: "Seedling Stage: Cotyledons spread and true compound leaves begin photosynthesis."
    },
    VEGETATIVE_GROWTH: {
      s2x: "Vigorous sympodial branching builds a dense multi-tiered canopy, maximizing solar energy capture.",
      s5x: "Vegetative Growth: Robust stem thickening and rapid canopy expansion."
    },
    BUD_FORMATION: {
      s2x: "Apical meristems transition into floral cymes, forming tightly wrapped green flower buds.",
      s5x: "Bud Formation: Floral inflorescence cymes form along the branches."
    },
    FLOWERING: {
      s2x: "Bright yellow star-shaped flowers open, presenting anthers fused into a protective cone around the pistil.",
      s5x: "Flowering: Golden star-shaped blossoms open to invite pollinators."
    },
    FRUIT_SET: {
      s2x: "Vibrations from bumblebee buzz pollination shake pollen from anther pores onto the receptive stigma.",
      s5x: "Pollination: Sonic buzz vibrations dislodge pollen grains for fertilization."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Fertilized ovaries swell into firm green tomatoes as cell division and water accumulation accelerate.",
      s5x: "Fruit Development: Green berries swell as cells expand rapidly."
    },
    RIPENING: {
      s2x: "Chlorophyll degrades and lycopene accumulates, transforming green fruit into fragrant, glossy scarlet tomatoes.",
      s5x: "Ripening: Lycopene synthesis turns the fruit brilliant crimson."
    },
    MATURE: {
      s2x: "Vines reach full maturity, laden with heavy clusters of ripe, nutrient-rich tomatoes ready for harvest.",
      s5x: "Full Maturity: Prime harvest milestone with heavy clusters of ripe fruit."
    }
  },
  sunflower: {
    SEED: {
      s2x: "The sunflower achene hydrates in the soil, initiating enzymatic mobilization of stored embryonic lipids.",
      s5x: "Seed Imbibition: Water uptake activates lipid reserves within the sunflower seed."
    },
    GERMINATION: {
      s2x: "A stout white radicle bursts through the pericarp, anchoring the emerging seedling deep into the earth.",
      s5x: "Germination: The vigorous radicle ruptures the shell and anchors downward."
    },
    ROOT_DEVELOPMENT: {
      s2x: "A powerful taproot descends over a meter deep, flanked by spreading laterals that secure water and nutrients.",
      s5x: "Root Architecture: A deep taproot anchors the future giant against strong winds."
    },
    SHOOT_EMERGENCE: {
      s2x: "The sturdy hypocotyl arch pulls the heavy cotyledons through the topsoil into direct sunlight.",
      s5x: "Shoot Emergence: The thick hypocotyl pushes through soil toward the sun."
    },
    SEEDLING: {
      s2x: "Fleshy cotyledons expand and coarse, rough-haired true leaves unfold, tracking the sun across the sky.",
      s5x: "Seedling: Cotyledons open and rough true leaves begin solar tracking."
    },
    VEGETATIVE_GROWTH: {
      s2x: "The main fibrous stalk thickens dramatically, displaying heliotropism as large cordate leaves turn with the sun.",
      s5x: "Vegetative Growth: Rapid stalk thickening and active daily heliotropic solar tracking."
    },
    BUD_FORMATION: {
      s2x: "The apical stem ceases upward growth to construct a massive terminal flower bud wrapped in green involucral bracts.",
      s5x: "Bud Formation: Massive terminal floral bud forms wrapped in protective bracts."
    },
    FLOWERING: {
      s2x: "Golden ray florets unfurl around a disc of hundreds of tiny fertile disk florets arranged in Fibonacci spirals.",
      s5x: "Anthesis: Brilliant golden ray petals open around the intricate central disk."
    },
    FRUIT_SET: {
      s2x: "Foraging bees crawl across the spiraling disc florets, transferring pollen across receptive bifid stigmas.",
      s5x: "Pollination: Active bee foraging ensures cross-pollination across disk florets."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Ray petals wither as fertilized disk florets develop into plump achenes packed with unsaturated oils.",
      s5x: "Seed Development: Petals drop and hundreds of oil-rich achene seeds swell."
    },
    RIPENING: {
      s2x: "The back of the flower head turns from green to golden yellow, and the seed hulls harden into striped shells.",
      s5x: "Ripening: The capitulum head turns golden and seed hulls harden."
    },
    MATURE: {
      s2x: "The heavy head bows earthward, laden with hundreds of dry, mature sunflower seeds ready for dispersal.",
      s5x: "Full Maturity: The massive head droops heavily with fully ripe seeds."
    }
  },
  strawberry: {
    SEED: {
      s2x: "The tiny achene hydrates upon the soil, signaling the microscopic embryo to break physiological dormancy.",
      s5x: "Achene Imbibition: Microscopic strawberry seed absorbs moisture and awakens."
    },
    GERMINATION: {
      s2x: "A delicate radicle pierces the achene coat and roots gently into the humus-rich surface layer.",
      s5x: "Radicle Emergence: Fragile root tip anchors in the topsoil layer."
    },
    ROOT_DEVELOPMENT: {
      s2x: "Fibrous adventitious roots proliferate from the basal crown, forming a shallow, dense absorption network.",
      s5x: "Fibrous Roots: A shallow crown root system multiplies to absorb surface moisture."
    },
    SHOOT_EMERGENCE: {
      s2x: "A miniature rosette shoot emerges from the crown, staying low to avoid wind and frost.",
      s5x: "Shoot Emergence: Basal crown shoot emerges close to the ground."
    },
    SEEDLING: {
      s2x: "Tiny trifoliate serrated leaves unfold from delicate petioles, establishing the perennial strawberry rosette.",
      s5x: "Seedling: Characteristic trifoliate saw-toothed leaves unfold."
    },
    VEGETATIVE_GROWTH: {
      s2x: "The central crown thickens, sending out vigorous stolons or runners to propagate clone daughter plants.",
      s5x: "Vegetative Stolons: Rosette crown thickens and sends out arching runners."
    },
    BUD_FORMATION: {
      s2x: "Crown meristems differentiate into cyme clusters of pale green flower buds held above the foliage.",
      s5x: "Inflorescence: Delicate floral buds emerge on slender upright pedicels."
    },
    FLOWERING: {
      s2x: "Pristine five-petaled white blossoms open with prominent golden rings of pollen-bearing stamens.",
      s5x: "Blossom: Pure white blossoms open with luminous yellow centers."
    },
    FRUIT_SET: {
      s2x: "Hoverflies and native bees cross-pollinate dozens of individual pistils covering the cone-shaped receptacle.",
      s5x: "Pollination: Insects pollinate dozens of pistils across the conical receptacle."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "The central floral receptacle expands into an enlarged succulent false fruit studded with immature green achenes.",
      s5x: "Fruit Growth: The fleshy receptacle swells, carrying true achene seeds on its skin."
    },
    RIPENING: {
      s2x: "Anthocyanin pigments accumulate as the fleshy receptacle softens, sweetens, and turns glossy vibrant red.",
      s5x: "Ripening: Receptacle turns from pale green to fragrant, glossy crimson red."
    },
    MATURE: {
      s2x: "Plump, aromatic red strawberries hang ready from fruit stalks, inviting wildlife to disperse the seeds.",
      s5x: "Full Maturity: Succulent, aromatic ripe strawberries ready for harvest."
    }
  },
  wheat: {
    SEED: {
      s2x: "The wheat caryopsis imbibes moisture, triggering gibberellins in the aleurone layer to produce digestive enzymes.",
      s5x: "Grain Imbibition: Water triggers aleurone enzymes to mobilize starchy endosperm."
    },
    GERMINATION: {
      s2x: "The coleorhiza breaks open and the primary seminal root emerges, quickly followed by lateral seminal roots.",
      s5x: "Seminal Roots: Primary and pair lateral seminal roots pierce the husk."
    },
    ROOT_DEVELOPMENT: {
      s2x: "A dense fibrous root system expands deep into the subsoil, optimizing water and nitrate absorption.",
      s5x: "Root Network: Dense fibrous roots anchor the grain and seek deep moisture."
    },
    SHOOT_EMERGENCE: {
      s2x: "A sharp, protective coleoptile spears upward through the soil, shielding the first embryonic leaf.",
      s5x: "Coleoptile Emergence: Spear-like coleoptile breaches the surface into sunlight."
    },
    SEEDLING: {
      s2x: "Linear parallel-veined leaves emerge from the coleoptile tip, launching active photosynthetic development.",
      s5x: "Seedling: Slender upright blade leaves unroll to capture solar radiation."
    },
    VEGETATIVE_GROWTH: {
      s2x: "The wheat plant enters tillering and stem elongation, multiplying stalks and thickening internal nodes.",
      s5x: "Tillering & Stem Elongation: Stems multiply into tillers and shoot skyward."
    },
    BUD_FORMATION: {
      s2x: "During the boot stage, the developing wheat spike swells inside the sheath of the uppermost flag leaf.",
      s5x: "Booting Stage: Swelling spike head is held within the protective flag leaf sheath."
    },
    FLOWERING: {
      s2x: "The spike emerges and tiny florets open for anthesis, exposing feathery stigmas and pale yellow anthers.",
      s5x: "Heading & Anthesis: Wheat ear emerges and florets open for pollination."
    },
    FRUIT_SET: {
      s2x: "Wheat flowers self-pollinate swiftly within the glumes via wind currents and gravity.",
      s5x: "Wind Pollination: Rapid self-pollination takes place inside protective glumes."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Caryopsis grains enter the milk and dough stages, depositing dense starch and gluten proteins in the kernel.",
      s5x: "Grain Fill: Kernels swell through milk and dough stages with starch and protein."
    },
    RIPENING: {
      s2x: "Stems and ears lose moisture, transitioning from lush green to a radiant shimmering golden amber.",
      s5x: "Ripening: Moisture drops and fields turn to shimmering golden amber."
    },
    MATURE: {
      s2x: "Golden wheat heads bow heavily under the weight of hard, mature grains, ready for combine harvest.",
      s5x: "Full Maturity: Hard, dry golden grains in bowed heads ready for harvest."
    }
  },
  chilli: {
    SEED: {
      s2x: "The flattened pepper seed absorbs soil moisture, activating internal gibberellins to dissolve stored endosperm.",
      s5x: "Seed Imbibition: Warm moisture activates stored reserves within the pepper seed."
    },
    GERMINATION: {
      s2x: "The embryonic radicle pierces the tough seed coat, descending rapidly into warm, moist soil.",
      s5x: "Radicle Emergence: Vigorous white root descends to establish subterranean hold."
    },
    ROOT_DEVELOPMENT: {
      s2x: "A deep central taproot forms, supplemented by extensive lateral feeder roots that scour the soil for nutrients.",
      s5x: "Root Branching: Taproot and dense laterals build a high-capacity absorption system."
    },
    SHOOT_EMERGENCE: {
      s2x: "The arched green hypocotyl lifts the seedling above ground, shaking off the seed coat as it greets the light.",
      s5x: "Shoot Emergence: Hypocotyl lifts the seedling into the light and sheds the husk."
    },
    SEEDLING: {
      s2x: "Two lance-shaped cotyledons flatten out, followed by the appearance of shiny, dark green true leaves.",
      s5x: "Seedling: Smooth lanceolate cotyledons spread and true leaves expand."
    },
    VEGETATIVE_GROWTH: {
      s2x: "The chilli bush develops a characteristic dichotomous branching architecture with dense, glossy foliage.",
      s5x: "Vegetative Forking: Stems fork into an open, sturdy bush with glossy green leaves."
    },
    BUD_FORMATION: {
      s2x: "Nodding green flower buds appear in the stem axils, hanging on slender, flexible pedicels.",
      s5x: "Bud Formation: Inverted floral buds emerge at the branch fork nodes."
    },
    FLOWERING: {
      s2x: "Delicate star-shaped white blossoms open, displaying pale blue-purple anthers loaded with fertile pollen.",
      s5x: "Flowering: Starry white flowers open with distinctive purplish-blue anthers."
    },
    FRUIT_SET: {
      s2x: "Air movement and visiting insects vibrate the drooping flowers, transferring pollen onto the central stigma.",
      s5x: "Pollination: Gentle breeze and pollinators fertilize the nodding blossoms."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Fertilized ovaries elongate into glossy green peppers, synthesizing capsaicin in the inner placental ribs.",
      s5x: "Fruit Growth: Peppers elongate rapidly, synthesizing pungent capsaicin within."
    },
    RIPENING: {
      s2x: "Chlorophyll breaks down as capsanthin pigments synthesize, turning the green chilli into fiery crimson.",
      s5x: "Color Break: Capsanthin synthesis turns peppers from deep green to fiery red."
    },
    MATURE: {
      s2x: "The bushy chilli plant displays vibrant fiery peppers, bursting with concentrated capsaicin and ready for picking.",
      s5x: "Full Maturity: Heavy crop of glossy, fiery hot chillies ready for harvest."
    }
  },
  rice: {
    SEED: {
      s2x: "The submerged paddy seed imbibes water through its fibrous hull, awakening cellular respiration under low oxygen.",
      s5x: "Paddy Imbibition: Rice grain imbibes water and initiates aquatic germination."
    },
    GERMINATION: {
      s2x: "In flooded conditions, the coleoptile emerges first to reach oxygen, followed closely by the seminal root.",
      s5x: "Germination: The coleoptile spears upward through water toward atmospheric air."
    },
    ROOT_DEVELOPMENT: {
      s2x: "Adventitious roots develop spongy aerenchyma tissue, channeling oxygen down from foliage into waterlogged mud.",
      s5x: "Aerenchyma Roots: Specialized spongy roots channel oxygen down into flooded mud."
    },
    SHOOT_EMERGENCE: {
      s2x: "Slender green shoots rise above the water line, unfolding specialized leaves that thrive in saturated soils.",
      s5x: "Shoot Emergence: Fresh green tillers rise gracefully above the water surface."
    },
    SEEDLING: {
      s2x: "Young rice seedlings develop multiple leaves with prominent ligules, anchoring firmly in the rich paddy mud.",
      s5x: "Seedling: Delicate ribbon-like blades form strong rooted clumps in the paddy."
    },
    VEGETATIVE_GROWTH: {
      s2x: "Rapid tillering creates dense clumps of leafy culms that turn the flooded paddy into a luxuriant emerald sea.",
      s5x: "Tillering: Explosive tillering produces dense emerald clumps across the paddy."
    },
    BUD_FORMATION: {
      s2x: "Panicle differentiation begins deep within the stem sheath during the swelling boot stage.",
      s5x: "Panicle Booting: Developing grain heads swell inside the protective sheath."
    },
    FLOWERING: {
      s2x: "The branched panicle emerges above the canopy and spikelets open briefly in the midday warmth for anthesis.",
      s5x: "Heading: Arching panicles emerge and tiny white spikelets open to pollinate."
    },
    FRUIT_SET: {
      s2x: "Rice florets self-pollinate within minutes as breezes transfer pollen grains inside the palea and lemma.",
      s5x: "Pollination: Swift self-pollination takes place inside the protective hulls."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Starch fills the developing kernels through milk and dough stages, causing the green panicles to bow downward.",
      s5x: "Grain Fill: Kernels fill with starch, weighing down the arching panicles."
    },
    RIPENING: {
      s2x: "The paddy dries down as the grain moisture drops, turning the emerald canopy into a sea of radiant golden amber.",
      s5x: "Ripening: Grains harden and the crop turns from vivid green to rich golden straw."
    },
    MATURE: {
      s2x: "Bowed, heavy golden panicles stand fully ripe across the dry paddy, ready for seasonal harvest.",
      s5x: "Full Maturity: Golden, heavy-headed grain clusters ready for paddy harvesting."
    }
  },
  rose: {
    SEED: {
      s2x: "The hard rose hip achene absorbs winter moisture, softening its thick shell to break physiological dormancy.",
      s5x: "Achene Imbibition: Moisture and cold stratification awaken the dormant rose seed."
    },
    GERMINATION: {
      s2x: "The primary radicle breaks free from the hard woody shell and anchors downward into the soil.",
      s5x: "Radicle Emergence: Strong root radicle bursts through the woody achene coat."
    },
    ROOT_DEVELOPMENT: {
      s2x: "A woody perennial root system establishes deep anchorage and extensive lateral channels for nutrients.",
      s5x: "Perennial Roots: Woody subterranean roots branch deep to support the future shrub."
    },
    SHOOT_EMERGENCE: {
      s2x: "A reddish seedling stem emerges above ground, bearing defensive epidermal prickles and juvenile foliage.",
      s5x: "Shoot Emergence: Crimson-tinted shoot rises bearing the first tiny prickles."
    },
    SEEDLING: {
      s2x: "Odd-pinnate serrated leaves unfold along the young stem, carrying basal stipules typical of Rosaceae.",
      s5x: "Seedling: Classic serrated compound leaves unfold along the juvenile cane."
    },
    VEGETATIVE_GROWTH: {
      s2x: "Woody canes surge upward and arch outward, forming an impenetrable thorny framework of glossy green leaves.",
      s5x: "Vegetative Canes: Sturdy woody canes elongate and branch into a full thorny shrub."
    },
    BUD_FORMATION: {
      s2x: "Sepals envelope the developing flower bud, which swells at the tip of terminal shoots with tightly folded petals.",
      s5x: "Bud Formation: Plump floral buds swell at branch tips, wrapped in green sepals."
    },
    FLOWERING: {
      s2x: "Fragrant velvety rose petals unfurl in radiant succession, exposing a golden crown of fertile stamens.",
      s5x: "Anthesis: Fragrant velvety rose blossoms unfurl in dramatic splendor."
    },
    FRUIT_SET: {
      s2x: "Bees delve into the fragrant blossoms, gathering pollen and transferring grains onto the sticky stigmas.",
      s5x: "Pollination: Foraging bees pollinate the dense ring of stigmas at the blossom core."
    },
    FRUIT_DEVELOPMENT: {
      s2x: "Petals fall as the hypanthium receptacle swells into a firm green rose hip encasing developing seeds.",
      s5x: "Hip Development: Fleshy hypanthium swells into a green, nutrient-packed rose hip."
    },
    RIPENING: {
      s2x: "Carotenoids and lycopene accumulate in the hip wall, shifting the color from green to brilliant glossy crimson.",
      s5x: "Color Shift: Rose hips turn from green to fiery glossy scarlet."
    },
    MATURE: {
      s2x: "The perennial shrub stands stately with arched canes laden with scarlet hips, prepared for winter dormancy.",
      s5x: "Full Maturity: Regal woody shrub laden with glossy crimson hips ready for winter."
    }
  }
};

// Process each species and stage to add script2x and script5x
for (const speciesId of Object.keys(rawData)) {
  const spec = rawData[speciesId];
  const stageTemplates = SPECIES_STAGE_CONCISE[speciesId] || {};

  spec.stages.forEach((stage) => {
    const sId = stage.stageId;
    const t = stageTemplates[sId];
    if (t) {
      stage.script2x = t.s2x;
      stage.script5x = t.s5x;
    } else {
      // Fallback generator if ever needed
      stage.script2x = `${stage.title}: ${stage.visualChanges} ${stage.biologicalProcess}`.slice(0, 160);
      stage.script5x = `${stage.title}: ${stage.shortSummary}`.slice(0, 80);
    }
  });
}

// Write the augmented dump
const outDumpPath = path.join(__dirname, 'narrations_variants_dump.json');
fs.writeFileSync(outDumpPath, JSON.stringify(rawData, null, 2), 'utf-8');
console.log(`Saved variants dump to ${outDumpPath}`);

// Also print summary
let totalStages = 0;
for (const k of Object.keys(rawData)) {
  totalStages += rawData[k].stages.length;
}
console.log(`Successfully generated 2x and 5x variants for all ${Object.keys(rawData).length} species, total ${totalStages} stages.`);
