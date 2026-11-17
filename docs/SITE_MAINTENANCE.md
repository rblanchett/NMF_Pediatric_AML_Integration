# Website maintenance and local export

This page is for the researcher updating the *Pediatric AML NMF Bridge Explorer* GitHub Pages site. It is not required reading for visitors.

## One-time setup

1. Extract the **entire** `Pediatric_AML_Bridge_Explorer_COMPLETE` ZIP on your computer.
2. Leave the site files together: `index.html`, `assets/`, `data/`, `scripts/`, and `README.md`.
3. Open `scripts/export_public_data.R` in RStudio. It attempts to detect the containing website folder automatically. If detection fails, set `NMF_BRIDGE_REPO_DIR` to the folder containing `index.html` or edit `PUBLIC_REPO_DIR`.
4. The project path in the script defaults to `C:/Users/reida/Documents/Aim_4/20260916_NMF/NMF_molecular_bridges/`. Change `PROJECT_DIR` if needed.
5. Install `jsonlite` once if necessary: `install.packages("jsonlite")`.
6. **Source the entire R file.** It reads your private existing Script 08, 13B and (optionally) 13C or 11D files, then writes `data/network-data.js` in the extracted website folder. It does **not** run NMF or redo any survival statistics.
7. Check the successful export log and open `index.html` locally to preview with your real data. Verify the banner announcing missing data is gone.
8. Review release permissions and aggregate-table disclosure risks before publishing. The exporter does not export USIs, beta values or CpG IDs, but some rare-feature aggregate counts remain visible.
9. Upload the **contents** of the extracted repository to your existing GitHub repository, preserving paths. Do **not** upload `export-local.log`, private upstream RDS/CSVs, or patient-level records. The website runs on GitHub Pages using `main` / `(root)`.

**Important:** This ZIP contains an intentionally empty `data/network-data.js` placeholder, *not* demo clinical data. The R exporter must be run before uploading this file to GitHub if you want the full directional network to appear. If replacing an already live site, do not overwrite its real `network-data.js` with the placeholder; first regenerate it locally.

## Built-in original-group annotations

`data/original-group-annotations.js` **is already populated** from the two uploaded aggregate summaries:

- `All_One_vs_All_Clinical_Covariates_BH_filtered_enrichment.csv` (original-primary group one-versus-all variables; alternate risk variables excluded; only protocol 1031 retained)
- `Original_23_Group_Survival_All_vs_All_Pairwise.csv` (253 pooled pairwise comparisons; 171 estimable; 36 BH significant)

These source CSVs do not need to be copied into the repository or supplied again for the current build. `scripts/export_public_data.R` **preserves** this annotation file and refreshes only the directional 13B/13C dataset.

The old `Original_23_Group_Cox_Main_Effects.csv` has deliberately **not** been used. Its categorical Cox coefficients cannot be interpreted as pairwise or one-versus-all effects without the original model specification.

## Interpretation notes

- An H arrow `nmf5 → nmf23` means original nmf5 patients whose H neighborhood includes nmf23, compared with other original nmf5 patients. The arrow is not a patient migration.
- Colored clinical arrows describe Script 13B tests; the neutral gray arrows represent H-neighborhood structure.
- A node's original-group covariates are separate one-versus-all tests. Reported category directions and percentages are descriptive; the BH q-value belongs to the whole categorical variable test.
- Node survival results are the **original, pooled, pairwise survival comparisons** between two original group assignments (not the 13B bridge subsets). The source table includes chi-square statistics and adjusted P values, but no hazard ratios, survival direction, or endpoint label.
- The `Sex` covariate uses blue for male and pink for female; protocol-1031 risk high/low use deep red/deep blue. Dashed vs solid signifies depleted vs enriched among incoming source-primary patients.
- Directional 11D/13C CpG counts do not establish a CpG–clinical-feature association.

## Local outputs and optional KM images

The exporter writes `data/network-data.js` and `export-local.log` to the extracted repository. You can optionally set `KM_OVERVIEW_FILE` or `KM_GROUP_PLOTS_DIR` in `scripts/export_public_data.R` to copy reviewed images into `assets/km/`, which appear as links from NMF nodes.

`tests/smoke_test.py` uses a synthetic in-memory network fixture to check the interface. It never substitutes demonstration values into the website's production data files.
