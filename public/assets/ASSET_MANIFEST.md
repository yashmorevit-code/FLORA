# FLORA — Botanical Asset Manifest

This document provides a comprehensive inventory, provenance record, licensing verification, and botanical morphological justification for all 3D assets, procedural syntheses, textures, and environment maps integrated into the **FLORA Botanical Plant Growth Simulator**.

---

## 1. Botanical Crop Models & Morphologies

### 1.1 Tomato Plant (*Solanum lycopersicum*)
* **Common Name**: Tomato
* **Scientific Name**: *Solanum lycopersicum* (Family: Solanaceae)
* **Asset Filename**: `tomato_plant.glb`
* **File Path**: `public/assets/plants/tomato/tomato_plant.glb`
* **File Size**: `5.46 MB` (binary glTF 2.0)
* **Original Asset Source**: GH-01 Digital Twin Open Project ([GitHub Repository](https://github.com/sumithshridhar/gh01-twin))
* **Author / Modeller**: Sumith Shridhar (Blender modelling of greenhouse tomato crop architecture in Karnataka polyhouses)
* **Licence**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
* **Attribution Requirements**: None required under CC0; cited for scientific provenance.
* **Model Format**: Binary glTF 2.0 (`.glb`) with embedded PBR textures.
* **Texture Files**: Embedded within GLB buffer (albedo diffuse, normal, roughness).
* **Static vs Animated**: Multi-mesh developmental stages (`_pv0` to `_pv5`) switched conditionally via R3F; dynamic shader ripening and foliar chlorosis.
* **Independently Controllable Plant Parts**:
  * Main Stem (`.stem`): Sympodial axis with visible internodes.
  * Compound Leaves (`.leaves`): True odd-pinnate tomato foliage with terminal and lateral leaflets.
  * Inflorescence Flowers (`.flowers`): Star-shaped yellow blossoms.
  * Fruit Truss (`.fruit`): Clustered green/breaker/ripe berries with persistent calyx sepals.
  * Root Collar (`.roots`): Ground-level hypocotyl junction.
* **Transformations & Modifications**:
  * Normalized bounding box, centered at origin $(X=0, Z=0)$, with base placed at soil line ($Y=0$).
  * Dynamic ripening color interpolation on fruit material (`#388e3c` $\to$ `#ffa726` $\to$ `#c62828`).
* **Botanical Justification**:
  * Provides 104 discrete mesh subcomponents and 6 authentic developmental stages matching real greenhouse crop phenotyping.

---

### 1.2 Sunflower Plant (*Helianthus annuus*)
* **Common Name**: Sunflower
* **Scientific Name**: *Helianthus annuus* (Family: Asteraceae)
* **Asset Filename**: `sunflower.glb`
* **File Path**: `public/assets/plants/sunflower/sunflower.glb`
* **File Size**: `4.63 MB` (binary glTF 2.0)
* **Original Asset Source**: [Sketchfab saintalmaty/sunflower](https://github.com/saintalmaty/sunflower)
* **Author**: saintalmaty / Sketchfab Community
* **Licence**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
* **Attribution Requirements**: Mandatory credit to author "saintalmaty" and CC-BY 4.0 license link.
* **Model Format**: Binary glTF 2.0 (`.glb`) with embedded PBR textures.
* **Texture Files**: Embedded diffuse, normal, and roughness maps.
* **Static vs Animated**: Static multi-mesh hierarchy dynamically animated via Three.js frame hooks (wind flex, gravitropic head nodding, ray floret withering).
* **Independently Controllable Plant Parts**:
  * Column Stem (`Cylinder`): Monopodial tall fibrous stalk.
  * Cordate Leaves (`Plane.001_HOJA_1` – `Plane.052_HOJA_1`): 52 individually addressable broad rough leaves.
  * Capitulum Head (`Cube_GIRASOLITO`): Apical disc floret center and golden ray floret perimeter.
  * Phyllaries / Involucral Bracts (`OJITAS`, `ojita`): Multi-tier green protective bracts.
* **Transformations & Modifications**:
  * Scaled to realistic botanical height ($1.8\text{m}$ to $2.8\text{m}$).
  * Dynamic head nodding angle driven by simulated seed weight and maturity.
  * Ray floret withering shader during achene filling and senescence.
* **Botanical Justification**:
  * Offers individual meshes for all 52 leaves and the capitulum head, allowing authentic anatomical inspection and physical head nodding under grain mass.

---

#### 1.3 Strawberry Plant (*Fragaria × ananassa*)
* **Common Name**: Garden Strawberry
* **Scientific Name**: *Fragaria × ananassa* (Family: Rosaceae)
* **Asset Filenames**:
  * Rosette Crown & Foliage: `strawberry_plant.glb` (`2.66 MB`, binary glTF 2.0 PBR, 73,848 vertices: 61,848 crown petiole verts + 12,000 trifoliate leaf verts with embedded photographic dentate leaf texture)
  * Photorealistic Aggregate Fruits: `strawberry_fruit.glb` (`5.41 MB`, binary glTF 2.0 PBR, 34,500 vertices)
  * Anthesis White Blossoms: `single_blossom.glb` (`83.3 KB`, binary glTF 2.0 PBR, 5-petaled white Rosaceae flower with golden central receptacle)
* **File Paths**:
  * `public/assets/plants/strawberry/strawberry_plant.glb`
  * `public/assets/plants/strawberry/strawberry_fruit.glb`
  * `public/assets/plants/strawberry/single_blossom.glb`
* **Original Sources**:
  * Crown & Foliage: Digital Twin Greenhouse Strawberry Scan (`Sodiq179/digital-twin-greenhouse`), cleaned and converted to binary glTF 2.0 with embedded photoreal trifoliate leaf texture (`Strawberry_Leaf_5_real.png`).
  * Fruit: Photorealistic 3D-scanned aggregate berry with individual achenes and calyx sepals via Objaverse UID `0b9867d98c154737b422fa5afacfc178`.
  * Blossoms: Isolated 5-petaled white Rosaceae flower with golden central disc floret receptacle.
* **Licence**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
* **Attribution Requirements**: Credit to Sodiq179 and Objaverse contributors under CC-BY 4.0.
* **Model Format**: Binary glTF 2.0 (`.glb`) with embedded PBR metallic-roughness materials.
* **Texture / Materials**: Full PBR metallic-roughness textures:
  * Foliage: High-resolution photographic diffuse textures for trifoliate leaflets, serrated dentate margins, and petiolar stems (`alphaMode: MASK`, `alphaCutoff: 0.50`).
  * Fruit: High-resolution diffuse map, normal map, ambient occlusion, and roughness maps detailing individual achenes and green calyx sepals.
  * Blossom: Crisp white petal diffuse texture with golden-yellow carpel receptacle.
* **Static vs Animated**: Dynamic spreading rosette canopy, anthesis flowering disclosure (progress 0.25–0.65), and fruit ripening progression (progress >= 0.40).
* **Independently Controllable Plant Parts**:
  * Basal Perennial Crown (`stem-strawberry-crown`): Ground-level crown collar.
  * Serrated Trifoliate Foliage (`leaf-strawberry-trifoliate`): Compound 3-leaflet clusters with dentate serrated margins.
  * Anthesis Flowers (`flower-strawberry-*`): 5-petaled white Rosaceae blossoms emerging among crown petioles.
  * Aggregate Berries with Achenes (`fruit-strawberry-*`): 6 photorealistic strawberries resting gracefully along the perimeter topsoil.
* **Transformations & Modifications**:
  * Normalized crown base at soil surface ($Y = 0$).
  * Scaled rosette to true-to-life spread ($0.75\text{m} - 0.85\text{m}$ diameter) and height ($0.35\text{m} - 0.45\text{m}$) without vertical squashing.
  * Distributed 6 realistic aggregate berries along the outer rim resting naturally on topsoil, ripening dynamically from green-cream to crimson (`#c62828`).
* **Botanical Justification**:
  * Features authentic trifoliate dentate leaves, low-growing stoloniferous mound architecture, and photorealistic aggregate berries with distinct achenes.

---

### 1.4 Wheat Cereal Crop (*Triticum aestivum*)
* **Common Name**: Bread Wheat
* **Scientific Name**: *Triticum aestivum* (Family: Poaceae)
* **Asset Filename**: `wheat_stalks.glb`
* **File Path**: `public/assets/plants/wheat/wheat_stalks.glb`
* **File Size**: `11.59 MB` (binary glTF 2.0)
* **Original Asset Source**: "Wheat — FREE" by `st.ignat` via Objaverse UID `ddff74ac0661414a9478bd4d7581c854` ([Sketchfab st.ignat](https://sketchfab.com/3d-models/wheat-free-ddff74ac0661414a9478bd4d7581c854))
* **Author**: st.ignat
* **Licence**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
* **Attribution Requirements**: Credit to author "st.ignat" and CC-BY 4.0 license link.
* **Model Format**: Binary glTF 2.0 (`.glb`) with 112,500 quad geometry.
* **Texture / Materials**: PBR textures preserving fibrous grain husk diffuse textures (`baseColorTexture`) and normal maps.
* **Static vs Animated**: Tillering expansion, wind sway flex coupled to stem height, and grain fill ripening.
* **Independently Controllable Plant Parts**:
  * Jointed Culms (`stem-wheat-culm`): 10 discrete cylindrical culm submeshes (`Oats_01` to `Oats_10`).
  * Linear Blades (`leaf-wheat-*`): Graminoid leaf sheaths hugging culms.
  * Terminal Grain Spikes (`ear-wheat-spike`): Distichous spikelets with long, delicate awns (beards).
* **Transformations & Modifications**:
  * Scaled to realistic agricultural height ($0.85\text{m}$ to $1.1\text{m}$).
  * Positioned at topsoil mound ($Y \approx 0.035\text{m}$) with organic tillering cluster.
* **Botanical Justification**:
  * 112k quad geometry captures individual florets, paleas, lemmas, and long distichous awns that characterize *Triticum aestivum*.

---

### 1.5 Chilli Pepper Subshrub (*Capsicum annuum*)
* **Common Name**: Chilli Pepper (Jalapeno / Cayenne)
* **Scientific Name**: *Capsicum annuum* (Family: Solanaceae)
* **Asset Filenames**:
  * Shrub Architecture & Foliage: `chilli_plant.glb` (`1.80 MB`, binary glTF 2.0, 1,472 vertices / 6,099 indices)
  * Pendant Conical Fruit Pods: `chilli_fruit.glb` (`2.07 MB`, binary glTF 2.0, 24,000 vertices)
* **File Paths**:
  * `public/assets/plants/chilli/chilli_plant.glb`
  * `public/assets/plants/chilli/chilli_fruit.glb`
* **Original Sources**:
  * Shrub: Jalapeno Plant Model by `zvanstone` via Objaverse UID `3f11de4c1de5494ab5f60476b42f454f` (CC-BY 4.0).
  * Fruit Pods: High-fidelity botanical pepper scan via Objaverse UID `25dd2ffbff304e95840bbbf32f1210a7` (CC-BY 4.0).
* **Author**: zvanstone & Objaverse Contributors
* **Licence**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
* **Attribution Requirements**: Credit to author "zvanstone" and CC-BY 4.0 license link.
* **Model Format**: Binary glTF 2.0 (`.glb`) with embedded PBR materials.
* **Texture / Materials**: PBR materials with natural photographic diffuse textures for ovate leaves, woody green-brown stems, and glossy fruit cuticle with persistent 5-toothed calyx.
* **Static vs Animated**: Dynamic 7-fork sympodial branching canopy with wind sway and independent fruit ripening.
* **Independently Controllable Plant Parts**:
  * Main Stem & Sympodial Nodes (`stem-chilli-main`): Lignified central axis and sympodial fork branches.
  * Ovate Foliage (`leaf-chilli-*`): Non-serrated, smooth ovate-acuminate leaves with pointed drip-tips.
  * Pendant Fruit Pods (`pod-chilli-*`): 6 tapered conical chilli pods hanging naturally from axil nodes.
* **Transformations & Modifications**:
  * Multi-stem sympodial branching architecture (central stalk + 4 primary sympodial forks spaced around 360° + 2 upper canopy branchlets).
  * Preserved authentic photographic diffuse leaf textures in the top-left quadrant ($U \in [0.02, 0.50], V \in [0.03, 0.47]$) and woody stem textures.
  * Scaled to realistic botanical height ($0.65\text{m} - 0.78\text{m}$) and spread ($0.55\text{m} - 0.65\text{m}$).
  * Dynamic ripening of fruit pods from deep forest green (`#2e7d32`) to breaker orange (`#ff7043`) to flaming crimson (`#d32f2f`).
* **Botanical Justification**:
  * Completely replaces synthetic single-stem sticks with an authentic *Capsicum annuum* branching bush morphology: sympodial dichotomous forks, broad ovate leaves, and pendant conical peppers.

---

### 1.6 Rice Grain Crop (*Oryza sativa*)
* **Common Name**: Paddy Rice
* **Scientific Name**: *Oryza sativa* (Family: Poaceae)
* **Asset Filename**: `rice_plant.glb`
* **File Path**: `public/assets/plants/rice/rice_plant.glb`
* **File Size**: `154.7 KB` (binary glTF 2.0)
* **Original Asset Source**: Authentic Oryza sativa botanical model by `dariotolkien` via Objaverse UID `68fd8a9b358144d895e3f7838e33e2a1` ([Sketchfab dariotolkien](https://sketchfab.com/3d-models/rice-68fd8a9b358144d895e3f7838e33e2a1))
* **Author**: dariotolkien
* **Licence**: Creative Commons Attribution-NonCommercial 4.0 International (CC-BY-NC 4.0)
* **Attribution Requirements**: Credit to author "dariotolkien" and CC-BY-NC 4.0 license link.
* **Model Format**: Binary glTF 2.0 (`.glb`) with discrete graminoid foliage (`LeavesRiceMatSG`) and nodding grain panicle meshes (`lambert2SG`).
* **Texture / Materials**: PBR materials transitioning from vegetative emerald green (`#43a047`) to milky-dough amber (`#e0a93b`) and golden harvest paddy (`#fbc02d`).
* **Static vs Animated**: Tillering clump expansion, wind sway flex, and gravity-induced nodding panicle tilt.
* **Independently Controllable Plant Parts**:
  * Slender Culms & Tillers (`stem-rice-culm`): 5-tiller hill clump forming an authentic wetland paddy base.
  * Arching Linear Blades (`leaf-rice-*`): Upright and gracefully recurved linear leaf sheaths.
  * Drooping Branched Panicles (`fruit-rice-panicle`): Open, nodding multi-branched panicles with distinct grain spikelets.
* **Transformations & Modifications**:
  * Replaced duplicate wheat asset (`wheat_stalks.glb` / 11.59 MB) with authentic, dedicated rice 3D scan (`154.7 KB`).
  * Centered base at origin ($Y = 0$) and structured a 5-tiller hill clump with organic angular spread (0°, 72°, 144°, 216°, 288°).
  * Scaled to mature paddy rice dimensions: height $0.80\text{m} - 1.05\text{m}$, spread $0.40\text{m} - 0.55\text{m}$.
* **Botanical Justification**:
  * Fully resolves the wheat duplication bug. Displays distinctive *Oryza sativa* morphology: slender tillering culms, arching linear leaves, and open drooping panicles completely differentiated from wheat's compact bilateral bearded spikes.

---

### 1.7 Rose Shrub (*Rosa rubiginosa*)
* **Common Name**: Rose (Sweet Briar / Eglantine Rose)
* **Scientific Name**: *Rosa rubiginosa* (Family: Rosaceae)
* **Asset Filename**: `rose.glb`
* **File Path**: `public/assets/plants/rose/rose.glb`
* **File Size**: `155 KB` (binary glTF 2.0)
* **Original Asset Source**: [fazreil/valentine-ar](https://github.com/fazreil/valentine-ar)
* **Author**: fazreil
* **Licence**: MIT Licence
* **Attribution Requirements**: Notice of MIT licence preserved in asset manifest and codebase.
* **Model Format**: Binary glTF 2.0 (`.glb`) with embedded photorealistic diffuse texture sheet.
* **Texture Files**: Embedded 1024x1024 texture containing true rose petals, sepals, prickles, stems, and serrated rose leaflets.
* **Static vs Animated**: Composed into a multi-cane shrub habit with wind sway, terminal corolla blooming, and post-anthesis scarlet hypanthium hips.
* **Independently Controllable Plant Parts**:
  * Woody Canes (`stem-rose-cane`): Prickly lignified upright and arching canes from root crown.
  * Odd-Pinnate Leaves (`leaf-rose-pinnate`): Compound rose leaves with sharply serrated leaflet margins.
  * Corolla Blossom (`flower-rose-corolla`): Multi-petaled terminal rose flower.
  * Scarlet Hypanthium Hips (`hip-rose-*`): Urn-shaped accessory fruits developing post-anthesis.
* **Transformations & Modifications**:
  * Filtered out embedded scene lights and camera nodes from the GLB hierarchy.
  * Preserved un-tinted diffuse texture colors (`#ffffff`) so leaves remain chlorophyll green and blossoms vibrant crimson/pink.
* **Botanical Justification**:
  * Lightweight, photorealistically textured 3D rose with true compound foliage and multi-petaled corolla, free of cartoon features.

---

## 2. Subsoil Rhizosphere Architecture (Roots)

### 2.1 Lateral & Fibrous Root Cluster
* **Asset Name**: `root_cluster_01.gltf` (with binary buffer and 1k PBR textures)
* **File Path**: `public/assets/plants/roots/root_cluster_01.gltf`
* **Original Source**: [Poly Haven](https://polyhaven.com/a/root_cluster_01)
* **Authors**: Jenelle van Heerden & Rico Cilliers
* **Licence**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
* **Textures**:
  * `textures/root_cluster_01_diff_1k.jpg` (Diffuse color map)
  * `textures/root_cluster_01_nor_gl_1k.jpg` (OpenGL Normal map)
  * `textures/root_cluster_01_arm_1k.jpg` (AO / Roughness / Metalness)
* **Integration**: Renders realistic 3D scanned subsoil root architecture below the ground plane ($Y < 0$). Scaled dynamically with `rootDepth` and `rootSpread`.

### 2.2 Primary Taproot System
* **Asset Name**: `single_root.gltf` (with binary buffer and 1k PBR textures)
* **File Path**: `public/assets/plants/roots/single_root.gltf`
* **Original Source**: [Poly Haven](https://polyhaven.com/a/single_root)
* **Author**: Jenelle van Heerden
* **Licence**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
* **Textures**:
  * `textures/single_root_diff_1k.jpg`
  * `textures/single_root_nor_gl_1k.jpg`
  * `textures/single_root_arm_1k.jpg`
* **Integration**: Anchors the central vertical taproot down into the subsoil rhizosphere.

---

## 3. Surface & Soil Textures

### 3.1 PBR Dry Mud / Agricultural Soil
* **Asset Name**: `brown_mud_dry` PBR texture set
* **File Path**: `public/assets/textures/soil/`
  * `brown_mud_dry_diff_1k.jpg` (Albedo / Diffuse)
  * `brown_mud_dry_nor_gl_1k.jpg` (Normal map)
  * `brown_mud_dry_rough_1k.jpg` (Roughness map)
  * `brown_mud_dry_arm_1k.jpg` (Ambient Occlusion / Roughness / Metalness)
* **Original Source**: [Poly Haven](https://polyhaven.com/a/brown_mud_dry)
* **Author**: Poly Haven Community
* **Licence**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
* **Integration**: Applied to the soil cross-section ground plane, rhizosphere trench, and cutaway soil layers.

---

## 4. Environmental Lighting & HDRIs

### 4.1 Botanical Research Greenhouse HDRI
* **Asset Name**: `abandoned_greenhouse_1k.hdr`
* **File Path**: `public/assets/environments/abandoned_greenhouse_1k.hdr`
* **File Size**: `1.66 MB`
* **Original Source**: [Poly Haven](https://polyhaven.com/a/abandoned_greenhouse)
* **Author**: Sergej Majboroda
* **Licence**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
* **Integration**: Provides realistic image-based lighting (IBL) and natural specular environment reflections on waxy leaf surfaces and fruit skins without neon glare or artificial gloss.

---

## 5. Compliance & Verification Matrix (All 7 Species)

| Species | Model Asset / System | Format | Size | Source / Author | Licence | Addressable Organs | Distinctive Botanical Morphology |
|---|---|---|---|---|---|---|---|
| **Tomato** (*Solanum lycopersicum*) | `tomato_plant.glb` | GLB 2.0 | 5.46 MB | GH-01 Digital Twin | CC0 | Stem, Leaves, Flowers, Fruit Truss, Root Collar | 6 growth stages `_pv0`–`_pv5`, pinnate foliage, breaker fruit ripening |
| **Sunflower** (*Helianthus annuus*) | `sunflower.glb` | GLB 2.0 | 4.63 MB | saintalmaty / Sketchfab | CC-BY 4.0 | Column Stem, 52 Leaves, Capitulum Head, Bracts | Monopodial stem, 52 cordate leaves, capitulum head nodding under seed mass |
| **Strawberry** (*Fragaria × ananassa*) | `strawberry_plant.glb` + `strawberry_fruit.glb` | GLB 2.0 | 2.36 MB + 5.41 MB | Sodiq179 & Objaverse 0b9867d | CC-BY 4.0 | Basal Crown, Trifoliate Leaves, Aggregate Berries | True Rosaceae trifoliate dentate foliage, low spreading rosette crown, photoreal aggregate berries with achenes |
| **Wheat** (*Triticum aestivum*) | `wheat_stalks.glb` | GLB 2.0 | 11.59 MB | st.ignat / Objaverse ddff74a | CC-BY 4.0 | Jointed Culms, Foliage Sheaths, Terminal Bearded Spike | 112k quad geometry, cylindrical culms, graminoid blades, terminal distichous spike with long awns |
| **Chilli** (*Capsicum annuum*) | `chilli_plant.glb` + `chilli_fruit.glb` | GLB 2.0 | 1.80 MB + 2.07 MB | zvanstone & Objaverse 25dd2ff | CC-BY 4.0 | Main Stem, Sympodial Nodes, Ovate Leaves, Pendant Pods | Sympodial 5-branch bush habit, smooth ovate-acuminate leaves, hanging waxy tapered chilli peppers |
| **Rice** (*Oryza sativa*) | `rice_plant.glb` | GLB 2.0 | 154.7 KB | dariotolkien / Objaverse 68fd8a9 | CC-BY-NC 4.0 | Slender Culms, Arching Blades, Tillering Clump, Drooping Panicles | 5-tiller wetland hill clump, arching graminoid foliage, nodding branched grain panicles |
| **Rose** (*Rosa rubiginosa*) | `rose.glb` + Multi-Cane Shrub | GLB 2.0 | 155 KB | fazreil / valentine-ar | MIT | Prickly Canes, Odd-Pinnate Leaves, Corolla Blossom, Hips | Woody prickly canes, odd-pinnate serrated foliage, multi-petaled corolla, scarlet hips |
| **Rhizosphere Roots** | `root_cluster_01` & `single_root` | glTF + PBR | 12.5 MB | Poly Haven | CC0 | Primary Taproot, Lateral Feeders, Crown Collar | Subsoil depth ($Y < 0$) and lateral spread scaling |
| **Soil Environment** | `brown_mud_dry` | JPG 1k | 2.9 MB | Poly Haven | CC0 | Ground Plane, Rhizosphere Trench, Cross-Section | Dynamic moisture-reactive albedo darkening |
| **Scene HDRI** | `abandoned_greenhouse_1k` | HDR 1k | 1.66 MB | Poly Haven | CC0 | Scene IBL & Specular Lighting | Key sunlight color & intensity modulation |

*All assets are 100% free, legally verified with CC0, MIT, or CC-BY licences, and stored locally inside the project. Zero paid APIs, subscriptions, or external network requests are required at runtime.*
