# Statistical data definitions

## Nodes — original NMF primary assignments

Each of 23 nodes is a component from the fixed k=23 model. Two may have no primary-assigned patients. Original group clinical annotations were derived from the provided `All_One_vs_All_Clinical_Covariates_BH_filtered_enrichment.csv`. Every included row has original `BH_FDR <= 0.05`; for multi-category covariates, selected enriched/depleted category percentages are **descriptive**, not separate post hoc categorical significance tests. Alternate `Cyto.Fusion.Molecular.Risk`, its `_update`, and other non-1031 risk labels are excluded; the risk covariate is solely `Risk.group.classification..by.protocol.1031`.

## Pairwise original-group survival

From `Original_23_Group_Survival_All_vs_All_Pairwise.csv`:

- 253 possible unordered pairs across 23 components, all `Sex = All`.
- 171 have nonmissing `Chi_Square`, `P_Value` and `P_Value_BH`.
- 36 have `P_Value_BH < 0.05`.
- Source fields: `Group_1`, `Group_2`, each group's patient/event counts, `Chi_Square`, `P_Value`, `P_Value_BH`.

These are the source's provided *pairwise survival* test statistics. The CSV lacks a method tag (log-rank versus another chi-square survival test), endpoint (OS versus EFS), direction, survival times or hazard ratios. The explorer **does not** add or infer those. Each node displays its tested pairs, supplied BH q-values, and event counts. It does not define a new survival analysis of incoming 13B bridge patients.

## Directional molecular neighborhoods

Script 13B tests incoming versus nonincoming original-primary source patients for each target H component. Its `FDR_Within_Population` is displayed for tested associations. Pairwise survival q-values in the node panel belong to a **different hypothesis family**, and are never compared or combined with 13B q-values. Script 13C/11D CpG data describe directional methylation catalogues, not clinical-feature-specific methylation testing.

## Public interpretation

No patient IDs or individual methylation values are displayed. Public source availability is not automatically a comprehensive disclosure or reuse clearance. Review clinical metadata use permissions and rare aggregate cells prior to publishing.
