# FLORA — Botanical Asset Research, Evaluation & Verification Report

**Project**: FLORA Botanical Plant Growth Simulator  
**Directory**: `C:\SB2`  
**Phase**: 4.4 — Botanical Asset Discovery and Verification  
**Author**: Antigravity Technical Artist & Botanical Specialist  
**Date**: October 18, 2026  

---

## 1. Executive Summary

This phase evaluates, verifies, and documents 3D botanical assets for all seven supported plant species in FLORA. Per instructions, **no React plant components have been rewritten, no synthetic procedural BufferGeometry was authored, and no materials were modified to disguise inaccurate shapes**. 

Every candidate model was evaluated against strict botanical criteria, legal licensing requirements, and physical format validity (GLB/glTF).

### Species Status Overview
* **Tomato (*Solanum lycopersicum*)**: **VERIFIED 3D MODEL** (`tomato_plant.glb`, CC0). Multi-stage digital twin with authentic pinnate foliage, sympodial stem, and fruit trusses.
* **Sunflower (*Helianthus annuus*)**: **VERIFIED 3D MODEL** (`sunflower.glb`, CC-BY 4.0). Monopodial stem, 52 addressable cordate leaves, capitulum with ray florets.
* **Strawberry (*Fragaria × ananassa*)**: **VERIFIED 3D MODEL** (`strawberry_plant.glb`, MIT). Acquired from Digital Twin Greenhouse repository; features true Rosaceae trifoliate dentate foliage, woody crown, and aggregate berries with calyces.
* **Wheat (*Triticum aestivum*)**: **VERIFIED 3D MODEL** (`wheat_stalks.glb`, CC-BY 3.0). Google Poly model featuring authentic jointed culms, graminoid leaf sheaths, and distichous terminal spikelets with awns (beards).
* **Rose (*Rosa rubiginosa*)**: **VERIFIED 3D MODEL** (`rose.glb`, MIT). Authentic textured woody canes, compound serrated foliage, and multi-petaled corolla bloom.
* **Chilli Pepper (*Capsicum annuum*)**: **CURRENTLY UNRESOLVED FOR DIRECT FREE GLB DOWNLOAD**. Candidate models identified on Sketchfab require OAuth 2.0 user credentials; public repositories lack complete, un-potted, un-stylized 3D plants without payment or authentication barriers.
* **Rice (*Oryza sativa*)**: **CURRENTLY UNRESOLVED FOR DIRECT FREE GLB DOWNLOAD**. Kyushu University open-science photogrammetry scans require Sketchfab account login; open public web lacks dedicated paddy panicle GLBs free of authentication.

---

## 2. Complete Asset Candidate Evaluation Table

| Species | Scientific Name | Candidate Model Name | Original Source | Direct Model Page | Author | Format | File Size | License | Attribution Requirements | Inspected? | Botanical Accuracy Assessment | Missing Botanical Structures | Suitability Rating | Final Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tomato** | *Solanum lycopersicum* | GH-01 Tomato Digital Twin | GitHub (`sumithshridhar/gh01-twin`) | [github.com/sumithshridhar/gh01-twin](https://github.com/sumithshridhar/gh01-twin) | Sumith Shridhar | Binary GLB 2.0 | 5.22 MB | **CC0 1.0 Universal** | None required (public domain); cited for provenance | **Yes** (481 nodes, 104 meshes) | **Excellent**. Authentic greenhouse crop morphology with odd-pinnate leaves, distinct cymes, and multi-stage fruit trusses. | Continuous vertex morphing (uses discrete stages `_pv0`–`_pv5`). | **10 / 10** | **ACCEPTED** (`public/assets/plants/tomato/tomato_plant.glb`) |
| **Sunflower** | *Helianthus annuus* | Sunflower | Sketchfab (`saintalmaty/sunflower`) | [sketchfab.com/3d-models/sunflower-1a43e24f54854c37b5310bfdbbc16ae8](https://sketchfab.com/3d-models/sunflower-1a43e24f54854c37b5310bfdbbc16ae8) | saintalmaty | Binary GLB 2.0 | 4.42 MB | **CC-BY 4.0** | Credit "saintalmaty" with CC-BY 4.0 license link | **Yes** (180 nodes, 58 meshes) | **High**. Robust monopodial stem, 52 individually addressable cordate leaves, capitulum with ray florets and seed disk. | Taproot system (complemented by subsoil rhizosphere). | **9.5 / 10** | **ACCEPTED** (`public/assets/plants/sunflower/sunflower.glb`) |
| **Strawberry** | *Fragaria × ananassa* | Strawberry Pot Digital Twin | GitHub (`Sodiq179/digital-twin-greenhouse`) | [github.com/Sodiq179/digital-twin-greenhouse](https://github.com/Sodiq179/digital-twin-greenhouse) | Sodiq179 | Binary FBX $\to$ GLB 2.0 | 37.89 MB (source: 84.7 MB) | **MIT License** | Preserve MIT license notice in documentation | **Yes** (28 nodes, crown, leaves, 3 berries) | **High**. True Rosaceae trifoliate dentate foliage, woody crown, aggregate conical berries with persistent green sepals. | Plagiotropic stolon runners are static within crown branches. | **9.0 / 10** | **ACCEPTED** (`public/assets/plants/strawberry/strawberry_plant.glb`) |
| **Wheat** | *Triticum aestivum* | Wheat Stalks Cluster | Google Poly Archive / Poly Pizza | [poly.pizza/m/4siom7-sFLN](https://poly.pizza/m/4siom7-sFLN) | Poly by Google | Binary GLB 2.0 | 45.3 KB | **CC-BY 3.0** | Credit "Poly by Google" with CC-BY 3.0 license link | **Yes** (1,164 verts, 2.2m native height) | **High**. Accurate jointed culms, linear grass blades, and distichous terminal spikelets with long bristly awns. | Microscopic grain furrowing. | **9.0 / 10** | **ACCEPTED** (`public/assets/plants/wheat/wheat_stalks.glb`) |
| **Rose** | *Rosa rubiginosa* | Sweet Briar Rose | GitHub (`fazreil/valentine-ar`) | [github.com/fazreil/valentine-ar](https://github.com/fazreil/valentine-ar) | fazreil | Binary GLB 2.0 | 155 KB | **MIT License** | Preserve MIT license notice in documentation | **Yes** (2 meshes, 1,966 verts, 1k diffuse texture) | **Moderate to High**. Real woody canes, odd-pinnate serrated foliage, and multi-petaled corolla bloom. | Geometric thorns (represented via diffuse texture rather than extruded spines). | **8.5 / 10** | **ACCEPTED** (`public/assets/plants/rose/rose.glb`) |
| **Chilli** | *Capsicum annuum* | Morfologi Capsicum annuum L | Sketchfab (`13be2eb621c24cbe9c417adffb081af3`) | [sketchfab.com/3d-models/morfologi-capsicum-annuum-l-13be2eb621c24cbe9c417adffb081af3](https://sketchfab.com/3d-models/morfologi-capsicum-annuum-l-13be2eb621c24cbe9c417adffb081af3) | Lab Anatomi Tumbuhan | glTF / GLB | ~1.5 MB | **CC-BY 4.0** | Credit author and license link | **Model Page Inspected** (File download blocked by OAuth login) | **Excellent (Morphological)**. Complete anatomical model detailing roots, sympodial stem, ovate-acuminate leaves, and hanging peppers. | None (educational complete plant). | **8.0 / 10** (Pending manual account download) | **UNAVAILABLE FOR AUTO-DOWNLOAD** (Requires Sketchfab login) |
| **Chilli** | *Capsicum annuum* | Chili 3d model | Sketchfab (`92c4964fe678416daaacc7d0e7f92432`) | [sketchfab.com/3d-models/none-92c4964fe678416daaacc7d0e7f92432](https://sketchfab.com/3d-models/none-92c4964fe678416daaacc7d0e7f92432) | Lalusahani9221 | glTF / GLB | 0.66 MB | **CC-BY 4.0** | Credit author and license link | **Model Page Inspected** (File download blocked by OAuth login) | **Moderate**. Potted bush with red peppers and ovate leaves, sculpted in Nomad Sculpt. | Plant is embedded inside an artificial pot; requires OAuth token. | **6.5 / 10** | **UNAVAILABLE FOR AUTO-DOWNLOAD** (Requires Sketchfab login) |
| **Chilli** | *Capsicum annuum* | Pepper-4D Spatiotemporal Dataset | GitHub / MDPI Plants 2026 | [github.com/foysalahmed10/Pepper-4D](https://github.com/foysalahmed10/Pepper-4D) | Foysal Ahmed et al. | Point Cloud (.ply) | ~1.8 GB | **Open Science / Academic** | Academic citation | **Inspected Repo & Abstract** | **Research Quality**. Real spatiotemporal scan across 29 plants. | Raw point cloud, not real-time polygonal WebGL mesh. | **4.0 / 10** | **REJECTED** (Point cloud unsuitable for real-time WebGL polygon pipeline) |
| **Chilli** | *Capsicum annuum* | Chilli Character | Poly Pizza | [poly.pizza/m/d7FpW-C9wXk](https://poly.pizza/m/d7FpW-C9wXk) | Polygonal Mind | GLB | 120 KB | CC-BY | Credit author | **Inspected** | **Zero Botanical Accuracy**. Stylized cartoon pepper mascot with sneakers, sunglasses, and limbs. | Not a plant. | **0 / 10** | **REJECTED** (Cartoon character) |
| **Chilli** | *Capsicum annuum* | Isolated Chili Pepper | Poly Pizza / Kenney | [poly.pizza](https://poly.pizza) | Poly by Google | GLB | 12 KB | CC0 | None | **Inspected** | **Incomplete**. Single isolated harvested vegetable. | Lacks plant stem, leaves, roots, flowers, and branching. | **1.0 / 10** | **REJECTED** (Single fruit prop, not a plant) |
| **Rice** | *Oryza sativa* | CC0 イネ 赤米 / 緑米 Rice | Sketchfab (`b44046bd482346c6bc3403599988c718`) | [sketchfab.com/3d-models/none-b44046bd482346c6bc3403599988c718](https://sketchfab.com/3d-models/none-b44046bd482346c6bc3403599988c718) | Yuichi Kano (ffish.asia / floraZia) | glTF / GLB | 14.06 MB | **CC0 1.0 Universal** | None required (public domain) | **Model Page Inspected** (File download blocked by OAuth login) | **Outstanding**. Authentic photogrammetry scan of mature paddy rice with nodding/drooping grain panicles. | None (scanned live biological specimen). | **9.5 / 10** (Pending manual account download) | **UNAVAILABLE FOR AUTO-DOWNLOAD** (Requires Sketchfab login) |
| **Rice** | *Oryza sativa* | Rice Plant Anatomy | Sketchfab (`be6aa4ac9adc4f558cc789a0baed8ae3`) | [sketchfab.com/3d-models/none-be6aa4ac9adc4f558cc789a0baed8ae3](https://sketchfab.com/3d-models/none-be6aa4ac9adc4f558cc789a0baed8ae3) | cybex.pertanian.go.id | glTF / GLB | 0.15 MB | **CC-BY 4.0** | Credit author and license link | **Model Page Inspected** (File download blocked by OAuth login) | **Moderate to High**. Educational model showing roots, tillering clump, linear leaves, and panicle. | Low-poly agricultural illustration; requires OAuth token. | **7.5 / 10** | **UNAVAILABLE FOR AUTO-DOWNLOAD** (Requires Sketchfab login) |
| **Rice** | *Oryza sativa* | LowPoly Crops Pack (Rice) | Quaternius / itch.io | [quaternius.com/packs.html](https://quaternius.com/packs.html) | Quaternius | OBJ / FBX | ~2 MB | **CC0 1.0 Universal** | None required | **Inspected** | **Low**. 5-stage stylized low-poly game asset. | Faceted geometric planes; lacks organic panicle detail. | **3.5 / 10** | **REJECTED** (Faceted low-poly game asset) |

---

## 3. Detailed Species-by-Species Findings

### A. Tomato (*Solanum lycopersicum*)
* **Status**: **VERIFIED & DOWNLOADED**
* **Local Asset Path**: `public/assets/plants/tomato/tomato_plant.glb` (5.22 MB)
* **License**: CC0 1.0 Universal (Public Domain)
* **Author / Provenance**: Sumith Shridhar (GH-01 Greenhouse Digital Twin project)
* **Botanical Evaluation**: Outstanding. Contains 104 discrete submeshes structured across 6 developmental growth stages (`_pv0` to `_pv5`). Morphological features include authentic odd-pinnate compound foliage with distinct primary and intercalary leaflets, natural sympodial vine branching, star-shaped yellow floral cymes, and realistic fruit trusses displaying persistent green calyx sepals and multi-stage breaker ripening.

### B. Sunflower (*Helianthus annuus*)
* **Status**: **VERIFIED & DOWNLOADED**
* **Local Asset Path**: `public/assets/plants/sunflower/sunflower.glb` (4.42 MB)
* **License**: Creative Commons Attribution 4.0 (CC-BY 4.0)
* **Author / Provenance**: saintalmaty / Sketchfab Community
* **Botanical Evaluation**: High quality. Composed of 58 discrete meshes including a robust lignified monopodial stem, 51 individually addressable cordate rough leaves arranged along the stem, multi-tiered green phyllary bracts, and an apical capitulum flower head with golden peripheral ray florets and a central disc floret array.

### C. Strawberry (*Fragaria × ananassa*)
* **Status**: **VERIFIED & DOWNLOADED**
* **Local Asset Path**: `public/assets/plants/strawberry/strawberry_plant.glb` (37.89 MB)
* **Source Asset**: `public/assets/plants/candidates/strawberry_pot.fbx` (84.7 MB, MIT)
* **License**: MIT License
* **Author / Provenance**: Sodiq179 (Digital Twin Greenhouse open project on GitHub)
* **Botanical Evaluation**: High quality. The model was extracted from the open agricultural digital twin repository. The artificial container/pot (`Cube`) and soil surface (`Plane`) were pruned out, leaving the natural plant architecture: a central lignified woody crown (`tree`), authentic Rosaceae trifoliate dentate foliage (`leaves`), and multiple conical aggregate berries (`strawberry`, `strawberry001`, `strawberry002`) with persistent 6-lobed green sepals.

### D. Wheat (*Triticum aestivum*)
* **Status**: **VERIFIED & DOWNLOADED**
* **Local Asset Path**: `public/assets/plants/wheat/wheat_stalks.glb` (45.3 KB)
* **Secondary Asset**: `public/assets/plants/wheat/wheat_field.glb` (2.62 MB)
* **License**: Creative Commons Attribution 3.0 Unported (CC-BY 3.0)
* **Author / Provenance**: Poly by Google / Poly Pizza open archive
* **Botanical Evaluation**: High quality. Features upright jointed culms with solid nodal rings, narrow graminoid leaf sheaths, and distichous terminal grain ears (spikes) bearing visible awns (beards). The model is completely distinct from lawn grass, correctly representing cultivated bread wheat.

### E. Rose (*Rosa rubiginosa*)
* **Status**: **VERIFIED & DOWNLOADED**
* **Local Asset Path**: `public/assets/plants/rose/rose.glb` (155 KB)
* **License**: MIT License
* **Author / Provenance**: fazreil / valentine-ar
* **Botanical Evaluation**: Moderate to High. Contains authentic woody branching canes, odd-pinnate compound rose foliage with sharply serrated leaflet margins, and multi-petaled corolla blossoms. Cartoon character assets (`Margolo333/rosebloubiz` pink mascot) previously present have been permanently rejected and eliminated.

### F. Chilli Pepper (*Capsicum annuum*)
* **Status**: **UNRESOLVED FOR DIRECT FREE GLB DOWNLOAD**
* **Best Identified Candidates**:
  1. *Morfologi Capsicum annuum L* (Sketchfab UID `13be2eb621c24cbe9c417adffb081af3`, CC-BY 4.0): Accurate botanical model of a complete chilli plant.
  2. *Chili 3d model* (Sketchfab UID `92c4964fe678416daaacc7d0e7f92432`, CC-BY 4.0): Potted branching chilli plant with red peppers.
* **The Download Barrier**: Both candidates are hosted exclusively on Sketchfab. Sketchfab enforces server-side OAuth 2.0 user authentication for all model archive downloads (`/v3/models/{uid}/download` returns HTTP 401 `{"detail":"Authentication credentials were not provided."}`). Automated CLI tools without interactive browser login credentials cannot download the file.
* **Open Repository Search**:
  - Poly Pizza: Only hosts Kenney's single harvested pepper prop and Polygonal Mind's cartoon mascot character with sneakers (both rejected).
  - Poly Haven: Zero crop models (only wild shrubs and ferns).
  - GitHub: Academic datasets like *Pepper-4D* only provide multi-gigabyte point clouds (.ply) and NeRF volumes, not real-time WebGL polygon meshes.
* **Recommendation**: If a Sketchfab login is available, download UID `13be2eb621c24cbe9c417adffb081af3`. Otherwise, document the technical constraint truthfully.

### G. Rice (*Oryza sativa*)
* **Status**: **UNRESOLVED FOR DIRECT FREE GLB DOWNLOAD**
* **Best Identified Candidates**:
  1. *CC0 イネ 赤米 / 緑米 Rice, Oryza sativa* by Yuichi Kano / Kyushu Open University (Sketchfab UID `b44046bd482346c6bc3403599988c718`, CC0 1.0 Universal): Authentic photogrammetric bio-scan of mature paddy rice with drooping panicles.
  2. *Rice Plant Anatomy* (Sketchfab UID `be6aa4ac9adc4f558cc789a0baed8ae3`, CC-BY 4.0): Educational botanical model depicting roots, tillers, linear leaves, and grain heads.
* **The Download Barrier**: While legally CC0 and CC-BY, the actual `.glb` archives reside behind Sketchfab's OAuth 2.0 download endpoint. Kano's companion Zenodo archive (DOI: 10.5281/zenodo.6577143) contains 27 companion 3D models (*Wisteria*, *Rubus*, etc.) but omitted *Oryza sativa*.
* **Open Repository Search**: Poly Pizza only has cooked rice bowls and kitchen utensils; Quaternius only has a 50-polygon faceted game prop.
* **Recommendation**: If a Sketchfab login is available, download UID `b44046bd482346c6bc3403599988c718`. Otherwise, document the technical constraint truthfully.

---

## 4. Downloaded Asset Directory Verification

All accepted 3D assets have been verified to physically exist on disk in `public/assets/plants/`:

```
C:\SB2\public\assets\plants\
├── tomato\
│   └── tomato_plant.glb        (5.22 MB, CC0, GH-01 Digital Twin)
├── sunflower\
│   └── sunflower.glb           (4.42 MB, CC-BY 4.0, saintalmaty)
├── strawberry\
│   └── strawberry_plant.glb    (37.89 MB, MIT, Digital Twin Greenhouse)
├── wheat\
│   ├── wheat_stalks.glb        (45.3 KB, CC-BY 3.0, Poly by Google)
│   └── wheat_field.glb         (2.62 MB, CC-BY 3.0, Poly by Google)
├── rose\
│   └── rose.glb                (155 KB, MIT, fazreil/valentine-ar)
└── roots\
    ├── root_cluster_01.gltf    (6.46 MB, CC0, Poly Haven)
    └── single_root.gltf        (1.91 MB, CC0, Poly Haven)
```

---

## 5. Scope Boundary Compliance

Per strict instructions:
1. **No React plant components were modified in this phase.**
2. **No species-to-model mappings were changed in `BotanicalScene.jsx`.**
3. **No custom procedural geometry was created.**
4. **Existing working assets were not deleted.**
5. **The complete research and verification artifact has been generated at `C:\SB2\BOTANICAL_ASSET_RESEARCH.md`.**
