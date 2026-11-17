# Pediatric AML NMF Bridge Explorer

**A separate GitHub Pages explorer for the original 23-component pediatric AML NMF model.** The viewer shows **group-level** directional molecular H-neighborhood bridges, covariates associated with those bridges, and an optional **direction-level** CpG summary. It is **not** another patient UMAP.

## What the website contains

- **Circular / Network map** toggle — same 23 NMF components in both views. The network map uses a reproducible, edge-informed force-directed layout; neither set of coordinates represents methylation distance.
- **Directed arrows** — primary source A → H-neighborhood target B. Each arrow corresponds to a tested clinical level from Script 13B, comparing original-A incoming patients (B belongs to their operational H neighborhood) against original-A nonincoming patients (B absent).
- **Clinical colors and sign** — color can represent clinical **family** or **individual covariate**. Solid means **higher in incoming**; dashed means **lower in incoming**. Width indicates the number of source-A patients incoming to B.
- **Filters** — sex population, clinical family/feature, direction, BH FDR, minimum patients, maximum arrows per source→target, and a group focus.
- **On hover / click an arrow** — patients in each arm, difference in percentage points (or median age units), q-value, comparison method, and all eligible clinical associations for that direction. An optional subsection displays the unique directional CpG counts from 13C / 11D (primary-only, conserved-only, both), and annotations from 13C if available.
- **On hover / click a node** — primary group size, available directional connections, and **separately imported** original-group one-vs-all clinical enrichment (when reviewed data are supplied).
- **SVG export** — save the currently filtered network as a vector graphic for presentations.

**Privacy:** This repository must contain only group-level summary information. The exporter suppresses original-primary group sizes of 1–4, requires at least five incoming and five nonincoming patients, and by default excludes categorical results if any of the four tested 2×2 cells contains fewer than five patients. Some significant findings in private 13B may therefore be absent from the public explorer. **Never commit** `target_covs.eligible.csv`, USIs, RDS model objects, private Script 13A/B/C tables, patient-to-patient matrices, or CpG-level data. The local exporter writes a single browser-readable `data/network-data.js` containing only aggregate statistics, directional CpG *counts*, and optional nearest-gene annotations. Public Pages content is accessible to everyone. Review institutional sharing rules before publishing.

## Critical: the bundled site starts in clearly marked DEMO mode

The included `data/network-data.js` initially contains **invented example arrows, numbers, and CpG counts** to demonstrate the interface. They are **not your experimental results**. A yellow banner covers the site in this mode. The demo banner disappears only after you run the local R export, which replaces the sample dataset with real aggregate results. **Do not present screenshots or results from demo mode as real findings.**

## Step 1 — unzip and run the local R exporter (on your Windows PC)

1. Extract the entire ZIP and place its **folder** (containing `index.html`, `assets`, `data`, `scripts`, and `README.md`) on your computer. Suggested location: `C:/YOUR/PROJECTS/Pediatric_AML_Bridge_Explorer`.
2. Open `scripts/export_public_data.R` in RStudio. Set `PROJECT_DIR` and `PUBLIC_REPO_DIR` to your actual local directories (or supply `NMF_PROJECT_DIR` and `NMF_BRIDGE_REPO_DIR` environment variables). The expected `Results/` subdirectory structure matches Scripts 08, 13B, and optional 13C.
3. Install the one export dependency if needed: `install.packages("jsonlite")`.
4. Run/source the entire `export_public_data.R`. **Requirements:** Script 08 objects, and completed Script 13B clinical associations + bridge counts. Script 13C is optional: if its output is absent, the exporter uses Script 11D for CpG counts where available; gene annotations require 13C outputs.
5. Confirm the console reports `SUCCESS`, and inspect `data/network-data.js`: it must start with `/* AGGREGATE RESEARCH DATA. ... */` and contain `"mode": "research"`. **Do not upload `export-local.log`**, which stays local and may contain paths.
6. Double-click `index.html` to preview locally. The page does not require an R server or web server and loads the local JavaScript file directly.

### Node hover: original-group one-vs-all statistics are a separate input

The existing `NMF_Significant_Characteristics_FINAL.tsv` or a similar reviewed table from the original one-vs-all analysis can be incorporated **separately**. Its column schema is not yet available here, so the exporter intentionally does **not** guess which field encodes direction or significance. To enable original-group annotations:

1. Set `GROUP_COVARIATES_FILE` to the verified CSV/TSV file on your computer.
2. Configure `GROUP_COL` with the **exact** group/feature/level/direction/FDR/(optional) sex-population column names. If the table instead records odds ratios and lacks direction labels, first prepare a reviewed table explicitly marking `Enriched` vs `Underrepresented` — do **not** infer direction from unrelated clinical tests.
3. The exporter checks column presence and direction values. Only rows at group-level q ≤ 0.05 are imported.

Until provided, hovering an NMF node accurately says **original-group clinical enrichment not supplied**, rather than incorrectly reusing incoming H-bridge associations as original-group enrichments.

## Step 2 — publish as a SEPARATE GitHub repository

I recommend naming the new repo `Pediatric_AML_Bridge_Explorer` under the same GitHub account as the current `Pediatric_AML_NMF` project. There is **no need to modify** the existing UMAP explorer. The new header already links back to the old site.

If using GitHub **in your browser**:

1. At GitHub, select **New repository**. Name it `Pediatric_AML_Bridge_Explorer`, choose **Public** (if approved for publication), and create it without adding a README (ours is already included).
2. In the new repository choose **Add file → Upload files**. Upload **the contents of the unzipped folder**, including the top-level `index.html`, `assets/`, `data/network-data.js`, `scripts/`, and `README.md`. GitHub's web uploader may not preserve empty folders; that's fine. Confirm the `index.html` is at the repository root. The hidden `.nojekyll` and `.gitignore` are optional but useful; if the browser uploader hides them, add them later.
3. Commit to `main`. Open **Settings → Pages → Build and deployment → Deploy from a branch**. Select **`main` / `(root)`**, then **Save**.
4. The expected address, once successfully published, is `https://rblanchett.github.io/Pediatric_AML_Bridge_Explorer/` (based on the existing public GitHub Pages username). This is a proposed address, **not a verified live deployment**.

For local git users, create the empty GitHub repository, then from the extracted folder run:

```bash
git init
git add index.html assets data/network-data.js scripts README.md .gitignore .nojekyll
git commit -m "Initial standalone NMF bridge explorer"
git branch -M main
git remote add origin https://github.com/rblanchett/Pediatric_AML_Bridge_Explorer.git
git push -u origin main
```

**To update results later:** re-run the R exporter, review the browser, then commit/upload **only** the updated `data/network-data.js`. No redeployment code change is required.

## Upstream inputs

| Source | Purpose | Required? |
|---|---|---|
| Script 08 `08_Comprehensive_All_CpG_Molecular_Patient_Map_Objects.rds` | All 23 original group sizes (even groups with no primary patients) | Yes, local export only |
| Script 13B `Table_13B_02_All_Directional_Bridge_Sample_Counts.csv` | Source→target counts by All/Female/Male | Yes, local export only |
| Script 13B `Table_13B_03_Clinical_Directional_Associations_FDR.csv` | Tested covariate-level directions, q-values, incoming/nonincoming contrasts | Yes, local export only |
| Script 13C `Table_13C_02_Clinical_Directional_CpG_Integrated_Atlas.csv` | Unique directional CpG counts (primary-only/conserved-only/both) | Optional |
| Script 11D `Table_11D_C_ALL_Selected_CpG_Direction_Associations.csv` | Direct fallback for directional CpG counts when 13C missing | Optional |
| 13C `Table_13C_07...` / `Table_13C_06...` | Optional nearest-gene lookup / genomic context counts | Optional |
| Reviewed original NMF one-vs-all group covariate export | Group hover enrichments / underrepresentations | Optional |

## Interpretation / limitations

- The original NMF model (`k=23`) is unchanged; all 23 components appear even if there are no original-primary patients for some components. Source groups in 13B were limited to adequately populated primary groups.
- The **direction** A → B means *original A patients incoming to H component B*; it **does not** indicate a patient's progression from group A to B, cellular movement, or temporal migration.
- In 13B the comparison is **incoming vs nonincoming within the same original primary A group**; it is not a simple source-A versus primary-B test. Effect signs and arrow styling refer to that specific comparison.
- Arrow width reflects incoming patient count, **not** significance or the magnitude of methylation change. q is Script 13B `FDR_Within_Population` (BH within population); the corresponding global FDR remains in the public data for audit.
- **Age** is a median contrast, not a prevalence in percentage points. For discrete covariates, percentage-point differences are shown.
- **Protocol risk** uses only `Risk.group.classification..by.protocol.1031`, never `Final.Risk.Group`.
- The CpG counts are **direction-level Script 11D identities**, not CpGs statistically associated with each covariate or an independently validated causal mechanism. Nearest genes are positional annotations, not confirmed regulatory targets.
- Layout geometry is schematic, especially in force-directed mode; do **not** interpret Euclidean distance on the screen as patient molecular distance.
- No USI-level clinical tables, methylation beta matrices, or CpG identifiers belong on GitHub.

## Files

```text
Pediatric_AML_Bridge_Explorer/
├── index.html                    # Standalone GitHub Pages site
├── assets/
│   ├── styles.css                # Responsive styling
│   └── app.js                    # SVG network renderer, interaction and filters
├── data/
│   └── network-data.js           # DEMO initially, overwritten by local R exporter
├── scripts/
│   └── export_public_data.R      # Runs LOCALLY using protected results
├── tests/
│   └── smoke_test.py             # Optional browser smoke test
├── .gitignore
├── .nojekyll
└── README.md
```

Generated with scientific caution: no clinical/molecular finding should be claimed from an example preview or from a direction-level CpG summary alone.
