#!/usr/bin/env Rscript
# =============================================================================
# PUBLIC EXPORT | PEDIATRIC AML NMF BRIDGE EXPLORER
# =============================================================================
# Converts existing private Script 08 / 13B / optional 13C + 11D results into
# group-level summaries for an entirely static GitHub Pages website.
# Does NOT export USIs, individual clinical records, beta values, or CpG IDs.
# The site is its own repository; edit paths below before running locally.
# =============================================================================

# ----- 01. EDIT PATHS ON YOUR COMPUTER --------------------------------------
PROJECT_DIR <- Sys.getenv("NMF_PROJECT_DIR", unset="C:/PATH/TO/NMF_Molecular_Bridges")
# The EXTRACTED WEBSITE REPOSITORY folder, not the main NMF data project.
PUBLIC_REPO_DIR <- Sys.getenv("NMF_BRIDGE_REPO_DIR", unset="C:/PATH/TO/Pediatric_AML_Bridge_Explorer")
RESULTS <- file.path(PROJECT_DIR, "Results")
FILE_08 <- file.path(RESULTS, "08_Comprehensive_All_CpG_Molecular_Patient_Map",
   "Objects", "08_Comprehensive_All_CpG_Molecular_Patient_Map_Objects.rds")
FILE_13B <- file.path(RESULTS, "13B_Clinical_H_Bridge_Atlas", "Tables",
   "Table_13B_03_Clinical_Directional_Associations_FDR.csv")
FILE_COUNTS <- file.path(RESULTS, "13B_Clinical_H_Bridge_Atlas", "Tables",
   "Table_13B_02_All_Directional_Bridge_Sample_Counts.csv")
FILE_13C <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_02_Clinical_Directional_CpG_Integrated_Atlas.csv")
FILE_13C_GENES <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_07_Priority_Direction_Nearest_Gene_Lookup.csv")
FILE_13C_REGIONS <- file.path(RESULTS, "13C_Clinical_CpG_Bridge_Integration", "Tables",
   "Table_13C_06_GRCh38_Genomic_Region_Context_Descriptive.csv")
FILE_11D <- file.path(RESULTS, "11D_Pair_Specific_Molecular_Identity_Conservation",
   "Tables", "Table_11D_C_ALL_Selected_CpG_Direction_Associations.csv")

# OPTIONAL: separately verified original-group one-vs-all significant
# characteristics. Leave NA until mapped (do NOT reuse 13B incoming bridge
# results as original-group enrichment!). Accept CSV or TSV after configuring
# exact column names below. Records must indicate enriched vs depleted.
GROUP_COVARIATES_FILE <- NA_character_
GROUP_COL <- list(
    Group = "Group", Feature = "Feature", Level = "Level",
    Direction = "Direction", FDR = "FDR", Population = "Population")

MIN_PUBLIC_BRIDGE <- 5L
MIN_PUBLIC_NONBRIDGE <- 5L
MIN_PUBLIC_CLINICAL_CELL <- 5L  # All four categorical 2x2 cells must have at least five patients
GROUP_Q_CUTOFF <- 0.05
SMALL_PRIMARY_COUNT_SUPPRESSION <- 5L  # no public exact values 1..4
MAX_NEAREST_GENES <- 8L
EXPECTED_N <- 854L
# Script 13B determines which associations were tested. The public UI uses
# FDR_Within_Population (same family as Fig_13B_B). It also shows FDR_Overall.

# ----- 02. LOGGING AND HELPERS ----------------------------------------------
if (!dir.exists(PUBLIC_REPO_DIR))
  stop("PUBLIC_REPO_DIR does not exist: ", PUBLIC_REPO_DIR,
       "\nExtract the website archive first, then edit the path in SECTION 01.")
if (!file.exists(file.path(PUBLIC_REPO_DIR,"index.html")))
  stop("PUBLIC_REPO_DIR must contain the explorer's index.html")
if (!requireNamespace("jsonlite",quietly=TRUE))
  stop("Please install jsonlite: install.packages('jsonlite')")
for (p in c(FILE_08,FILE_13B,FILE_COUNTS))
  if (!file.exists(p)) stop("Required upstream file is missing: ",p)
log_file <- file.path(PUBLIC_REPO_DIR,"export-local.log")
logline <- function(...) {
  s <- paste0("[", format(Sys.time(),"%Y-%m-%d %H:%M:%S"), "] ",paste0(...,collapse=""))
  cat(s,"\n");cat(s,"\n",file=log_file,append=TRUE)
}
need <- function(z,fields,source) {
  miss <- setdiff(fields,names(z))
  if(length(miss))stop(source," missing columns: ",paste(miss,collapse=", "))
}
rd <- function(path)utils::read.csv(path,check.names=FALSE,stringsAsFactors=FALSE)
valid_id <- function(z) is.character(z) && grepl("^nmf([1-9]|1[0-9]|2[0-3])$",z)
number <- function(z) {
  x <- suppressWarnings(as.numeric(z))
  x[!is.finite(x)] <- NA_real_
  x
}
flag <- function(z) !is.na(z)&tolower(trimws(as.character(z))) %in% c("true","t","1","yes")
make_pair <- function(a,b) paste0(a,"__to__",b)
identifiers <- paste0("nmf",1:23)

# ----- 03. LOAD ORIGINAL 23 GROUPS ------------------------------------------
logline("Read Script 08 original assignments (only aggregate counts exported)")
s08 <- readRDS(FILE_08)
need(s08$All_Patients,c("USI","Primary_Group"),"Script 08 All_Patients")
ids <- as.character(s08$All_Patients$USI)
primary <- as.character(s08$All_Patients$Primary_Group)
if(length(ids)!=EXPECTED_N||anyNA(ids)||anyDuplicated(ids)||anyNA(primary))
  stop("Invalid original USIs/primary assignments in Script 08")
if(any(!primary %in% identifiers))stop("Unexpected primary NMF group label")
groupcounts <- table(factor(primary,levels=identifiers))
nodes <- lapply(identifiers,function(g) {
  n <- as.integer(groupcounts[[g]])
  list(id=g,primaryPatients=if(n>0&&n<SMALL_PRIMARY_COUNT_SUPPRESSION) NA_integer_ else n,
       groupStats=list())
})
rm(s08,ids,primary)

# ----- 04. LOAD GROUP-DIRECTION COUNTS / PUBLIC SUPPRESSION -----------------
logline("Read 13B directional sample counts")
counts <- rd(FILE_COUNTS)
need(counts,c("Pair_Key","Source","Target","Population",
              "N_Source","N_Bridge","N_NonBridge"),"13B direction counts")
counts <- counts[counts$Source %in% identifiers & counts$Target %in% identifiers &
   counts$Source!=counts$Target & counts$Population %in% c("All","Female","Male"),,drop=FALSE]
if(anyDuplicated(counts[,c("Pair_Key","Population")]))
  stop("Duplicate Pair_Key / Population in 13B counts")
if(any(make_pair(counts$Source,counts$Target)!=counts$Pair_Key))
  stop("13B counts have inconsistent Pair_Key")
for(nm in c("N_Source","N_Bridge","N_NonBridge"))counts[[nm]] <- number(counts[[nm]])
if(any(!is.finite(counts$N_Source)|!is.finite(counts$N_Bridge)|
       !is.finite(counts$N_NonBridge)))stop("Missing numeric patient-count fields")
if(any(counts$N_Bridge+counts$N_NonBridge!=counts$N_Source))
  stop("13B patient counts do not sum to source group size")
# Only publish tested arms with at least the minimum count, even if 13B has
# ineligible direction rows in the complete private audit.
counts <- counts[counts$N_Bridge>=MIN_PUBLIC_BRIDGE &
   counts$N_NonBridge>=MIN_PUBLIC_NONBRIDGE,,drop=FALSE]
counts_pub <- lapply(seq_len(nrow(counts)),function(i) {
  z <- counts[i,]
  list(source=z$Source,target=z$Target,population=z$Population,
       nSource=as.integer(z$N_Source),nBridge=as.integer(z$N_Bridge),
       nNonBridge=as.integer(z$N_NonBridge))
})
logline("Public eligible directed-pair/population count rows: ",length(counts_pub))

# ----- 05. LOAD TESTED CLINICAL ASSOCIATIONS --------------------------------
clin <- rd(FILE_13B)
need(clin,c("Pair_Key","Source","Target","Population","Feature","Level",
          "Feature_Type","Status","Effect_Bridge_Minus_NonBridge",
          "Effect_Unit","FDR_Within_Population","FDR_Overall","P_Primary",
          "N_Bridge","N_NonBridge","N_Source","Primary_Test",
          "Pct_Bridge","Pct_NonBridge"),"13B clinical associations")
if(any(as.character(clin$Feature) %in% c("Final.Risk.Group","Final_Risk_Group")))
  stop("Forbidden risk variable in 13B table: only 1031 protocol risk")
if(any(clin$Feature=="Protocol_Risk",na.rm=TRUE))
  logline("Verified public risk feature: 1031 protocol (13B Feature=Protocol_Risk)")
else logline("No protocol 1031 risk clinical tests found (not silently substituted)")
clin <- clin[clin$Status=="tested" &
  clin$Source %in% identifiers & clin$Target %in% identifiers &
  clin$Population %in% c("All","Female","Male"),,drop=FALSE]
clin$Q <- number(clin$FDR_Within_Population)
clin$Effect <- number(clin$Effect_Bridge_Minus_NonBridge)
clin <- clin[is.finite(clin$Q)&clin$Q>=0&clin$Q<=1&is.finite(clin$Effect),,drop=FALSE]
allowed_pairs <- paste(counts$Pair_Key,counts$Population,sep="||")
clin <- clin[paste(clin$Pair_Key,clin$Population,sep="||") %in% allowed_pairs,,drop=FALSE]
# Conservative public-release suppression: significant results derived from very
# small categorical cells stay PRIVATE, even if source H arms contain >=5 people.
# For binary/categorical covariate levels, all four cells of the incoming vs
# non-incoming 2x2 comparison need at least MIN_PUBLIC_CLINICAL_CELL.
# Age is continuous and already subject to the >=5-per-arm source rule.
need(clin,c("N_Bridge_Observed","N_NonBridge_Observed",
            "N_Bridge_Level","N_NonBridge_Level"),"13B public cell-suppression check")
clin_before_privacy <- nrow(clin)
is_continuous <- as.character(clin$Feature_Type)=="continuous"
nb_obs <- number(clin$N_Bridge_Observed)
nn_obs <- number(clin$N_NonBridge_Observed)
nb_level <- number(clin$N_Bridge_Level)
nn_level <- number(clin$N_NonBridge_Level)
public_eligible <- is_continuous | (
   is.finite(nb_obs)&is.finite(nn_obs)&is.finite(nb_level)&is.finite(nn_level) &
   nb_level>=MIN_PUBLIC_CLINICAL_CELL &
   nn_level>=MIN_PUBLIC_CLINICAL_CELL &
   (nb_obs-nb_level)>=MIN_PUBLIC_CLINICAL_CELL &
   (nn_obs-nn_level)>=MIN_PUBLIC_CLINICAL_CELL)
clin <- clin[!is.na(public_eligible)&public_eligible,,drop=FALSE]
logline("Privacy-filtered ",clin_before_privacy-nrow(clin),
        " clinical associations with small or unverified 2x2 cells")
if(nrow(clin) && any(make_pair(clin$Source,clin$Target)!=clin$Pair_Key))
  stop("13B clinical association Pair_Key mismatch")
if(nrow(clin) && anyDuplicated(clin[,c("Pair_Key","Population","Feature","Level")]))
  stop("Duplicate source/target/population/feature/level clinical tests. Audit before public export")
# Confirm each association's source counts match 13B direction count record.
idx <- match(paste(clin$Pair_Key,clin$Population,sep="||"),allowed_pairs)
if(nrow(clin) && any(is.na(idx)))stop("Unmatched 13B clinical comparison")
if(nrow(clin) && any(number(clin$N_Bridge)!=counts$N_Bridge[idx]|
                    number(clin$N_NonBridge)!=counts$N_NonBridge[idx]))
  stop("13B association arm counts disagree with 13B directional count table")
family <- function(f) {
  if(f=="Sex")return("Sex")
  if(f=="Protocol_Risk")return("Protocol 1031 risk")
  if(f%in%c("Age","AgeGroup"))return("Age")
  if(f%in%c("M6_AML","M7_AML"))return("Phenotype")
  if(f%in%c("FLT3_ITD","WT1","NPM","CEBPA","Mutations_Category"))return("Mutation")
  if(f=="Primary_Fusion")return("Fusion")
  if(f%in%c("t_8_21","t_9_11","inv_16","del5q","Trisomy21","MLL","Primary_Cytogenetics"))
    return("Cytogenetics")
  "Other"
}
edges <- lapply(seq_len(nrow(clin)),function(i) {
  z <- clin[i,,drop=FALSE]
  list(source=z$Source,target=z$Target,population=z$Population,
       feature=z$Feature,level=z$Level,family=family(z$Feature),
       effect=as.numeric(z$Effect),unit=z$Effect_Unit,
       q=as.numeric(z$Q),qGlobal=number(z$FDR_Overall),
       p=number(z$P_Primary),
       nSource=as.integer(z$N_Source),nBridge=as.integer(z$N_Bridge),
       nNonBridge=as.integer(z$N_NonBridge),
       nBridgeLevel=if("N_Bridge_Level" %in% names(z))number(z$N_Bridge_Level) else NA_real_,
       nNonBridgeLevel=if("N_NonBridge_Level" %in% names(z))number(z$N_NonBridge_Level) else NA_real_,
       pBridge=number(z$Pct_Bridge),pNonBridge=number(z$Pct_NonBridge),
       incomingMedian=if(z$Feature_Type=="continuous")number(z$Pct_Bridge) else NA_real_,
       nonIncomingMedian=if(z$Feature_Type=="continuous")number(z$Pct_NonBridge) else NA_real_,
       primaryTest=z$Primary_Test,status=z$Status)
})
logline("Public clinical association edges: ",length(edges))

# ----- 06. OPTIONAL DIRECTED CpG SUMMARIES, NOT CLINICAL CpG TESTS ---------
cpg <- list()
if(file.exists(FILE_13C)) {
  logline("Loading precomputed 13C directional CpG counts")
  z <- rd(FILE_13C)
  need(z,c("Pair_Key","Population","N_Unique_CpGs","N_PrimaryOnly",
           "N_ConservedOnly","N_Both_PrimaryAndConserved","N_Neither_Label"),
       "13C clinical directional CpG atlas")
  z <- z[z$Population=="All" & !duplicated(z$Pair_Key),,drop=FALSE]
  cpg <- lapply(seq_len(nrow(z)),function(i) {
    q <- z[i,]
    list(pair=q$Pair_Key,
      nUnique=number(q$N_Unique_CpGs),nPrimaryOnly=number(q$N_PrimaryOnly),
      nConservedOnly=number(q$N_ConservedOnly),
      nBoth=number(q$N_Both_PrimaryAndConserved),
      nNeither=number(q$N_Neither_Label),genes=list(),regions=list())
  })
} else if(file.exists(FILE_11D)) {
  logline("13C not available; building limited CpG summaries from 11D")
  z <- rd(FILE_11D)
  need(z,c("CpG","Source","Target","Primary_Restricted","Neighborhood_Conserved"),"11D catalogue")
  z <- z[!is.na(z$CpG)&nzchar(trimws(as.character(z$CpG))) &
    z$Source %in% identifiers & z$Target %in% identifiers,,drop=FALSE]
  z$Pair_Key <- make_pair(z$Source,z$Target)
  sp <- split(seq_len(nrow(z)),z$Pair_Key)
  cpg <- lapply(names(sp),function(k) {
    q <- z[sp[[k]],,drop=FALSE]
    ids <- unique(q$CpG)
    pri <- unique(q$CpG[flag(q$Primary_Restricted)])
    cons <- unique(q$CpG[flag(q$Neighborhood_Conserved)])
    list(pair=k,nUnique=length(ids),nPrimaryOnly=length(setdiff(pri,cons)),
      nConservedOnly=length(setdiff(cons,pri)),
      nBoth=length(intersect(pri,cons)),nNeither=length(setdiff(ids,union(pri,cons))),
      genes=list(),regions=list())
  })
} else logline("Neither 13C nor 11D CpG summary available. CpG sidebar will say unavailable")
if(length(cpg)) {
  pairs <- vapply(cpg,function(z)z$pair,character(1))
  if(anyDuplicated(pairs))stop("Duplicate CpG pairs in 13C output")
  if(file.exists(FILE_13C_GENES)) {
    genes <- rd(FILE_13C_GENES)
    need(genes,c("Pair_Key","Gene","N_Unique_Directional_CpGs"),"13C gene lookup")
    for(i in seq_along(cpg)) {
      q <- genes[genes$Pair_Key==cpg[[i]]$pair,,drop=FALSE]
      if(nrow(q)) {
        q <- q[order(-number(q$N_Unique_Directional_CpGs)),,drop=FALSE]
        q <- head(q,MAX_NEAREST_GENES)
        cpg[[i]]$genes <- lapply(seq_len(nrow(q)),function(j)
          list(gene=as.character(q$Gene[j]),n=number(q$N_Unique_Directional_CpGs[j])))
      }
    }
  }
  if(file.exists(FILE_13C_REGIONS)) {
    regions <- rd(FILE_13C_REGIONS)
    need(regions,c("Pair_Key","Region","N_Unique_CpGs"),"13C region counts")
    for(i in seq_along(cpg)) {
      q <- regions[regions$Pair_Key==cpg[[i]]$pair,,drop=FALSE]
      cpg[[i]]$regions <- lapply(seq_len(nrow(q)),function(j)
        list(region=as.character(q$Region[j]),n=number(q$N_Unique_CpGs[j])))
    }
  }
}
logline("Public directional CpG summary pairs: ",length(cpg))

# ----- 07. OPTIONAL ORIGINAL GROUP ONE-VS-ALL FEATURES ----------------------
if(length(GROUP_COVARIATES_FILE)==1L && !is.na(GROUP_COVARIATES_FILE) &&
   nzchar(GROUP_COVARIATES_FILE)) {
  if(!file.exists(GROUP_COVARIATES_FILE))stop("Group enrichment file missing: ",GROUP_COVARIATES_FILE)
  logline("Reading externally reviewed original-group one-vs-all feature table")
  ext <- tolower(tools::file_ext(GROUP_COVARIATES_FILE))
  z <- if(ext=="tsv")utils::read.delim(GROUP_COVARIATES_FILE,stringsAsFactors=FALSE,
                                     check.names=FALSE) else rd(GROUP_COVARIATES_FILE)
  essential <- c("Group","Feature","Level","Direction","FDR")
  need(z,unlist(GROUP_COL[essential],use.names=FALSE),"Group one-vs-all enrichment")
  popcol <- GROUP_COL$Population
  make_val <- function(col)if(!is.null(col)&&length(col)==1L&&!is.na(col)&&col%in%names(z))z[[col]] else rep("All",nrow(z))
  d <- data.frame(Group=as.character(make_val(GROUP_COL$Group)),
     Feature=as.character(make_val(GROUP_COL$Feature)),
     Level=as.character(make_val(GROUP_COL$Level)),
     Direction=tolower(trimws(as.character(make_val(GROUP_COL$Direction)))),
     FDR=number(make_val(GROUP_COL$FDR)),
     Population=as.character(make_val(popcol)),stringsAsFactors=FALSE)
  d$Direction[d$Direction %in% c("higher","overrepresented","over-represented","enrichment","enriched")] <- "enriched"
  d$Direction[d$Direction %in% c("lower","underrepresented","under-represented","depletion","depleted")] <- "depleted"
  if(any(!d$Direction %in% c("enriched","depleted")))
    stop("Original-group enrichment has unrecognized directions. Supply explicit enriched/depleted labels")
  d <- d[d$Group %in% identifiers & as.integer(groupcounts[match(d$Group,names(groupcounts))]) >= SMALL_PRIMARY_COUNT_SUPPRESSION & d$Population %in% c("All","Female","Male") &
     is.finite(d$FDR)&d$FDR<=GROUP_Q_CUTOFF,,drop=FALSE]
  for(i in seq_along(nodes)) {
    q <- d[d$Group==nodes[[i]]$id,,drop=FALSE]
    nodes[[i]]$groupStats <- lapply(seq_len(nrow(q)),function(j)
       list(feature=q$Feature[j],level=q$Level[j],direction=q$Direction[j],
            q=q$FDR[j],population=q$Population[j]))
  }
  logline("Imported reviewed original-group covariate rows: ",nrow(d))
} else logline("No verified original-group enrichment file supplied; node inspector will say so")

# ----- 08. PUBLIC EXPORT / SECURITY CHECK -----------------------------------
out <- list(
  meta=list(mode="research",description="Exploratory in-sample direction-level clinical comparisons",
    cohort=EXPECTED_N,source="13B + optional 13C / 11D; 08 original assignments",
    riskColumn="Risk.group.classification..by.protocol.1031",
    primaryGroupAssignmentsRefitted=FALSE,
    fdrFamily="13B FDR_Within_Population (BH within All/Female/Male)",
    cpgNote="11D candidate CpGs are not individually tested against clinical covariates"),
  nodes=nodes,edges=edges,cpg=cpg,counts=counts_pub)
json <- jsonlite::toJSON(out,auto_unbox=TRUE,pretty=TRUE,na="null",null="null",digits=8)
if(grepl('"USI"|"Patient_ID"|"Sample_ID"|"CpG_ID"',json,perl=TRUE))
  stop("SECURITY: unexpected patient/CpG identifier key in public JSON")
# Export only a top-level JS assignment so file:// preview works without fetch.
outfile <- file.path(PUBLIC_REPO_DIR,"data","network-data.js")
dir.create(dirname(outfile),recursive=TRUE,showWarnings=FALSE)
writeLines(c("/* AGGREGATE RESEARCH DATA. Generated locally; no patient IDs or CpG IDs. */",
             paste0("window.NMF_BRIDGE_DATA = ",json,";")),outfile,useBytes=TRUE)
size <- file.info(outfile)$size
logline("SUCCESS — aggregate public JS data: ",outfile," | ",format(size,big.mark=",")," bytes")
logline("SUMMARY — nodes: ",length(nodes),"; tested clinical associations: ",
        length(edges),"; eligible directed pair/population rows: ",length(counts_pub),
        "; CpG-pair summaries: ",length(cpg))
logline("PRIVACY — original patient IDs, direct CpG IDs, original beta matrix not exported")
logline("NEXT — review site and public summary, then publish; do NOT upload private 13B or 13C tables")
