# Pediatric AML | Molecular Bridge Explorer

### Exploring how DNA methylation-defined AML groups connect to clinical characteristics

**23 NMF components · 854 pediatric AML diagnostic samples · Interactive, group-level network**

[**Explore the interactive molecular bridge map**](https://rblanchett.github.io/Pediatric_AML_Bridge_Explorer/) · [Original pediatric AML NMF project](https://github.com/rblanchett/Pediatric_AML_NMF) · [How the website was built](docs/SITE_MAINTENANCE.md)

> **About this resource:** This is an exploratory research visualization of group-level molecular relationships and clinical associations, **not** a clinical diagnostic or treatment tool. The network does not represent individual patients moving between disease states.

## What are we looking at?

Acute myeloid leukemia (AML) is molecularly heterogeneous: patients with the same diagnosis may have very different DNA methylation patterns and clinical features. We analyzed genome-wide DNA methylation profiles from **854 pediatric AML samples** using **non-negative matrix factorization (NMF)** with **23 components**.

NMF represents each patient's methylation profile as a weighted combination of molecular components. A patient's **primary NMF group** is the component with the largest weight. But a single group label can conceal additional contributions: a patient may also have meaningful similarity to other NMF components.

This explorer displays those *additional relationships* as a **network of NMF groups**, then asks which clinical characteristics are more or less common among patients exhibiting each directed molecular relationship.

Rather than displaying 854 separate patients, the network summarizes **connections between NMF components**.

## Open the explorer

**[Launch the Molecular Bridge Explorer](https://rblanchett.github.io/Pediatric_AML_Bridge_Explorer/)**

Choose between two complementary layouts:

- **Circular:** Places all 23 NMF components around a circle, making it easier to follow directional connections and compare groups.
- **Network map:** Rearranges the same components according to their displayed connections to make network structure easier to explore.

Both layouts show the **same underlying analysis**. Node positions are visual arrangements, **not** methylation distances, developmental trajectories, or clinical-risk coordinates.

### How to read the map

| Visual element | Meaning |
|---|---|
| **Circle labeled `nmf1`–`nmf23`** | One component from the original NMF model; the circle is **not** an individual patient |
| **Arrow `A → B`** | Patients originally assigned to **A** whose H-derived molecular neighborhood also includes component **B** |
| **Gray arrow** | An eligible molecular-neighborhood relationship, whether or not a significant clinical covariate is displayed |
| **Colored arrow** | A clinical association tested among the patients defining that directed relationship; subject to the selected filters |
| **Solid colored arrow** | The displayed covariate level is **more common** among incoming patients than among nonincoming patients from the same original group |
| **Dashed colored arrow** | The displayed covariate level is **less common** among incoming patients (or has a lower median for a continuous variable) |
| **Thicker arrow** | More patients in the incoming H-neighborhood subset |

**Example:** For an arrow `nmf5 → nmf23`, the analysis starts with patients whose *original primary group* is `nmf5`. It compares those whose H neighborhoods include `nmf23` (**incoming**) against those whose H neighborhoods do not include `nmf23` (**nonincoming**). This is **not** a comparison of all original `nmf5` patients against all original `nmf23` patients.

### Clinical colors

Most arrow colors identify a clinical covariate family or selected characteristic. Two covariates have dedicated category colors:

| Clinical characteristic | Color |
|---|---|
| **Male** | Blue |
| **Female** | Pink |
| **High risk — protocol 1031** | Deep red |
| **Low risk — protocol 1031** | Deep blue |
| **Unknown protocol 1031 risk** | Gray |

The risk variable is **`Risk.group.classification..by.protocol.1031` only**, not another risk-classification system. Arrow color identifies the **clinical category being tested**, not the sex or risk of every patient in the neighborhood. Solid versus dashed distinguishes increased versus decreased representation.

## Explore the results

**Start with a group.** Hover over or select an NMF node to inspect its original-group size, visible connections, and, when added, its separately tested **one-versus-all clinical enrichments**. Original-group enrichments are *not* inferred from the bridge statistics.

**Follow an arrow.** Hover or select a directional link to see the incoming and nonincoming patient counts, clinical comparison, effect direction, and **Benjamini–Hochberg false-discovery-rate (BH FDR)** result.

**Change the question.** Filter by patient subset (all patients, female, or male), covariate, clinical direction, minimum neighborhood size, and FDR threshold. You can choose how many clinical arrows appear per NMF direction. The **Show underlying H bridges** option helps distinguish the molecular network from the subset of links meeting the clinical display filters.

**Look at methylation signatures.** When available, the arrow details include directional CpG summaries, such as **primary-restricted** and **neighborhood-conserved** CpGs. These CpGs characterize the **molecular direction as a whole**; they are **not** necessarily CpGs statistically associated with the particular clinical feature shown on that arrow. Genomic locations and nearby genes are annotations, not demonstrated regulatory targets.

**Connect to survival.** When original Kaplan–Meier (KM) figures are supplied, links appear in NMF node details. Those KM curves describe survival by **original primary NMF assignment**; they do **not** estimate survival for patients following any specific molecular bridge. The site does not generate new OS/EFS survival analyses.

You can also **export the currently displayed network as SVG** for presentations or figures.

## Where the data come from

The viewer brings together several stages of the pediatric AML NMF analysis:

| Analysis | Contribution to this explorer |
|---|---|
| **Original NMF model / Script 08** | Fixed original NMF assignments and H-derived molecular neighborhoods |
| **Script 13B** | Direction-specific clinical comparisons and incoming/nonincoming patient counts |
| **Scripts 11D and 13C** | Directional CpG summaries and optional genomic context |
| **Original one-versus-all clinical analysis** | Optional, separately imported enrichments/underrepresentations for individual NMF nodes |
| **Original NMF survival analysis** | Optional links to reviewed original-group Kaplan–Meier plots |

The exported website uses aggregate summaries and does not need patient-level methylation matrices or patient identifiers to render the network.

## Interpretation and limitations

This is an **observational, exploratory molecular atlas**. The connections are defined using NMF H profiles, and some CpG signatures were selected using H-derived neighborhoods in the same cohort; their agreement is **not independent validation**. A significant clinical association identifies a difference in the defined incoming-versus-nonincoming comparison, not a causal mechanism, patient transition, or validated diagnostic subtype.

**BH FDR values refer to the corresponding Script 13B testing families.** Changing a display filter does not rerun the statistics. An arrow being absent under a restrictive filter does not establish that the corresponding H-neighborhood relationship is absent. Likewise, a significant result in one sex-specific analysis and a nonsignificant result in another does not alone establish a sex interaction.

The all-patient network and the female/male **analysis subsets** are distinct from the **Sex covariate** (male/female prevalence), which is evaluated in the pooled population. Some original NMF components may have no patients for whom they are the primary assignment; they remain visible because the model has 23 components.

Only reviewed aggregate results should be published in this repository. Small-group or rare-category associations may warrant additional disclosure review when linked to public clinical datasets. No patient IDs, individual clinical records, or patient-level methylation measurements are required on the public website.

## Related resources

- [Original Pediatric AML NMF repository](https://github.com/rblanchett/Pediatric_AML_NMF) — accompanying analyses and the separate patient-level NMF UMAP explorer.
- [Molecular Bridge Explorer (GitHub Pages)](https://rblanchett.github.io/Pediatric_AML_Bridge_Explorer/) — this interactive network.
- [Technical setup, local export, and maintenance](docs/SITE_MAINTENANCE.md) — instructions for researchers maintaining the website.

---

*The molecular groups are fixed from the original NMF analysis. Clinical and genomic annotations may be expanded as additional analyses are reviewed; new annotations do not themselves redefine the original group assignments.*
